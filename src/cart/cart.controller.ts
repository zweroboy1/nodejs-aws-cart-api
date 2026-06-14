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
import { BasicAuthGuard } from '../auth';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { CartService } from './services';
import { CreateOrderDto, PutCartPayload } from '../order/type';

@Controller('api/profile/cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly orderService: OrderService,
    ) { }

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

    // @UseGuards(JwtAuthGuard)
    @UseGuards(BasicAuthGuard)
    @Put('order')
    async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
        const userId = getUserIdFromRequest(req);
        const cart = await this.cartService.findByUserId(userId);

        if (!(cart?.items.length)) {
            throw new BadRequestException('Cart is empty');
        }

        const { id: cartId, items } = cart;
        const order = this.orderService.create({
            userId,
            cartId,
            items: items.map(({ product_id, count }) => ({
                productId: product_id,
                count,
            })),
            address: body.address,
            total: 0,
        });
        await this.cartService.removeByUserId(userId);

        return { order };
    }

    @UseGuards(BasicAuthGuard)
    @Get('order')
    getOrder(): Order[] {
        return this.orderService.getAll();
    }
}
