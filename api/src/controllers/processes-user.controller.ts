import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Processes,
  User,
} from '../models';
import {ProcessesRepository} from '../repositories';

export class ProcessesUserController {
  constructor(
    @repository(ProcessesRepository)
    public processesRepository: ProcessesRepository,
  ) { }

  @get('/processes/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Processes',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Processes.prototype.id,
  ): Promise<User> {
    return this.processesRepository.createdByUser(id);
  }
}
