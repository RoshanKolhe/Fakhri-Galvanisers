import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {HsnMaster, HsnMasterRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class HsnMasterRepository extends TimeStampRepositoryMixin<
  HsnMaster,
  typeof HsnMaster.prototype.id,
  Constructor<
    DefaultCrudRepository<
      HsnMaster,
      typeof HsnMaster.prototype.id,
      HsnMasterRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
  ) {
    super(HsnMaster, dataSource);
  }
}
