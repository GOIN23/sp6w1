import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";



export type recoveryPasswordDocument = HydratedDocument<RecoveryPassword>;




@Schema()
export class RecoveryPassword {

    @Prop({
        required: true
    })
    code: string;

    @Prop({
        required: true
    })
    email: string;

}

export const RecoveryPasswordSchema = SchemaFactory.createForClass(RecoveryPassword)