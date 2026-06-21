import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @Column({ type: 'uuid', nullable: true })
    cart_id!: string;

    @Column({ type: 'jsonb', default: {} })
    payment!: Record<string, unknown>;

    @Column({ type: 'jsonb', default: {} })
    delivery!: Record<string, unknown>;

    @Column({ type: 'text', default: '' })
    comments!: string;

    @Column({ type: 'varchar', length: 20, default: 'OPEN' })
    status!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    total!: number;
}
