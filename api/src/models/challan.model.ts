import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Quotation} from './quotation.model';
import {Order} from './order.model';
import {Customer} from './customer.model';

@model()
export class Challan extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  vehicleNumber: string;

  @property({
    type: 'number',
  })
  grossWeight: number;

  @property({
    type: 'number',
  })
  tareWeight: number;

  @property({
    type: 'number',
  })
  netWeight: number;

  @property({
    type: 'string',
  })
  poNumber: string;

  @property.array(Object, {
    name: 'materials',
  })
  materials: Object[];

  @property({
    type: 'string',
  })
  remark: string;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
  })
  images?: string[];

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
    type: 'number',
  })
  createdBy: number;

  @property({
    type: 'string',
  })
  createdByType: string;

  @property({
    type: 'number',
  })
  updatedBy: number;

  @property({
    type: 'string',
  })
  updatedByType: string;

  @property({
    type: 'number',
  })
  deletedBy: number;

  @property({
    type: 'string',
  })
  deletedByType: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @belongsTo(() => Quotation)
  quotationId: number;

  @hasOne(() => Order)
  order: Order;

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<Challan>) {
    super(data);
  }
}

export interface ChallanRelations {
  // describe navigational properties here
}

export type ChallanWithRelations = Challan & ChallanRelations;
