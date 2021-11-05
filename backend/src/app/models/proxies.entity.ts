import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'proxy' })
export class Proxy extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  protocol: string;

  @Column({ type: 'varchar', length: 300 })
  host: string;

  @Column({ type: 'varchar', length: 300 })
  port: string;

  @Column({ type: 'varchar', length: 300 })
  username: string;

  @Column({ type: 'varchar', length: 300 })
  password: string;

  @Column({ type: 'bool', default: true })
  active: string;

  @Column({ type: 'timestamptz', nullable: true, default: () => 'NULL' })
  tryed_at: Date;
}
