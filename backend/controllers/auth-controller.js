import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../utils/http-error.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    throw HttpError.badRequest("Email and password are required");
  }

  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
  }).select("+password");

  if (!user) {
    throw HttpError.unauthorized("Invalid email or password");
  }

  const now = new Date();

  if (user.lockedUntil && user.lockedUntil > now) {
    throw new HttpError(423, "Account temporarily locked. Try again later.");
  }

  if (user.lockedUntil && user.lockedUntil <= now) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await user.save();
    throw HttpError.unauthorized("Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (!currentPassword || !newPassword) {
    throw HttpError.badRequest(
      "Current password and new password are required",
    );
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw HttpError.badRequest(
      `New password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    throw HttpError.unauthorized("Authentication required");
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!isPasswordCorrect) {
    throw HttpError.unauthorized("Current password is incorrect");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw HttpError.badRequest(
      "New password must be different from current password",
    );
  }

  user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.tokenVersion += 1;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });
};
