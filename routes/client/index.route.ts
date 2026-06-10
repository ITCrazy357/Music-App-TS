import { Express } from "express";
import { authRoutes } from "./auth.route";
import { topicRoutes } from "./topic.route";
import { songRoutes } from "./song.route";
import { requireAuth, injectUser } from "../../middlewares/clients/auth.middleware";
import { favoriteSongRoutes } from "./favorite.route";
import { searchRoutes } from "./search.route";
import { commentRoutes } from "./comment.route";

const clientRoutes = (app: Express): void => {
  app.use(injectUser); // Inject user globally for all client routes

  app.use("/auth", authRoutes);
  app.use("/topics", topicRoutes);
  app.use("/songs", songRoutes);
  app.use("/favorite-songs", requireAuth, favoriteSongRoutes);
  app.use("/search", searchRoutes);
  app.use("/comments", commentRoutes);
};

export default clientRoutes;
