// src/components/Chat.js
import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

// Helper to generate a color from a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
}

// Avatar component
function Avatar({ name, size = 28 }) {
  const display = name ? name[0].toUpperCase() : "?";
  const color = stringToColor(name || "?");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        fontWeight: "bold",
        fontSize: size * 0.6,
        marginRight: 6,
        userSelect: "none",
      }}
    >
      {display}
    </span>
  );
}

const EMOJIS = ["👍", "❤️", "😂", "🎉"];

const Chat = () => {
  const {
    isConnected,
    messages,
    username,
    users,
    connect,
    disconnect,
    sendMessage,
    addReaction,
    removeReaction,
    typingUsers,
    setTyping,
    markMessageRead,
  } = useSocket();
  const [input, setInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when they appear
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.readBy && !msg.readBy.includes(socket.id)) {
        markMessageRead(msg.id);
      }
    });
  }, [messages, markMessageRead]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (setTyping) {
      setTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTyping(false), 1200);
    }
  };

  const handleConnect = () => {
    if (nameInput.trim()) {
      setLoading(true);
      connect(nameInput.trim());
      setTimeout(() => setLoading(false), 500); // Simulate loading
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: 8,
        boxShadow: "0 2px 8px #eee",
        background: "#fafbfc",
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>💬 Global Chat Room</h2>
        {/* Online users */}
        {isConnected && (
          <div style={{ fontSize: 13, color: "#555", marginTop: 6, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            <b style={{ marginRight: 6 }}>Online users ({users.length}):</b>
            {users.length === 0 ? (
              <span style={{ color: "#aaa" }}> None</span>
            ) : (
              users.map((u, i) => (
                <span key={u.id} style={{ display: "inline-flex", alignItems: "center", marginRight: 10, marginBottom: 2 }}>
                  <Avatar name={u.username === username ? "You" : u.username} size={22} />
                  {u.username === username ? <b>You</b> : u.username}
                </span>
              ))
            )}
          </div>
        )}
      </div>
      {!isConnected ? (
        <div style={{ textAlign: "center" }}>
          <input
            type="text"
            placeholder="Enter your username"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              marginRight: 8,
              width: 180,
            }}
            disabled={loading}
          />
          <button
            onClick={handleConnect}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              background: "#007bff",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center" }}>
            <span>
              Connected as <b>{username}</b>
            </span>
            <button
              style={{
                marginLeft: "auto",
                padding: "4px 10px",
                borderRadius: 4,
                border: "none",
                background: "#dc3545",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={disconnect}
            >
              Disconnect
            </button>
          </div>
          <div
            style={{
              border: "1px solid #ccc",
              height: 300,
              overflowY: "auto",
              padding: 8,
              marginBottom: 10,
              background: "#fff",
              borderRadius: 4,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", marginTop: 100 }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    marginBottom: 10,
                    textAlign: msg.sender === username ? "right" : "left",
                    display: "flex",
                    flexDirection: msg.sender === username ? "row-reverse" : "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Avatar name={msg.sender === username ? "You" : msg.sender || "Anonymous"} />
                  <span
                    style={{
                      display: "inline-block",
                      background: msg.sender === username ? "#d1e7dd" : "#f1f3f4",
                      color: "#222",
                      borderRadius: 8,
                      padding: "6px 12px",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                    }}
                  >
                    <b style={{ color: "#007bff" }}>
                      {msg.sender === username ? "You" : msg.sender || "Anonymous"}
                    </b>
                    {": "}
                    {msg.message}
                    <span
                      style={{
                        fontSize: 10,
                        color: "#888",
                        marginLeft: 8,
                        float: "right",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {/* Reactions */}
                    <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
                      {EMOJIS.map((emoji) => {
                        const reacted = msg.reactions && msg.reactions[emoji]?.includes(socket.id);
                        const count = msg.reactions && msg.reactions[emoji]?.length;
                        return (
                          <button
                            key={emoji}
                            style={{
                              background: reacted ? "#ffe066" : "#f1f3f4",
                              border: "1px solid #ddd",
                              borderRadius: 12,
                              padding: "2px 8px",
                              cursor: "pointer",
                              fontWeight: reacted ? "bold" : "normal",
                              outline: "none",
                              fontSize: 16,
                            }}
                            onClick={() =>
                              reacted
                                ? removeReaction(msg.id, emoji)
                                : addReaction(msg.id, emoji)
                            }
                          >
                            {emoji} {count > 0 ? count : ""}
                          </button>
                        );
                      })}
                    </div>
                    {/* Read receipts */}
                    {msg.readBy && users.length > 0 && (
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                        <span>Read by: </span>
                        {users
                          .filter((u) => msg.readBy.includes(u.id))
                          .map((u) => (u.username === username ? "You" : u.username))
                          .join(", ") || "No one yet"}
                      </div>
                    )}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "none",
                background: "#28a745",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              {typingUsers.filter((u) => u !== username).join(", ")}
              {typingUsers.filter((u) => u !== username).length === 1 ? " is typing..." : typingUsers.filter((u) => u !== username).length > 1 ? " are typing..." : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Chat;
