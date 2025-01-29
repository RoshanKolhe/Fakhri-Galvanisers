import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Quotation, QuotationRelations, Customer} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {CustomerRepository} from './customer.repository';

export class QuotationRepository extends TimeStampRepositoryMixin<
  Quotation,
  typeof Quotation.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Quotation,
      typeof Quotation.prototype.id,
      QuotationRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof Quotation.prototype.id
  >;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('QuotationRepository')
    protected quotationRepositoryGetter: Getter<QuotationRepository>,
  ) {
    super(Quotation, dataSource);

    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
