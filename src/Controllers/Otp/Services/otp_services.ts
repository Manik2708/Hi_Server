import sendmail from "nodemailer";
import {
  NodemailerSenderEmail,
  NodemailerSenderPassword,
  NodemailerService,
} from "src/enviornment_variables";
import { User } from "src/Database/Models/user";
import { generateOtp } from "otp-generator-ts";
import express from "express";
import { InternalServerError } from "src/Errors/server_error";
import { verifyOtp } from "otp-generator-ts";
import { BadRequestError, BadRequestTypes } from "src/Errors/bad_request";

export class OTPServices{
    sendOtp= async (req: express.Request, res: express.Response)=>{
        try {
            const id= req.id;
            const user = await User.findById(id);
            const email = "" + user?.email;
            const otp = generateOtp(6, "10m", "emailotp");
            let transporter = sendmail.createTransport({
              service: NodemailerService,
              auth: {
                user: NodemailerSenderEmail,
                pass: NodemailerSenderPassword,
              },
            });
            transporter.sendMail(
              {
                from: NodemailerSenderEmail,
                to: email,
                subject: "Verify Your Email Address",
                text:
                  "Your OTP is " +
                  otp.otp +
                  ". Please see that this OTP is valid only for 10 Minutes",
              },
              (err, data) => {
                if (err) {
                  throw new InternalServerError(err.toString());
                } else {
                  return res.json({ otptoken: otp.token });
                }
              },
            );
          } catch (e: any) {
                throw new InternalServerError(e.toString());
          }
    }
    verifyOtp= async(req: express.Request, res:express.Response)=>{
      try {
        const { otp, otptoken } = req.body;
        if (
          otp == null ||
          otp == undefined ||
          otptoken == null ||
          otptoken == undefined
        ) {
          throw new BadRequestError(BadRequestTypes.OTP_OR_TOKEN_NOT_PROVIDED);
        }
        if (otp.toString().length != 4) {
          throw new BadRequestError(BadRequestTypes.INVALID_OTP);
        }
        let parsedOtp: number = parseInt(otp);
        if (Number.isNaN(parsedOtp)) {
          throw new BadRequestError(BadRequestTypes.INVALID_OTP);
        }
    
        const isVerified = verifyOtpObject.verifyOTP(
          parsedOtp,
          otptoken,
          "emailotp",
        );
        if (isVerified) {
          const user = await User.findByIdAndUpdate(
            req.id,
            { isEmailVerified: true },
            { new: true },
          );
          return res.status(200).json(user);
        } else {
          throw new BadRequestError(BadRequestTypes.OTP_VERIFICATION_FAILED);
        }
      } catch (e: any) {
        throw new InternalServerError(e.toString());
      }
    }
}

export const verifyOtpObject = {
  verifyOTP: verifyOtp,
};