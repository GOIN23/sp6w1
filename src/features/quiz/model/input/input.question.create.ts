import { IsString, Length } from "class-validator"
import { Trim } from "../../../../utilit/decorators/transform/trim"



export class InputQuestionCreate {
    @Trim()
    @IsString()
    @Length(10, 500)
    body: string

    @IsString({ each: true })
    correctAnswers: string[]

}

