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
import {Challan} from '../models';
import {ChallanRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class ChallanController {
  constructor(
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
  ) {}

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
  @post('/challans')
  @response(200, {
    description: 'Challan model instance',
    content: {'application/json': {schema: getModelSchemaRef(Challan)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Challan, {
            title: 'NewChallan',
            exclude: ['id'],
          }),
        },
      },
    })
    challan: Omit<Challan, 'id'>,
  ): Promise<Challan> {
    const existingChallan = await this.challanRepository.findOne({
      where: {
        or: [{quotationId: challan.quotationId}, {poNumber: challan.poNumber}],
      },
    });

    if (existingChallan) {
      let errorMessage = '';

      if (existingChallan.quotationId === challan.quotationId) {
        errorMessage += 'RFQ Reference is already used in another Challan. ';
      }
      if (existingChallan.poNumber == challan.poNumber) {
        errorMessage += 'PO Number is already used in another Challan.';
      }

      throw new HttpErrors.BadRequest(errorMessage.trim());
    }

    return this.challanRepository.create(challan);
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
  @get('/challans')
  @response(200, {
    description: 'Array of Challan model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Challan, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Challan) filter?: Filter<Challan>,
  ): Promise<Challan[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [
        {
          relation: 'quotation',
          scope: {
            include: [{relation: 'customer'}],
          },
        },
      ],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin')
    ) {
      return this.challanRepository.find(filter);
    } else {
      return this.challanRepository.find({
        ...filter,
        where: {
          customerId: currnetUser.id,
        },
      });
    }
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
  @get('/challans/{id}')
  @response(200, {
    description: 'Challan model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Challan, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Challan, {exclude: 'where'})
    filter?: FilterExcludingWhere<Challan>,
  ): Promise<Challan> {
    filter = {
      ...filter,
      include: [
        {
          relation: 'quotation',
          scope: {
            include: [{relation: 'customer'}],
          },
        },
      ],
    };
    return this.challanRepository.findById(id, filter);
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
  @patch('/challans/{id}')
  @response(204, {
    description: 'Challan PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Challan, {partial: true}),
        },
      },
    })
    challan: Challan,
  ): Promise<void> {
    const existingChallan = await this.challanRepository.findOne({
      where: {
        and: [
          {
            or: [
              {quotationId: challan.quotationId},
              {poNumber: challan.poNumber},
            ],
          },
          {id: {neq: id}}, // Exclude the current challan from check
        ],
      },
    });

    if (existingChallan) {
      let errorMessage = '';

      if (existingChallan.quotationId === challan.quotationId) {
        errorMessage += 'RFQ Reference is already used in another Challan. ';
      }
      if (existingChallan.poNumber === challan.poNumber) {
        errorMessage += 'PO Number is already used in another Challan.';
      }

      throw new HttpErrors.BadRequest(errorMessage.trim());
    }

    // If validation passes, update the challan
    await this.challanRepository.updateById(id, challan);
  }

  @del('/challans/{id}')
  @response(204, {
    description: 'Challan DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.challanRepository.deleteById(id);
  }
}
