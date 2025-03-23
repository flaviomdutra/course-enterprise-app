import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '@src/prisma.service';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import fs from 'fs';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        dest: './uploads',
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) => {
            return cb(
              null,
              `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpeg') {
            req.fileValidationError = 'UNSUPPORTED_FILE_TYPE';
            return cb(null, false);
          }
          return cb(null, true);
        },
      },
    ),
  )
  async uploadVideo(
    @Req() req: Request & { fileValidationError?: string },
    @Body()
    contentData: {
      title: string;
      description: string;
    },
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<any> {
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];

    if (
      req.fileValidationError &&
      req.fileValidationError === 'UNSUPPORTED_FILE_TYPE'
    ) {
      throw new BadRequestException(
        'Invalid file type. Only video/mp4 and image/jpeg are supported.',
      );
    }

    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException(
        'Both video and thumbnail files are required.',
      );
    }

    return await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        title: contentData.title,
        description: contentData.description,
        url: videoFile.path,
        thumbnailUrl: thumbnailFile.path,
        sizeInKb: videoFile.size,
        duration: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  @Get('stream/:videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const video = await this.prismaService.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const videoPath = path.join('.', video.url);
    const fileSize = fs.statSync(videoPath).size;

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(HttpStatus.PARTIAL_CONTENT, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });

      return file.pipe(res);
    }
    res.writeHead(HttpStatus.OK, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
  }
}
