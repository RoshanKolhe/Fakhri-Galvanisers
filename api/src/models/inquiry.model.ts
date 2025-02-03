import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Customer} from './customer.model';

@model()
export class Inquiry extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  firstName: string;

  @property({
    type: 'string',
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  phoneNumber: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  company: string;

  @property({
    type: 'string',
  })
  gstIn: string;

  @property({
    type: 'string',
  })
  designation: string;

  @property({
    type: 'string',
  })
  address: string;

  @property.array(Object, {
    name: 'materials',
  })
  materials: Object[];

  @property({
    type: 'number',
    default: 0,
  })
  status?: number; // 0:partially submitted, 1:fully submitted, 2: converted

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

  @belongsTo(() => Inquiry, {name: 'creator'})
  createdBy: number;

  @belongsTo(() => Inquiry, {name: 'updater'})
  updatedBy: number;

  @belongsTo(() => Inquiry, {name: 'deleter'})
  deletedBy: number;

  @hasOne(() => Customer)
  customer: Customer;

  constructor(data?: Partial<Inquiry>) {
    super(data);
  }
}

export interface InquiryRelations {
  // describe navigational properties here
}

export type InquiryWithRelations = Inquiry & InquiryRelations;
