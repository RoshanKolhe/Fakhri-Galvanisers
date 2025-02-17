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
} from '@loopback/rest';
import {QcReport} from '../models';
import {QcReportRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';

export class QcReportController {
  constructor(
    @repository(QcReportRepository)
    public qcReportRepository: QcReportRepository,
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
    return this.qcReportRepository.find(filter);
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
    return this.qcReportRepository.findById(id, filter);
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
}
