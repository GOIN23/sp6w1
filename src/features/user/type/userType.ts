import mongoose from "mongoose";

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
  