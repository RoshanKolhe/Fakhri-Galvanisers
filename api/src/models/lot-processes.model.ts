import {Entity, model, property} from '@loopback/repository';

@model()
export class LotProcesses extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  lotsId?: number;

  @property({
    type: 'number',
  })
  processesId?: number;

  @property({
    type: 'string',
  })
  duration?: string;

  @property({
    type: 'string',
  })
  timeTaken?: string;

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

  constructor(data?: Partial<LotProcesses>) {
    super(data);
  }
}

export interface LotProcessesRelations {
  // describe navigational properties here
}

export type LotProcessesWithRelations = LotProcesses & LotProcessesRelations;
