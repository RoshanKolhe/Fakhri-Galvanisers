import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {LotProcesses, LotProcessesRelations} from '../models';

export class LotProcessesRepository extends DefaultCrudRepository<
  LotProcesses,
  typeof LotProcesses.prototype.id,
  LotProcessesRelations
> {
  constructor(
    @inject('datasources.fakhriGalvanisers') dataSource: FakhriGalvanisersDataSource,
  ) {
    super(LotProcesses, dataSource);
  }
}
