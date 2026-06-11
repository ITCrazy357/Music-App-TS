import { Express } from "express";
import { authRoutes } from "./auth.route";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import {
  requireAuth,
  injectUser,
} from "../../middlewares/clients/auth.middleware";
import { injectAds } from "../../middlewares/clients/ad.middleware";
import { favoriteSongRoutes } from "./favorite.route";
import { searchRoutes } from "./search.route";
import { commentRoutes } from "./comment.route";
import { commentFilterRoutes } from "./comment.filter.route";
import { adRoutes } from "./ad.route";
import { homeRoutes } from "./home.route";
import { rankingRoutes } from "./ranking.route";

const clientRoutes = (app: Express): void => {
  app.use(injectUser); // Inject user globally for all client routes
  app.use(injectAds); // Inject ads globally

  app.use("/", homeRoutes);
  app.use("/auth", authRoutes);
  app.use("/topics", topicRoutes);
  app.use("/songs", songRoutes);
  app.use("/favorite-songs", requireAuth, favoriteSongRoutes);
  app.use("/search", searchRoutes);
  app.use("/comments", commentRoutes);
  app.use("/comments-filter", commentFilterRoutes);
  app.use("/ads", adRoutes);
  app.use("/rankings", rankingRoutes);
};

export default clientRoutes;
