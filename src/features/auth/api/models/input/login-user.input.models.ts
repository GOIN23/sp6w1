import { IsString } from "class-validator";

import { Trim } from "src/utilit/decorators/transform/trim";



export class LoginUserCreateModel {
    @Trim()
    @IsString()
    password: string
    @IsString()
    @Trim()
    loginOrEmail: string

}



