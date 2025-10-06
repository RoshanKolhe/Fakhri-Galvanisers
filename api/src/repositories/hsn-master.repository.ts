import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {HsnMaster, HsnMasterRelations, User} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';

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

  public readonly createdByUser: BelongsToAccessor<User, typeof HsnMaster.prototype.id>;

  public readonly updatedByUser: BelongsToAccessor<User, typeof HsnMaster.prototype.id>;

  public readonly deletedByUser: BelongsToAccessor<User, typeof HsnMaster.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(HsnMaster, dataSource);
    this.deletedByUser = this.createBelongsToAccessorFor('deletedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('deletedByUser', this.deletedByUser.inclusionResolver);
    this.updatedByUser = this.createBelongsToAccessorFor('updatedByUser', userRepositoryGetter,);
    this.registerInclusionResolver('updatedByUser', this.updatedByUser.inclusionResolver);
    this.createdByUser = this.createBelongsToAccessorFor('createdByUser', userRepositoryGetter,);
    this.registerInclusionResolver('createdByUser', this.createdByUser.inclusionResolver);
  }
}
