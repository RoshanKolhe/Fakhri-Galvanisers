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
import {
  LotProcesses,
  Material,
  Order,
  OrderQcTest,
  Payment,
  QcReport,
} from '../models';
import {
  ChallanRepository,
  LotProcessesRepository,
  LotsRepository,
  MaterialRepository,
  MaterialUserRepository,
  OrderQcTestRepository,
  OrderRepository,
  PaymentRepository,
  QcReportRepository,
} from '../repositories';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';
import { inject } from '@loopback/core';
import { FakhriGalvanisersDataSource } from '../datasources';
import { UserProfile } from '@loopback/security';

export class OrderController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
    @repository(MaterialRepository)
    public materialRepository: MaterialRepository,
    @repository(MaterialUserRepository)
    public materialUserRepository: MaterialUserRepository,
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
    @repository(LotsRepository)
    public lotsRepository: LotsRepository,
    @repository(LotProcessesRepository)
    public lotProcessesRepository: LotProcessesRepository,
    @repository(QcReportRepository)
    public qcReportRepository: QcReportRepository,
    @repository(OrderQcTestRepository)
    public orderQcTestRepository: OrderQcTestRepository,
  ) { }

  @authenticate({
    strategy: 'jwt',
  })
  @post('/orders')
  @response(200, {
    description: 'Order model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Order) } },
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
            },
          },
        },
      },
    })
    orderData: Omit<Order, 'id' | 'orderId'> & { materials: object[] },
  ): Promise<Order> {
    const { materials, ...orderFields } = orderData;
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const challan = await this.challanRepository.findById(
        orderData.challanId,
        { include: ['order'] },
      );
      if (challan.order) {
        throw new HttpErrors.BadRequest(
          'Order Already Exists for this challan',
        );
      }
      const inputData: Partial<Order> = {
        ...orderFields,
        customerId: challan.customerId,
        challanImages: challan.challanImages,
        poImages: challan.poImages,
        vehicleImages: challan.vehicleImages,
        materialImages: challan.materialImages,
        status: 0,
        isPaid: false,
        timeline: [
          {
            id: 0,
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

      if (orderData.materials && orderData.materials.length > 0) {
        const mappedMaterials = orderData.materials.map((material: any) => ({
          microns: material.microns,
          hsnCode: material.hsnCode,
          totalQuantity: material.totalQuantity,
          materialType: material.materialType,
          noOfLots: material.noOfLots,
          startDate: material.startDate,
          endDate: material.endDate,
          preTreatmentUserId: material.preTreatmentUserId,
          galvanizingUserId: material.galvanizingUserId,
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

      const savedMaterials = await this.materialRepository.find({
        where: { orderId: createdOrder.id },
        order: ['id ASC'], // to match input index
      }, { transaction: tx });

      for (let i = 0; i < orderData.materials.length; i += 1) {
        const material = orderData.materials[i];
        const savedMaterial = savedMaterials[i];

        if (material.status === 0 && material.lots && material.lots.length > 0) {
          for (const lotData of material.lots) {
            const lot: any = lotData;
            const savedLot = await this.lotsRepository.create({
              lotNumber: lot.lotNumber.toString(),
              materialId: savedMaterial.id,
              quantity: lot.quantity,
              filing: lot.filing,
              visualInspection: lot.visualInspection,
              status: 0,
            }, { transaction: tx });

            const combinedProcesses = [
              ...(lot.preTreatmentProcesses || []),
              ...(lot.galvanizingProcesses || []),
            ];

            for (const process of combinedProcesses) {
              await this.lotProcessesRepository.create({
                lotsId: savedLot.id,
                processesId: process.processId,
                duration: process.duration,
                status: 0,
              }, { transaction: tx });
            }
          }
        }
      }
      let subtotal = 0;
      let totalTax = 0;
      let grandTotal = 0;

      challan.materials.forEach((material: any) => {
        const pricePerUnit = parseFloat(material?.pricePerUnit) || 0;
        const quantity = parseFloat(material?.quantity) || 0;
        const tax = parseFloat(material?.tax) || 0;
        if (pricePerUnit && quantity) {
          const totalPrice = pricePerUnit * quantity;
          const taxAmount = (totalPrice * tax) / 100;

          subtotal += totalPrice;
          totalTax += taxAmount;
          grandTotal += totalPrice + taxAmount;
        }
      });
      const formattedInvoiceId = `PI-${createdOrder.id.toString().padStart(4, '0')}`;
      const paymentData: Partial<Payment> = {
        orderId: createdOrder.id,
        performaId: formattedInvoiceId,
        dueDate: new Date(),
        totalAmount: grandTotal,
        customerId: challan.customerId,
      };
      await this.paymentRepository.create(paymentData, {
        transaction: tx,
      });

      await this.challanRepository.updateById(orderData?.challanId, { status: 3 }, { transaction: tx });
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
          items: getModelSchemaRef(Order, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        { relation: 'materials' },
        { relation: 'customer' },
        { relation: 'challan' },
        { relation: 'payment' },
        { relation: 'dispatch' },
      ],
      order: ['createdAt DESC'],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin')
    ) {
      return this.orderRepository.find(filter);
    } else {
      return this.orderRepository.find({
        ...filter,
        where: {
          ...filter?.where,
          customerId: currnetUser.id,
        },
      });
    }
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/orders/{id}')
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, { exclude: 'where' })
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
              { relation: 'preTreatmentUser' },
              { relation: 'galvanizingUser' },
              { relation: 'processes' },
              { relation: 'lots', scope: { include: ['processes'] } },
            ],
          },
        },
        { relation: 'orderQcTests' },
        { relation: 'customer' },
        { relation: 'challan' },
        { relation: 'payment' },
        { relation: 'dispatch' },
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
                process['processesDetails'] = matchedProcess;
              }
              return { ...process };
            });
            return { ...lot };
          });

          return { ...material };
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
    content: { 'application/json': { schema: getModelSchemaRef(Order) } },
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
                items: { type: 'object' }, // Accepts materials array
              },
            },
          },
        },
      },
    })
    orderData: Partial<Omit<Order, 'id' | 'orderId'>> & { materialsData?: any[] },
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {
      const { materialsData, ...orderWithoutMaterials } = orderData;

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
        { transaction: tx },
      );

      if (materialsData && materialsData.length > 0) {
        for (const material of materialsData) {
          const materialId = material.id;

          console.log(material);
          await this.materialRepository.updateById(
            materialId,
            {
              startDate: material.startDate,
              endDate: material.endDate,
              status: material.status,
              noOfLots: material.noOfLots,
              preTreatmentUserId: material.preTreatmentUser?.id,
              galvanizingUserId: material.galvanizingUser?.id,
              remark: material.remark,
            },
            { transaction: tx },
          );
          // const existingProcesses = await this.materialRepository
          //   .processes(materialId)
          //   .find();

          // if (existingProcesses.length > 0) {
          //   await this.materialRepository
          //     .processes(materialId)
          //     .unlinkAll({ transaction: tx });
          // }

          // const existingUsers = await this.materialRepository
          //   .users(materialId)
          //   .find();

          // if (existingUsers.length > 0) {
          //   await this.materialRepository
          //     .users(materialId)
          //     .unlinkAll({ transaction: tx });
          // }

          // for (const process of material.processes) {
          //   await this.materialRepository
          //     .processes(materialId)
          //     .link(process.id, { transaction: tx });
          // }

          // // Update or insert assigned workers
          // for (const worker of material.users) {
          //   await this.materialRepository
          //     .users(materialId)
          //     .link(worker.id, { transaction: tx });
          // }
          const materialLots = await this.lotsRepository.find({
            where: {
              materialId: materialId,
            },
            include: ['processes'],
          });

          console.log('material lots', materialLots);
          for (const lot of material.lots) {
            if (material.status === 0) {
              if (materialLots && materialLots.length > 0) {
                for (const materialLot of materialLots) {
                  if (materialLot.lotNumber === lot.lotNumber) {
                    await this.lotsRepository.updateById(materialLot.id, {
                      quantity: lot.quantity,
                      filing: lot.filing,
                      visualInspection: lot.visualInspection,
                    });
                    for (const lotProcess of materialLot.processes) {
                      console.log('lotProcess', lotProcess);
                      console.log('lot.proccesses', lot);
                      const allProcesses = [
                        ...(lot.galvanizingProcesses || []),
                        ...(lot.preTreatmentProcesses || []),
                      ];

                      const foundLotFromMaterial = allProcesses.find(
                        (res: any) => res.processId === lotProcess.id,
                      );
                      console.log('foundLotsProcesses', foundLotFromMaterial)
                      if (foundLotFromMaterial) {
                        await this.lotProcessesRepository.updateAll(
                          {
                            duration: foundLotFromMaterial.duration,
                          },
                          {
                            lotsId: materialLot.id,
                            processesId: foundLotFromMaterial.processId,
                          },
                          { transaction: tx },
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
                    filing: lot.filing,
                    visualInspection: lot.visualInspection,
                    status: 0,
                  },
                  { transaction: tx },
                );

                for (const processData of [...lot.preTreatmentProcesses, ...lot.galvanizingProcesses]) {
                  await this.lotProcessesRepository.create(
                    {
                      lotsId: savedLot.id,
                      processesId: processData.processId,
                      duration: processData.duration,
                      status: 0,
                    },
                    { transaction: tx },
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
                  relation: 'galvanizingUser',
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
                  relation: 'preTreatmentUser',
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
          { relation: 'customer' },
          { relation: 'challan' },
        ],
      });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
  })
  @post('/orders/getJobCard')
  async getJobCard(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              materialId: { type: 'number' },
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
    const { materialId } = requestData;
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

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.WORKER],
    },
  })
  @post('/orders/getWorkerWiseJobs')
  async getWorkerJobCard(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ) {
    const userId = currentUser.id;

    // Step 1: Get material IDs assigned to this user from junction table
    const assignedMaterials = await this.materialUserRepository.find({
      where: { userId: userId },
    });

    // Extract material IDs
    const materialIds = assignedMaterials.map(record => record.materialId);

    if (materialIds.length === 0) {
      return []; // No materials assigned to this user
    }

    // Step 2: Fetch materials by their IDs and include related orders
    const materials = await this.materialRepository.find({
      where: { id: { inq: materialIds } }, // Filter materials by IDs
      include: [{ relation: 'order' }], // Include order details
    });

    return materials;
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.WORKER],
    },
  })
  @post('/orders/getWorkerMaterialLotAndProcess')
  async getWorkerMaterialLotAndProcess(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              materialId: { type: 'number' },
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
    const materialWithLots = await this.materialRepository.findById(
      requestData.materialId,
      {
        include: [
          { relation: 'order' },
          { relation: 'lots', scope: { include: ['processes'] } },
        ],
      },
    );
    const lotProcesses: any = await this.lotProcessesRepository.find({
      where: {
        lotsId: {
          inq: materialWithLots.lots?.map((lot: any) => lot.id) || [],
        },
      },
    });
    if (materialWithLots.lots && materialWithLots.lots.length > 0) {
      materialWithLots.lots = materialWithLots.lots.map((lot: any) => {
        const matchingLotProcess = lotProcesses.filter(
          (lotProcess: any) => lotProcess.lotsId === lot.id,
        );

        // Modify lot processes
        lot.processes = lot.processes.map((process: any) => {
          const matchedProcess = matchingLotProcess.find(
            (lp: any) => lp.processesId === process.id,
          );
          if (matchedProcess) {
            process['processesDetails'] = {
              ...matchedProcess,
              durationInMs: matchedProcess.duration
                ? new Date(matchedProcess.duration).getTime()
                : null,
              timeTakenInMs: matchedProcess.timeTaken
                ? new Date(matchedProcess.timeTaken).getTime()
                : null,
            };
          }
          return { ...process };
        });
        return { ...lot };
      });
    }
    return { ...materialWithLots };
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.WORKER],
    },
  })
  @post('/orders/{id}/updateLotProcess')
  async updateLotProcess(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              lotsId: { type: 'number' },
              processesId: { type: 'number' },
              processData: {
                type: 'object',
                properties: {
                  timeTaken: { type: 'string', format: 'date-time' },
                  status: {
                    type: 'number',
                  },
                },
              },
            },
            required: ['lotsId', 'processesId'],
          },
        },
      },
    })
    requestData: {
      lotsId: number;
      processesId: number;
      processData: {
        timeTaken?: string;
        status?: number;
      };
    },
    @param.path.number('id') orderId: number,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(Order, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const { lotsId, processesId, processData } = requestData;

      const updateData: Partial<LotProcesses> = {};
      updateData.status = processData?.status ? processData.status : 1;

      if (processData?.timeTaken) {
        updateData.timeTaken = processData.timeTaken;
        updateData.status = 2;
      }

      await this.lotProcessesRepository.updateAll(
        updateData,
        {
          lotsId: lotsId,
          processesId: processesId,
        },
        { transaction: tx },
      );
      tx.commit();
      await this.updateOrderAndMaterialStatus(orderId);
      return Promise.resolve({
        status: 1,
        msg: 'Lot process Updated Successfully',
      });
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/orders/{id}')
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }

  async updateOrderAndMaterialStatus(orderId: number): Promise<void> {
    // Fetch all materials related to the order
    const order = await this.orderRepository.findById(orderId);
    const materials = await this.materialRepository.find({
      where: { orderId },
      include: [{ relation: 'lots' }],
    });

    let allMaterialsCompleted = true;

    for (const material of materials) {
      let allLotsCompleted = true;
      let materialInProgress = false;

      // Fetch all lot IDs for this material
      const lotIds = material.lots.map(lot => lot.id);
      if (lotIds.length === 0) continue;

      // Fetch lot processes separately using lotIds from the junction table
      const lotProcesses: any = await this.lotProcessesRepository.find({
        where: { lotsId: { inq: lotIds } },
      });

      // Group lot processes by lotId
      const lotProcessMap = new Map<number, any[]>();
      for (const process of lotProcesses) {
        if (!lotProcessMap.has(process.lotsId)) {
          lotProcessMap.set(process.lotsId, []);
        }
        lotProcessMap.get(process.lotsId)?.push(process);
      }

      for (const lot of material.lots) {
        const processes: any = lot.id ? lotProcessMap.get(lot.id) : [];
        let allProcessesCompleted = true;
        let lotInProgress = false;

        for (const process of processes) {
          if (process.status === 1) {
            lotInProgress = true;
            allProcessesCompleted = false;
          } else if (process.status !== 2) {
            allProcessesCompleted = false;
          }
        }

        // Update lot status
        const lotStatus = lotInProgress ? 1 : allProcessesCompleted ? 2 : 0;
        await this.lotsRepository.updateById(lot.id, { status: lotStatus });
        if (allProcessesCompleted) {
          const alreadyPresent = await this.qcReportRepository.findOne({
            where: {
              lotsId: lot.id,
            },
          });
          if (!alreadyPresent) {
            const inputData: Partial<QcReport> = {
              orderId: orderId,
              materialId: material.id,
              lotsId: lot.id,
              status: 0,
            };
            await this.qcReportRepository.create(inputData);
          }
        }

        if (lotStatus === 1) materialInProgress = true;
        if (lotStatus !== 2) allLotsCompleted = false;
      }

      // Update material status
      const materialStatus = materialInProgress ? 1 : allLotsCompleted ? 2 : 1;
      await this.materialRepository.updateById(material.id, {
        status: materialStatus,
      });

      if (materialStatus !== 2) allMaterialsCompleted = false;
    }

    // Update order status
    const orderStatus = allMaterialsCompleted ? 2 : 1;
    const orderTimeline = order.timeline || [];
    const statusTimelineMap = {
      1: { id: 1, title: 'In Process' },
      2: { id: 2, title: 'Material Ready' },
    };

    if (orderStatus in statusTimelineMap) {
      const newEntry = {
        id: statusTimelineMap[orderStatus].id,
        title: statusTimelineMap[orderStatus].title,
        time: new Date().toISOString(),
      };

      // Check if the entry already exists
      const isAlreadyPresent = orderTimeline.some(
        (entry: any) => entry.id === newEntry.id,
      );

      if (!isAlreadyPresent) {
        orderTimeline.push(newEntry);
      }
    }

    await this.orderRepository.updateById(orderId, {
      status: orderStatus,
      timeline: orderTimeline,
    });
  }

  @post('/orders/{orderId}/order-qc-tests')
  @response(200, {
    description: 'Multiple OrderQcTest model instances created',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { 'x-ts-type': OrderQcTest },
        },
      },
    },
  })
  async createMultipleOrderQcTests(
    @param.path.number('orderId') orderId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'specification',
                'testDetails',
                'requirement',
                'observed',
                'micronTestValues'
              ],
              properties: {
                specification: { type: 'string' },
                testDetails: { type: 'string' },
                requirement: { type: 'string' },
                testResult: { type: 'string' },
                observed: { type: 'string' },
                micronTestValues: {type: 'array', items: {type: 'number'}},
                images: { type: 'array', items: { type: 'string' } },
                status: { type: 'number' },
                remark: { type: 'string' },
              },
            },
          },
        },
      },
    })
    tests: Array<
      Omit<
        OrderQcTest,
        'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted' | 'orderId'
      >
    >,
  ): Promise<OrderQcTest[]> {
    await this.orderQcTestRepository.deleteAll({ orderId });
    const records = tests.map(test => ({
      ...test,
      orderId,
      isDeleted: false,
    }));

    return this.orderQcTestRepository.createAll(records);
  }
}
