import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderPayload, OrderStatus } from '../type';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
    ) { }

    async getAll(): Promise<OrderEntity[]> {
        return this.orderRepository.find();
    }

    async findById(orderId: string): Promise<OrderEntity | null> {
        return this.orderRepository.findOne({ where: { id: orderId } });
    }

    async create(data: CreateOrderPayload): Promise<OrderEntity> {
        const order = this.orderRepository.create({
            user_id: data.userId,
            cart_id: data.cartId,
            delivery: data.address as unknown as Record<string, unknown>,
            total: data.total,
            status: OrderStatus.Open,
            comments: '',
            payment: {},
        });
        return this.orderRepository.save(order);
    }

    async update(orderId: string, data: Partial<OrderEntity>): Promise<void> {
        await this.orderRepository.update(orderId, data as any);
    }
}
