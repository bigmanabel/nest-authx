import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
    ) { }

    async signUp(signUpDto: SignUpDto) {
        try {
            const user = this.userRepository.create({
                ...signUpDto,
                password: await this.hashingService.hash(signUpDto.password),
            });

            await this.userRepository.save(user);
        } catch (error) {
            const pgUniqueViolationErrorCode = '23505';
            if (error.code === pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }
            throw new BadRequestException(error.message);
        }
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.userRepository.findOneBy({
            email: signInDto.email,
        });

        if (!user) {
            throw new UnauthorizedException('User does not exist');
        }

        const passwordIsValid = await this.hashingService.compare(
            signInDto.password,
            user.password,
        );

        if (!passwordIsValid) {
            throw new UnauthorizedException('Password does not match');
        }

        // TODO: Return access token
        return true;
    }
}
