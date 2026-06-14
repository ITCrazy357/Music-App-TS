import express, { Express } from "express";
import adminRouter from "./routes/admin/index.route";

const app: Express = express();
app.locals.prefixAdmin = "admin";
adminRouter(app);

app._router.stack.forEach((middleware: any) => {
  if (middleware.name === 'router') { // router middleware
    middleware.handle.stack.forEach((handler: any) => {
      let route;
      if (handler.route) {
        route = handler.route;
        console.log(route.stack[0].method.toUpperCase(), route.path);
      } else if (handler.name === 'router') {
        handler.handle.stack.forEach((subHandler: any) => {
          if (subHandler.route) {
             console.log(subHandler.route.stack[0].method.toUpperCase(), middleware.regexp, subHandler.route.path);
          }
        });
      }
    });
  }
});
