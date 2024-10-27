

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)



export class EmailAdapterMock {
  sendEmail = jest.fn()
}
