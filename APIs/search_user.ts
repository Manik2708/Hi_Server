import express from "express";
import { authMiddlewre } from "../Middlewares/user";
import { User } from "../Database/Models/user";

export const searchUser = express.Router();

searchUser.get("/search-user", authMiddlewre, async (req, res) => {
  try {
    const query = req.query.param as string | undefined;
    const UserList = await User.find(
      { _id: { $ne: res.locals.id } },
      { $text: { $search: query } },
    )
      .select("username")
      .select("name");
    return res.status(200).json(UserList);
  } catch (e: any) {
    return res.status(500).json({ msg: e.message });
  }
});
