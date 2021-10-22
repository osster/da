import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dictionary } from './dictionaries.entity';
import { Option } from './options.entity';
import { Site } from './site.entity';

@Entity({ name: 'dictionary_item' })
export class DictionaryItem extends BaseEntity {

  @ManyToOne(() => Dictionary)
  dictionary: Dictionary;

  @Column({ type: 'varchar', length: 20 })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

}