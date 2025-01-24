// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {FakhriGalvanisersDataSource} from '../datasources';
import {EmailManagerBindings} from '../keys';
import {EmailManager} from '../services/email.service';
import {CustomerCredentials, CustomerRepository} from '../repositories';
import {
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
  repository,
} from '@loopback/repository';
import * as _ from 'lodash';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {JWTService} from '../services/jwt-service';
import {
  getJsonSchemaRef,
  getModelSchemaRef,
  HttpErrors,
  post,
  get,
  requestBody,
  response,
  param,
} from '@loopback/rest';
import {Customer} from '../models';
import {validateCredentials} from '../services/validator';
import {CredentialsRequestBody} from './specs/customer-controller-spec';
import {MyCustomerService} from '../services/customer-service';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
import {PermissionKeys} from '../authorization/permission-keys';
import generateResetPasswordTemplate from '../templates/reset-password.template';
import SITE_SETTINGS from '../utils/config';

export class CustomerController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.customer.service')
    public customerService: MyCustomerService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/customer/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(Customer),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<Customer, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(Customer, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const customer = await this.customerRepository.findOne({
        where: {
          or: [{email: userData.email}],
        },
      });
      if (customer) {
        throw new HttpErrors.BadRequest('Customer Already Exists');
      }

      validateCredentials(userData);
      // userData.permissions = [PermissionKeys.ADMIN];
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.customerRepository.create(userData, {
        transaction: tx,
      });
      const savedUserData = _.omit(savedUser, 'password');
      tx.commit();
      return Promise.resolve({
        success: true,
        userData: savedUserData,
        message: `Customer registered successfully`,
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  @post('/customer/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: CustomerCredentials,
  ): Promise<{}> {
    const user = await this.customerService.verifyCredentials(credentials);
    const userProfile = this.customerService.convertToUserProfile(user);
    const userData = _.omit(user, 'password');
    const token = await this.jwtService.generateToken(userProfile);
    const allUserData = await this.customerRepository.findById(userData.id);
    return Promise.resolve({
      accessToken: token,
      user: allUserData,
    });
  }

  @get('/customer/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    const user = await this.customerRepository.findOne({
      where: {
        id: currnetUser.id,
      },
    });
    const userData = _.omit(user, 'password');
    return Promise.resolve({
      ...userData,
      displayName: `${userData?.firstName} ${userData?.lastName}`,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
  @get('/customer/list')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Customer, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    filter = {
      ...filter,
      fields: {password: false},
    };
    return this.customerRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/customer/{id}', {
    responses: {
      '200': {
        description: 'Customer Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer),
          },
        },
      },
    },
  })
  async getSingleCustomer(@param.path.number('id') id: number): Promise<any> {
    const user = await this.customerRepository.findOne({
      where: {
        id: id,
      },
      fields: {
        password: false,
      },
    });
    return Promise.resolve({
      ...user,
    });
  }

  @post('/customer/sendResetPasswordLink')
  async sendResetPasswordLink(
    @requestBody({
      description: 'Input for sending reset password link',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'The email address of the user',
              },
            },
            required: ['email'],
          },
        },
      },
    })
    userData: {
      email: string;
    },
  ): Promise<object> {
    const user = await this.customerRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      const userProfile = this.customerService.convertToUserProfile(user);
      const token = await this.jwtService.generate10MinToken(userProfile);
      const resetPasswordLink = `${process.env.REACT_APP_ENDPOINT}/auth/admin/customer-new-password?token=${token}`;
      const template = generateResetPasswordTemplate({
        userData: userProfile,
        resetLink: resetPasswordLink,
      });
      console.log(template);
      const mailOptions = {
        from: SITE_SETTINGS.fromMail,
        to: userData.email,
        subject: template.subject,
        html: template.html,
      };

      try {
        await this.emailManager.sendMail(mailOptions);
        return {
          success: true,
          message: `Password reset link sent to ${userData.email}. Please check your inbox.`,
        };
      } catch (err) {
        throw new HttpErrors.UnprocessableEntity(
          err.message || 'Mail sending failed',
        );
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exist");
    }
  }

  @authenticate('jwt')
  @post('/customer/setNewPassword')
  async setNewPassword(
    @requestBody({
      description: 'Input for resetting user password without the old password',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                format: 'email',
                description: 'The email address of the user',
              },
              newPassword: {
                type: 'string',
                description: 'The new password to be set',
              },
            },
            required: ['email', 'newPassword'], // Only email and newPassword are required
          },
        },
      },
    })
    passwordOptions: any,
  ): Promise<object> {
    const user = await this.customerRepository.findOne({
      where: {
        email: passwordOptions.email,
      },
    });

    if (user) {
      const encryptedPassword = await this.hasher.hashPassword(
        passwordOptions.newPassword,
      );
      await this.customerRepository.updateById(user.id, {
        password: encryptedPassword,
      });
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } else {
      throw new HttpErrors.BadRequest("Email doesn't exist");
    }
  }
}
