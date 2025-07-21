import { NextFunction, Response } from "express";
import passport from "passport";
import HttpStatus from "http-status";
import { responseMessage } from "../constants/responseMessage";
import { sendApiResponse } from "../utils/apiError";
import { CustomRequest } from "../interface/requests";

export const authenticateUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return sendApiResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, {
          message: responseMessage.AUTHENTICATION_FAILED,
        });
      }

      if (!user) {
        const errorMsg =
          info?.message === "jwt expired"
            ? responseMessage.TOKEN_EXPIRED
            : responseMessage.UNAUTHORIZED;
        // res.clearCookie("token", {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        //   sameSite: "lax",
        //   path: "/",
        // });
        return sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
          message: errorMsg,
        });
      }
      req.userId = user._id;
      next();
    }
  )(req, res, next);
};
