import { Entity, Column, OneToMany, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dictionary } from './dictionaries.entity';
import { DictionaryItem } from './dictionary_items.entity';
import { Group } from './groups.entity';
// import { Section } from './sections.entity';
// import { Site } from './site.entity';

export enum OptionType {
  BOOL = 'boolean',
  DICTIONARY = 'dictionary',
  NUMBER_RANGE = 'number_range',
  DICTIONARY_RANGE = 'dictionary_range',
}

@Entity({ name: 'option' })
export class Option extends BaseEntity {

  @ManyToOne(() => Dictionary)
  dictionary: Dictionary;

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ 
    type: 'enum', 
    enum: OptionType,
    nullable: true,
    default: null
  })
  type: OptionType;

  @Column({ type: 'varchar', length: 100 })
  parameter_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bool_type: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  ratio: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  operation: string | null;
  
  // @ManyToMany(type => Group, group => group.options, {
  //   cascade: true
  // })
  // @JoinTable()
  // groups: Group[];

  // @OneToMany(() => DictionaryItem, dictionaryIten => dictionaryIten.dictionary)
  // items: DictionaryItem[];

  // @ManyToOne(() => Site, site => site.options)
  // site: Site;
  
  // @ManyToMany(type => Section, section => section.options, {
  //     cascade: true
  // })
  // @JoinTable()
  // sections: Section[];
}