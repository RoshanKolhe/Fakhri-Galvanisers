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
import {Inquiry} from '../models';
import {InquiryRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class InquiryController {
  constructor(
    @repository(InquiryRepository)
    public inquiryRepository: InquiryRepository,
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
      include: [{relation: 'creator'}, {relation: 'updater'}],
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
}
