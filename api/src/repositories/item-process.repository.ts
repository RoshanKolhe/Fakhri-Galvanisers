import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {ItemProcess, ItemProcessRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class ItemProcessRepository extends TimeStampRepositoryMixin<
  ItemProcess,
  typeof ItemProcess.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ItemProcess,
      typeof ItemProcess.prototype.id,
      ItemProcessRelations
    >
  >
>(DefaultCrudRepository) {

  constructor(
    @inject('datasources.fakhriGalvanisers') dataSource: FakhriGalvanisersDataSource,
  ) {
    super(ItemProcess, dataSource);
  }
}