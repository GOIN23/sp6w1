import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Repository } from 'typeorm';
import { BlogsEntityT } from '../../../features/content/blogs/domain/blog.entityT';




@ValidatorConstraint({ name: 'NameIsExist', async: false })
@Injectable()
export class NameIsExistConstraint implements ValidatorConstraintInterface {
    constructor(@InjectRepository(BlogsEntityT) protected blogs: Repository<BlogsEntityT>) { }
    async validate(value: any, args: ValidationArguments) {
        try {
            const nameIsExist = await this.blogs.findOne({
                where: { blogId: value }
            });
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