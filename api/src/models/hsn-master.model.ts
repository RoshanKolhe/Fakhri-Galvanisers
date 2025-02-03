import {Entity, model, property} from '@loopback/repository';

@model()
export class HsnMaster extends Entity {
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
  hsnCode: string;

  @property({
    type: 'number',
    required: true,
  })
  tax: number;

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

  constructor(data?: Partial<HsnMaster>) {
    super(data);
  }
}

export interface HsnMasterRelations {
  // describe navigational properties here
}

export type HsnMasterWithRelations = HsnMaster & HsnMasterRelations;
