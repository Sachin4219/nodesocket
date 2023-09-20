const express = require("express");
const app = express();
http = require("http");
const cors = require("cors");
const { Server } = require("socket.io"); // Add this

app.use(cors()); // Add cors middleware

const server = http.createServer(app); // Add this

// Add this
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const formatMessage = require("./utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeavesChat,
  getRoomUsers,
} = require("./utils/users");

const port = process.env.PORT || 4000;
const botname = "Arbitrator Bot :";

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    console.log("user joined room", username, room);
    const user = userJoin(username, room);
    socket.join(room);
    console.log(getRoomUsers(room));
    //when a new user connects
    socket.emit("message", formatMessage(botname, "Welcome to chaton"));
    socket.broadcast
      .to(room)
      .emit(
        "message",
        formatMessage(botname, `${username} has joined the chat`)
      );

    io.to(room).emit("roomUsers", {
      room: room,
      users: getRoomUsers(room),
    });

    //when a user disconnects
    socket.on("disconnect", (username, room) => {
      const user = userLeavesChat(username);
      // if (user) {
      io.to(room).emit(
        "message",
        formatMessage(botname, `${username} has left the chat`)
      );
      // }
      io.to(room).emit("roomUsers", {
        room: room,
        users: getRoomUsers(room),
      });
    });
  });

  //listen for chatMessage
  socket.on("chatMessage", ({ username, message, room }) => {
    try {
      // const user = getCurrentUser(username);
      io.to(room).emit("message", formatMessage(username, message));
    } catch (err) {
      console.log(err);
    }
  });
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
