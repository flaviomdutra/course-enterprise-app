import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma.service';

@Injectable()
export class MediaPlayerService {
  constructor(private readonly prismaService: PrismaService) {}

  async prepareStreaming(videoId: string) {
    const video = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
    });
    return video?.url;
  }
}