import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Items,
  User,
} from '../models';
import {ItemsRepository} from '../repositories';

export class ItemsUserController {
  constructor(
    @repository(ItemsRepository)
    public itemsRepository: ItemsRepository,
  ) { }

  @get('/items/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Items',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Items.prototype.id,
  ): Promise<User> {
    return this.itemsRepository.deleter(id);
  }
}
