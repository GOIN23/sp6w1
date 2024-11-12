import { Type } from "class-transformer"
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator"
import { publishedStatus } from "../../type/quizType"

export class QueryQuizParamsDto {
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
    bodySearchTerm?: string

    @IsOptional()
    @IsEnum(publishedStatus)
    publishedStatus: publishedStatus


}