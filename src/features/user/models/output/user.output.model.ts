

export class UserOutputModel {
    id: string
    login: string
    email: string
    createdAt: string
}

// MAPPERS

export const UserOutputModelMapper = (user: any): UserOutputModel => {
    const outputModel = new UserOutputModel();

    outputModel.id = String(user.user_id)
    outputModel.login = user.login;
    outputModel.email = user.email;
    outputModel.createdAt = user.created_at


    return outputModel;
};
