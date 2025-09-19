import { type Context } from "hono";
import User from "./user.model";

export const getUsers = async (c: Context) => {
  try {
    const users = await User.find();

    return c.json(
      {
        success: true,
        data: users,
      },
      200
    );
  } catch (error) {
    throw error;
  }
};

export const getUser = async (c: Context) => {
  try {
    const user = await User.findById(c.req.param("id")).select("-password");

    return c.json(
      {
        success: true,
        data: user,
      },
      200
    );
  } catch (error) {
    throw error;
  }
};
