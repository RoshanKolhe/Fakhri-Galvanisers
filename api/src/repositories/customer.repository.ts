import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Customer, CustomerRelations, Quotation, Order, Challan, Payment} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {QuotationRepository} from './quotation.repository';
import {OrderRepository} from './order.repository';
import {ChallanRepository} from './challan.repository';
import {PaymentRepository} from './payment.repository';

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

  public readonly challans: HasManyRepositoryFactory<Challan, typeof Customer.prototype.id>;

  public readonly payments: HasManyRepositoryFactory<Payment, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('QuotationRepository')
    protected quotationRepositoryGetter: Getter<QuotationRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>, @repository.getter('PaymentRepository') protected paymentRepositoryGetter: Getter<PaymentRepository>,
  ) {
    super(Customer, dataSource);
    this.payments = this.createHasManyRepositoryFactoryFor('payments', paymentRepositoryGetter,);
    this.registerInclusionResolver('payments', this.payments.inclusionResolver);
    this.challans = this.createHasManyRepositoryFactoryFor('challans', challanRepositoryGetter,);
    this.registerInclusionResolver('challans', this.challans.inclusionResolver);
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
