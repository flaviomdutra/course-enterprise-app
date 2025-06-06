import { Thumbnail } from '@contentModule/shared/persistence/entity/thumbnail.entity';
import { DefaultEntity } from '@sharedModules/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Content } from './content.entity';
import { Video } from './video.entity';

@Entity({ name: 'Movie' })
export class Movie extends DefaultEntity<Movie> {
  @OneToOne(() => Video, (video) => video.movie, {
    cascade: true,
  })
  video: Video;

  @Column({ type: 'float', nullable: true })
  externalRating: number | null;

  @OneToOne(() => Content, (content) => content.movie)
  @JoinColumn()
  content: Content;

  @Column({ type: 'uuid', nullable: false })
  contentId: string;

  @OneToOne(() => Thumbnail, {
    cascade: true,
  })
  @JoinColumn()
  thumbnail: Thumbnail | null;
}
