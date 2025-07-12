import {Entity, model, property} from '@loopback/repository';

@model()
export class Processes extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    required: true
  })
  processGroup: number;     // 0 for 'pre treatment' and 1 for 'galvanizing'

  // @property({
  //   type: 'string',
  //   required: true
  // })
  // duration: string;

  @property({
    type: 'number',
    default: 0,
  })
  status: number;

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

  constructor(data?: Partial<Processes>) {
    super(data);
  }
}

export interface ProcessesRelations {
  // describe navigational properties here
}

export type ProcessesWithRelations = Processes & ProcessesRelations;
