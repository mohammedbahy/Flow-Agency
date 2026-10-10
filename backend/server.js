import dotenv from "dotenv";
import connectToDatabase from "./database/mongodb.js";
import createApp from "./app.js";

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
