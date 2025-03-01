import {Constructor, inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {User, UserRelations, Notification} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {NotificationRepository} from './notification.repository';

export type Credentials = {
  email?: string;
  employeeId?: string;
  password: string;
};

export class UserRepository extends TimeStampRepositoryMixin<
  User,
  typeof User.prototype.id,
  Constructor<
    DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  >
>(DefaultCrudRepository) {
  public readonly creator: BelongsToAccessor<User, typeof User.prototype.id>;

  public readonly updater: BelongsToAccessor<User, typeof User.prototype.id>;

  public readonly deleter: BelongsToAccessor<User, typeof User.prototype.id>;

  public readonly notifications: HasManyRepositoryFactory<Notification, typeof User.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('NotificationRepository') protected notificationRepositoryGetter: Getter<NotificationRepository>,
  ) {
    super(User, dataSource);
    this.notifications = this.createHasManyRepositoryFactoryFor('notifications', notificationRepositoryGetter,);
    this.registerInclusionResolver('notifications', this.notifications.inclusionResolver);
    this.deleter = this.createBelongsToAccessorFor(
      'deleter',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('deleter', this.deleter.inclusionResolver);
    this.updater = this.createBelongsToAccessorFor(
      'updater',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('updater', this.updater.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor(
      'creator',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
  }
}
