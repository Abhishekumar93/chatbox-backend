import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import moment from "moment";

dotenv.config();

export const generateToken = (subject: object) => {
  const jwtData = {
    sub: subject,
    iat: moment().unix(),
  };
  return jsonwebtoken.sign(jwtData, process.env.JWT_SECRET ?? "", {
    expiresIn: 24 * 60 * 60 * 1000,
  });
};
