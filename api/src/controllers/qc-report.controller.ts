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
import {QcReport, QcTest} from '../models';
import {
  DispatchRepository,
  MaterialRepository,
  OrderRepository,
  QcReportRepository,
  QcTestRepository,
} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {FakhriGalvanisersDataSource} from '../datasources';

export class QcReportController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @repository(QcReportRepository)
    public qcReportRepository: QcReportRepository,
    @repository(QcTestRepository)
    public qcTestRepository: QcTestRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(MaterialRepository)
    public materialRepository: MaterialRepository,
    @repository(DispatchRepository)
    public dispatchRepository: DispatchRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @post('/qc-reports')
  @response(200, {
    description: 'QcReport model instance',
    content: {'application/json': {schema: getModelSchemaRef(QcReport)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(QcReport, {
            title: 'NewQcReport',
            exclude: ['id'],
          }),
        },
      },
    })
    qcReport: Omit<QcReport, 'id'>,
  ): Promise<QcReport> {
    return this.qcReportRepository.create(qcReport);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.WORKER],
    },
  })
  @post('/qc-reports/{id}/create-tests')
  @response(200, {
    description: 'QcReport model instance',
    content: {'application/json': {schema: getModelSchemaRef(QcReport)}},
  })
  async createQCTests(
    @param.path.number('id') qcReportId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(QcTest, {
              title: 'NewQcTestReport',
              exclude: ['id'],
            }),
          },
        },
      },
    })
    qcTests: Omit<QcTest, 'id'>[],
  ): Promise<QcTest[]> {
    const repo = new DefaultTransactionalRepository(QcReport, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const qcReport = await this.qcReportRepository.findById(qcReportId);
      if (!qcReport) {
        throw new HttpErrors.BadRequest('Qc Report does not exist');
      }

      // Delete existing QcTests for the given QcReportId
      await this.qcTestRepository.deleteAll(
        {qcReportId},
        {
          transaction: tx,
        },
      );

      // Create new QC Tests
      const data = await this.qcTestRepository.createAll(
        qcTests.map(test => ({...test, qcReportId})),
        {
          transaction: tx,
        },
      );
      await this.qcReportRepository.updateById(
        qcReportId,
        {status: 1},
        {
          transaction: tx,
        },
      );
      tx.commit();
      await this.checkAllQcStatusAndCreateDispatch(qcReport.orderId);
      return data;
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/qc-reports')
  @response(200, {
    description: 'Array of QcReport model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(QcReport, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(QcReport) filter?: Filter<QcReport>,
  ): Promise<QcReport[]> {
    return this.qcReportRepository.find({
      ...filter,
      include: [
        {
          relation: 'order',
          scope: {
            include: ['customer'],
          },
        },
        {relation: 'material'},
        {relation: 'lots'},
        {relation: 'qcTests'},
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
  })
  @get('/qc-reports/{id}')
  @response(200, {
    description: 'QcReport model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(QcReport, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(QcReport, {exclude: 'where'})
    filter?: FilterExcludingWhere<QcReport>,
  ): Promise<QcReport> {
    return this.qcReportRepository.findById(id, {
      ...filter,
      include: [
        {
          relation: 'order',
          scope: {
            include: ['customer'],
          },
        },
        {relation: 'material'},
        {relation: 'lots'},
        {relation: 'qcTests'},
      ],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.WORKER,
        PermissionKeys.ADMIN,
      ],
    },
  })
  @patch('/qc-reports/{id}')
  @response(204, {
    description: 'QcReport PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(QcReport, {partial: true}),
        },
      },
    })
    qcReport: QcReport,
  ): Promise<void> {
    await this.qcReportRepository.updateById(id, qcReport);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/qc-reports/{id}')
  @response(204, {
    description: 'QcReport DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.qcReportRepository.deleteById(id);
  }

  async checkAllQcStatusAndCreateDispatch(orderId: number): Promise<void> {
    const qcReports = await this.qcReportRepository.find({
      where: {orderId},
    });

    const allQcCompleted =
      qcReports.length > 0 && qcReports.every(qc => qc.status === 1);

    const materials = await this.materialRepository.find({
      where: {orderId},
    });

    const allMaterialsCompleted =
      materials.length > 0 && materials.every(mat => mat.status === 2);

    if (allQcCompleted && allMaterialsCompleted) {
      const order = await this.orderRepository.findById(orderId);
      const orderTimeline = order.timeline || [];

      const newEntry = {
        id: 3,
        title: 'Ready to Dispatch',
        time: new Date().toISOString(),
      };

      const isAlreadyPresent = orderTimeline.some(
        (entry: any) => entry.id === 3,
      );
      if (!isAlreadyPresent) {
        orderTimeline.push(newEntry);
      }

      await this.orderRepository.updateById(orderId, {
        status: 3,
        timeline: orderTimeline,
      });

      await this.dispatchRepository.create({
        orderId,
        status: 0,
        customerId: order.customerId,
      });

      console.log(
        `Order ${orderId} marked as 'Ready to Dispatch' and dispatch record created.`,
      );
    }
  }
}
