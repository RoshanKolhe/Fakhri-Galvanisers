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
} from '@loopback/rest';
import {Quotation} from '../models';
import {
  NotificationRepository,
  QuotationRepository,
  UserRepository,
} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';
import {formatRFQId} from '../utils/constants';

export class QuotationController {
  constructor(
    @repository(QuotationRepository)
    public quotationRepository: QuotationRepository,
    @repository(NotificationRepository)
    public notificationRepository: NotificationRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
      ],
    },
  })
  @post('/quotations')
  @response(200, {
    description: 'Quotation model instance',
    content: {'application/json': {schema: getModelSchemaRef(Quotation)}},
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
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<Quotation> {
    const user: any = await this.userRepository.findById(currnetUser.id);
    const inputData: Partial<Quotation> = {
      ...quotation,
      createdByType: currnetUser.userType,
      createdBy: currnetUser.id,
      updatedByType: currnetUser.userType,
      updatedBy: currnetUser.id,
    };
    const quotationData = await this.quotationRepository.create(inputData);

    if (quotation.status === 4) {
      await this.notificationRepository.create({
        avatarUrl: user?.avatar?.fileUrl ? user?.avatar?.fileUrl : null,
        title: `A new Request for Quotation (RFQ) has been submitted by ${currnetUser.name}.`,
        type: 'quotation',
        status: 0,
        userId: 0,
        extraDetails: {
          rfqId: quotationData.id,
        },
      });
    }
    if (quotation.status === 2) {
      console.log('here');
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
    }
    return quotationData;
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
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
          items: getModelSchemaRef(Quotation, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Quotation) filter?: Filter<Quotation>,
  ): Promise<Quotation[]> {
    console.log('currnetUser', currnetUser.id);
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: ['customer'],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin')
    ) {
      return this.quotationRepository.find(filter);
    } else {
      console.log(filter);

      return this.quotationRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          customerId: currnetUser.id,
        },
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
      ],
    },
  })
  @get('/quotations/{id}')
  @response(200, {
    description: 'Quotation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Quotation, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Quotation, {exclude: 'where'})
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
      ],
    },
  })
  @patch('/quotations/{id}')
  @response(204, {
    description: 'Quotation PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Quotation, {partial: true}),
        },
      },
    })
    quotation: Quotation,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<void> {
    const user: any = await this.userRepository.findById(currentUser.id);
    await this.quotationRepository.updateById(id, {
      ...quotation,
      updatedBy: currentUser.id,
      updatedByType: currentUser.userType,
    });

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
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.quotationRepository.deleteById(id);
  }
}
