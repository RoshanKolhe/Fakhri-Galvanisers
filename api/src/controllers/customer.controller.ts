// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {FakhriGalvanisersDataSource} from '../datasources';
import {EmailManagerBindings} from '../keys';
import {EmailManager} from '../services/email.service';
import {
  ChallanRepository,
  CustomerCredentials,
  CustomerRepository,
  OrderRepository,
  PaymentRepository,
} from '../repositories';
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
  patch,
  del,
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
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,

    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.customer.service')
    public customerService: MyCustomerService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN],
    },
  })
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
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
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
      userData.permissions = [PermissionKeys.CUSTOMER];
      userData.password = await this.hasher.hashPassword(userData.password);
      userData.createdByType = 'admin';
      userData.createdBy = currnetUser.id;
      userData.updatedByType = 'admin';
      userData.updatedBy = currnetUser.id;
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

  @authenticate('jwt')
  @get('/customer/me')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    console.log('email', currnetUser.email);
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
      where: {
        ...filter?.where,
        isDeleted: false,
      },
      fields: {password: false},
      order: ['createdAt DESC'],
    };
    console.log(filter);
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
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
      const inputData: Partial<Customer> = {
        password: encryptedPassword,
        updatedBy: user.id,
        updatedByType: currentUser.userType,
      };
      await this.customerRepository.updateById(user.id, inputData);
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } else {
      throw new HttpErrors.BadRequest("Email doesn't exist");
    }
  }

  @authenticate({
    strategy: 'jwt',
  })
  @patch('/api/customers/{id}')
  @response(204, {
    description: 'Customer PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
    @inject(AuthenticationBindings.CURRENT_USER) currentCustomer: UserProfile,
  ): Promise<any> {
    // Fetch the user information before updating
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new HttpErrors.NotFound('Customer not found');
    }

    if (customer.password) {
      customer.password = await this.hasher.hashPassword(customer.password);
    }

    if (customer.email && customer.email !== existingCustomer.email) {
      const emailExists = await this.customerRepository.findOne({
        where: {email: customer.email, id: {neq: id}},
      });

      if (emailExists) {
        throw new HttpErrors.BadRequest('Email already exists');
      }
    }

    if (customer) {
      customer.updatedBy = currentCustomer.id;
      customer.updatedByType = currentCustomer.userType;
      await this.customerRepository.updateById(id, customer);
    }

    return Promise.resolve({
      success: true,
      message: `Customer profile updated successfully`,
    });
  }

  @authenticate('jwt')
  @post('/customer/setPassword')
  async setPassword(
    @requestBody({
      description: 'Input for changing user password',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              oldPassword: {
                type: 'string',
                description: "The user's current password",
              },
              newPassword: {
                type: 'string',
                description: 'The new password to be set',
              },
            },
            required: ['oldPassword', 'newPassword'],
          },
        },
      },
    })
    passwordOptions: any,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<object> {
    const user = await this.customerRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });

    if (user) {
      const passwordCheck = await this.hasher.comparePassword(
        passwordOptions.oldPassword,
        user.password,
      );

      if (passwordCheck) {
        const encryptedPassword = await this.hasher.hashPassword(
          passwordOptions.newPassword,
        );
        const inputData: Partial<Customer> = {
          password: encryptedPassword,
          updatedBy: currentUser.id,
          updatedByType: currentUser.userType,
        };
        await this.customerRepository.updateById(user.id, inputData);
        return {
          success: true,
          message: 'Password changed successfully',
        };
      } else {
        throw new HttpErrors.BadRequest("Old password doesn't match");
      }
    } else {
      throw new HttpErrors.BadRequest("Email doesn't exist");
    }
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/customer/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new HttpErrors.BadRequest('Customer Not Found');
    }

    await this.customerRepository.updateById(id, {
      isDeleted: true,
      deletedBy: currentUser.id,
      deletedByType: currentUser.userType,
      deletedAt: new Date(),
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.SUPER_ADMIN, PermissionKeys.CUSTOMER],
    },
  })
  @get('/customer/getDashboardCounts')
  async getCustomerDashboardCounts(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<any> {
    console.log(currnetUser.permissions);

    const user = await this.customerRepository.findById(currnetUser.id);

    if (!user.permissions.includes('customer')) {
      throw new HttpErrors.Forbidden('Access Denied');
    }

    // Fetch all required data in parallel
    const [
      totalOrdersCountRes,
      totalOutstandingRes,
      ordersInProcessCountRes,
      ordersReadyForDispatchCountRes,
      ordersMaterialReceivedCountRes,
      ordersMaterialReadyCountRes,
      totalChallanCountRes,
      latestInvoices,
      latestOrderRes,
    ] = await Promise.all([
      this.orderRepository.count({customerId: user.id}),
      this.paymentRepository.execute(
        'SELECT SUM(totalAmount) as total FROM Payment WHERE status = 0 AND customerId = ?',
        [user.id],
      ),
      this.orderRepository.count({customerId: user.id, status: 1}),
      this.orderRepository.count({customerId: user.id, status: 3}),
      this.orderRepository.count({customerId: user.id, status: 0}),
      this.orderRepository.count({customerId: user.id, status: 2}),
      this.challanRepository.count({customerId: user.id}),
      this.paymentRepository.find({
        where: {customerId: user.id},
        order: ['createdAt DESC'],
        limit: 2, // Fetch latest and second last invoice
      }),
      this.orderRepository.findOne({
        where: {customerId: user.id},
        order: ['createdAt DESC'], // Get latest order
      }),
    ]);

    // Extracting required values
    const totalOrdersCount = totalOrdersCountRes.count || 0; // Avoid division by zero
    const totalOutstanding = totalOutstandingRes[0]?.total ?? 0;
    const ordersInProcessCount = ordersInProcessCountRes.count;
    const ordersReadyForDispatchCount = ordersReadyForDispatchCountRes.count;
    const ordersMaterialReceivedCount = ordersMaterialReceivedCountRes.count;
    const ordersMaterialReadyCount = ordersMaterialReadyCountRes.count;
    const totalChallanCount = totalChallanCountRes.count;

    // Get latest and second last invoice amounts
    const latestInvoiceAmount = latestInvoices[0]?.totalAmount ?? 0;
    const secondLastInvoiceAmount = latestInvoices[1]?.totalAmount ?? 0;

    // Orders overview data in the required format
    const ordersOverview = [
      {
        label: 'Orders in Process',
        totalAmount: totalOrdersCount,
        value: ordersInProcessCount,
      },
      {
        label: 'Orders Ready for Dispatch',
        totalAmount: totalOrdersCount,
        value: ordersReadyForDispatchCount,
      },
      {
        label: 'Orders Material Received',
        totalAmount: totalOrdersCount,
        value: ordersMaterialReceivedCount,
      },
    ];

    // Orders percentage in the required format
    const ordersPercentage = [
      {
        label: 'Material Received',
        value:
          totalOrdersCount > 0
            ? Number(
                (
                  (ordersMaterialReceivedCount / totalOrdersCount) *
                  100
                ).toFixed(2),
              )
            : 0,
      },
      {
        label: 'In Process',
        value:
          totalOrdersCount > 0
            ? Number(
                ((ordersInProcessCount / totalOrdersCount) * 100).toFixed(2),
              )
            : 0,
      },
      {
        label: 'Material Ready',
        value:
          totalOrdersCount > 0
            ? Number(
                ((ordersMaterialReadyCount / totalOrdersCount) * 100).toFixed(
                  2,
                ),
              )
            : 0,
      },
      {
        label: 'Ready To Dispatch',
        value:
          totalOrdersCount > 0
            ? Number(
                (
                  (ordersReadyForDispatchCount / totalOrdersCount) *
                  100
                ).toFixed(2),
              )
            : 0,
      },
    ];

    // Get latest order details (returns null if no orders exist)
    const latestOrder = latestOrderRes ?? {};

    return {
      totalOrdersCount,
      totalOutstanding,
      ordersInProcessCount,
      totalChallanCount,
      latestInvoiceAmount,
      secondLastInvoiceAmount,
      ordersOverview,
      ordersPercentage, // Percentage of each order status
      latestOrder, // Returning full latest order data
    };
  }
}
