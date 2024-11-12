import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';



@Injectable()
export class DefaultValuesPipeQuiz implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        return {
            sortBy: value.sortBy || 'createdAt',
            sortDirection: value.sortDirection || 'desc',
            pageNumber: value.pageNumber || 1,
            pageSize: value.pageSize || 10,
            bodySearchTerm: value.bodySearchTerm || null,
            publishedStatus: value.publishedStatus || 'all'
        };
    }
}
