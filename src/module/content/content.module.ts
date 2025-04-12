import { CreateMovieUseCase } from '@contentModule/application/use-case/create-movie.use-case';
import { CreateTvShowEpisodeUseCase } from '@contentModule/application/use-case/create-tv-show-episode.use-case';
import { CreateTvShowUseCase } from '@contentModule/application/use-case/create-tv-show.use-case';
import { GetStreamingURLUseCase } from '@contentModule/application/use-case/get-streaming-url.use-case';
import { AgeRecommendationService } from '@contentModule/core/service/age-recommendation.service';
import { EpisodeLifecycleService } from '@contentModule/core/service/episode-lifecycle.service';
import { VideoMetadataService } from '@contentModule/core/service/video-metadata.service';
import { VideoProcessorService } from '@contentModule/core/service/video-processor.service';
import { VideoProfanityFilterService } from '@contentModule/core/service/video-profanity-filter.service';
import { ExternalMovieClient } from '@contentModule/http/rest/client/external-movie-rating/external-movie-rating.client';
import { AdminMovieController } from '@contentModule/http/rest/controller/admin-movie.controller';
import { AdminTvShowController } from '@contentModule/http/rest/controller/admin-tv-show-controller';
import { MediaPlayerController } from '@contentModule/http/rest/controller/media-player.controller';
import { PersistenceModule } from '@contentModule/persistence/persistence.module';
import { ContentRepository } from '@contentModule/persistence/repository/content.repository';
import { VideoRepository } from '@contentModule/persistence/repository/video.repository';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@sharedModules/config/config.module';
import { HttpClientModule } from '@sharedModules/http-client/http-client.module';

@Module({
  imports: [
    PersistenceModule.forRoot(),
    ConfigModule.forRoot(),
    HttpClientModule,
  ],
  controllers: [
    AdminMovieController,
    MediaPlayerController,
    AdminTvShowController,
  ],
  providers: [
    ContentRepository,
    VideoRepository,
    ExternalMovieClient,
    AgeRecommendationService,
    VideoMetadataService,
    VideoProfanityFilterService,
    VideoProcessorService,
    EpisodeLifecycleService,
    CreateMovieUseCase,
    CreateTvShowEpisodeUseCase,
    CreateTvShowUseCase,
    GetStreamingURLUseCase,
  ],
})
export class ContentModule {}
