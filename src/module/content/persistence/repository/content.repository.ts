import { MovieContentModel } from '@contentModule/core/model/movie-content.model';
import { TvShowContentModel } from '@contentModule/core/model/tv-show-content.model';
import { Content } from '@contentModule/persistence/entity/content.entity';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@sharedModules/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';
import { Episode } from '../entity/episode.entity';

@Injectable()
export class ContentRepository extends DefaultTypeOrmRepository<Content> {
  constructor(readonly entityManager: EntityManager) {
    super(Content, entityManager);
  }

  async saveMovie(entity: MovieContentModel): Promise<MovieContentModel> {
    const content = new Content({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      movie: entity.movie,
    });
    await super.save(content);

    return new MovieContentModel({
      id: content.id,
      title: content.title,
      description: content.description,
      ageRecommendation: content.ageRecommendation,
      movie: content.movie!,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      deletedAt: content.deletedAt,
    });
  }

  async saveTvShow(entity: TvShowContentModel): Promise<TvShowContentModel> {
    const episodes = entity.tvShow.episodes;
    const content = new Content({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      ageRecommendation: entity.ageRecommendation,
      tvShow: entity.tvShow,
    });

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.getRepository(Content).save(content);
      // saves the relations from the ManyToOne relationship side to avoid replacement
      if (Array.isArray(episodes) && episodes.length > 0) {
        await transactionalEntityManager.getRepository(Episode).save(episodes);
      }
    });

    return new TvShowContentModel({
      id: content.id,
      title: content.title,
      description: content.description,
      tvShow: content.tvShow!,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      deletedAt: content.deletedAt,
    });
  }

  async findTvShowContentById(
    id: string,
    relations: string[],
  ): Promise<TvShowContentModel | null> {
    const content = await super.findOneById(id, relations);

    //Ensure the content is the type tvShow
    if (!content || !content.tvShow) {
      return null;
    }

    return new TvShowContentModel({
      id: content.id,
      title: content.title,
      description: content.description,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      deletedAt: content.deletedAt,
      tvShow: content.tvShow,
    });
  }
}
