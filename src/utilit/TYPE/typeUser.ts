export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserViewModel = {
  _id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserViewModel2 = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserViewModelConfidential = {
  _id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
};

export type PaginatorUsers = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewModel2[];
};

export type qureUsers = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type emailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

export type userDb = {
  _id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
  emailConfirmation: emailConfirmation;
};

export type UserViewModelManagerTest = {
  id: string;
  login: string;
  email: string;
  emailConfirmation: emailConfirmation;
};
