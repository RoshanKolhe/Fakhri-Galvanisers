import {
  Entity,
  model,
  property,
  belongsTo,
  hasMany,
} from '@loopback/repository';
import {Order} from './order.model';
import {Material} from './material.model';
import {Lots} from './lots.model';
import {QcTest} from './qc-test.model';

@model()
export class QcReport extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0:Pending, 1:Completed

  @property({
    type: 'array',
    itemType: 'object',
    required: false,
  })
  images?: object[];

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
  isDeleted: boolean;

  @property({
    type: 'string',
  })
  remark?: string;

  @belongsTo(() => Order)
  orderId: number;

  @belongsTo(() => Material)
  materialId: number;

  @belongsTo(() => Lots)
  lotsId: number;

  @hasMany(() => QcTest)
  qcTests: QcTest[];

  constructor(data?: Partial<QcReport>) {
    super(data);
  }
}

export interface QcReportRelations {
  // describe navigational properties here
}

export type QcReportWithRelations = QcReport & QcReportRelations;
