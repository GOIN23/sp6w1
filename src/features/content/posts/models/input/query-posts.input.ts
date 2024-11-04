





export class QueryPostsParamsDto {

    sortBy: string = 'createdAt'; // значение по умолчанию

    sortDirection: 'asc' | 'desc' = 'desc'; // значение по умолчанию

    pageNumber: number = 1; // значение по умолчанию
    pageSize?: number = 10; // значение по умолчанию


    searchNameTerm: string = null
}