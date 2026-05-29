import { Express } from "express";
import { authRoutes } from "./auth.route";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";

import { requireAuth } from "../../middlewares/clients/auth.middleware";

const clientRoutes = (app: Express): void => {
  app.use("/auth", authRoutes);
  app.use("/topics", requireAuth, topicRoutes);
  app.use("/songs", requireAuth, songRoutes);
};

export default clientRoutes;
