export class UserRoutes {
  static CREATE_ACCOUNT_WITHOUT_VERIFICATION: string =
    'create-account-without-verification';
  static LOGIN: string = 'login';
  static CHANGE_EMAIL: string = 'change-email';
  static SET_USER_ONLINE: string = 'set-user-online';
}

export class ConfessionRoutes {
  static SEND_CONFESSION: string = 'send-confession';
  static REJECT_CONFESSION: string = 'reject-confession';
}

export class OTPRoutes {
  static SEND_OTP: string = 'send-otp';
  static VERIFY_OTP: string = 'verify-otp';
}
