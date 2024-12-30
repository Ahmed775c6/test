const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import cors
const path = require("path"); // Import path for resolving paths

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your front-end URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Serve the dist folder
const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));

// Fallback route to serve index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  
  // Send a unique ID to the client
  socket.emit("my-id", socket.id);

  socket.on("call-user", (data) => {
   
    socket.to(data.to).emit("incoming-call", socket.id, data.offer);
  });

  socket.on("send-ice-candidate", (candidate) => {
    socket.broadcast.emit("receive-ice-candidate", candidate);
  });

  socket.on("end-call", () => {
    socket.broadcast.emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
