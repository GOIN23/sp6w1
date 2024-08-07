// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { HydratedDocument } from "mongoose";
// import { randomUUID } from 'crypto';

// export type UserDocument = HydratedDocument<UserCreated>;




// @Schema()
// export class UserCreated {
//     @Prop()
//     id: string
//     @Prop({
//         required: true
//     })
//     login: string;

//     @Prop({
//         required: true
//     })
//     email: string;

//     @Prop({
//         required: true
//     })
//     createdAt: string;
//     @Prop({
//         required: true
//     })
//     emailConfirmation: emailConfirmationShema

//     @Prop({
//         required: true
//     })
//     passwordHash: string
//     @Prop({
//         required: true
//     })
//     passwordSalt: string
// }

// export const UserCreatedSchema = SchemaFactory.createForClass(UserCreated);