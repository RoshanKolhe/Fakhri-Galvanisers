import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FakhriGalvanisersDataSource} from '../datasources';
import {Inquiry, InquiryRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class InquiryRepository extends TimeStampRepositoryMixin<
  Inquiry,
  typeof Inquiry.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Inquiry,
      typeof Inquiry.prototype.id,
      InquiryRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly creator: BelongsToAccessor<Inquiry, typeof Inquiry.prototype.id>;

  public readonly updater: BelongsToAccessor<Inquiry, typeof Inquiry.prototype.id>;

  public readonly deleter: BelongsToAccessor<Inquiry, typeof Inquiry.prototype.id>;

  constructor(
    @inject('datasources.fakhriGalvanisers')
    dataSource: FakhriGalvanisersDataSource, @repository.getter('InquiryRepository') protected inquiryRepositoryGetter: Getter<InquiryRepository>,
  ) {
    super(Inquiry, dataSource);
    this.deleter = this.createBelongsToAccessorFor('deleter', inquiryRepositoryGetter,);
    this.registerInclusionResolver('deleter', this.deleter.inclusionResolver);
    this.updater = this.createBelongsToAccessorFor('updater', inquiryRepositoryGetter,);
    this.registerInclusionResolver('updater', this.updater.inclusionResolver);
    this.creator = this.createBelongsToAccessorFor('creator', inquiryRepositoryGetter,);
    this.registerInclusionResolver('creator', this.creator.inclusionResolver);
  }
}
