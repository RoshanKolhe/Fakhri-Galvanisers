import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  HsnMaster,
  User,
} from '../models';
import {HsnMasterRepository} from '../repositories';

export class HsnMasterUserController {
  constructor(
    @repository(HsnMasterRepository)
    public hsnMasterRepository: HsnMasterRepository,
  ) { }

  @get('/hsn-masters/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to HsnMaster',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof HsnMaster.prototype.id,
  ): Promise<User> {
    return this.hsnMasterRepository.createdByUser(id);
  }
}
