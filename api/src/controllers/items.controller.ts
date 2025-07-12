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
import { Items, Processes } from '../models';
import { ChallanRepository, ItemProcessRepository, ItemsRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';

export class ItemsController {
  constructor(
    @repository(ItemsRepository)
    public itemsRepository: ItemsRepository,
    @repository(ItemProcessRepository)
    public itemsProcessRepository: ItemProcessRepository,
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository
  ) { }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN]
    }
  })
  @post('/items')
  @response(200, {
    description: 'Items model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Items) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Items, {
            title: 'NewItems',
            exclude: ['id'],
          }).definitions?.Items?.properties,
          processes: {
            type: 'array',
            items: { type: 'number' },
          },
          itemProcessDuration: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    })
    itemData: Omit<Items, 'id'> & {
      processes?: number[], itemProcessDuration: Array<{
        processId: number;
        processName: string;
        processDuration: string;
      }>
    },
  ): Promise<Items> {
    const { processes, itemProcessDuration, ...itemFields } = itemData;
    const item = await this.itemsRepository.create(itemFields);
    if (processes?.length) {
      for (const processId of processes) {
        await this.itemsRepository.processes(item.id).link(processId);
      }

      for (const itemProcess of itemProcessDuration) {
        const data = await this.itemsProcessRepository.findOne({
          where: {
            and: [
              { itemsId: item.id },
              { processesId: itemProcess.processId }
            ]
          }
        });

        if (data) {
          const updated = await this.itemsProcessRepository.updateById(data.id, {
            processDuration: itemProcess.processDuration,
            processName: itemProcess.processName,
          });

          console.log('Updated:', updated); // Should log success
        }
      }
    }
    return item;
  }

  @authenticate({ strategy: 'jwt' })
  @get('/items/get-by-challanId/{challanId}')
  async fetchItemsByChallans(
    @param.path.number('challanId') challanId: number,
  ): Promise<{ success: boolean; message: string; data: any[] | null }> {
    try {
      const challan: any = await this.challanRepository.findById(challanId);

      if (!challan) {
        return {
          success: false,
          message: 'Challan not found',
          data: null
        };
      }

      const challanItemsId = challan?.materials?.map((i: any) => i?.itemType?.id).filter(Boolean);

      const items = await this.itemsRepository.find({
        where: {
          id: { inq: challanItemsId }
        },
        include: [{ relation: 'processes' }]
      });

      const result: any[] = [];

      for (const itemData of items) {
        const itemProcessesMap = await this.itemsProcessRepository.find({
          where: { itemsId: itemData.id },
        });

        // Enhance processes with processDuration
        const orderedProcesses = itemProcessesMap
          .map(ip => {
            const process = itemData.processes.find(p => p.id === ip.processesId);
            if (process) {
              return {
                ...process,
                duration: ip.processDuration ?? null,
              };
            }
            return undefined;
          })
          .filter((p): p is Processes & { duration: string } => p !== undefined);

        const preTreatmentProcesses = orderedProcesses.filter(p => p.processGroup === 0);
        const galvanizingProcesses = orderedProcesses.filter(p => p.processGroup === 1);

        result.push({
          itemsId: itemData.id,
          itemName: itemData.materialType,
          preTreatmentProcesses,
          galvanizingProcesses
        });
      }

      return {
        success: true,
        message: "Items process data grouped and sequenced",
        data: result
      };
    } catch (error) {
      console.error('Error fetching items by challanId:', error);
      throw error;
    }
  }

  @get('/items/count')
  @response(200, {
    description: 'Items model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Items) where?: Where<Items>,
  ): Promise<Count> {
    return this.itemsRepository.count(where);
  }

  @get('/items')
  @response(200, {
    description: 'Array of Items model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Items, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Items) filter?: Filter<Items>,
  ): Promise<Items[]> {
    return this.itemsRepository.find({ ...filter, include: [{ relation: 'hsnMaster' }] });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN]
    }
  })
  @patch('/items')
  @response(200, {
    description: 'Items PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Items, { partial: true }),
        },
      },
    })
    items: Items,
    @param.where(Items) where?: Where<Items>,
  ): Promise<Count> {
    return this.itemsRepository.updateAll(items, where);
  }

  @get('/items/{id}')
  @response(200, {
    description: 'Items model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Items, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Items, { exclude: 'where' }) filter?: FilterExcludingWhere<Items>
  ): Promise<object> {
    const itemData = await this.itemsRepository.findById(id, {
      ...filter,
      include: [
        { relation: 'hsnMaster' },
        { relation: 'processes' },
      ],
    });

    const itemProcessesMap = await this.itemsProcessRepository.find({
      where: { itemsId: id },
    });

    const orderedProcesses = itemProcessesMap
      .map(ip => itemData.processes.find(p => p.id === ip.processesId))
      .filter((p): p is Processes => p !== undefined);

    itemData.processes = orderedProcesses;

    const itemProcessDuration = await this.itemsProcessRepository.find({
      where: {
        and: [
          { itemsId: itemData.id },
        ]
      }
    });

    return {
      ...itemData,
      itemProcessDuration: itemProcessDuration
    };
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN]
    }
  })
  @patch('/items/{id}')
  @response(204, {
    description: 'Items PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            Items,
            {
              title: 'UpdatedItems',
              partial: true
            }
          ).definitions?.Items?.properties,
          processes: {
            type: 'array',
            items: { type: 'number' },
          },
          itemProcessDuration: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    })
    items: Partial<Omit<Items, 'id'>> & {
      processes?: number[], itemProcessDuration: Array<{
        processId: number;
        processName: string;
        processDuration: string;
      }>
    },
  ): Promise<void> {
    try {
      const { processes, itemProcessDuration, ...itemFields } = items;

      // processes 
      const itemData = await this.itemsRepository.findById(id, { include: [{ relation: 'processes' }] });

      if (!itemData) {
        throw new HttpErrors.NotFound('Item not found');
      }

      if (itemData?.processes?.length > 0) {
        for (const process of itemData.processes) {
          await this.itemsRepository.processes(itemData.id).unlink(process.id);
        }
      }

      if (processes && processes?.length > 0) {
        for (const processId of processes) {
          await this.itemsRepository.processes(itemData.id).link(processId);
        }

        for (const itemProcess of itemProcessDuration) {
          const data = await this.itemsProcessRepository.findOne({
            where: {
              and: [
                { itemsId: itemData.id },
                { processesId: itemProcess.processId }
              ]
            }
          });

          if (data) {
            await this.itemsProcessRepository.updateById(data.id, { processDuration: itemProcess.processDuration, processName: itemProcess.processName });
          }
        }
      }

      // updating other data
      await this.itemsRepository.updateById(id, itemFields);

    } catch (error) {
      throw error;
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN]
    }
  })
  @put('/items/{id}')
  @response(204, {
    description: 'Items PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() items: Items,
  ): Promise<void> {
    await this.itemsRepository.replaceById(id, items);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN]
    }
  })
  @del('/items/{id}')
  @response(204, {
    description: 'Items DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemsRepository.deleteById(id);
  }
}
