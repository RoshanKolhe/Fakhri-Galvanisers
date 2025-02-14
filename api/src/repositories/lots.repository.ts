import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Lots, LotsRelations, Processes, LotProcesses} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {LotProcessesRepository} from './lot-processes.repository';
import {ProcessesRepository} from './processes.repository';

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

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('LotProcessesRepository') protected lotProcessesRepositoryGetter: Getter<LotProcessesRepository>, @repository.getter('ProcessesRepository') protected processesRepositoryGetter: Getter<ProcessesRepository>,
  ) {
    super(Lots, dataSource);
    this.processes = this.createHasManyThroughRepositoryFactoryFor('processes', processesRepositoryGetter, lotProcessesRepositoryGetter,);
    this.registerInclusionResolver('processes', this.processes.inclusionResolver);
  }
}
