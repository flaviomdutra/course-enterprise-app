import { VideoNotFoundException } from '@contentModule/shared/core/exception/video-not-found.exception';
import { VideoRepository } from '@contentModule/shared/persistence/repository/video.repository';
import { QUEUES } from '@contentModule/shared/queue/queue.constant';
import { TranscribeVideoUseCase } from '@contentModule/video-processor/core/use-case/transcribe-video.use-case';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { OnApplicationShutdown } from '@nestjs/common';
import { AppLogger } from '@sharedModules/logger/service/app-logger.service';
import { Job } from 'bullmq';

@Processor(QUEUES.VIDEO_TRANSCRIPT)
export class VideoTranscriptionConsumer
  extends WorkerHost
  implements OnApplicationShutdown
{
  constructor(
    private readonly videoRepository: VideoRepository,
    private readonly transcribeVideoUseCase: TranscribeVideoUseCase,
    private readonly logger: AppLogger,
  ) {
    super();
  }
  async process(job: Job<{ videoId: string; url: string }, void>) {
    this.logger.log(`Processing transcript for video ID: ${job.data.videoId}`);

    const video = await this.videoRepository.findOneById(job.data.videoId, [
      'metadata',
    ]);
    if (!video) {
      throw new VideoNotFoundException(
        `Video with ID ${job.data.videoId} not found`,
      );
    }

    await this.transcribeVideoUseCase.execute(video);
  }

  onFailed(job: Job, error: Error) {
    this.logger.error(`Job failed: ${job.id}`, {
      job,
      error,
    });
    //Do something with the error, log it, send a notification, put in a dead letter queue, etc.
  }

  async onApplicationShutdown() {
    await this.worker.close(true);
  }
}
