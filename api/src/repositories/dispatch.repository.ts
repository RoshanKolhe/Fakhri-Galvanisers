import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Dispatch, DispatchRelations, Order, Customer} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {OrderRepository} from './order.repository';
import {CustomerRepository} from './customer.repository';

export class DispatchRepository extends TimeStampRepositoryMixin<
  Dispatch,
  typeof Dispatch.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Dispatch,
      typeof Dispatch.prototype.id,
      DispatchRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly order: BelongsToAccessor<Order, typeof Dispatch.prototype.id>;

  public readonly customer: BelongsToAccessor<Customer, typeof Dispatch.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Dispatch, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
