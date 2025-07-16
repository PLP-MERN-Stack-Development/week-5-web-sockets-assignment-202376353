// src/hooks/useSocket.js
import { useEffect, useState, useCallback } from "react";
import { socket } from "../socket/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server with username
  const connect = useCallback((name) => {
    setUsername(name);
    socket.connect();
    socket.emit("user_join", name);
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socket.disconnect();
    setUsername("");
  }, []);

  // Send a message
  const sendMessage = useCallback((message) => {
    if (!message) return;
    socket.emit("send_message", { message, sender: username });
  }, [username]);

  // Add a reaction
  const addReaction = useCallback((messageId, reaction) => {
    socket.emit("add_reaction", { messageId, reaction });
  }, []);

  // Remove a reaction
  const removeReaction = useCallback((messageId, reaction) => {
    socket.emit("remove_reaction", { messageId, reaction });
  }, []);

  // Set typing status
  const setTyping = useCallback((isTyping) => {
    socket.emit("typing", isTyping);
  }, []);

  // Mark a message as read
  const markMessageRead = useCallback((messageId) => {
    socket.emit("message_read", { messageId });
  }, []);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("message_updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    });
    socket.on("user_list", (userList) => {
      setUsers(userList);
    });
    socket.on("user_joined", (user) => {
      // Optionally show a system message or notification
    });
    socket.on("user_left", (user) => {
      // Optionally show a system message or notification
    });
    socket.on("typing_users", (typingList) => {
      setTypingUsers(typingList);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("message_updated");
      socket.off("user_list");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("typing_users");
    };
  }, []);

  return {
    socket,
    isConnected,
    messages,
    username,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    addReaction,
    removeReaction,
    setTyping,
    markMessageRead,
  };
};
