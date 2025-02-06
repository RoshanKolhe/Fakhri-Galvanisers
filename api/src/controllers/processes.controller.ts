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
import {Processes} from '../models';
import {ProcessesRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class ProcessesController {
  constructor(
    @repository(ProcessesRepository)
    public processesRepository: ProcessesRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @post('/processes')
  @response(200, {
    description: 'Processes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Processes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Processes, {
            title: 'NewProcesses',
            exclude: ['id'],
          }),
        },
      },
    })
    processes: Omit<Processes, 'id'>,
  ): Promise<Processes> {
    return this.processesRepository.create(processes);
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
  @get('/processes')
  @response(200, {
    description: 'Array of Processes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Processes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Processes) filter?: Filter<Processes>,
  ): Promise<Processes[]> {
    return this.processesRepository.find(filter);
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
  @get('/processes/{id}')
  @response(200, {
    description: 'Processes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Processes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Processes, {exclude: 'where'})
    filter?: FilterExcludingWhere<Processes>,
  ): Promise<Processes> {
    return this.processesRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @patch('/processes/{id}')
  @response(204, {
    description: 'Processes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Processes, {partial: true}),
        },
      },
    })
    processes: Processes,
  ): Promise<void> {
    await this.processesRepository.updateById(id, processes);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @del('/processes/{id}')
  @response(204, {
    description: 'Processes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.processesRepository.deleteById(id);
  }
}
