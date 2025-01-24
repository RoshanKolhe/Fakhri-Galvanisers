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
import {Inquiry} from '../models';
import {InquiryRepository} from '../repositories';

export class InquiryController {
  constructor(
    @repository(InquiryRepository)
    public inquiryRepository : InquiryRepository,
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
    @param.filter(Inquiry, {exclude: 'where'}) filter?: FilterExcludingWhere<Inquiry>
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

  @del('/inquiries/{id}')
  @response(204, {
    description: 'Inquiry DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.inquiryRepository.deleteById(id);
  }
}
