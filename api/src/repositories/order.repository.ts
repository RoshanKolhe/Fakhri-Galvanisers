import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Order, OrderRelations, Challan, Material, Customer, QcReport, Payment, Dispatch} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {ChallanRepository} from './challan.repository';
import {MaterialRepository} from './material.repository';
import {CustomerRepository} from './customer.repository';
import {QcReportRepository} from './qc-report.repository';
import {PaymentRepository} from './payment.repository';
import {DispatchRepository} from './dispatch.repository';

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

  public readonly payment: HasOneRepositoryFactory<Payment, typeof Order.prototype.id>;

  public readonly dispatch: HasOneRepositoryFactory<Dispatch, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('ChallanRepository') protected challanRepositoryGetter: Getter<ChallanRepository>, @repository.getter('MaterialRepository') protected materialRepositoryGetter: Getter<MaterialRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('QcReportRepository') protected qcReportRepositoryGetter: Getter<QcReportRepository>, @repository.getter('PaymentRepository') protected paymentRepositoryGetter: Getter<PaymentRepository>, @repository.getter('DispatchRepository') protected dispatchRepositoryGetter: Getter<DispatchRepository>,
  ) {
    super(Order, dataSource);
    this.dispatch = this.createHasOneRepositoryFactoryFor('dispatch', dispatchRepositoryGetter);
    this.registerInclusionResolver('dispatch', this.dispatch.inclusionResolver);
    this.payment = this.createHasOneRepositoryFactoryFor('payment', paymentRepositoryGetter);
    this.registerInclusionResolver('payment', this.payment.inclusionResolver);
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
