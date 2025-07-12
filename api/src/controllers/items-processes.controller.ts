import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
  import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
Items,
ItemProcess,
Processes,
} from '../models';
import {ItemsRepository} from '../repositories';

export class ItemsProcessesController {
  constructor(
    @repository(ItemsRepository) protected itemsRepository: ItemsRepository,
  ) { }

  @get('/items/{id}/processes', {
    responses: {
      '200': {
        description: 'Array of Items has many Processes through ItemProcess',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Processes)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Processes>,
  ): Promise<Processes[]> {
    return this.itemsRepository.processes(id).find(filter);
  }

  @post('/items/{id}/processes', {
    responses: {
      '200': {
        description: 'create a Processes model instance',
        content: {'application/json': {schema: getModelSchemaRef(Processes)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Items.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Processes, {
            title: 'NewProcessesInItems',
            exclude: ['id'],
          }),
        },
      },
    }) processes: Omit<Processes, 'id'>,
  ): Promise<Processes> {
    return this.itemsRepository.processes(id).create(processes);
  }

  @patch('/items/{id}/processes', {
    responses: {
      '200': {
        description: 'Items.Processes PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Processes, {partial: true}),
        },
      },
    })
    processes: Partial<Processes>,
    @param.query.object('where', getWhereSchemaFor(Processes)) where?: Where<Processes>,
  ): Promise<Count> {
    return this.itemsRepository.processes(id).patch(processes, where);
  }

  @del('/items/{id}/processes', {
    responses: {
      '200': {
        description: 'Items.Processes DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Processes)) where?: Where<Processes>,
  ): Promise<Count> {
    return this.itemsRepository.processes(id).delete(where);
  }
}
