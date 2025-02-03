import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
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
  getJsonSchemaRef,
} from '@loopback/rest';
import * as _ from 'lodash';
import {Customer, Inquiry} from '../models';
import {CustomerRepository, InquiryRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';
import {FakhriGalvanisersDataSource} from '../datasources';
import {validateCredentials} from '../services/validator';
import {BcryptHasher} from '../services/hash.password.bcrypt';

export class InquiryController {
  constructor(
    @repository(InquiryRepository)
    public inquiryRepository: InquiryRepository,
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  @post('/inquiries')
  @response(200, {
    description: 'Inquiry model instance',
    content: {'application/json': {schema: getModelSchemaRef(Inquiry)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Inquiry, {
            title: 'NewInquiry',
            exclude: ['id'],
          }),
        },
      },
    })
    inquiry: Omit<Inquiry, 'id'>,
  ): Promise<Inquiry> {
    return this.inquiryRepository.create(inquiry);
  }

  @get('/inquiries')
  @response(200, {
    description: 'Array of Inquiry model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Inquiry, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Inquiry) filter?: Filter<Inquiry>,
  ): Promise<Inquiry[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
    };
    return this.inquiryRepository.find(filter);
  }

  @get('/inquiries/{id}')
  @response(200, {
    description: 'Inquiry model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Inquiry, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Inquiry, {exclude: 'where'})
    filter?: FilterExcludingWhere<Inquiry>,
  ): Promise<Inquiry> {
    return this.inquiryRepository.findById(id, filter);
  }

  @patch('/inquiries/{id}')
  @response(204, {
    description: 'Inquiry PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Inquiry, {partial: true}),
        },
      },
    })
    inquiry: Inquiry,
  ): Promise<void> {
    await this.inquiryRepository.updateById(id, inquiry);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/inquiries/{id}')
  @response(204, {
    description: 'Inquiry DELETE success',
  })
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new HttpErrors.BadRequest('Inquiry Not Found');
    }

    await this.inquiryRepository.updateById(id, {
      isDeleted: true,
      deletedBy: currentUser.id,
      deletedAt: new Date(),
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @post('/inquiryToCustomer/{inquiryId}', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(Customer),
        },
      },
    },
  })
  async inquiryToCustomer(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<Customer, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.path.number('inquiryId') inquiryId: number,
  ) {
    const repo = new DefaultTransactionalRepository(Customer, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const customer = await this.customerRepository.findOne({
        where: {
          or: [{email: userData.email}],
        },
      });
      const inquiry = await this.inquiryRepository.findOne({
        where: {
          or: [{id: inquiryId}],
        },
      });
      if (customer) {
        throw new HttpErrors.BadRequest('Customer Already Exists');
      }
      if (!inquiry) {
        throw new HttpErrors.BadRequest('Inquiry Not Found');
      }

      validateCredentials(userData);
      userData.permissions = [PermissionKeys.CUSTOMER];
      userData.password = await this.hasher.hashPassword(userData.password);
      userData.createdByType = 'admin';
      userData.createdBy = currnetUser.id;
      userData.updatedByType = 'admin';
      userData.updatedBy = currnetUser.id;
      userData.inquiryId = inquiryId;
      const savedUser = await this.customerRepository.create(userData, {
        transaction: tx,
      });
      await this.inquiryRepository.updateById(
        inquiryId,
        {status: 2},
        {
          transaction: tx,
        },
      );

      const savedUserData = _.omit(savedUser, 'password');
      tx.commit();
      return Promise.resolve({
        success: true,
        userData: savedUserData,
        message: `Customer registered successfully`,
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }
}
