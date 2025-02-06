import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Challan, ChallanRelations, Quotation} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {QuotationRepository} from './quotation.repository';

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

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('QuotationRepository') protected quotationRepositoryGetter: Getter<QuotationRepository>,
  ) {
    super(Challan, dataSource);
    this.quotation = this.createBelongsToAccessorFor('quotation', quotationRepositoryGetter,);
    this.registerInclusionResolver('quotation', this.quotation.inclusionResolver);
  }
}
