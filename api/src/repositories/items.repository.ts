import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Items, ItemsRelations, User, HsnMaster, Processes, ItemProcess} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {UserRepository} from './user.repository';
import {HsnMasterRepository} from './hsn-master.repository';
import {ItemProcessRepository} from './item-process.repository';
import {ProcessesRepository} from './processes.repository';

export class ItemsRepository extends TimeStampRepositoryMixin<
  Items,
  typeof Items.prototype.id,
  Constructor<
    DefaultCrudRepository<Items, typeof Items.prototype.id, ItemsRelations>
  >
>(DefaultCrudRepository) {

  public readonly creator: BelongsToAccessor<User, typeof Items.prototype.id>;

  public readonly updater: BelongsToAccessor<User, typeof Items.prototype.id>;

  public readonly deleter: BelongsToAccessor<User, typeof Items.prototype.id>;

  public readonly hsnMaster: BelongsToAccessor<HsnMaster, typeof Items.prototype.id>;

  public readonly processes: HasManyThroughRepositoryFactory<Processes, typeof Processes.prototype.id,
          ItemProcess,
          typeof Items.prototype.id
        >;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('HsnMasterRepository') protected hsnMasterRepositoryGetter: Getter<HsnMasterRepository>, @repository.getter('ItemProcessRepository') protected itemProcessRepositoryGetter: Getter<ItemProcessRepository>, @repository.getter('ProcessesRepository') protected processesRepositoryGetter: Getter<ProcessesRepository>,
  ) {
    super(Items, dataSource);
    this.processes = this.createHasManyThroughRepositoryFactoryFor('processes', processesRepositoryGetter, itemProcessRepositoryGetter,);
    this.registerInclusionResolver('processes', this.processes.inclusionResolver);
    this.hsnMaster = this.createBelongsToAccessorFor('hsnMaster', hsnMasterRepositoryGetter,);
    this.registerInclusionResolver('hsnMaster', this.hsnMaster.inclusionResolver);
    this.deleter = this.createBelongsToAccessorFor('deleter', userRepositoryGetter,);
    this.registerInclusionResolver('deleter', this.deleter.inclusionResolver);
    this.updater = this.createBelongsToAccessorFor('updater', userRepositoryGetter,);
    this.registerInclusionResolver('updater', this.updater.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor('creator', userRepositoryGetter,);
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
  }
}
