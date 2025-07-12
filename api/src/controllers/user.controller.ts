/* eslint-disable @typescript-eslint/naming-convention */
import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
  WhereBuilder,
  repository,
} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  getJsonSchemaRef,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {EmailManagerBindings} from '../keys';
import {User} from '../models';
import {
  ChallanRepository,
  Credentials,
  InquiryRepository,
  OrderRepository,
  PaymentRepository,
  QuotationRepository,
  UserRepository,
} from '../repositories';
import {EmailManager} from '../services/email.service';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {validateCredentials} from '../services/validator';
import generateOtpTemplate from '../templates/otp.template';
import SITE_SETTINGS from '../utils/config';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import {getStartAndEndDateOfWeek} from '../utils/constants';
import {FakhriGalvanisersDataSource} from '../datasources';
import generateResetPasswordTemplate from '../templates/reset-password.template';

export class UserController {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    public dataSource: FakhriGalvanisersDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(QuotationRepository)
    public quotationRepository: QuotationRepository,
    @repository(InquiryRepository)
    public inquiryRepository: InquiryRepository,
    @repository(PaymentRepository)
    public paymentRepository: PaymentRepository,
    @repository(ChallanRepository)
    public challanRepository: ChallanRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<User, 'id'>,
  ) {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      validateCredentials(userData);
      const user = await this.userRepository.findOne({
        where: {
          or: [{email: userData.email}, {employeeId: userData.employeeId}],
        },
      });
      console.log(user);
      if (user) {
        throw new HttpErrors.BadRequest('User Already Exists');
      }

      // userData.permissions = [PermissionKeys.ADMIN];
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData, {
        transaction: tx,
      });
      const savedUserData = _.omit(savedUser, 'password');
      tx.commit();
      return Promise.resolve({
        success: true,
        userData: savedUserData,
        message: `User registered successfully`,
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  @post('/login', {
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
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const userData = _.omit(user, 'password');
    const token = await this.jwtService.generateToken(userProfile);
    const allUserData = await this.userRepository.findById(userData.id);
    return Promise.resolve({
      accessToken: token,
      user: allUserData,
    });
  }

  @get('/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    console.log(currnetUser);
    const user = await this.userRepository.findOne({
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
  @get('/api/users/list')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {
            includeRelations: true,
          }),
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    filter = {
      ...filter,
      where: {
        ...filter?.where,
        id: {neq: currentUser.id},
        isDeleted: false,
      },
      fields: {password: false, otp: false, otpExpireAt: false},
      include: [{relation: 'creator'}, {relation: 'updater'}],
    };
    return this.userRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/api/users/{id}', {
    responses: {
      '200': {
        description: 'User Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getSingleUser(@param.path.number('id') id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      fields: {
        password: false,
        otp: false,
        otpExpireAt: false,
      },
    });
    return Promise.resolve({
      ...user,
    });
  }

  @authenticate({
    strategy: 'jwt',
  })
  @patch('/api/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
  ): Promise<any> {
    // Fetch the user information before updating
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    // Hash password if it's being updated
    if (user.password) {
      user.password = await this.hasher.hashPassword(user.password);
    }

    // Validate email uniqueness only if email is being updated
    if (user.email && user.email !== existingUser.email) {
      const emailExists = await this.userRepository.findOne({
        where: {email: user.email, id: {neq: id}}, // Exclude the current user
      });

      if (emailExists) {
        throw new HttpErrors.BadRequest('Email already exists');
      }
    }

    // Set updatedBy field
    user.updatedBy = currentUser.id;

    await this.userRepository.updateById(id, user);

    return {
      success: true,
      message: `User profile updated successfully`,
    };
  }

  @post('/sendResetPasswordLink')
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
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generate10MinToken(userProfile);
      const resetPasswordLink = `${process.env.REACT_APP_ENDPOINT}/auth/admin/new-password?token=${token}`;
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
  @post('/setPassword')
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
    const user = await this.userRepository.findOne({
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
        await this.userRepository.updateById(user.id, {
          password: encryptedPassword,
        });
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

  @authenticate('jwt')
  @post('/setNewPassword')
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
    const user = await this.userRepository.findOne({
      where: {
        email: passwordOptions.email,
      },
    });

    if (user) {
      const encryptedPassword = await this.hasher.hashPassword(
        passwordOptions.newPassword,
      );
      await this.userRepository.updateById(user.id, {
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

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/user/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: UserProfile,
    @param.path.number('id') id: number,
  ): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpErrors.BadRequest('User Not Found');
    }

    await this.userRepository.updateById(id, {
      isDeleted: true,
      deletedBy: currentUser.id,
      deletedAt: new Date(),
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [
        PermissionKeys.SUPER_ADMIN,
        PermissionKeys.ADMIN,
        PermissionKeys.CUSTOMER,
        PermissionKeys.SUPERVISOR
      ],
    },
  })
  @get('/getDashboardCounts')
  async getDashboardCounts(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<any> {
    console.log(currnetUser.permissions);
    let totalActiveOrders = 0;
    let totalOrdersReadyToDispatch = 0;
    let totalPendingRfq = 0;
    let totalConversions = 0;
    let totalChallan = 0;
    let last10DaysDispatchCounts: number[] = [];
    let last10DaysRfqCounts: number[] = [];
    let last10DaysActiveOrdersCounts: number[] = [];
    let percentageChangeDispatch = 0;
    let percentageChangeRfq = 0;
    let percentageChangeActiveOrders = 0;

    const user = await this.userRepository.findById(currnetUser.id);

    if (user.permissions.includes('super_admin') || user.permissions.includes('admin') || user.permissions.includes('supervisor')) {
      totalConversions = (
        await this.inquiryRepository.count({
          status: 2,
        })
      ).count;
      totalChallan = (await this.challanRepository.count()).count;
      totalActiveOrders = (
        await this.orderRepository.count({
          status: {inq: [0, 1, 2]},
        })
      ).count;
      totalOrdersReadyToDispatch = (
        await this.orderRepository.count({
          status: 3,
        })
      ).count;

      // Get totalPendingRfq (status 2)
      totalPendingRfq = (
        await this.quotationRepository.count({
          status: 2,
        })
      ).count;

      // Get counts for last 10 days based on `updatedAt`
      const today = new Date();
      for (let i = 9; i >= 0; i--) {
        const startOfDay = new Date(today);
        startOfDay.setDate(today.getDate() - i);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        // Count Active Orders for the day
        const activeOrdersCount = (
          await this.orderRepository.count({
            status: {inq: [0, 1, 2]},
            updatedAt: {between: [startOfDay, endOfDay]},
          })
        ).count;
        last10DaysActiveOrdersCounts.push(activeOrdersCount);

        // Count Orders Ready to Dispatch for the day
        const dispatchCount = (
          await this.orderRepository.count({
            status: 3,
            updatedAt: {between: [startOfDay, endOfDay]},
          })
        ).count;
        last10DaysDispatchCounts.push(dispatchCount);

        // Count Pending RFQs for the day
        const rfqCount = (
          await this.quotationRepository.count({
            status: 2,
            updatedAt: {between: [startOfDay, endOfDay]},
          })
        ).count;
        last10DaysRfqCounts.push(rfqCount);
      }

      // Calculate percentage increase/decrease
      const todayDispatch = last10DaysDispatchCounts[9] || 0;
      const yesterdayDispatch = last10DaysDispatchCounts[8] || 0;
      if (yesterdayDispatch > 0) {
        percentageChangeDispatch =
          ((todayDispatch - yesterdayDispatch) / yesterdayDispatch) * 100;
      }

      const todayRfq = last10DaysRfqCounts[9] || 0;
      const yesterdayRfq = last10DaysRfqCounts[8] || 0;
      if (yesterdayRfq > 0) {
        percentageChangeRfq = ((todayRfq - yesterdayRfq) / yesterdayRfq) * 100;
      }

      const todayActiveOrders = last10DaysActiveOrdersCounts[9] || 0;
      const yesterdayActiveOrders = last10DaysActiveOrdersCounts[8] || 0;
      if (yesterdayActiveOrders > 0) {
        percentageChangeActiveOrders =
          ((todayActiveOrders - yesterdayActiveOrders) /
            yesterdayActiveOrders) *
          100;
      }

      // **🔹 Get Invoice Counts for Each Status**
      const invoiceStatuses = [
        {label: 'Pending', status: 0},
        {label: 'Paid', status: 1},
        {label: 'Overdue', status: 2},
        {label: 'Pending Approval', status: 3},
        {label: 'Request Reupload', status: 4},
      ];

      let invoiceCounts = await Promise.all(
        invoiceStatuses.map(async invoice => {
          const count = (
            await this.paymentRepository.count({status: invoice.status})
          ).count;
          return {label: invoice.label, value: count};
        }),
      );

      return {
        success: true,
        totalActiveOrders,
        totalOrdersReadyToDispatch,
        totalPendingRfq,
        totalConversions,
        totalChallan,
        last10DaysActiveOrdersCounts,
        last10DaysDispatchCounts,
        last10DaysRfqCounts,
        percentageChangeActiveOrders: percentageChangeActiveOrders.toFixed(2),
        percentageChangeDispatch: percentageChangeDispatch.toFixed(2),
        percentageChangeRfq: percentageChangeRfq.toFixed(2),
        invoiceCounts,
      };
    }
  }
}
