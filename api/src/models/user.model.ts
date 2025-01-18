import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
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
  })
  dob: string;

  @property({
    type: 'string',
  })
  fullAddress: string;

  @property({
    type: 'string',
  })
  city: string;

  @property({
    type: 'string',
  })
  state: string;

  @property({
    type: 'string',
  })
  gstNo: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  phoneNumber: string;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property.array(String, {
    name: 'permissions',
  })
  permissions: String[];

  @property({
    type: 'number',
    required: true,
  })
  isActive: number;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'string',
  })
  fcmToken?: string;

  @property({
    type: 'string',
  })
  otpExpireAt: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isEmailVerified: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
