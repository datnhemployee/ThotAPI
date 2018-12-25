// const Connection = require("../Constant/Connection");
// const index = require("../routes/router");
const express = require("express");
const http = require("http");
const socketIo = require('socket.io');
const axios = require("axios");

const ctrlAccount = require("./ctrlAccount");

class Server {
  constructor () {
  }

  get AccountController () {
    if(!this.AccountController)
      this.AccountController = new ctrlAccount();
    return this.AccountController;
  }

  get client () {
    return [{
      socketID: String,
      username: String,
    }];
  }

  get port () {
    return Connection.PORT;
  }

  addClient ( client ) {
    if(client && 
      client.socketID && 
      client.username &&
      !this.client.includes(client)){
        if(this.AccountController.logIn(client)){
          this.client.push(client);
        }
    }
  }

  removeClient ( client ) {
    let index = this.client.indexOf(client);
    if(index !== -1){
      this.client.splice(index,1);
    }
  }

  run () {
    // initialization
    const app = express();
    app.use(index);

    const server = http.Server(app);
    const io = socketIo(server);
    server.listen(this.port, () => 
      console.log("listening to port: "+ 
      this.port)
    );

    let interval;
    console.log(
      "io: "+ io.bind(io)
    );
    io.on('abc', (msg) => console.log(
      "New client try to connect: "+ socket.id +
      "just send me: " + msg
    ));
    io.on('connection', socket => {
      console.log("New client try to connect: "+ socket.id);
      
      socket.on(
        Connection.LOGIN, 
         (info) => {
           if(!info || 
            !info.username || 
            !info.password){
              socket.emit(Connection.LOGIN,Connection.LOGIN_UNSUCCESFULLY);
              return;
            }
            let client = {
              socketID: socket.id,
              username: info.username,
              password: info.password,
            };
            this.addClient(client);
            console.log("New client has connected");
            socket.emit(Connection.LOGIN,Connection.LOGIN_SUCCESFULLY);

        });

      socket.on("disconnection", (info)=> {
        this.removeClient(info);
        console.log("client disconnected")});
    });

  }

}

module.exports = Server;
