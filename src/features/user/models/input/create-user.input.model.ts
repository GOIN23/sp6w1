import { IsString, Length, Matches } from "class-validator";
import { Trim } from "../../../../utilit/decorators/transform/trim";
import { IsOptionalEmail } from "../../../../utilit/decorators/validate/is-optional-email";
import { LoginIsExist, LoginIsExistContsraint } from "../../validate/login-is-exist.decorator";
import { EmailIsExist } from "../../validate/email-is-exist.decorator";


export class UserCreateModel {
    @IsString()
    @Trim()
    @Length(3, 10, { message: "Length not correct" })
    @Matches("^[a-zA-Z0-9_-]*$")
    @LoginIsExist()
    login: string

    @IsOptionalEmail()
    @Trim()
    @IsString()
    @EmailIsExist()
    email: string

    @Trim()
    @IsString()
    @Length(6, 20, { message: "Length not correct" })
    password: string
}



