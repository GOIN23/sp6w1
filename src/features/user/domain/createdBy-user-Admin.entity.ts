import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { randomUUID } from 'crypto';

export type UserDocument = HydratedDocument<User>;




@Schema()
class emailConfirmationShema {
    @Prop({
        required: true
    })
    expirationDate: Date

    @Prop({
        required: true
    })
    confirmationCode: string

    @Prop({
        required: true
    })
    isConfirmed: boolean

}


@Schema()
export class User {
    @Prop({
        required: true
    })
    login: string;

    @Prop({
        required: true
    })
    email: string;

    @Prop({
        required: true
    })
    createdAt: string;
    @Prop({
        required: true
    })
    emailConfirmation: emailConfirmationShema

    @Prop({
        required: true
    })
    passwordHash: string
    @Prop({
        required: true
    })
    passwordSalt: string

}

export const UserSchema = SchemaFactory.createForClass(User);