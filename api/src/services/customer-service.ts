import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Customer, User} from '../models';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password.bcrypt';
import {CustomerRepository} from '../repositories';

export class MyCustomerService implements UserService<Customer, Credentials> {
  constructor(
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<Customer> {
    const getUser = await this.customerRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!getUser) {
      throw new HttpErrors.BadRequest('Email not found');
    }

    if (!getUser.password) {
      throw new HttpErrors.BadRequest(
        'No Password is assigned to this mail please reset the password',
      );
    }

    if (!getUser.isActive) {
      throw new HttpErrors.BadRequest('User not active');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getUser.password,
    );
    if (passswordCheck) {
      return getUser;
    }
    throw new HttpErrors.BadRequest('password doesnt match');
  }

  convertToUserProfile(customer: Customer): UserProfile {
    return {
      id: `${customer.id}`,
      name: `${customer.firstName}`,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      [securityId]: `${customer.id}`,
      permissions: customer.permissions,
    };
  }
}
