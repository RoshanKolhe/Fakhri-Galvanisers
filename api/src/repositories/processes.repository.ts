import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Processes, ProcessesRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class ProcessesRepository extends TimeStampRepositoryMixin<
  Processes,
  typeof Processes.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Processes,
      typeof Processes.prototype.id,
      ProcessesRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
  ) {
    super(Processes, dataSource);
  }
}
