
import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Order, OrderRelations, Challan, Material, Customer, QcReport, Payment, Dispatch, OrderQcTest, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ChallanRepository} from './challan.repository';
import {MaterialRepository} from './material.repository';
import {CustomerRepository} from './customer.repository';
import {QcReportRepository} from './qc-report.repository';
import {PaymentRepository} from './payment.repository';
import {DispatchRepository} from './dispatch.repository';
import {OrderQcTestRepository} from './order-qc-test.repository';
import {UserRepository} from './user.repository';

export class OrderRepository extends TimeStampRepositoryMixin<
  Order,
  typeof Order.prototype.id,
  Constructor<
    DefaultCrudRepository<Order, typeof Order.prototype.id, OrderRelations>
  >
>(DefaultCrudRepository) {

  public readonly challan: BelongsToAccessor<Challan, typeof Order.prototype.id>;

  public readonly materials: HasManyRepositoryFactory<Material, typeof Order.prototype.id>;

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  public readonly qcReports: HasManyRepositoryFactory<QcReport, typeof Order.prototype.id>;

  public readonly payment: HasOneRepositoryFactory<Payment, typeof Order.prototype.id>;

  public readonly dispatch: HasOneRepositoryFactory<Dispatch, typeof Order.prototype.id>;

  public readonly orderQcTests: HasManyRepositoryFactory<OrderQcTest, typeof Order.prototype.id>;

  public readonly createdByUser: BelongsToAccessor<User, typeof Order.prototype.id>;

  public readonly updatedByUser: BelongsToAccessor<User, typeof Order.prototype.id>;

  public readonly deletedByUser: BelongsToAccessor<User, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>, @repository.getter('MaterialRepository') protected materialRepositoryGetter: Getter<MaterialRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('QcReportRepository') protected qcReportRepositoryGetter: Getter<QcReportRepository>, @repository.getter('PaymentRepository') protected paymentRepositoryGetter: Getter<PaymentRepository>, @repository.getter('DispatchRepository') protected dispatchRepositoryGetter: Getter<DispatchRepository>, @repository.getter('OrderQcTestRepository') protected orderQcTestRepositoryGetter: Getter<OrderQcTestRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Order, dataSource);
    this.deletedByUser = this.createBelongsToAccessorFor('deletedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('deletedByUser', this.deletedByUser.inclusionResolver);
    this.updatedByUser = this.createBelongsToAccessorFor('updatedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('updatedByUser', this.updatedByUser.inclusionResolver);
    this.createdByUser = this.createBelongsToAccessorFor('createdByUser', userRepositoryGetter,);
    this.registerInclusionResolver('createdByUser', this.createdByUser.inclusionResolver);
    this.orderQcTests = this.createHasManyRepositoryFactoryFor('orderQcTests', orderQcTestRepositoryGetter,);
    this.registerInclusionResolver('orderQcTests', this.orderQcTests.inclusionResolver);
    this.dispatch = this.createHasOneRepositoryFactoryFor('dispatch', dispatchRepositoryGetter);
    this.registerInclusionResolver('dispatch', this.dispatch.inclusionResolver);
    this.payment = this.createHasOneRepositoryFactoryFor('payment', paymentRepositoryGetter);
    this.registerInclusionResolver('payment', this.payment.inclusionResolver);
    this.qcReports = this.createHasManyRepositoryFactoryFor('qcReports', qcReportRepositoryGetter,);
    this.registerInclusionResolver('qcReports', this.qcReports.inclusionResolver);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.materials = this.createHasManyRepositoryFactoryFor('materials', materialRepositoryGetter,);
    this.registerInclusionResolver('materials', this.materials.inclusionResolver);
    this.challan = this.createBelongsToAccessorFor('challan', challanRepositoryGetter,);
    this.registerInclusionResolver('challan', this.challan.inclusionResolver);
  }
}
