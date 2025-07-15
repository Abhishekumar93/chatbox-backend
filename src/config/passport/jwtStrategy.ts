import { Strategy as JwtStrategy } from "passport-jwt";
import dotenv from "dotenv";
import User from "../../models/user";

dotenv.config();

const opts = {
  jwtFromRequest: (req: any) => {
    return req?.cookies?.token || null;
  },
  secretOrKey: process.env.JWT_SECRET ?? "",
};

const jwtVerify = async (jwtPayload: any, done: any) => {
  try {
    const user = await User.findById(jwtPayload.sub._id);

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(opts, jwtVerify);

export default jwtStrategy;
