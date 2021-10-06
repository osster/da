import { Entity, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dictionary } from './dictionary.entity';
import { Site } from './site.entity';

export enum OptionType {
  BOOL = 'boolean',
  DICTIONARY = 'dictionary',
  NUMBER_RANGE = 'number_range',
  DICTIONARY_RANGE = 'dictionary_range',
}

export enum OptionSegments {
  CATALOG = 'catalog',
  SECOND = 'second',
}

@Entity({ name: 'option' })
export class Option extends BaseEntity {

  @ManyToOne(() => Site, site => site.options)
  site: Site;

  @OneToMany(() => Dictionary, dictionary => dictionary.options)
  dictionaries: Dictionary[];

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
  dictionary_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bool_type: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  ratio: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  operation: string | null;
  
  @Column({ 
    type: 'enum', 
    enum: OptionSegments,
    nullable: true,
    default: null
   })
   enabled_in_segments: OptionSegments;

   @Column({ 
     type: 'enum', 
     enum: OptionSegments,
     nullable: true,
     default: null
    })
    visible_in_segments: OptionSegments;
}