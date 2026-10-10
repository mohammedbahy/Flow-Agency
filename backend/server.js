import dotenv from "dotenv";
import { createApp } from "./app.js";
import connectToDatabase from "./database/mongodb.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectToDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
