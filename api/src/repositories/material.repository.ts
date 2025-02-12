import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Material, MaterialRelations, Order, User, MaterialUser, Processes, MaterialProcess} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {OrderRepository} from './order.repository';
import {MaterialUserRepository} from './material-user.repository';
import {UserRepository} from './user.repository';
import {MaterialProcessRepository} from './material-process.repository';
import {ProcessesRepository} from './processes.repository';

export class MaterialRepository extends TimeStampRepositoryMixin<
  Material,
  typeof Material.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Material,
      typeof Material.prototype.id,
      MaterialRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly order: BelongsToAccessor<Order, typeof Material.prototype.id>;

  public readonly users: HasManyThroughRepositoryFactory<User, typeof User.prototype.id,
          MaterialUser,
          typeof Material.prototype.id
        >;

  public readonly processes: HasManyThroughRepositoryFactory<Processes, typeof Processes.prototype.id,
          MaterialProcess,
          typeof Material.prototype.id
        >;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('OrderRepository') protected orderRepositoryGetter: Getter<OrderRepository>, @repository.getter('MaterialUserRepository') protected materialUserRepositoryGetter: Getter<MaterialUserRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('MaterialProcessRepository') protected materialProcessRepositoryGetter: Getter<MaterialProcessRepository>, @repository.getter('ProcessesRepository') protected processesRepositoryGetter: Getter<ProcessesRepository>,
  ) {
    super(Material, dataSource);
    this.processes = this.createHasManyThroughRepositoryFactoryFor('processes', processesRepositoryGetter, materialProcessRepositoryGetter,);
    this.registerInclusionResolver('processes', this.processes.inclusionResolver);
    this.users = this.createHasManyThroughRepositoryFactoryFor('users', userRepositoryGetter, materialUserRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
    this.order = this.createBelongsToAccessorFor('order', orderRepositoryGetter,);
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
