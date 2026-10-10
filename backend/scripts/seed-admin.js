import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";
import bcrypt from "bcrypt";

dotenv.config();

const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@agency.com";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin12345";
const NAME = process.env.SEED_ADMIN_NAME || "System Admin";
const BCRYPT_ROUNDS = 10;

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: EMAIL.toLowerCase().trim() });
  if (existing) {
    console.log(`Admin user already exists: ${EMAIL}`);
    return;
  }

  const password = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  await User.create({
    name: NAME,
    email: EMAIL.toLowerCase().trim(),
    password,
    role: ROLES.ADMIN,
    status: "active",
    mustChangePassword: false,
  });

  console.log("Admin user created:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
};

seedAdmin()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
