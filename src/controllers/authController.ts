import { Request, Response } from "express";
import User from "../models/user";
import { convertArrayToString } from "../utils/util";
import { generateToken } from "../config/jwt";
import { CustomRequest } from "../interface/requests";
import { sendApiResponse } from "../utils/apiError";
import HttpStatus from "http-status";
import { responseMessage } from "../constants/responseMessage";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, name, email, password } = req.body;
    const errorMessages: string[] = [];
    if (!username) errorMessages.push("username");
    if (!name) errorMessages.push("name");
    if (!email) errorMessages.push("email");
    if (!password) errorMessages.push("password");
    if (errorMessages.length > 0) {
      sendApiResponse(res, HttpStatus.BAD_REQUEST, {
        message: `${convertArrayToString(errorMessages)} fields ${
          errorMessages.length > 1 ? "are" : "is"
        } required`,
      });
      return;
    }

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
      sendApiResponse(res, HttpStatus.CONFLICT, {
        message: responseMessage.USER_ALREADY_EXISTS,
      });
      return;
    }

    const isUsernameAvailable = await User.findOne({ username });
    if (isUsernameAvailable) {
      sendApiResponse(res, HttpStatus.CONFLICT, {
        message: responseMessage.usernameTaken(username),
      });
      return;
    }

    await User.create({
      username,
      name,
      email,
      password: atob(password),
    });

    sendApiResponse(res, HttpStatus.CREATED, {
      message: responseMessage.USER_REGISTERED,
    });
  } catch (error: any) {
    sendApiResponse(res, HttpStatus.BAD_REQUEST, {
      message: error.message,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
      message: responseMessage.INVALID_CREDENTIALS,
    });
    return;
  }

  const isPasswordMatches = await user.comparePassword(atob(password));

  if (!isPasswordMatches) {
    sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
      message: responseMessage.INVALID_CREDENTIALS,
    });
    return;
  }

  await User.findByIdAndUpdate(user._id, { isOnline: true });
  const payload = {
    _id: user._id,
    email: user.email,
  };
  const token = generateToken(payload);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
  sendApiResponse(res, HttpStatus.OK, {
    message: responseMessage.USER_LOGGED_IN,
  });
};

export const getUsersList = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUser = req?.userId;
    if (!currentUser) {
      sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
        message: responseMessage.UNAUTHORIZED,
      });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limitParam = req.query.limit as string | undefined;

    const totalUsers = await User.countDocuments();

    let limit: number;
    let skip: number;

    if (limitParam) {
      limit = parseInt(limitParam);
      skip = (page - 1) * limit;
    } else {
      limit = totalUsers;
      skip = 0;
    }

    const users = await User.find({ _id: { $ne: currentUser } })
      .select("-password -__v")
      .skip(skip)
      .limit(limit);
    sendApiResponse(res, HttpStatus.OK, {
      data: {
        users,
        currentPage: page,
        totalPages: limitParam ? Math.ceil(totalUsers / limit) : 1,
        totalUsers,
      },
    });
  } catch (error: any) {
    sendApiResponse(res, HttpStatus.BAD_REQUEST, { message: error.message });
  }
};

export const getUserDetail = async (req: CustomRequest, res: Response) => {
  try {
    const userId =
      req.params.id === "currentUser" ? req?.userId : req.params.id;
    if (!userId) {
      sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
        message: responseMessage.UNAUTHORIZED,
      });
      return;
    }
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      sendApiResponse(res, HttpStatus.NOT_FOUND, {
        message: responseMessage.USER_NOT_FOUND,
      });
      return;
    }
    sendApiResponse(res, HttpStatus.OK, { data: user });
  } catch (error: any) {
    sendApiResponse(res, HttpStatus.BAD_REQUEST, { message: error.message });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body;

  await User.findByIdAndUpdate(atob(id), { isOnline: false });

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  sendApiResponse(res, HttpStatus.OK, {
    message: responseMessage.USER_LOGGED_OUT,
  });
};
