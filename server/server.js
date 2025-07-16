// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { PORT, CLIENT_URL } = require("./config");
const { setupSocket } = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

setupSocket(io);

app.get("/", (req, res) => {
  res.send("Socket.io Chat Server is running");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 