// socket/index.js
const { handleSendMessage, handleAddReaction, handleRemoveReaction, handleMessageRead } = require("../controllers/chatController");

function setupSocket(io) {
  const users = {};
  const typingUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user joining
    socket.on("user_join", (username) => {
      users[socket.id] = { username, id: socket.id };
      io.emit("user_list", Object.values(users));
      io.emit("user_joined", { username, id: socket.id });
      console.log(`${username} joined the chat`);
    });

    socket.on("send_message", (data) => handleSendMessage(io, socket, data));

    // Handle reactions
    socket.on("add_reaction", (data) => handleAddReaction(io, socket, data));
    socket.on("remove_reaction", (data) => handleRemoveReaction(io, socket, data));

    // Handle typing indicator
    socket.on("typing", (isTyping) => {
      if (users[socket.id]) {
        const username = users[socket.id].username;
        if (isTyping) {
          typingUsers[socket.id] = username;
        } else {
          delete typingUsers[socket.id];
        }
        io.emit("typing_users", Object.values(typingUsers));
      }
    });

    // Handle read receipts
    socket.on("message_read", (data) => handleMessageRead(io, socket, data));

    socket.on("disconnect", () => {
      if (users[socket.id]) {
        const { username } = users[socket.id];
        io.emit("user_left", { username, id: socket.id });
        console.log(`${username} left the chat`);
      }
      delete users[socket.id];
      delete typingUsers[socket.id];
      io.emit("user_list", Object.values(users));
      io.emit("typing_users", Object.values(typingUsers));
    });
  });
}

module.exports = { setupSocket };
