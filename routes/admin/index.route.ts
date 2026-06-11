import { Express } from "express";
import { dashboardRoutes } from "./dashboard.route";
import { systemConfig } from "../../config/system";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { singerRoutes } from "./singer.route";
import { userRoutes } from "./user.route";
import { roleRoutes } from "./role.route";
import { profileRoutes } from "./profile.route";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/clients/auth.middleware";
import { uploadRoutes } from "./upload.route";
import { adRoutes } from "./ad.route";
import { settingRoutes } from "./setting.route";

const adminRouter = (app: Express): void => {
  const PATH_ADMIN = `/${systemConfig.prefixAdmin}`;

  app.use(
    PATH_ADMIN + "/dashboard",
    requireAuth,
    requireAdmin,
    dashboardRoutes,
  );
  app.use(PATH_ADMIN + "/topics", requireAuth, requireAdmin, topicRoutes);
  app.use(PATH_ADMIN + "/songs", requireAuth, requireAdmin, songRoutes);
  app.use(PATH_ADMIN + "/upload", requireAuth, requireAdmin, uploadRoutes);
  app.use(PATH_ADMIN + "/singers", requireAuth, requireAdmin, singerRoutes);
  app.use(PATH_ADMIN + "/users", requireAuth, requireAdmin, userRoutes);
  app.use(PATH_ADMIN + "/roles", requireAuth, requireAdmin, roleRoutes);
  app.use(PATH_ADMIN + "/profile", requireAuth, requireAdmin, profileRoutes);
  app.use(PATH_ADMIN + "/ads", requireAuth, requireAdmin, adRoutes);
  app.use(PATH_ADMIN + "/settings", requireAuth, requireAdmin, settingRoutes);
};

export default adminRouter;
