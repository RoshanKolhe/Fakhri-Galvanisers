import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Challan, ChallanRelations, Quotation, Order} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {QuotationRepository} from './quotation.repository';
import {OrderRepository} from './order.repository';

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

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('QuotationRepository') protected quotationRepositoryGetter: Getter<QuotationRepository>, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Challan, dataSource);
    this.order = this.createHasOneRepositoryFactoryFor('order', orderRepositoryGetter);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
    this.quotation = this.createBelongsToAccessorFor('quotation', quotationRepositoryGetter,);
    this.registerInclusionResolver('quotation', this.quotation.inclusionResolver);
  }
}
