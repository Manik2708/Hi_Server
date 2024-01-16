import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { User } from "../Database/Models/user";
import { verifyOtp } from "otp-generator-ts";
const verifyOTP = express.Router();

verifyOTP.post("/verify-email", authMiddlewre, async (req, res) => {
  try {
    const { otp, otptoken } = req.body;
    if (
      otp == null ||
      otp == undefined ||
      otptoken == null ||
      otptoken == undefined
    ) {
      return res.status(400).json({ msg: "OTP or token is not provided" });
    }
    if (otp.toString().length != 4) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    let parsedOtp: number = parseInt(otp);
    if (Number.isNaN(parsedOtp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const isVerified = verifyOtpObject.verifyOTP(
      parsedOtp,
      otptoken,
      "emailotp",
    );
    if (isVerified) {
      const user = await User.findByIdAndUpdate(
        res.locals.id,
        { isEmailVerified: true },
        { new: true },
      );
      return res.status(200).json(user);
    } else {
      res.status(400).json({ msg: "Verification failed" });
    }
  } catch (e: any) {
    res.status(500).json({ msg: e.message });
  }
});
// this object is created for testing purposes
export const verifyOtpObject = {
  verifyOTP: verifyOtp,
};
export { verifyOTP };
