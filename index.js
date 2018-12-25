// const Server = require("./Controller/ctrlServer");

// const server = new Server();

// // ** main **
// server.run();

const express = require("express");
const app = express();
const router = require('./routes/router');
app.use('',router);

app.use(express.static('public'));

const server = app.listen(8000, () => {
  const { family,address, port } = server.address();
  console.log(`Listening at http://${family}:${port}`);
});