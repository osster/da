import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Group } from './groups.entity';
import { Option } from './options.entity';
import { Site } from './site.entity';

@Entity({ name: 'section' })
export class Section extends BaseEntity {

  @ManyToOne(() => Site, site => site.sections)
  site: Site;

  @ManyToMany(type => Group)
  @JoinTable()
  groups: Group[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 300 })
  uri: string;

  @Column({ type: 'integer', unsigned: true, default: 1 })
  pages: number;
  
}