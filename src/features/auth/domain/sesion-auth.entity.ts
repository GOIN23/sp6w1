import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";



export type recoveryPasswordDocument = HydratedDocument<DeviceSesions>;



@Schema()
export class DeviceSesions {

    @Prop({
        required: true
    })
    deviceId: string;

    @Prop({
        required: true
    })
    ip: string;

    @Prop({
        required: true
    })
    lastActiveDate: string

    @Prop({
        required: true
    })
    title: string

    @Prop({
        required: true
    })
    userId: string


}

export const DeviceSesionsSchema = SchemaFactory.createForClass(DeviceSesions)