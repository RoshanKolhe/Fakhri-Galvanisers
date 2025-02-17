import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Lots, LotsRelations, Processes, LotProcesses, QcReport} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {LotProcessesRepository} from './lot-processes.repository';
import {ProcessesRepository} from './processes.repository';
import {QcReportRepository} from './qc-report.repository';

export class LotsRepository extends TimeStampRepositoryMixin<
  Lots,
  typeof Lots.prototype.id,
  Constructor<
    DefaultCrudRepository<Lots, typeof Lots.prototype.id, LotsRelations>
  >
>(DefaultCrudRepository) {

  public readonly processes: HasManyThroughRepositoryFactory<Processes, typeof Processes.prototype.id,
          LotProcesses,
          typeof Lots.prototype.id
        >;

  public readonly qcReports: HasManyRepositoryFactory<QcReport, typeof Lots.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('LotProcessesRepository') protected lotProcessesRepositoryGetter: Getter<LotProcessesRepository>, @repository.getter('ProcessesRepository') protected processesRepositoryGetter: Getter<ProcessesRepository>, @repository.getter('QcReportRepository') protected qcReportRepositoryGetter: Getter<QcReportRepository>,
  ) {
    super(Lots, dataSource);
    this.qcReports = this.createHasManyRepositoryFactoryFor('qcReports', qcReportRepositoryGetter,);
    this.registerInclusionResolver('qcReports', this.qcReports.inclusionResolver);
    this.processes = this.createHasManyThroughRepositoryFactoryFor('processes', processesRepositoryGetter, lotProcessesRepositoryGetter,);
    this.registerInclusionResolver('processes', this.processes.inclusionResolver);
  }
}
