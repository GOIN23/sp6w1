import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UsersRepository } from "../infrastructure/users.repository";






@ValidatorConstraint({ name: "LoginIsExist", async: true })
@Injectable()
export class LoginIsExistContsraint implements ValidatorConstraintInterface {
    constructor(private readonly UsersRepository: UsersRepository) { }

    async validate(value: any, validationArguments: ValidationArguments) {
        const loginIsExists = await this.UsersRepository.findIsLogin(value)

        if (!loginIsExists) {
            return true
        } else {
            return false
        }
    }


}



export function LoginIsExist(property?: string, validationOptions?: ValidationOptions) {

    return function (object: Object, propertyName: string
    ) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: LoginIsExistContsraint
        })
    }
}