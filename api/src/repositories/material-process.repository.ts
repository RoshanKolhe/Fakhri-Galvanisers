import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {MaterialProcess, MaterialProcessRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class MaterialProcessRepository extends TimeStampRepositoryMixin<
  MaterialProcess,
  typeof MaterialProcess.prototype.id,
  Constructor<
    DefaultCrudRepository<
      MaterialProcess,
      typeof MaterialProcess.prototype.id,
      MaterialProcessRelations
    >
  >
>(DefaultCrudRepository) {

  constructor(
    @inject('datasources.fakhriGalvanisers') dataSource: FakhriGalvanisersDataSource,
  ) {
    super(MaterialProcess, dataSource);
  }
}
