import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DictionaryItem } from './dictionary_items.entity';
import { Option } from './options.entity';
import { Site } from './site.entity';

@Entity({ name: 'dictionary' })
export class Dictionary extends BaseEntity {

  @ManyToOne(() => Site, {
    cascade: true
  })
  site: Site;

  @OneToMany(() => DictionaryItem, item => item.dictionary)
  items: DictionaryItem[];

  @Column({ type: 'varchar', length: 20 })
  key: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

}