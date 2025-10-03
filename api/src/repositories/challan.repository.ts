import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Challan, ChallanRelations, Quotation, Order, Customer, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {QuotationRepository} from './quotation.repository';
import {OrderRepository} from './order.repository';
import {CustomerRepository} from './customer.repository';
import {UserRepository} from './user.repository';

export class ChallanRepository extends TimeStampRepositoryMixin<
  Challan,
  typeof Challan.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Challan,
      typeof Challan.prototype.id,
      ChallanRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly quotation: BelongsToAccessor<Quotation, typeof Challan.prototype.id>;

  public readonly order: HasOneRepositoryFactory<Order, typeof Challan.prototype.id>;

  public readonly customer: BelongsToAccessor<Customer, typeof Challan.prototype.id>;

  public readonly createdByUser: BelongsToAccessor<User, typeof Challan.prototype.id>;

  public readonly updatedByUser: BelongsToAccessor<User, typeof Challan.prototype.id>;

  public readonly deletedByUser: BelongsToAccessor<User, typeof Challan.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('QuotationRepository') protected quotationRepositoryGetter: Getter<QuotationRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Challan, dataSource);
    this.deletedByUser = this.createBelongsToAccessorFor('deletedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('deletedByUser', this.deletedByUser.inclusionResolver);
    this.updatedByUser = this.createBelongsToAccessorFor('updatedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('updatedByUser', this.updatedByUser.inclusionResolver);
    this.createdByUser = this.createBelongsToAccessorFor('createdByUser', userRepositoryGetter,);
    this.registerInclusionResolver('createdByUser', this.createdByUser.inclusionResolver);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.order = this.createHasOneRepositoryFactoryFor('order', orderRepositoryGetter);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
    this.quotation = this.createBelongsToAccessorFor('quotation', quotationRepositoryGetter,);
    this.registerInclusionResolver('quotation', this.quotation.inclusionResolver);
  }
}
