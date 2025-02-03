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
import {HsnMaster} from '../models';
import {HsnMasterRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class HsnMasterController {
  constructor(
    @repository(HsnMasterRepository)
    public hsnMasterRepository: HsnMasterRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @post('/hsn-masters')
  @response(200, {
    description: 'HsnMaster model instance',
    content: {'application/json': {schema: getModelSchemaRef(HsnMaster)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HsnMaster, {
            title: 'NewHsnMaster',
            exclude: ['id'],
          }),
        },
      },
    })
    hsnMaster: Omit<HsnMaster, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<HsnMaster> {
    console.log(currnetUser);
    const hsn = await this.hsnMasterRepository.findOne({
      where: {
        or: [{hsnCode: hsnMaster.hsnCode}],
      },
    });
    if (hsn) {
      throw new HttpErrors.BadRequest('HSN Code Already Exists');
    }
    const inputData: Partial<HsnMaster> = {
      ...hsnMaster,
      createdByType: currnetUser.userType,
      createdBy: currnetUser.id,
      updatedByType: currnetUser.userType,
      updatedBy: currnetUser.id,
    };
    return this.hsnMasterRepository.create(inputData);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
      ],
    },
  })
  @get('/hsn-masters')
  @response(200, {
    description: 'Array of HsnMaster model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(HsnMaster, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(HsnMaster) filter?: Filter<HsnMaster>,
  ): Promise<HsnMaster[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
    };
    return this.hsnMasterRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @get('/hsn-masters/{id}')
  @response(200, {
    description: 'HsnMaster model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(HsnMaster, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(HsnMaster, {exclude: 'where'})
    filter?: FilterExcludingWhere<HsnMaster>,
  ): Promise<HsnMaster> {
    return this.hsnMasterRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.ADMIN],
    },
  })
  @patch('/hsn-masters/{id}')
  @response(204, {
    description: 'HsnMaster PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HsnMaster, {partial: true}),
        },
      },
    })
    hsnMaster: HsnMaster,
  ): Promise<void> {
    // Check if the HSN code is being updated
    if (hsnMaster.hsnCode) {
      const existingHsn = await this.hsnMasterRepository.findOne({
        where: {hsnCode: hsnMaster.hsnCode, id: {neq: id}}, // Exclude the current record
      });

      if (existingHsn) {
        throw new HttpErrors.Conflict('HSN Code already exists.');
      }
    }
    await this.hsnMasterRepository.updateById(id, hsnMaster);
  }

  @del('/hsn-masters/{id}')
  @response(204, {
    description: 'HsnMaster DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.hsnMasterRepository.deleteById(id);
  }
}
