import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Order, OrderRelations, Challan} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ChallanRepository} from './challan.repository';

export class OrderRepository extends TimeStampRepositoryMixin<
  Order,
  typeof Order.prototype.id,
  Constructor<
    DefaultCrudRepository<Order, typeof Order.prototype.id, OrderRelations>
  >
>(DefaultCrudRepository) {

  public readonly challan: BelongsToAccessor<Challan, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>,
  ) {
    super(Order, dataSource);
    this.challan = this.createBelongsToAccessorFor('challan', challanRepositoryGetter,);
    this.registerInclusionResolver('challan', this.challan.inclusionResolver);
  }
}
