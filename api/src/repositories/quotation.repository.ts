import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Quotation, QuotationRelations, Customer, Challan} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {CustomerRepository} from './customer.repository';
import {ChallanRepository} from './challan.repository';

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

  public readonly challan: HasOneRepositoryFactory<Challan, typeof Quotation.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('QuotationRepository')
    protected quotationRepositoryGetter: Getter<QuotationRepository>, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>,
  ) {
    super(Quotation, dataSource);
    this.challan = this.createHasOneRepositoryFactoryFor('challan', challanRepositoryGetter);
    this.registerInclusionResolver('challan', this.challan.inclusionResolver);

    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
