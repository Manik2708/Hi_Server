import express from 'express';
import { createAccount } from './APIs/create_account';
import { tokenValidator } from './APIs/token_validation';
import { getData } from './APIs/provide_data';
import { verifyOTP } from './APIs/verify_otp';
import { sendOTP } from './APIs/send_otp';
import { login } from './APIs/login';
import { changeEmail } from './APIs/change_email';
import { changePassword } from './APIs/change_password';
import { sendConfession } from './APIs/send_confession';
import { saveFirebaseToken } from './APIs/firebase_token';
import { requestUnreadRecievedConfessions } from './APIs/request_recieved_confessions';
import { rejectConfession } from './APIs/reject_confession';
import path from 'path';

export class ApiContainer {
  static app = express();

  static registerApiInContainer = (): express.Express => {
    ApiContainer.app.use(createAccount);
    ApiContainer.app.use(tokenValidator);
    ApiContainer.app.use(getData);
    ApiContainer.app.use(verifyOTP);
    ApiContainer.app.use(sendOTP);
    ApiContainer.app.use(login);
    ApiContainer.app.use(changeEmail);
    ApiContainer.app.use(changePassword);
    // ApiContainer.app.use(sendConfession);
    ApiContainer.app.use(saveFirebaseToken);
    ApiContainer.app.use(requestUnreadRecievedConfessions);
    ApiContainer.app.use(rejectConfession);
    ApiContainer.app.use(express.static(path.join(__dirname, './docs')));
    ApiContainer.app.get('/', (req, res) => {
      return res.sendFile(path.join(__dirname, './docs', 'index.html'));
    });

    return ApiContainer.app;
  };
}
