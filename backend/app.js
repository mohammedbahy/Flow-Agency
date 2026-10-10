import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRoutes from "./routes/auth-routes.js";
import clientRoutes from "./routes/client-routes.js";
import deadlineRuleRoutes from "./routes/deadline-rule-routes.js";
import permissionRoutes from "./routes/permission-routes.js";
import reportRoutes from "./routes/report-routes.js";
import taskRoutes from "./routes/task-routes.js";
import teamRoutes from "./routes/team-routes.js";
import userRoutes from "./routes/user-routes.js";

/**
 * Builds the Express application.
 *
 * `identityMiddleware` is the integration seam for authentication: the
 * Sprint-1 auth story mounts it here (or passes it in) and it must populate
 * `req.user = { _id, role }`. Route guards fail closed with 401 until then,
 * so no client endpoint is ever left silently unprotected.
 */
export const createApp = ({ identityMiddleware } = {}) => {
  const app = express();

  app.use(express.json());

  if (identityMiddleware) {
    app.use(identityMiddleware);
  }

  app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Backend is running successfully",
    });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/permissions", permissionRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/clients", clientRoutes);
  app.use("/api/v1/teams", teamRoutes);
  app.use("/api/v1/deadline-rules", deadlineRuleRoutes);
  app.use("/api/v1/tasks", taskRoutes);
  app.use("/api/v1/reports", reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
