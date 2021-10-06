import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dictionary } from './dictionary.entity';
import { Option } from './options.entity';

@Entity({ name: 'site' })
export class Site extends BaseEntity {

  @OneToMany(() => Option, option => option.site)
  options: Option[];

  @OneToMany(() => Dictionary, dictionary => dictionary.site)
  dictionaries: Dictionary[];

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  host: string;
}