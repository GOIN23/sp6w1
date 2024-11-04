import { IsInt, IsOptional, IsString } from "class-validator";




import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from "class-transformer";

@Injectable()
export class DefaultValuesPipeUser implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        return {
            sortBy: value.sortBy || 'createdAt',
            sortDirection: value.sortDirection || 'desc',
            pageNumber: value.pageNumber || 1,
            pageSize: value.pageSize || 10,
            searchLoginTerm: value.searchLoginTerm || null,
            searchEmailTerm: value.searchEmailTerm || null
        };
    }
}




export class QueryParamsDto {
    @IsOptional()
    @IsString()
    sortBy: string // значение по умолчанию

    @IsOptional()
    @IsString()
    sortDirection: 'asc' | 'desc' = 'desc'; // значение по умолчанию

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageNumber: number = 1; // значение по умолчанию

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    pageSize?: number = 10; // значение по умолчанию

    @IsOptional()
    @IsString()
    searchLoginTerm: string | null = null; // значение по умолчанию null

    @IsOptional()
    @IsString()
    searchEmailTerm: string | null = null; // значение по умолчанию null
}
