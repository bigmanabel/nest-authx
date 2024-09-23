import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SessionAuthenticationService } from './session-authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { promisify } from 'util';
import { Request } from 'express';

@Auth(AuthType.None)
@Controller('session-authentication')
export class SessionAuthenticationController {
    constructor(private readonly sessionAuthenticationService: SessionAuthenticationService,) { }

    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Req() request: Request, @Body() signInDto: SignInDto) {
        const user = await this.sessionAuthenticationService.signIn(signInDto);
        await promisify(request.logIn).call(request, user);
    }
}
