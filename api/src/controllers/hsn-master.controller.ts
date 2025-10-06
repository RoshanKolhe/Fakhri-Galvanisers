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
  getFilterSchemaFor,
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<HsnMaster> {
    console.log(currentUser);
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
      createdByType: currentUser.userType,
      createdBy: currentUser.id,
      updatedByType: currentUser.userType,
      updatedBy: currentUser.id,
    };
    return this.hsnMasterRepository.create(inputData,{currentUser});
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
    @param.query.object('filter', getFilterSchemaFor(HsnMaster))
      filter?: Filter<HsnMaster>,
    ): Promise<{data: HsnMaster[], count:{total:number,
      activeTotal: number;
      inActiveTotal: number;
    }}> {
      filter = filter ?? {};

      const updatedFilter : Filter<HsnMaster>={
        ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      order: ['createdAt DESC'],
    };

    const countFilter={
      isDeleted:false
    }
   const data = await this.hsnMasterRepository.find(updatedFilter);
   const total = await this.hsnMasterRepository.count();
   const activeTotal = await this.hsnMasterRepository.count({...countFilter, status: 1 });
    const inActiveTotal = await this.hsnMasterRepository.count({...countFilter, status: 0 });

    return {data, count:{total: total.count,
       activeTotal: activeTotal.count,
        inActiveTotal: inActiveTotal.count}
    };
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
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
    await this.hsnMasterRepository.updateById(id, hsnMaster, {currentUser});
  }

  @del('/hsn-masters/{id}')
  @response(204, {
    description: 'HsnMaster DELETE success',
  })
  async deleteById(@param.path.number('id') id: number,
 @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
): Promise<void> {
    await this.hsnMasterRepository.deleteById(id,{currentUser});
  }
}
