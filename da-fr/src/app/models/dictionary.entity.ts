import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Option } from './options.entity';
import { Site } from './site.entity';

@Entity({ name: 'dictionary' })
export class Dictionary extends BaseEntity {

  @ManyToOne(() => Site, site => site.dictionaries)
  site: Site;

  @ManyToOne(() => Option, option => option.dictionaries)
  option: Option;

  @OneToMany(() => Option, option => option.site)
  options: Option[];

  @Column({ type: 'varchar', length: 20 })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

}