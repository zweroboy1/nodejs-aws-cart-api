import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
    @PrimaryColumn({ type: 'uuid' })
    cart_id!: string;

    @PrimaryColumn({ type: 'uuid' })
    product_id!: string;

    @Column({ type: 'integer', default: 1 })
    count!: number;

    @Column({ type: 'jsonb', default: {} })
    product!: { id: string; title: string; description: string; price: number };

    @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cart_id' })
    cart!: CartEntity;
}
