import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Option } from './options.entity';
import { Site } from './site.entity';

@Entity({ name: 'section' })
export class Section extends BaseEntity {

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 300 })
  uri: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', unsigned: true, default: 1 })
  pages: number;


  @ManyToOne(() => Site, site => site.sections)
  site: Site;

  @ManyToMany(type => Option, option => option.sections)
  options: Option[];
  
}