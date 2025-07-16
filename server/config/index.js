// config/index.js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5001,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5177",
};
