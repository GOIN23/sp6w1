import { IsString, Length, Matches } from "class-validator";

import { Trim } from "src/utilit/decorators/transform/trim";



export class NewPasswordInputeModel {
    @Trim()
    @IsString()
    @Length(6, 20, { message: "Length not correct" })
    newPassword: string


    @Trim()
    @IsString()
    recoveryCode: string

}


