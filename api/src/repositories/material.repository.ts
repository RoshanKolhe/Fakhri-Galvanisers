import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Material, MaterialRelations, Order} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {OrderRepository} from './order.repository';

export class MaterialRepository extends TimeStampRepositoryMixin<
  Material,
  typeof Material.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Material,
      typeof Material.prototype.id,
      MaterialRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly order: BelongsToAccessor<Order, typeof Material.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Material, dataSource);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
