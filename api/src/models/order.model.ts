import {
  Entity,
  model,
  property,
  belongsTo,
  hasMany, hasOne
} from '@loopback/repository';
import { Challan } from './challan.model';
import { Material } from './material.model';
import { Customer } from './customer.model';
import { QcReport } from './qc-report.model';
import { Payment } from './payment.model';
import { Dispatch } from './dispatch.model';
import { OrderQcTest } from './order-qc-test.model';
import {User} from './user.model';

@model()
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: false,
  })
  orderId?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isPaid?: boolean;

  @property({
    type: 'object',
  })
  paymentDoc?: object;

  @property({
    type: 'array',
    itemType: 'object',
  })
  challanImages?: object[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  poImages?: object[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  vehicleImages?: object[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  materialImages?: object[];

  @property({
    type: 'string',
  })
  remark?: string;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0 : Material Received,1:In Process, 2:Material Ready,3:Ready ToDispatch,4:Cancelled

  @property({
    type: 'array',
    itemType: 'object',
  })
  timeline?: object[];

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

  @property({
    type: 'string'
  })
  tcNo: string;

  @property({
    type: 'string'
  })
  ourChallanNo: string;

  @property({
    type: 'date'
  })
  tcDate: Date;

  @property({
    type: 'date'
  })
  ourChallanDate: Date;

  @belongsTo(() => Challan)
  challanId: number;

  @hasMany(() => Material)
  materials: Material[];

  @belongsTo(() => Customer)
  customerId: number;

  @hasMany(() => QcReport)
  qcReports: QcReport[];

  @hasOne(() => Payment)
  payment: Payment;

  @hasOne(() => Dispatch)
  dispatch: Dispatch;

  @hasMany(() => OrderQcTest)
  orderQcTests: OrderQcTest[];

  @belongsTo(() => User)
  createdByUserId: number;

  @belongsTo(() => User)
  updatedByUserId: number;

  @belongsTo(() => User)
  deletedByUserId: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
