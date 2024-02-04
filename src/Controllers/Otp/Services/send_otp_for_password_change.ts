import express from "express";
import { User } from "src/Database/Models/user";
import { generateOtp } from "otp-generator-ts";
import sendmail from "nodemailer";
import { BadRequestError, BadRequestTypes } from "src/Errors/bad_request";
import { InternalServerError } from "src/Errors/server_error";

export class SendOTPForPasswordChange{
    sendOtpForPasswordChange=async(req: express.Request, res: express.Response)=>{
        try {
            const { identify } = req.body;
            const user = await User.findOne({ email: identify });
            if (user == null) {
              throw new BadRequestError(BadRequestTypes.USER_DOESNOT_EXISTS);
            }
            const email = "" + user?.email;
            const otp = generateOtp(6, "10m", "emailotp");
            let transporter = sendmail.createTransport({
              service: "gmail",
              auth: {
                user: "mehtamanik96@gmail.com",
                pass: "odaejpdmyojhzwkr",
              },
            });
            transporter.sendMail(
              {
                from: "mehtamanik96@gmail.com",
                to: email,
                subject: "Change Password",
                text:
                  "Your OTP is " +
                  otp.otp +
                  ". Please see that this OTP is valid only for 10 Minutes",
              },
              (err, data) => {
                if (err) {
                  throw new InternalServerError(err.toString());
                } else {
                  return res.json({
                    otptoken: otp.token,
                    id: user._id,
                    email: user.email,
                  });
                }
              },
            );
          } catch (e: any) {
            throw new InternalServerError(e.toString());
          }
    }
}