import { AgeRecommendationService } from '@contentModule/core/service/age-recommendation.service';
import { EpisodeLifecycleService } from '@contentModule/core/service/episode-lifecycle.service';
import { VideoProcessorService } from '@contentModule/core/service/video-processor.service';
import { CreateEpisodeRequestDto } from '@contentModule/http/rest/dto/request/create-episode-request.dto';
import { Episode } from '@contentModule/persistence/entity/episode.entity';
import { Video } from '@contentModule/persistence/entity/video.entity';
import { ContentRepository } from '@contentModule/persistence/repository/content.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CreateTvShowEpisodeUseCase {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly ageRecommendationService: AgeRecommendationService,
    private readonly episodeLifecycleService: EpisodeLifecycleService,
    private readonly videoProcessorService: VideoProcessorService,
  ) {}

  async execute(
    episodeData: CreateEpisodeRequestDto & {
      videoUrl: string;
      contentId: string;
      videoSizeInKb: number;
    },
  ): Promise<Episode> {
    const content = await this.contentRepository.findTvShowContentById(
      episodeData.contentId,
      ['tvShow'],
    );
    if (!content?.tvShow) {
      throw new NotFoundException(
        `TV Show with id ${episodeData.contentId} not found`,
      );
    }
    //!Episode cannot be loaded with tvShow because of the number of records
    //Episode can only be loaded if video is ready
    const episode = new Episode({
      title: episodeData.title,
      description: episodeData.description,
      season: episodeData.season,
      number: episodeData.number,
      tvShow: content.tvShow,
    });

    //start passing the entity
    await this.episodeLifecycleService.checkEpisodeConstraintsOrThrow(episode);

    //TODO add status to the video
    const video = new Video({
      url: episodeData.videoUrl,
      sizeInKb: episodeData.videoSizeInKb,
    });

    Promise.all([
      await this.videoProcessorService.processMetadataAndSecurity(video),
      await this.ageRecommendationService.setAgeRecommendationForContent(
        content,
      ),
    ]);

    episode.video = video;
    content.tvShow.episodes = [episode];

    await this.contentRepository.saveTvShow(content);

    return episode;
  }
}
