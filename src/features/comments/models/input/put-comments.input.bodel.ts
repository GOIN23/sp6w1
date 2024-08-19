import { IsString, Length, Matches, MaxLength } from "class-validator";
import { Trim } from "src/utilit/decorators/transform/trim";
import { IsOptionalEmail } from "src/utilit/decorators/validate/is-optional-email";


export class PutCommentsModel {
    @Trim()
    @IsString()
    @Length(29, 300)
    content: string
}

