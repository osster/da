import { PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: () => 'NULL' })
    deletedAt: Date;

    // @Column({ type: 'varchar', length: 300, nullable: true })
    // internalComment: string | null;

    // @Column({ type: 'varchar', length: 300, nullable: true })
    // createdBy: string | null;

    // @Column({ type: 'varchar', length: 300, nullable: true })
    // lastChangedBy: string | null;
}