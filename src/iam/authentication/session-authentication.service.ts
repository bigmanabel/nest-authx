import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class SessionAuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
    ) { }

    async signIn(signInDto: SignInDto) {
        const user = await this.userRepository.findOneBy({
            email: signInDto.email,
        });

        if (!user) {
            throw new UnauthorizedException('User does not exist');
        }

        const isPasswordValid = await this.hashingService.compare(
            signInDto.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Password does not match');
        }

        return user;
    }
}
