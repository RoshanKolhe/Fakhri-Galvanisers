import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {QcReport, QcReportRelations, Order, Material, Lots, QcTest} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {OrderRepository} from './order.repository';
import {MaterialRepository} from './material.repository';
import {LotsRepository} from './lots.repository';
import {QcTestRepository} from './qc-test.repository';

export class QcReportRepository extends TimeStampRepositoryMixin<
  QcReport,
  typeof QcReport.prototype.id,
  Constructor<
    DefaultCrudRepository<
      QcReport,
      typeof QcReport.prototype.id,
      QcReportRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly order: BelongsToAccessor<Order, typeof QcReport.prototype.id>;

  public readonly material: BelongsToAccessor<Material, typeof QcReport.prototype.id>;

  public readonly lots: BelongsToAccessor<Lots, typeof QcReport.prototype.id>;

  public readonly qcTests: HasManyRepositoryFactory<QcTest, typeof QcReport.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('MaterialRepository') protected materialRepositoryGetter: Getter<MaterialRepository>, @repository.getter('LotsRepository') protected lotsRepositoryGetter: Getter<LotsRepository>, @repository.getter('QcTestRepository') protected qcTestRepositoryGetter: Getter<QcTestRepository>,
  ) {
    super(QcReport, dataSource);
    this.qcTests = this.createHasManyRepositoryFactoryFor('qcTests', qcTestRepositoryGetter,);
    this.registerInclusionResolver('qcTests', this.qcTests.inclusionResolver);
    this.lots = this.createBelongsToAccessorFor('lots', lotsRepositoryGetter,);
    this.registerInclusionResolver('lots', this.lots.inclusionResolver);
    this.material = this.createBelongsToAccessorFor('material', materialRepositoryGetter,);
    this.registerInclusionResolver('material', this.material.inclusionResolver);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
