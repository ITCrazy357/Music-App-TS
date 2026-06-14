import express from "express";
import request from "supertest";

const app = express();
app.use((req, res, next) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

request(app)
  .post("/test?q=1")
  .end((err, res) => {
    console.log(res.text);
  });
