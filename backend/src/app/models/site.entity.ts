import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Dictionary } from './dictionary.entity';
import { Option } from './options.entity';
import { Section } from './sections.entity';

export enum SiteType {
  CATALOG_ONLINER_BY = 'catalog_onliner_by',
  AB_ONLINER_BY = 'ab_onliner_by',
  R_ONLINER_BY = 'r_onliner_by',
  OLX_UA = 'olx_ua',
  DOM_RIA_COM = 'dom_ria_com',
  AUTO_RIA_COM = 'auto_ria_com',
}

@Entity({ name: 'site' })
export class Site extends BaseEntity {

  @OneToMany(() => Option, option => option.site)
  options: Option[];

  @OneToMany(() => Dictionary, dictionary => dictionary.site)
  dictionaries: Dictionary[];

  @OneToMany(() => Section, section => section.site)
  sections: Section[];

  @Column({ type: 'varchar', length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  host: string;

  @Column({ 
    type: 'enum', 
    enum: SiteType,
    nullable: true,
    default: null
   })
  type: SiteType;
}