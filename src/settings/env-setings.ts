import { EnvironmentVariable } from "./configuration";
import { IsEnum } from "class-validator";

export enum Environments {
    DEVELOPMENT = 'DEVELOPMENT',
    STAGING = 'STAGING',
    // 'production' данная переменная не допустима, так как isProduction будет работать не корректно
    PRODUCTION = 'PRODUCTION ',
    TEST = "TEST ",
}
export class EnvironmentSettings {
    constructor(private environmentVariables: EnvironmentVariable) { }
    @IsEnum(Environments)
    private ENV = this.environmentVariables.ENV;
    get isProduction() {
        return this.ENV === Environments.PRODUCTION;
    }
    get isStaging() {
        return this.ENV === Environments.STAGING;
    }
    get isTesting() {
        return this.ENV === Environments.TEST;
    }
    get isDevelopment() {
        return this.ENV === Environments.DEVELOPMENT;
    }
    get currentEnv() {
        return this.ENV;
    }
}
