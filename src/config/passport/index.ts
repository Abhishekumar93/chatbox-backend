import passport from "passport";
import jwtStrategy from "./jwtStrategy";

export const initializePassport = () => {
  passport.use("jwt", jwtStrategy);
};
