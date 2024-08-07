import { IsInt, IsOptional, IsString } from "class-validator";



import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

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
    sortBy: string = 'createdAt'; // значение по умолчанию

    @IsOptional()
    @IsString()
    sortDirection: 'asc' | 'desc' = 'desc'; // значение по умолчанию

    @IsOptional()
    @IsInt()
    pageNumber: number = 1; // значение по умолчанию

    @IsOptional()
    @IsInt()
    pageSize?: number = 10; // значение по умолчанию

    @IsOptional()
    @IsString()
    searchNameTerm: string = null
}