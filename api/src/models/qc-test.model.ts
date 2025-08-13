import { Entity, model, property } from '@loopback/repository';

@model()
export class QcTest extends Entity {
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
    type: 'string',
    required: true,
  })
  micronTestValues: string;

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
  qcReportId?: number;

  constructor(data?: Partial<QcTest>) {
    super(data);
  }
}

export interface QcTestRelations {
  // describe navigational properties here
}

export type QcTestWithRelations = QcTest & QcTestRelations;
