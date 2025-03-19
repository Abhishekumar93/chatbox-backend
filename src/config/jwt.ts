import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";

dotenv.config();

export const generateToken = (userId: string) => {
  return jsonwebtoken.sign({ userId }, process.env.JWT_SECRET ?? "", {
    expiresIn: "7d",
  });
};
