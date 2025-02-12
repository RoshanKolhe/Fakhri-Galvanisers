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
  ): Promise<Order> {
    filter = {
      ...filter,
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
    };
    return this.orderRepository.findById(id, filter);
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
              materials: {
                type: 'array',
                items: {type: 'object'}, // Accepts materials array
              },
            },
          },
        },
      },
    })
    orderData: Partial<Omit<Order, 'id' | 'orderId'>> & {materials?: object[]},
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const {materials, ...orderWithoutMaterials} = orderData;

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

      if (materials && materials.length > 0) {
        for (const material of materials) {
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

  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
