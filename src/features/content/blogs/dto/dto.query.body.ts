import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";



@Injectable()
export class DefaultValuesPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        return {
            sortBy: value.sortBy || 'createdAt',
            sortDirection: value.sortDirection || 'desc',
            pageNumber: value.pageNumber || 1,
            pageSize: value.pageSize || 10,
            searchNameTerm: value.searchNameTerm || null,
        };
    }
}










export class QueryBlogsParamsDto {
    @IsOptional()
    @IsString()
    sortBy?: string // значение по умолчанию

    @IsOptional()
    @IsString()
    sortDirection?: 'asc' | 'desc'

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageNumber?: number

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageSize?: number

    @IsOptional()
    @IsString()
    searchNameTerm?: string
}