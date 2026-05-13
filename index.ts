import express, { Express, Request, Response } from "express";
import * as database from "./config/database";
import dotenv from "dotenv";
import clientRoutes from "./routes/client/index.route";

dotenv.config();
database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("views", "./views");
app.set("view engine", "pug");
//client router
clientRoutes(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
