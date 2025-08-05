import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Order} from './order.model';
import {Customer} from './customer.model';

@model()
export class Dispatch extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'array',
    itemType: 'object',
  })
  documents?: object[];

  @property({
    type: 'object',
  })
  vehicleDetails?: object;

  @property({
    type: 'date',
  })
  dispatchDate?: Date;

  @property({
    type: 'string',
  })
  remark?: string;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

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

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @belongsTo(() => Order)
  orderId: number;

  @belongsTo(() => Customer)
  customerId: number;
  
  constructor(data?: Partial<Dispatch>) {
    super(data);
  }
}

export interface DispatchRelations {
  // describe navigational properties here
}

export type DispatchWithRelations = Dispatch & DispatchRelations;
