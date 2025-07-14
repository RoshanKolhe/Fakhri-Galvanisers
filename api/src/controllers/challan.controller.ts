import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import { Challan } from '../models';
import { ChallanRepository, NotificationRepository, OrderRepository } from '../repositories';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';
import { inject } from '@loopback/core';
import { UserProfile } from '@loopback/security';

export class ChallanController {
  constructor(
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
  ) { }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.SUPERVISOR,
        PermissionKeys.WORKER
      ],
    },
  })
  @post('/challans')
  @response(200, {
    description: 'Challan model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Challan) } },
  })
  async create(

    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Challan, {
            title: 'NewChallan',
            exclude: ['id'],
          }),
        },
      },
    })
    challan: Omit<Challan, 'id'>,
  ): Promise<Challan> {
    const existingChallan = await this.challanRepository.findOne({
      where: {
        and: [{ poNumber: challan.poNumber }, { customerId: currnetUser.id }],
      },
    });
    if (existingChallan && existingChallan.poNumber == challan.poNumber) {
      throw new HttpErrors.BadRequest(
        'PO Number is already used in another Challan for this customer.',
      );
    }

    const createdChallan = await this.challanRepository.create(challan);

    if (!createdChallan || !createdChallan.id) {
      throw new HttpErrors.BadRequest('Something went wrong');
    }

    const formattedChallanId = `CHALLAN${createdChallan.id.toString().padStart(5, '0')}`;
    await this.challanRepository.updateById(createdChallan.id, { challanId: formattedChallanId });

    return createdChallan;
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.DISPATCH,
        PermissionKeys.SUPERVISOR
      ],
    },
  })
  @get('/challans')
  @response(200, {
    description: 'Array of Challan model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Challan, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Challan) filter?: Filter<Challan>,
  ): Promise<Challan[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        {
          relation: 'quotation',
          scope: {
            include: [{ relation: 'customer' }],
          },
        },
        {
          relation: 'order',
        },
        {
          relation: 'customer',
        },
      ],
      order: ['createdAt DESC'],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin') || 
      currentUserPermission.includes('supervisor')
    ) {
      return this.challanRepository.find(filter);
    } else {
      return this.challanRepository.find({
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
      required: [PermissionKeys.DISPATCH, PermissionKeys.SUPERVISOR],
    },
  })
  @get('/challans/inwardChallans')
  @response(200, {
    description: 'Array of Challan model instances with no orders',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Challan, { includeRelations: true }),
        },
      },
    },
  })
  async findChallansWithoutOrders(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(Challan) filter?: Filter<Challan>,
  ): Promise<Challan[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
        status: 2,
        id: {
          nin: (
            await this.orderRepository.find({
              fields: { challanId: true },
            })
          ).map(order => order.challanId),
        },
      },
      include: [
        {
          relation: 'quotation',
          scope: {
            include: [{ relation: 'customer' }],
          },
        },
        {
          relation: 'customer'
        }
      ],
    };

    return this.challanRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.SUPERVISOR
      ],
    },
  })
  @get('/challans/{id}')
  @response(200, {
    description: 'Challan model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Challan, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Challan, { exclude: 'where' })
    filter?: FilterExcludingWhere<Challan>,
  ): Promise<Challan> {
    filter = {
      ...filter,
      include: [
        {
          relation: 'quotation',
        },
        {
          relation: 'customer',
          scope: {
            fields: { permissions: false, password: false }
          }
        }
      ],
    };
    return this.challanRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.SUPERVISOR

      ],
    },
  })
  @patch('/challans/{id}')
  @response(204, {
    description: 'Challan PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Challan, { partial: true }),
        },
      },
    })
    challan: Challan,
  ): Promise<void> {
    const existingChallan = await this.challanRepository.findOne({
      where: {
        and: [
          { poNumber: challan.poNumber },
          { customerId: currnetUser.id },
          { id: { neq: id } }
        ],
      },
    });

    if (existingChallan) {
      throw new HttpErrors.BadRequest('PO Number is already used in another Challan.');
    }
    await this.challanRepository.updateById(id, challan);
  }

  @del('/challans/{id}')
  @response(204, {
    description: 'Challan DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.challanRepository.deleteById(id);
  }

  // material arraived to notify customer
  @authenticate({
    strategy: 'jwt'
  })
  @post('/challans/material-arrived/{id}')
  async materialArrived(
    @param.path.number('id') id: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const challanDetails: any = await this.challanRepository.findById(id, { include: [{ relation: 'customer' }] });
      if (!challanDetails) {
        throw new HttpErrors.NotFound('Challan not found');
      }

      // sending notification to customer...
      if (!challanDetails?.customerId) {
        throw new HttpErrors.BadRequest('Customer details are missing')
      }

      await this.notificationRepository.create({
        avatarUrl: challanDetails?.customer?.avatar?.fileUrl ? challanDetails?.customer?.avatar?.fileUrl : null,
        title: `Material with challan ${challanDetails?.challanId} arrived`,
        type: 'material',
        status: 0,
        userId: 0,
        customerId: challanDetails?.customerId,
        extraDetails: {
          challanId: challanDetails.id,
        },
      });

      await this.challanRepository.updateById(challanDetails?.id, { status: 1 });

      return {
        success: true,
        message: 'Material Arrived notification sent'
      }
    } catch (error) {
      throw error;
    }
  }
}
