import express, { Express, Request, Response } from "express";
import * as database from "./config/database";
import dotenv from "dotenv";

import clientRoutes from "./routes/client/index.route";
import adminRouter from "./routes/admin/index.route";
import { systemConfig } from "./config/system";

import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";

dotenv.config();
database.connect();

const app: Express = express();
const port: number | string = process.env.PORT || 3000;

app.use(methodOverride("_method"));

// Cấu hình middleware để đọc dữ liệu từ req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());

// Middleware truyền flash message cho mọi template Pug
// Lưu ý: connect-flash khi gọi req.flash() có thể “consume” message.
// Map theo key cụ thể để tránh ăn hết sai thời điểm.
app.use((req: Request, res: Response, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.set("views", "./views");
app.set("view engine", "pug");
app.locals.prefixAdmin = systemConfig.prefixAdmin;
//client router
clientRoutes(app);
//admin router
adminRouter(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
