import { UsersRepository } from '../../src/features/users/infrastructure/users.repository';
import { UsersService } from '../../src/features/users/application/users.service';

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)
export const UserServiceMockObject = {
  sendMessageOnEmail() {
    console.log('Call mock method sendMessageOnEmail / MailService');
    return Promise.resolve(true);
  },
  create() {
    return Promise.resolve('123');
  },
};

//  .overrideProvider(UsersService)
//  .useClass(UserServiceMock)
// or
// .overrideProvider(UsersService)
// .useFactory({
//      factory: (usersRepo: UsersRepository) => {
//          return new UserServiceMock(usersRepo);
//      },
//      inject: [UsersRepository]
//      }
//     )

export class UserServiceMock extends UsersService {
  constructor(usersRepository: UsersRepository) {
    super(usersRepository);
  }

  sendMessageOnEmail() {
    console.log(
      'Call mock method sendMessageOnEmail / MailService, for specific test',
    );
    return Promise.resolve(true);
  }
}
