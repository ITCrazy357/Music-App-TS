import { Express } from "express";
import { authRoutes } from "./auth.route";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { requireAuth } from "../../middlewares/clients/auth.middleware";
import { favoriteSongRoutes } from "./favorite.route";

const clientRoutes = (app: Express): void => {
  app.use("/auth", authRoutes);
  app.use("/topics", requireAuth, topicRoutes);
  app.use("/songs", requireAuth, songRoutes);
  app.use("/favorite-songs", requireAuth, favoriteSongRoutes);
};

export default clientRoutes;
