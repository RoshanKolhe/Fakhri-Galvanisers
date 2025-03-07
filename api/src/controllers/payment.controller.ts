import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
  relation,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Payment} from '../models';
import {
  CustomerRepository,
  DispatchRepository,
  MaterialRepository,
  NotificationRepository,
  OrderRepository,
  PaymentRepository,
  QcReportRepository,
} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';
import {FakhriGalvanisersDataSource} from '../datasources';

export class PaymentController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(MaterialRepository)
    public materialRepository: MaterialRepository,
    @repository(DispatchRepository)
    public dispatchRepository: DispatchRepository,
    @repository(QcReportRepository)
    public qcReportRepository: QcReportRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @post('/payments')
  @response(200, {
    description: 'Payment model instance',
    content: {'application/json': {schema: getModelSchemaRef(Payment)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Payment, {
            title: 'NewPayment',
            exclude: ['id'],
          }),
        },
      },
    })
    payment: Omit<Payment, 'id'>,
  ): Promise<Payment> {
    return this.paymentRepository.create(payment);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @get('/payments')
  @response(200, {
    description: 'Array of Payment model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Payment, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Payment) filter?: Filter<Payment>,
  ): Promise<Payment[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        {
          relation: 'order',
          scope: {
            include: [
              {
                relation: 'challan',
              },
            ],
          },
        },
        {relation: 'customer'},
      ],
      order: ['createdAt DESC'],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin')
    ) {
      return this.paymentRepository.find(filter);
    } else {
      return this.paymentRepository.find({
        ...filter,
        where: {
          customerId: currnetUser.id,
        },
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @get('/payments/{id}')
  @response(200, {
    description: 'Payment model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Payment, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Payment, {exclude: 'where'})
    filter?: FilterExcludingWhere<Payment>,
  ): Promise<Payment> {
    return this.paymentRepository.findById(id, {
      ...filter,
      include: [
        {
          relation: 'order',
          scope: {
            include: [
              {
                relation: 'challan',
              },
              {
                relation: 'customer',
              },
            ],
          },
        },
        {relation: 'customer'},
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @patch('/payments/{id}')
  @response(204, {
    description: 'Payment PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Payment, {partial: true}),
        },
      },
    })
    payment: Payment,
  ): Promise<void> {
    const repo = new DefaultTransactionalRepository(Payment, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const paymentDetails = await this.paymentRepository.findById(id);
      if (!paymentDetails) {
        throw new HttpErrors.BadRequest('Invoice not found');
      }
      const customer: any = await this.customerRepository.findById(
        paymentDetails.customerId,
      );
      if (payment.status && payment.status === 1) {
        await this.orderRepository.updateById(
          paymentDetails.orderId,
          {isPaid: true},
          {transaction: tx},
        );

        const materials = await this.materialRepository.find({
          where: {orderId: paymentDetails.orderId},
        });

        const qcReports = await this.qcReportRepository.find({
          where: {orderId: paymentDetails.orderId},
        });

        const allMaterialsCompleted =
          materials.length > 0 &&
          materials.every(material => material.status === 2);

        const allQcCompleted =
          qcReports.length > 0 && qcReports.every(qc => qc.status === 1);

        if (allMaterialsCompleted && allQcCompleted) {
          await this.dispatchRepository.create(
            {
              orderId: paymentDetails.orderId,
              customerId: paymentDetails.customerId,
            },
            {transaction: tx},
          );

          // Update order timeline with 'Ready to Dispatch' entry
          const order = await this.orderRepository.findById(
            paymentDetails.orderId,
          );
          const orderTimeline = order.timeline || [];

          const newEntry = {
            id: 3,
            title: 'Ready to Dispatch',
            time: new Date().toISOString(),
          };

          if (!orderTimeline.some((entry: any) => entry.id === 3)) {
            orderTimeline.push(newEntry);
          }

          await this.orderRepository.updateById(
            paymentDetails.orderId,
            {
              status: 3,
              timeline: orderTimeline,
            },
            {transaction: tx},
          );
        }
        await this.notificationRepository.create(
          {
            avatarUrl: customer?.avatar?.fileUrl
              ? customer?.avatar?.fileUrl
              : null,
            title: `Payment ${paymentDetails.performaId} has been approved by Admin`,
            type: 'payment',
            status: 0,
            customerId: customer.id,
            extraDetails: {
              paymentId: paymentDetails.id,
            },
          },
          {transaction: tx},
        );
      } else {
        await this.orderRepository.updateById(
          paymentDetails.orderId,
          {isPaid: false},
          {transaction: tx},
        );
      }

      if (payment.status && payment.status === 3) {
        await this.notificationRepository.create(
          {
            avatarUrl: customer?.avatar?.fileUrl
              ? customer?.avatar?.fileUrl
              : null,
            title: `Customer ${customer?.firstName} sent you the Payment Proof for approval`,
            type: 'payment',
            status: 0,
            userId: 0,
            extraDetails: {
              paymentId: paymentDetails.id,
            },
          },
          {transaction: tx},
        );
      }

      if (payment.status && payment.status === 4) {
        await this.notificationRepository.create(
          {
            avatarUrl: customer?.avatar?.fileUrl
              ? customer?.avatar?.fileUrl
              : null,
            title: `Admin has requested a reupload of the payment proof for invoice ${paymentDetails.performaId}.`,
            type: 'payment',
            status: 0,
            customerId: customer.id,
            extraDetails: {
              paymentId: paymentDetails.id,
            },
          },
          {transaction: tx},
        );
      }

      await this.paymentRepository.updateById(id, payment, {transaction: tx});

      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/payments/{id}')
  @response(204, {
    description: 'Payment DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.paymentRepository.deleteById(id);
  }
}
