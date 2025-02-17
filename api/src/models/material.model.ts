import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import {User} from './user.model';
import {MaterialUser} from './material-user.model';
import {Processes} from './processes.model';
import {MaterialProcess} from './material-process.model';
import {Lots} from './lots.model';
import {QcReport} from './qc-report.model';

@model()
export class Material extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  materialType: string;

  @property({
    type: 'string',
    required: true,
  })
  hsnCode: string;

  @property({
    type: 'number',
    required: true,
  })
  totalQuantity: number;

  @property({
    type: 'number',
    required: true,
  })
  noOfLots: number;

  @property({
    type: 'number',
    required: true,
  })
  microns: number;

  @property({
    type: 'date',
  })
  startDate?: Date;

  @property({
    type: 'date',
  })
  endDate?: Date;

  @property({
    type: 'number',
    default: 0,
  })
  status?: number;

  @property({
    type: 'string',
  })
  remark?: string;

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

  @belongsTo(() => Order)
  orderId: number;

  @hasMany(() => User, {through: {model: () => MaterialUser}})
  users: User[];

  @hasMany(() => Processes, {through: {model: () => MaterialProcess}})
  processes: Processes[];

  @hasMany(() => Lots)
  lots: Lots[];

  @hasMany(() => QcReport)
  qcReports: QcReport[];

  constructor(data?: Partial<Material>) {
    super(data);
  }
}

export interface MaterialRelations {
  // describe navigational properties here
}

export type MaterialWithRelations = Material & MaterialRelations;
