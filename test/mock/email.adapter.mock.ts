

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)



export class EmailAdapterMock {

  async sendEmail(userCode: string, email: string, recoverePasswordCode?: string): Promise<boolean> {
    const ob = {
      userCode,
      email,
      recoverePasswordCode,
    }
    return true
  }
}
