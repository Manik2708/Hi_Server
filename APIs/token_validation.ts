import express from "express";
import jwt from "jwt-simple";
import { User } from "../Database/Models/user";

const tokenValidator = express.Router();

tokenValidator.post("/token-validation", async (req, res) => {
  try {
    const token = req.header("token");
    if (token == null) {
      return res.status(400).json(false);
    }
    const decode = jwt.decode(token, "token");
    const user = await User.findById(decode.id);
    if (user == null) {
      return res.status(400).json(false);
    }
    res.json(true);
  } catch (e: any) {
    res.status(500).json({ msg: e.message });
  }
});

export { tokenValidator };
