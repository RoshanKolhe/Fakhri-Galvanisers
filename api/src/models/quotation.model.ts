import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Customer} from './customer.model';
import {Challan} from './challan.model';
import {User} from './user.model';

@model()
export class Quotation extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Customer)
  customerId: number;

  @property.array(Object, {
    name: 'materials',
  })
  materials: Object[];

  @property({
    type: 'string',
  })
  customerNote: string;

  @property({
    type: 'string',
  })
  adminNote: string;

  @property({
    type: 'string',
  })
  remark: string;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0: draft, 1:approved , 2:pending approval, 3:rejected, 4:created

  @property({
    type: 'string',
  })
  rejectedReason: string;

  @property({
    type: 'object',
  })
  poDoc?: object;

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

  @hasOne(() => Challan)
  challan: Challan;

  @belongsTo(() => User)
  createdByUserId: number;

  @belongsTo(() => User)
  updatedByUserId: number;

  @belongsTo(() => User)
  deletedByUserId: number;

  constructor(data?: Partial<Quotation>) {
    super(data);
  }
}

export interface QuotationRelations {
  // describe navigational properties here
}

export type QuotationWithRelations = Quotation & QuotationRelations;
