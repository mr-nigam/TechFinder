import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import express from 'express';


const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({server});

app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

wss.on("connection",(ws)=>{
    console.log("Client connected");

  // Send message to client
    ws.send("Welcome to WebSocket server!");


  // Receive message from client
    ws.on("message", (message) => {
        console.log("Received:", message.toString());

    // Echo back
        ws.send(`Server received: ${message}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

});

const PORT = process.env.WS_PORT || 7000;

server.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});