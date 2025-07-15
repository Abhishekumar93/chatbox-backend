// utils/sendResponse.ts
import { Response } from "express";

export const sendApiResponse = (
  res: Response,
  statusCode: number,
  options: {
    message?: string;
    data?: unknown;
  }
) => {
  if (!res) {
    throw new Error("Response object is required");
  }

  const { message, data } = options;

  const responseBody: Record<string, any> = {};
  if (message) responseBody.message = message;
  if (data !== undefined) responseBody.data = data;

  return res.status(statusCode).json(responseBody);
};
