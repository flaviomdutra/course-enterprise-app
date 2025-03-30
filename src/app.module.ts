import { Module } from '@nestjs/common';
import { ContentManagementService } from './core/content-management.service';
import { MediaPlayerService } from './core/media-player.service';
import { ContentController } from './http/controller/content.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [ContentController],
  providers: [PrismaService, ContentManagementService, MediaPlayerService],
})
export class AppModule {}
