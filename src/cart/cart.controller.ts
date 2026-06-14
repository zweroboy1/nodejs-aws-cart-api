import {
    Controller,
    Get,
    Delete,
    Put,
    Body,
    Req,
    UseGuards,
    HttpStatus,
    HttpCode,
    BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartService } from './services';
import { CartEntity } from './entities/cart.entity';
import { CreateOrderDto, PutCartPayload } from '../order/type';
import { OrderEntity } from '../order/entities/order.entity';

@Controller('api/profile/cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly orderService: OrderService, @InjectDataSource() private readonly dataSource: DataSource,) { }

    // @UseGuards(JwtAuthGuard)
    @UseGuards(BasicAuthGuard)
    @Get()
    async findUserCart(@Req() req: AppRequest) {
        const cart = await this.cartService.findOrCreateByUserId(
            getUserIdFromRequest(req),
        );
        return cart.items.map(({ product, count }) => ({ product, count }));
    }

    // @UseGuards(JwtAuthGuard)
    @UseGuards(BasicAuthGuard)
    @Put()
    async updateUserCart(
        @Req() req: AppRequest,
        @Body() body: PutCartPayload,
    ) {
        const cart = await this.cartService.updateByUserId(
            getUserIdFromRequest(req),
            body,
        );
        return cart.items.map(({ product, count }) => ({ product, count }));
    }

    // @UseGuards(JwtAuthGuard)
    @UseGuards(BasicAuthGuard)
    @Delete()
    @HttpCode(HttpStatus.OK)
    async clearUserCart(@Req() req: AppRequest) {
        await this.cartService.removeByUserId(getUserIdFromRequest(req));
    }

    @UseGuards(BasicAuthGuard)
    @Put('order')
    async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
        const userId = getUserIdFromRequest(req);
        const cart = await this.cartService.findByUserId(userId);

        if (!(cart?.items.length)) {
            throw new BadRequestException('Cart is empty');
        }

        const order = await this.dataSource.transaction(async (manager) => {
            const total = cart.items.reduce(
                (sum, { product, count }) => sum + (product?.price || 0) * count,
                0,
            );

            const newOrder = manager.create(OrderEntity, {
                user_id: userId,
                cart_id: cart.id,
                delivery: body.address,
                total,
                status: 'ORDERED',
                comments: '',
                payment: {},
            });
            await manager.save(OrderEntity, newOrder);

            await manager.update(CartEntity, cart.id, { status: 'ORDERED' as any });

            return newOrder;
        });

        return { order };
    }

    @UseGuards(BasicAuthGuard)
    @Get('order')
    async getOrder() {
        const orders = await this.orderService.getAll();
        return Promise.all(
            orders.map(async (order) => {
                const cart = order.cart_id
                    ? await this.cartService.findById(order.cart_id)
                    : null;
                return {
                    id: order.id,
                    address: order.delivery,
                    items: (cart?.items ?? []).map(({ product_id, count }) => ({
                        productId: product_id,
                        count,
                    })),
                    statusHistory: [
                        {
                            status: order.status,
                            timestamp: Date.now(),
                            comment: order.comments ?? '',
                        },
                    ],
                };
            }),
        );
    }
}
