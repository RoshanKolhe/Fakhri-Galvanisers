import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Order, OrderRelations, Challan, Material, Customer, QcReport} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ChallanRepository} from './challan.repository';
import {MaterialRepository} from './material.repository';
import {CustomerRepository} from './customer.repository';
import {QcReportRepository} from './qc-report.repository';

export class OrderRepository extends TimeStampRepositoryMixin<
  Order,
  typeof Order.prototype.id,
  Constructor<
    DefaultCrudRepository<Order, typeof Order.prototype.id, OrderRelations>
  >
>(DefaultCrudRepository) {

  public readonly challan: BelongsToAccessor<Challan, typeof Order.prototype.id>;

  public readonly materials: HasManyRepositoryFactory<Material, typeof Order.prototype.id>;

  public readonly customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  public readonly qcReports: HasManyRepositoryFactory<QcReport, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>, @repository.getter('MaterialRepository') protected materialRepositoryGetter: Getter<MaterialRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('QcReportRepository') protected qcReportRepositoryGetter: Getter<QcReportRepository>,
  ) {
    super(Order, dataSource);
    this.qcReports = this.createHasManyRepositoryFactoryFor('qcReports', qcReportRepositoryGetter,);
    this.registerInclusionResolver('qcReports', this.qcReports.inclusionResolver);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.materials = this.createHasManyRepositoryFactoryFor('materials', materialRepositoryGetter,);
    this.registerInclusionResolver('materials', this.materials.inclusionResolver);
    this.challan = this.createBelongsToAccessorFor('challan', challanRepositoryGetter,);
    this.registerInclusionResolver('challan', this.challan.inclusionResolver);
  }
}
