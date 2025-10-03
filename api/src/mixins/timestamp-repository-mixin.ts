import { Constructor } from '@loopback/core';
import {
  Count,
  DataObject,
  Entity,
  EntityCrudRepository,
  Options,
  Where,
} from '@loopback/repository';

export function TimeStampRepositoryMixin<
  E extends Entity & {
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    isDeleted?: Boolean;
    createdByUserId?: number;
    updatedByUserId?: number;
    deletedByUserId?: number;
  },
  ID,
  R extends Constructor<EntityCrudRepository<E, ID>>,
>(repository: R) {
  class MixedRepository extends repository {
    async create(entity: DataObject<E>, options?: Options): Promise<E> {
      const userId = (options as any)?.currentUser?.id;

      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      if (userId) {
        entity.createdByUserId = userId;
        entity.updatedByUserId = userId;
      }

      return super.create(entity, options);
    }

    async createAll(
      entities: DataObject<E>[],
      options?: Options,
    ): Promise<E[]> {
      const currentTime = new Date();
      const userId = (options as any)?.currentUser?.id;

      entities.forEach(entity => {
        entity.createdAt = currentTime;
        entity.updatedAt = currentTime;
        if (userId) {
          entity.createdByUserId = userId;
          entity.updatedByUserId = userId;
        }
      });

      return super.createAll(entities, options);
    }

    async updateAll(
      data: DataObject<E>,
      where?: Where<E>,
      options?: Options,
    ): Promise<Count> {
      data.updatedAt = new Date();
      const userId = (options as any)?.currentUser?.id;
      if (userId) data.updatedByUserId = userId;

      return super.updateAll(data, where, options);
    }

    async replaceById(
      id: ID,
      data: DataObject<E>,
      options?: Options,
    ): Promise<void> {
      data.updatedAt = new Date();
      const userId = (options as any)?.currentUser?.id;
      if (userId) data.updatedByUserId = userId;

      return super.replaceById(id, data, options);
    }

    async deleteById(id: ID, options?: Options): Promise<void> {
      const userId = (options as any)?.currentUser?.id;

      const entity = await this.findById(id, options);

      entity.deletedAt = new Date();
      entity.isDeleted = true;
      if (userId) entity.deletedByUserId = userId;

      await super.updateById(id, entity, options);
    }

    async deleteAll(where?: Where<E>, options?: Options): Promise<Count> {
      const userId = (options as any)?.currentUser?.id;
      const entities = await this.find({ where }, options);

      const currentTime = new Date();
      const updates = entities.map(e => {
        e.deletedAt = currentTime;
        e.isDeleted = true;
        if (userId) e.deletedByUserId = userId;
        return this.updateById(e.getId(), e, options);
      });

      await Promise.all(updates);

      return { count: entities.length };
    }
  }

  return MixedRepository;
}
