import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Option } from './options.entity';
import { Section } from './sections.entity';
import { Site } from './site.entity';

@Entity({ name: 'group' })
export class Group extends BaseEntity {

  @Column({ type: 'varchar', length: 100 })
  name: string;

  // @ManyToMany(type => Section, section => section.groups)
  // @JoinTable()
  // sections: Section[];
  
  @ManyToOne(() => Site)
  site: Site;

  @ManyToMany(type => Option)
  @JoinTable()
  options: Option[];
}