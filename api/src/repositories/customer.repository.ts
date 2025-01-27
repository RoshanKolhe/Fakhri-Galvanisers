import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Customer, CustomerRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export type CustomerCredentials = {
  email: string;
  password: string;
};

export class CustomerRepository extends TimeStampRepositoryMixin<
  Customer,
  typeof Customer.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Customer,
      typeof Customer.prototype.id,
      CustomerRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly creator: BelongsToAccessor<Customer, typeof Customer.prototype.id>;

  public readonly updater: BelongsToAccessor<Customer, typeof Customer.prototype.id>;

  public readonly deleter: BelongsToAccessor<Customer, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Customer, dataSource);
    this.deleter = this.createBelongsToAccessorFor('deleter', customerRepositoryGetter,);
    this.registerInclusionResolver('deleter', this.deleter.inclusionResolver);
    this.updater = this.createBelongsToAccessorFor('updater', customerRepositoryGetter,);
    this.registerInclusionResolver('updater', this.updater.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor('creator', customerRepositoryGetter,);
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
  }
}
