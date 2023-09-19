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
const botname = "Chaton Bot :";

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //when a new user connects
    socket.emit("message", formatMessage(botname, "Welcome to chaton"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    //when a user disconnects
    socket.on("disconnect", () => {
      const user = userLeavesChat(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botname, `${user.username} has left the chat`)
        );
      }

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });
  });

  //listen for chatMessage
  socket.on("chatMessage", (message) => {
    try {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("message", formatMessage(user.username, message));
    } catch (err) {
      console.log(err);
    }
  });
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});
