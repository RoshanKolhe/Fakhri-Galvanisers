import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterExcludingWhere,
  IsolationLevel,
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
import {Material, Order} from '../models';
import {
  ChallanRepository,
  LotProcessesRepository,
  LotsRepository,
  MaterialRepository,
  OrderRepository,
} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {FakhriGalvanisersDataSource} from '../datasources';
import {UserProfile} from '@loopback/security';

export class OrderController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(MaterialRepository)
    public materialRepository: MaterialRepository,
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
    @repository(LotsRepository)
    public lotsRepository: LotsRepository,
    @repository(LotProcessesRepository)
    public lotProcessesRepository: LotProcessesRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
  })
  @post('/orders')
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,

    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(Order, {
                title: 'NewOrder',
                exclude: ['id', 'orderId'],
              }).definitions?.NewOrder?.properties,
              materials: {
                type: 'array',
                items: {type: 'object'}, // Define materials as an array of objects
              },
            },
            required: ['materials'], // Ensure materials are provided
          },
        },
      },
    })
    orderData: Omit<Order, 'id' | 'orderId'> & {materials: object[]},
  ): Promise<Order> {
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const {materials, ...orderWithoutMaterials} = orderData;
      const inputData: Partial<Order> = {
        ...orderWithoutMaterials,
        status: 1,
        timeline: [
          {
            id: 1,
            title: 'Material Received',
            time: new Date(),
          },
        ],
        createdBy: currnetUser.id,
        createdByType: currnetUser.userType,
        updatedBy: currnetUser.id,
        updatedByType: currnetUser.userType,
      };
      const createdOrder = await this.orderRepository.create(inputData, {
        transaction: tx,
      });

      const formattedOrderId = `ORD${createdOrder.id.toString().padStart(5, '0')}`;
      await this.orderRepository.updateById(
        createdOrder.id,
        {
          orderId: formattedOrderId,
        },
        {
          transaction: tx,
        },
      );
      if (materials && materials.length > 0) {
        const mappedMaterials = materials.map((material: any) => ({
          microns: material.microns,
          hsnCode: material.hsnNo.hsnCode,
          totalQuantity: material.quantity,
          materialType: material.materialType,
          orderId: createdOrder.id,
          status: 0,
          createdBy: currnetUser.id,
          createdByType: currnetUser.userType,
          updatedBy: currnetUser.id,
          updatedByType: currnetUser.userType,
        }));

        await this.materialRepository.createAll(mappedMaterials, {
          transaction: tx,
        });
      }
      tx.commit();
      return this.orderRepository.findById(createdOrder.id, {
        include: ['materials'],
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/orders')
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        {relation: 'materials'},
        {relation: 'customer'},
        {relation: 'challan'},
      ],
    };
    return this.orderRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<any> {
    // Include relations like materials, users, processes, etc.
    filter = {
      ...filter,
      include: [
        {
          relation: 'materials',
          scope: {
            include: [
              {relation: 'users'},
              {relation: 'processes'},
              {relation: 'lots', scope: {include: ['processes']}},
            ],
          },
        },
        {relation: 'customer'},
        {relation: 'challan'},
      ],
    };

    const order: any = await this.orderRepository.findById(id, filter);
    const lotProcesses: any = await this.lotProcessesRepository.find({
      where: {
        lotsId: {
          inq: order.materials.flatMap(
            (material: any) => material.lots?.map((lot: any) => lot.id) || [],
          ),
        },
      },
    });
    if (lotProcesses && lotProcesses.length) {
      order.materials = order.materials.map((material: any) => {
        if (material.lots && material.lots.length > 0) {
          material.lots = material.lots.map((lot: any) => {
            const matchingLotProcess = lotProcesses.filter(
              (lotProcess: any) => lotProcess.lotsId === lot.id,
            );

            // Modify lot processes
            lot.processes = lot.processes.map((process: any) => {
              const matchedProcess = matchingLotProcess.find(
                (lp: any) => lp.processesId === process.id,
              );
              if (matchedProcess) {
                process.duration = matchedProcess.duration;
                process.timeTaken = matchedProcess.timeTaken;
                process.lotProcessesStatus = matchedProcess.status;
              }
              return {...process};
            });
            return {...lot};
          });

          return {...material};
        }
        return material;
      });
    }
    return order;
  }

  @authenticate({
    strategy: 'jwt',
  })
  @patch('/orders/{id}')
  @response(200, {
    description: 'Order model updated successfully',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async updateOrder(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.path.number('id') orderId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(Order, {
                title: 'UpdateOrder',
                partial: true, // Allows partial updates
              }).definitions?.UpdateOrder?.properties,
              materialsData: {
                type: 'array',
                items: {type: 'object'}, // Accepts materials array
              },
            },
          },
        },
      },
    })
    orderData: Partial<Omit<Order, 'id' | 'orderId'>> & {materialsData?: any[]},
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {materialsData, ...orderWithoutMaterials} = orderData;

      // Ensure the order exists
      const existingOrder = await this.orderRepository.findById(orderId);
      if (!existingOrder) {
        throw new HttpErrors.NotFound('Order not found');
      }

      // Update order details if provided
      await this.orderRepository.updateById(
        orderId,
        {
          ...orderWithoutMaterials,
          updatedBy: currentUser.id,
          updatedByType: currentUser.userType,
        },
        {transaction: tx},
      );

      if (materialsData && materialsData.length > 0) {
        for (const material of materialsData) {
          const materialId = material.id;

          await this.materialRepository.updateById(
            materialId,
            {
              startDate: material.startDate,
              endDate: material.endDate,
              status: material.status,
              noOfLots: material.noOfLots,
              remark: material.remark,
            },
            {transaction: tx},
          );
          const existingProcesses = await this.materialRepository
            .processes(materialId)
            .find();

          if (existingProcesses.length > 0) {
            await this.materialRepository
              .processes(materialId)
              .unlinkAll({transaction: tx});
          }

          const existingUsers = await this.materialRepository
            .users(materialId)
            .find();

          if (existingUsers.length > 0) {
            await this.materialRepository
              .users(materialId)
              .unlinkAll({transaction: tx});
          }

          for (const process of material.processes) {
            await this.materialRepository
              .processes(materialId)
              .link(process.id, {transaction: tx});
          }

          // Update or insert assigned workers
          for (const worker of material.users) {
            await this.materialRepository
              .users(materialId)
              .link(worker.id, {transaction: tx});
          }
          const materialLots = await this.lotsRepository.find({
            where: {
              materialId: materialId,
            },
            include: ['processes'],
          });
          for (const lot of material.lots) {
            if (material.status === 0) {
              if (materialLots && materialLots.length > 0) {
                for (const materialLot of materialLots) {
                  if (materialLot.lotNumber === lot.lotNumber) {
                    await this.lotsRepository.updateById(materialLot.id, {
                      quantity: lot.quantity,
                    });
                    for (const lotProcess of materialLot.processes) {
                      const foundLotFromMaterial = lot.processes.find(
                        (res: any) => res.processId === lotProcess.id,
                      );
                      console.log(foundLotFromMaterial);
                      console.log(lotProcess.id);
                      if (foundLotFromMaterial) {
                        await this.lotProcessesRepository.updateAll(
                          {
                            duration: foundLotFromMaterial.duration,
                          },
                          {
                            lotsId: materialLot.id,
                            processesId: foundLotFromMaterial.processId,
                          },
                          {transaction: tx},
                        );
                      }
                    }
                  }
                }
              } else {
                const savedLot = await this.lotsRepository.create(
                  {
                    lotNumber: lot.lotNumber.toString(),
                    materialId: materialId,
                    quantity: lot.quantity,
                    status: 0,
                  },
                  {transaction: tx},
                );

                for (const processData of lot.processes) {
                  await this.lotProcessesRepository.create(
                    {
                      lotsId: savedLot.id,
                      processesId: processData.processId,
                      duration: processData.duration,
                      status: 0,
                    },
                    {transaction: tx},
                  );
                }
              }
            }
          }
        }
      }

      await tx.commit();
      return this.orderRepository.findById(orderId, {
        include: [
          {
            relation: 'materials',
            scope: {
              include: [
                {
                  relation: 'users',
                  scope: {
                    fields: {
                      password: false,
                      otp: false,
                      otpExpireAt: false,
                      permissions: false,
                    },
                  },
                },
                {
                  relation: 'processes',
                },
              ],
            },
          },
          {relation: 'customer'},
          {relation: 'challan'},
        ],
      });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @post('/orders/getJobCard')
  async getJobCard(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              materialId: {type: 'number'},
            },
            required: ['materialId'],
          },
        },
      },
    })
    requestData: {
      materialId: number;
    },
  ) {
    const {materialId} = requestData;
    const lots = await this.lotsRepository.find({
      where: {
        materialId: materialId,
      },
    });

    const mappedLots = await Promise.all(
      lots.map(async res => {
        const lotProcessesData = await this.lotProcessesRepository.find({
          where: {
            lotsId: res.id,
          },
        });

        if (lotProcessesData.length > 0) {
          return lotProcessesData.map(lotProcess => ({
            ...res,
            processes: {
              duration: lotProcess.duration,
              timeTaken: lotProcess.timeTaken,
            },
          }));
        } else {
          return res; // Keep original lot if no processes found
        }
      }),
    );

    return mappedLots;
  }

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
