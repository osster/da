import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Option } from './options.entity';

@Entity({ name: 'site' })
export class Site extends BaseEntity {

  @OneToMany(() => Option, option => option.site)
  options: Option[];

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  host: string;
}