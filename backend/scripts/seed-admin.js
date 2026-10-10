import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";

dotenv.config();

const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@agency.com";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin12345";
const NAME = process.env.SEED_ADMIN_NAME || "System Admin";
const BCRYPT_ROUNDS = 10;

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${EMAIL}`);
    return;
  }

  const password = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  await User.create({
    name: NAME,
    email: EMAIL,
    password,
    role: ROLES.ADMIN,
  });

  console.log("Admin user created:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
};

seedAdmin()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
