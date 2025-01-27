import {Entity, model, property, belongsTo} from '@loopback/repository';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  firstName: string;

  @property({
    type: 'string',
  })
  lastName: string;

  @property({
    type: 'string',
  })
  dob: string;

  @property({
    type: 'string',
  })
  fullAddress: string;

  @property({
    type: 'string',
  })
  city: string;

  @property({
    type: 'string',
  })
  state: string;

  @property({
    type: 'string',
  })
  gstNo: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  phoneNumber: string;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property.array(String, {
    name: 'permissions',
  })
  permissions: String[];

  @property({
    type: 'number',
    required: true,
  })
  isActive: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isEmailVerified: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @belongsTo(() => Customer, {name: 'creator'})
  createdBy: number;

  @belongsTo(() => Customer, {name: 'updater'})
  updatedBy: number;

  @belongsTo(() => Customer, {name: 'deleter'})
  deletedBy: number;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
