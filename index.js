const express = require("express");
const app = express();
const http = require("http");
const { type } = require("os");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


let users = []
let typing = new Set([]);

let sleep = async (ms) => {
  new Promise(resolve => setTimeout(resolve, ms));
}


app.use(express.static(__dirname + "/src"));



app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


io.on("connection", (socket) => {
  socket.on("joined", (name)=> {
    users.push({
      id: socket.id,
      name: name
    })

    socket.broadcast.emit("joined", name);
  }) 
  socket.on("message", (message) => {
    socket.broadcast.emit("message", message)
  });

  socket.on("typing", async (typer) => {
    typing.add(typer.name);
    console.log(typing)
    socket.emit('typing', typing)
  })
  socket.on("disconnect", () => {
    users.forEach((disconnected) => {
      if (socket.id == disconnected.id) {
        socket.broadcast.emit("disconnected", disconnected.name)
      }
    })
    console.log("user disconnected");
  });
});

server.listen(30000, () => {
  console.log("listening on *:3000");
});
