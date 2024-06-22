import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.accessTokenTtl,
            }
        );

        return {
            accessToken,
        };
    }
}
