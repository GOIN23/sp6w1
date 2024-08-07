import { IsInt, IsOptional, IsString } from "class-validator";

export class QueryPostsParamsDto {
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