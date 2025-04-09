import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {OrderQcTest, OrderQcTestRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class OrderQcTestRepository extends TimeStampRepositoryMixin<
  OrderQcTest,
  typeof OrderQcTest.prototype.id,
  Constructor<
    DefaultCrudRepository<
      OrderQcTest,
      typeof OrderQcTest.prototype.id,
      OrderQcTestRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
  ) {
    super(OrderQcTest, dataSource);
  }
}
