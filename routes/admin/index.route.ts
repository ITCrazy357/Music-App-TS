import { Express } from "express";
import { dashboardRoutes } from "./dashboard.route";
import { systemConfig } from "../../config/system";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { requireAuth, requireAdmin } from "../../middlewares/clients/auth.middleware";

const adminRouter = (app: Express): void => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(PATH_ADMIN + "/dashboard", requireAuth, requireAdmin, dashboardRoutes);
  app.use(PATH_ADMIN + "/topics", requireAuth, requireAdmin, topicRoutes);
  app.use(PATH_ADMIN + "/songs", requireAuth, requireAdmin, songRoutes);
};

export default adminRouter;
