import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Inquiry, InquiryRelations, Customer} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {CustomerRepository} from './customer.repository';

export class InquiryRepository extends TimeStampRepositoryMixin<
  Inquiry,
  typeof Inquiry.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Inquiry,
      typeof Inquiry.prototype.id,
      InquiryRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly customer: HasOneRepositoryFactory<
    Customer,
    typeof Inquiry.prototype.id
  >;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('InquiryRepository')
    protected inquiryRepositoryGetter: Getter<InquiryRepository>,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Inquiry, dataSource);
    this.customer = this.createHasOneRepositoryFactoryFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
