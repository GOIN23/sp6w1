import { DbSettings } from './db-settings';
import { ValidateNested, validateSync } from "class-validator";
import { ApiSettings } from "./apiSettings";
import { EnvironmentSettings } from "./env-setings";



export type EnvironmentVariable = { [key: string]: string };
export type ConfigurationType = Configuration;
export type ApiSettingsType = ConfigurationType['apiSettings'];
export type EnvironmentSettingsType = ConfigurationType['environmentSettings'];
export type DbSettingsSettingsType = ConfigurationType['dbSettings'];


export class Configuration {
    @ValidateNested()
    apiSettings: ApiSettings;

    @ValidateNested()
    dbSettings: DbSettings

    @ValidateNested()
    environmentSettings: EnvironmentSettings;

    private constructor(configuration: Configuration) {
        Object.assign(this, configuration);
    }

    static createConfig(environmentVariables: Record<string, string>): Configuration {
        return new this({
            // Инициализация настроек
            apiSettings: new ApiSettings(environmentVariables),
            dbSettings: new DbSettings(environmentVariables),
            environmentSettings: new EnvironmentSettings(environmentVariables),
            

            // Другие настройки...
        });
    }
}

// export function validate(environmentVariables: Record<string, string>) {
//     const config = Configuration.createConfig(environmentVariables);
//     const errors = validateSync(config, { skipMissingProperties: false });
//     if (errors.length > 0) {
//         throw new Error(errors.toString());
//     }
//     return config;
// }

export default () => {
    const environmentVariables = process.env as EnvironmentVariable;

    console.log('process.env.ENV =', environmentVariables.ENV);
    return Configuration.createConfig(environmentVariables);
};