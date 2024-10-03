import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Model } from 'mongoose';
import { Blog } from '../../../features/content/blogs/domain/blog.entity';




@ValidatorConstraint({ name: 'NameIsExist', async: false })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
    constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) { }
    async validate(value: any, args: ValidationArguments) {
        try {
            const nameIsExist = await this.blogModel.findOne({ _id: value });
            return !!nameIsExist;


        } catch (error) {
            return false

        }

    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return 'Name already exist';
    }
}

export function NameIsExist(
    property?: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: NameIsExistConstraint,
        });
    };
}