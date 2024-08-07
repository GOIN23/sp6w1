import { IsNumber } from "class-validator";
import { EnvironmentVariable } from "./configuration";



export class ApiSettings {
    constructor(private environmentVariables: EnvironmentVariable) {
    }
    @IsNumber()
    PORT: number = Number(this.environmentVariables.PORT);
    SECRET:number = Number(this.environmentVariables.SECRET)
}