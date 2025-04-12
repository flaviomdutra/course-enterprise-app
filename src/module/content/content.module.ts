import { Module } from '@nestjs/common';
import { ConfigModule } from '../shared/module/config/config.module';
import { ContentManagementService } from './core/service/content-management.service';
import { MediaPlayerService } from './core/service/media-player.service';
import { ExternalMovieClient } from './http/rest/client/external-movie-rating/external-movie-rating.client';
import { AdminMovieController } from './http/rest/controller/admin-movie.controller';
import { MediaPlayerController } from './http/rest/controller/media-player.controller';
import { HttpClient } from './infra/http/client/http.client';
import { PersistenceModule } from './persistence/persistence.module';
import { ContentRepository } from './persistence/repository/content.repository';
import { VideoRepository } from './persistence/repository/video.repository';

@Module({
  imports: [PersistenceModule.forRoot(), ConfigModule.forRoot()],
  controllers: [AdminMovieController, MediaPlayerController],
  providers: [
    ContentManagementService,
    MediaPlayerService,
    ContentRepository,
    VideoRepository,
    ExternalMovieClient,
    HttpClient,
  ],
})
export class ContentModule {}
