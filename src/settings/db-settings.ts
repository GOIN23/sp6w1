import { IsString } from "class-validator";
import { EnvironmentVariable } from "./configuration";




export class DbSettings {
    constructor(private environmentVariables: EnvironmentVariable) {
    }
    @IsString()
    MONGO_CONNECTION_URI: string = String(this.environmentVariables.MONGO_CONNECTION_URI)
    MONGO_CONNECTION_URI_TEST:string = String(this.environmentVariables.MONGO_CONNECTION_URI_TEST)
}