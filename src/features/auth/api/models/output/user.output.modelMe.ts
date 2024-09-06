

export class UserOutputModel {
    id: string
    login: string
    email: string
    createdAt: string
}

// MAPPERS

export const UserOutputModelMapper = (user: any): UserOutputModel => {
    const outputModel = new UserOutputModel();

    outputModel.id = user._id.toString();
    outputModel.login = user.login;
    outputModel.email = user.email;
    outputModel.createdAt = user.createdAt


    return outputModel;
};
