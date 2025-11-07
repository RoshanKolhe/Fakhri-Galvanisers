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
  getFilterSchemaFor,
} from '@loopback/rest';
import { Quotation } from '../models';
import {
  CustomerRepository,
  NotificationRepository,
  QuotationRepository,
  UserRepository,
} from '../repositories';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';
import { inject } from '@loopback/core';
import { UserProfile } from '@loopback/security';
import { formatRFQId } from '../utils/constants';
import { EmailManagerBindings } from '../keys';
import { EmailManager } from '../services/email.service';
import SITE_SETTINGS from '../utils/config';
import notificationTemplate from '../templates/notification.template';

export class QuotationController {
  constructor(
    @repository(QuotationRepository)
    public quotationRepository: QuotationRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
  ) { }

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
  @post('/quotations')
  @response(200, {
    description: 'Quotation model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Quotation) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Quotation, {
            title: 'NewQuotation',
            exclude: ['id'],
          }),
        },
      },
    })
    quotation: Omit<Quotation, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<Quotation> {
    let user: any;
    if (currentUser.userType == 'customer') {
      user = await this.customerRepository.findById(currentUser.id);
    } else {
      user = await this.userRepository.findById(currentUser.id);
    }
    const inputData: Partial<Quotation> = {
      ...quotation,
      createdByType: currentUser.userType,
      createdBy: currentUser.id,
      updatedByType: currentUser.userType,
      updatedBy: currentUser.id,
    };
    const quotationData = await this.quotationRepository.create(inputData, { currentUser });

    const customer = await this.customerRepository.findById(quotation.customerId);

    if (quotation.status === 4) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `A new Request for Quotation (RFQ) has been submitted by ${currentUser.name}.`,
        type: 'quotation',
        status: 0,
        userId: 0,
        extraDetails: {
          rfqId: quotationData.id,
        },
      });
    }
    if (quotation.status === 2) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `Admin sent you the Quotation for approval`,
        type: 'quotation',
        status: 0,
        customerId: quotation.customerId,
        extraDetails: {
          rfqId: quotationData.id,
        },
      });

      const template = notificationTemplate({
        userData: customer,
        subject: `Admin sent you the Quotation for approval`,
        content: `Admin sent you the Quotation for approval`,
        buttonInfo: `Click the button below to check the quotation:`,
        buttonName: `View Quotation`,
        redirectLink: `${process.env.REACT_APP_ENDPOINT}/dashboard/quotation/${quotationData?.id}/view`
      });

      await this.emailManager.sendMail({
        from: SITE_SETTINGS.fromMail,
        to: customer.email,
        subject: template.subject,
        html: template.html,
      })
    }

    await this.quotationRepository.updateById(quotationData?.id, { status: 2 });
    return quotationData;
  }


  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.SUPERVISOR,
      ],
    },
  })
  @get('/quotations')
  @response(200, {
    description: 'Array of Quotation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Quotation, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.query.object('filter', getFilterSchemaFor(Quotation))
    filter?: Filter<Quotation>,
  ): Promise<{
    data: Quotation[]; count: {
      total: number,
      draftTotal: number,
      approvedTotal: number,
      pendingApprovalTotal: number,
      rejectedTotal: number,
      createdTotal: number,
    }
  }> {
    filter = filter ?? {};

    const baseWhere = {
      ...filter.where,
      isDeleted: false,
    };

    let finalFilter: Filter<Quotation>;

    // Check role
    const currentUserPermission = currentUser.permissions;

    if (
      currentUserPermission.includes(PermissionKeys.SUPER_ADMIN) ||
      currentUserPermission.includes(PermissionKeys.ADMIN)
    ) {
      finalFilter = {
        ...filter,
        where: baseWhere,
        include: ['customer'],
      };
    } else {
      finalFilter = {
        ...filter,
        where: {
          ...baseWhere,
          customerId: currentUser.id,
        },
        include: ['customer'],
      };
    }


    const countfilter = {
      isDeleted: false,
    }

    const data = await this.quotationRepository.find(finalFilter);
    const total = await this.quotationRepository.count(countfilter);
    const draftTotal = await this.quotationRepository.count({ ...countfilter, status: 0 },);
    const approvedTotal = await this.quotationRepository.count({ ...countfilter, status: 1 });
    const pendingApprovalTotal = await this.quotationRepository.count({ ...countfilter, status: 2 });
    const rejectedTotal = await this.quotationRepository.count({ ...countfilter, status: 3 });
    const createdTotal = await this.quotationRepository.count({ ...countfilter, status: 4 });

    return {
      data, count: {
        total: total.count,
        draftTotal: draftTotal.count,
        approvedTotal: approvedTotal.count,
        pendingApprovalTotal: pendingApprovalTotal.count,
        rejectedTotal: rejectedTotal.count,
        createdTotal: createdTotal.count,

      }
    };
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
  @get('/quotations/{id}')
  @response(200, {
    description: 'Quotation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Quotation, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Quotation, { exclude: 'where' })
    filter?: FilterExcludingWhere<Quotation>,
  ): Promise<Quotation> {
    filter = {
      ...filter,
      include: ['customer'],
    };
    return this.quotationRepository.findById(id, filter);
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
  @patch('/quotations/{id}')
  @response(204, {
    description: 'Quotation PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Quotation, { partial: true }),
        },
      },
    })
    quotation: Quotation,
  ): Promise<void> {
    let user: any;
    console.log({ currentUser })
    if (currentUser.userType == 'customer') {
      user = await this.customerRepository.findById(Number(currentUser.id));
    } else {
      user = await this.userRepository.findById(Number(currentUser.id));
    }

    const quotationExist = await this.quotationRepository.findById(id);


    await this.quotationRepository.updateById(id, {
      ...quotation,
      updatedBy: currentUser.id,
      updatedByType: currentUser.userType,

    }, { currentUser });
    console.log({ quotation })

    const customer = await this.customerRepository.findById(quotationExist.customerId);


    if (quotation.status === 2) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `Admin sent you the Quotation for approval`,
        type: 'quotation',
        status: 0,
        customerId: quotation.customerId,
        extraDetails: {
          rfqId: id,
        },
      });
    }

    // await this.quotationRepository.updateById(id, { status: 2 });

    const template = notificationTemplate({
      userData: user,
      subject: `Admin sent you the Quotation for approval`,
      content: `Admin sent you the Quotation for approval`,
      redirectLink: `https://uat.hylite.co.in/dashboard/quotation/${quotation?.id}/view`
    });

    await this.emailManager.sendMail({
      from: SITE_SETTINGS.fromMail,
      to: customer.email,
      subject: template.subject,
      html: template.html,
    })

    if (quotation.status === 1) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `Quotation ${formatRFQId(id)} has been approved by ${currentUser.name}.`,
        type: 'quotation',
        status: 0,
        userId: 0,
      });
    }
    if (quotation.status === 3) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `Quotation ${formatRFQId(id)} has been rejected by ${currentUser.name}.`,
        type: 'quotation',
        status: 0,
        userId: 0,
        extraDetails: {
          rfqId: id,
        },
      });
    }
  }

  @del('/quotations/{id}')
  @response(204, {
    description: 'Quotation DELETE success',
  })
  async deleteById(@param.path.number('id') id: number,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile
  ): Promise<void> {
    await this.quotationRepository.deleteById(id, { currentUser });
  }
}