import { Entity, model, property } from '@loopback/repository';

@model()
export class OrderQcTest extends Entity {
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
  specification: string;

  @property({
    type: 'string',
    required: true,
  })
  testDetails: string;

  @property({
    type: 'string',
    required: true,
  })
  requirement: string;

  @property({
    type: 'string',
  })
  testResult?: string;

  @property({
    type: 'string',
    required: true,
  })
  observed: string;

  @property({
    type: 'array',
    itemType: 'number',
    required: true,
  })
  micronTestValues: number[];

  @property({
    type: 'array',
    itemType: 'object',
    required: false,
  })
  images?: object[];

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

  @property({
    type: 'number',
  })
  orderId?: number;

  constructor(data?: Partial<OrderQcTest>) {
    super(data);
  }
}

export interface OrderQcTestRelations {
  // describe navigational properties here
}

export type OrderQcTestWithRelations = OrderQcTest & OrderQcTestRelations;
