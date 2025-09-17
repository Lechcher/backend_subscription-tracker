import { Context } from "hono";
import User from "./user.model";

export const getUsers = (c: Context) => {
  try {
    const users = User.find();

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

export const getUser = (c: Context) => {
  try {
    const user = User.findById(c.req.param("id")).select("-password");

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
