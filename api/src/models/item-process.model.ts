import { Entity, model, property } from '@loopback/repository';

@model()
export class ItemProcess extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
  })
  itemsId?: number;

  @property({
    type: 'number',
  })
  processesId?: number;

  @property({
    type: 'string',
  })
  processName: string;

  @property({
    type: 'string',
  })
  processDuration: string;

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
  constructor(data?: Partial<ItemProcess>) {
    super(data);
  }
}

export interface ItemProcessRelations {
  // describe navigational properties here
}

export type ItemProcessWithRelations = ItemProcess & ItemProcessRelations;
