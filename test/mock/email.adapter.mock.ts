

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)

import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import { EmailAdapter } from "src/features/auth/application/emai-Adapter";


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
