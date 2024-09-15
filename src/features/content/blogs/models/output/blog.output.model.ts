


export class BlogOutputModel {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

// MAPPERS

export const blogOutputModelMapper = (blog: any): BlogOutputModel => {
    const outputModel = new BlogOutputModel();


    outputModel.id = blog._id.toString();
    outputModel.name = blog.name;
    outputModel.description = blog.description;
    outputModel.createdAt = blog.createdAt
    outputModel.websiteUrl = blog.websiteUrl
    outputModel.isMembership = blog.isMembership


    return outputModel;
};
