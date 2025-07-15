import { Model, model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
  isOnline: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: [true, "Name is required"] },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      message: (props) =>
        `${props.value} is not a valid email. Please provide a valid email.`,
    },
  },
  password: { type: String, required: [true, "Password is required"] },
  isOnline: { type: Boolean, default: false },
});

// Hash Password Before Saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = model<IUser>("User", userSchema);
export default User;
