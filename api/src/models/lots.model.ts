import {Entity, model, property, hasMany} from '@loopback/repository';
import {Processes} from './processes.model';
import {LotProcesses} from './lot-processes.model';

@model()
export class Lots extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  materialId?: number;

  @property({
    type: 'string',
    required: false,
  })
  lotNumber?: string;

  @property({
    type: 'number',
    required: false,
  })
  quantity?: number;

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
  isDeleted: boolean;

  @property({
    type: 'string',
  })
  remark?: string;

  @hasMany(() => Processes, {through: {model: () => LotProcesses}})
  processes: Processes[];

  constructor(data?: Partial<Lots>) {
    super(data);
  }
}

export interface LotsRelations {
  // describe navigational properties here
}

export type LotsWithRelations = Lots & LotsRelations;
