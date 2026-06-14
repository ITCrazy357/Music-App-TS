const express = require('express');
const http = require('http');

const app = express();
app.use((req, res, next) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

const server = app.listen(0, () => {
  const req = http.request({
    port: server.address().port,
    path: '/test?q=1',
    method: 'POST'
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(data);
      server.close();
    });
  });
  req.end();
});
