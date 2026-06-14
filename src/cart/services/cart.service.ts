import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity, CartStatus } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { PutCartPayload } from '../../order/type';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartEntity)
        private readonly cartRepository: Repository<CartEntity>,
        @InjectRepository(CartItemEntity)
        private readonly cartItemRepository: Repository<CartItemEntity>,
    ) { }

    async findByUserId(userId: string): Promise<CartEntity | null> {
        return this.cartRepository.findOne({ where: { user_id: userId, status: CartStatus.OPEN } });
    }

    async createByUserId(userId: string): Promise<CartEntity> {
        const cart = this.cartRepository.create({
            user_id: userId,
            status: CartStatus.OPEN,
            items: [],
        });
        return this.cartRepository.save(cart);
    }

    async findOrCreateByUserId(userId: string): Promise<CartEntity> {
        const cart = await this.findByUserId(userId);
        if (cart) return cart;
        return this.createByUserId(userId);
    }

    async updateByUserId(userId: string, payload: PutCartPayload): Promise<CartEntity> {
        const cart = await this.findOrCreateByUserId(userId);

        const existingItem = cart.items.find((i) => i.product_id === payload.product.id);

        if (!existingItem) {
            const item = this.cartItemRepository.create({
                cart_id: cart.id,
                product_id: payload.product.id,
                count: payload.count,
                product: payload.product,
            });
            await this.cartItemRepository.save(item);
        } else if (payload.count === 0) {
            await this.cartItemRepository.delete({ cart_id: cart.id, product_id: payload.product.id });
        } else {
            await this.cartItemRepository.update(
                { cart_id: cart.id, product_id: payload.product.id },
                { count: payload.count },
            );
        }

        return this.cartRepository.findOne({ where: { id: cart.id } }) as Promise<CartEntity>;
    }

    async findById(cartId: string): Promise<CartEntity | null> {
        return this.cartRepository.findOne({ where: { id: cartId } });
    }

    async removeByUserId(userId: string): Promise<void> {
        const cart = await this.findByUserId(userId);
        if (cart) {
            await this.cartRepository.remove(cart);
        }
    }
}
