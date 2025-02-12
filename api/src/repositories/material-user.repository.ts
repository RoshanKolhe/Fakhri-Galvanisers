import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {MaterialUser, MaterialUserRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class MaterialUserRepository extends TimeStampRepositoryMixin<
  MaterialUser,
  typeof MaterialUser.prototype.id,
  Constructor<
    DefaultCrudRepository<
      MaterialUser,
      typeof MaterialUser.prototype.id,
      MaterialUserRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
  ) {
    super(MaterialUser, dataSource);
  }
}
