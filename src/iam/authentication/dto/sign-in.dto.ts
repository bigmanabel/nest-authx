import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword, MinLength } from "class-validator";

export class SignInDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsStrongPassword()
    @MinLength(8)
    password: string;
}
