import { VideoMetadata } from '@contentModule/shared/persistence/entity/video-metadata.entity';
import { Video } from '@contentModule/shared/persistence/entity/video.entity';
import { VideoSummaryGenerationAdapter } from '@contentModule/video-processor/core/adapter/video-summary-generator.adapter.interface';
import { VideoMetadataRepository } from '@contentModule/video-processor/persistence/repository/video-metadata.repository';
import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from '@sharedModules/logger/service/app-logger.service';

@Injectable()
export class GenerateSummaryForVideoUseCase {
  constructor(
    @Inject(VideoSummaryGenerationAdapter)
    private readonly videoSummaryGenerator: VideoSummaryGenerationAdapter,
    private readonly videoMetadataRepository: VideoMetadataRepository,
    private readonly logger: AppLogger,
  ) {}

  public async execute(video: Video): Promise<void> {
    const summary = await this.videoSummaryGenerator.generateSummary(video.url);
    if (!summary) {
      throw new Error(
        `Failed to generate summary for video with ID ${video.id}`,
      );
    }
    this.logger.log(`Generated summary for video ID ${video.id}`, {
      summary,
      videoId: video.id,
    });

    const metadata = await this.videoMetadataRepository.findOne({
      where: { video },
    });

    if (metadata) {
      metadata.autoGeneratedDescription = summary;
      await this.videoMetadataRepository.save(metadata);
      return;
    }

    const newMetadata = new VideoMetadata({
      autoGeneratedDescription: summary,
      video,
    });

    await this.videoMetadataRepository.save(newMetadata);
  }
}
