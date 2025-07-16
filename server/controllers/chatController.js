// controllers/chatController.js
const { messages } = require("../models/messageModel");

function handleSendMessage(io, socket, data) {
  const message = {
    ...data,
    id: Date.now(),
    senderId: socket.id,
    timestamp: new Date().toISOString(),
    reactions: {},
    readBy: [socket.id],
  };
  messages.push(message);
  io.emit("receive_message", message);
}

function handleAddReaction(io, socket, { messageId, reaction }) {
  const message = messages.find((msg) => msg.id === messageId);
  if (message) {
    if (!message.reactions[reaction]) {
      message.reactions[reaction] = [];
    }
    if (!message.reactions[reaction].includes(socket.id)) {
      message.reactions[reaction].push(socket.id);
    }
    io.emit("message_updated", message);
  }
}

function handleRemoveReaction(io, socket, { messageId, reaction }) {
  const message = messages.find((msg) => msg.id === messageId);
  if (message && message.reactions[reaction]) {
    message.reactions[reaction] = message.reactions[reaction].filter((id) => id !== socket.id);
    if (message.reactions[reaction].length === 0) {
      delete message.reactions[reaction];
    }
    io.emit("message_updated", message);
  }
}

function handleMessageRead(io, socket, { messageId }) {
  const message = messages.find((msg) => msg.id === messageId);
  if (message) {
    if (!message.readBy.includes(socket.id)) {
      message.readBy.push(socket.id);
      io.emit("message_updated", message);
    }
  }
}

module.exports = {
  handleSendMessage,
  handleAddReaction,
  handleRemoveReaction,
  handleMessageRead,
};
