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
  HsnMaster,
} from '../models';
import {ItemsRepository} from '../repositories';

export class ItemsHsnMasterController {
  constructor(
    @repository(ItemsRepository)
    public itemsRepository: ItemsRepository,
  ) { }

  @get('/items/{id}/hsn-master', {
    responses: {
      '200': {
        description: 'HsnMaster belonging to Items',
        content: {
          'application/json': {
            schema: getModelSchemaRef(HsnMaster),
          },
        },
      },
    },
  })
  async getHsnMaster(
    @param.path.number('id') id: typeof Items.prototype.id,
  ): Promise<HsnMaster> {
    return this.itemsRepository.hsnMaster(id);
  }
}
