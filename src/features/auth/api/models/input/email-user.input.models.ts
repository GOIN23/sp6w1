import { IsString, Matches } from "class-validator";

import { Trim } from "src/utilit/decorators/transform/trim";



export class EmailInputeModel {
    @IsString()
    @Trim()
    @Matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
    email: string


}


