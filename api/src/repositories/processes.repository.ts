import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Processes, ProcessesRelations, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';

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

  public readonly createdByUser: BelongsToAccessor<User, typeof Processes.prototype.id>;

  public readonly updatedByUser: BelongsToAccessor<User, typeof Processes.prototype.id>;

  public readonly deletedByUser: BelongsToAccessor<User, typeof Processes.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Processes, dataSource);
    this.deletedByUser = this.createBelongsToAccessorFor('deletedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('deletedByUser', this.deletedByUser.inclusionResolver);
    this.updatedByUser = this.createBelongsToAccessorFor('updatedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('updatedByUser', this.updatedByUser.inclusionResolver);
    this.createdByUser = this.createBelongsToAccessorFor('createdByUser', userRepositoryGetter,);
    this.registerInclusionResolver('createdByUser', this.createdByUser.inclusionResolver);
  }
}
