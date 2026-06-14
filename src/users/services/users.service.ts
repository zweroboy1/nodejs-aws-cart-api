import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '../models';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    async findOne(name: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { name } });
    }

    async createOne({ name, password }: User): Promise<User> {
        const user = this.userRepository.create({ name, password });
        return this.userRepository.save(user);
    }
}
