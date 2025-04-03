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
import {Dispatch} from '../models';
import {DispatchRepository} from '../repositories';
import {PermissionKeys} from '../authorization/permission-keys';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';

export class DispatchController {
  constructor(
    @repository(DispatchRepository)
    public dispatchRepository: DispatchRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @post('/dispatches')
  @response(200, {
    description: 'Dispatch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Dispatch)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dispatch, {
            title: 'NewDispatch',
            exclude: ['id'],
          }),
        },
      },
    })
    dispatch: Omit<Dispatch, 'id'>,
  ): Promise<Dispatch> {
    return this.dispatchRepository.create(dispatch);
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
  @get('/dispatches')
  @response(200, {
    description: 'Array of Dispatch model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Dispatch, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.filter(Dispatch) filter?: Filter<Dispatch>,
  ): Promise<Dispatch[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      include: [{relation: 'order'}, {relation: 'customer'}],
      order: ['createdAt DESC'],
    };
    const currentUserPermission = currnetUser.permissions;
    if (
      currentUserPermission.includes('super_admin') ||
      currentUserPermission.includes('admin')
    ) {
      return this.dispatchRepository.find(filter);
    } else {
      return this.dispatchRepository.find({
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
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @get('/dispatches/{id}')
  @response(200, {
    description: 'Dispatch model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Dispatch, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Dispatch, {exclude: 'where'})
    filter?: FilterExcludingWhere<Dispatch>,
  ): Promise<Dispatch> {
    return this.dispatchRepository.findById(id, {
      ...filter,
      include: [{relation: 'order'}, {relation: 'customer'}],
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @patch('/dispatches/{id}')
  @response(204, {
    description: 'Dispatch PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Dispatch, {partial: true}),
        },
      },
    })
    dispatch: Dispatch,
  ): Promise<void> {
    await this.dispatchRepository.updateById(id, dispatch);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @del('/dispatches/{id}')
  @response(204, {
    description: 'Dispatch DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.dispatchRepository.deleteById(id);
  }
}
