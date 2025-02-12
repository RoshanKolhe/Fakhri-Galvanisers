import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Customer, CustomerRelations, Quotation, Order} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {QuotationRepository} from './quotation.repository';
import {OrderRepository} from './order.repository';

export type CustomerCredentials = {
  email: string;
  password: string;
};

export class CustomerRepository extends TimeStampRepositoryMixin<
  Customer,
  typeof Customer.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Customer,
      typeof Customer.prototype.id,
      CustomerRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly quotations: HasManyRepositoryFactory<
    Quotation,
    typeof Customer.prototype.id
  >;

  public readonly orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('QuotationRepository')
    protected quotationRepositoryGetter: Getter<QuotationRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Customer, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor('orders', orderRepositoryGetter,);
    this.registerInclusionResolver('orders', this.orders.inclusionResolver);
    this.quotations = this.createHasManyRepositoryFactoryFor(
      'quotations',
      quotationRepositoryGetter,
    );
    this.registerInclusionResolver(
      'quotations',
      this.quotations.inclusionResolver,
    );
  }
}
