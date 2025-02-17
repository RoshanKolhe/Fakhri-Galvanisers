import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {QcTest, QcTestRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class QcTestRepository extends TimeStampRepositoryMixin<
  QcTest,
  typeof QcTest.prototype.id,
  Constructor<
    DefaultCrudRepository<QcTest, typeof QcTest.prototype.id, QcTestRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
  ) {
    super(QcTest, dataSource);
  }
}
