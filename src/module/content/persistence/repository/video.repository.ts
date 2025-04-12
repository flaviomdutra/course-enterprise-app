import { Video } from '@contentModule/persistence/entity/video.entity';
import { Injectable } from '@nestjs/common';
import { DefaultTypeOrmRepository } from '@sharedModules/persistence/typeorm/repository/default-typeorm.repository';
import { EntityManager } from 'typeorm';

@Injectable()
export class VideoRepository extends DefaultTypeOrmRepository<Video> {
  constructor(readonly entityManager: EntityManager) {
    super(Video, entityManager);
  }
}
