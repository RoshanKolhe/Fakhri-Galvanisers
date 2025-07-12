import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository';
import { User } from './user.model';
import { HsnMaster } from './hsn-master.model';
import { Processes } from './processes.model';
import { ItemProcess } from './item-process.model';

@model()
export class Items extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true
  })
  materialType: string;

  // @property({
  //   type: 'array',
  //   itemType: 'object',
  //   required: true
  // })
  // itemProcessDuration: object[];

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
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @belongsTo(() => User, { name: 'creator' })
  createdBy: number;

  @belongsTo(() => User, { name: 'updater' })
  updatedBy: number;

  @belongsTo(() => User, { name: 'deleter' })
  deletedBy: number;

  @belongsTo(() => HsnMaster)
  hsnMasterId: number;

  @hasMany(() => Processes, { through: { model: () => ItemProcess } })
  processes: Processes[];

  constructor(data?: Partial<Items>) {
    super(data);
  }
}

export interface ItemsRelations {
  // describe navigational properties here
}

export type ItemsWithRelations = Items & ItemsRelations;
