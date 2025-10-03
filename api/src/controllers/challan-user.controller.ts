import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Challan,
  User,
} from '../models';
import {ChallanRepository} from '../repositories';

export class ChallanUserController {
  constructor(
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
  ) { }

  @get('/challans/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Challan',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Challan.prototype.id,
  ): Promise<User> {
    return this.challanRepository.deletedByUser(id);
  }
}
