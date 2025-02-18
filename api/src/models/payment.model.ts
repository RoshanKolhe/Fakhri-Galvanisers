import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Order} from './order.model';
import {Customer} from './customer.model';

@model()
export class Payment extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: false,
  })
  performaId?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
  })
  paymentProof?: string[];

  @belongsTo(() => Order)
  orderId: number;

  @property({
    type: 'date',
  })
  dueDate?: Date;

  @property({
    type: 'number',
    required: true,
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  totalAmount: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; //0:Pending, 1:Paid,2:Overdue,3:pending Approval,4:request requpload

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

  @property({
    type: 'string',
  })
  remark?: string;

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<Payment>) {
    super(data);
  }
}

export interface PaymentRelations {
  // describe navigational properties here
}

export type PaymentWithRelations = Payment & PaymentRelations;
