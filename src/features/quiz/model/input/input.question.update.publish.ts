import { IsBoolean } from "class-validator"



export class InputQuestionUpdatePublish {
    @IsBoolean()
    published: boolean

}

