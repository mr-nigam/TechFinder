import 'dotenv/config';
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();

/**
 * Basic middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check route
 */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "WebSocket server running",
    });
});

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Create WebSocket server
 */
const wss = new WebSocketServer({
    server,
    clientTracking: true,
});

/**
 * Store connected clients
 */
const clients = new Map();

/**
 * Broadcast helper
 */
const broadcast = (data, exclude = null) => {

    const message = JSON.stringify(data);

    for (const [clientId, client] of clients.entries()) {

        if (
            client.readyState === client.OPEN &&
            client !== exclude
        ) {
            client.send(message);
        }
    }
};

/**
 * Generate client ID
 */
const generateClientId = () => {
    return crypto.randomUUID();
};

/**
 * Handle WebSocket connections
 */

wss.on("connection", (ws, req) => {

    const clientId = generateClientId();

    clients.set(clientId, ws);

    console.log(`Client connected: ${clientId}`);

    /**
     * Send initial connection payload
     */
    
    ws.send(
        JSON.stringify({
            type: "connection",
            message: "Connected successfully",
            clientId,
        })
    );

    /**
     * Notify others
     */
    broadcast(
        {
            type: "user_joined",
            clientId,
        },
        ws
    );

    /**
     * Handle incoming messages
     */
    ws.on("message", async (message) => {

        try {

            const parsedMessage = JSON.parse(
                message.toString()
            );

            console.log(
                `Message from ${clientId}:`,
                parsedMessage
            );

            /**
             * Example message types
             */
            switch (parsedMessage.type) {

                case "chat_message":

                    broadcast({
                        type: "chat_message",
                        clientId,
                        message: parsedMessage.message,
                        createdAt: new Date(),
                    });

                    break;

                case "ping":

                    ws.send(
                        JSON.stringify({
                            type: "pong",
                        })
                    );

                    break;

                default:

                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: "Invalid message type",
                        })
                    );
            }

        } catch (error) {

            console.error("Message handling error:", error);

            ws.send(
                JSON.stringify({
                    type: "error",
                    message: "Invalid JSON format",
                })
            );
        }
    });

    /**
     * Heartbeat
     */
    ws.isAlive = true;

    ws.on("pong", () => {
        ws.isAlive = true;
    });

    /**
     * Handle disconnect
     */
    ws.on("close", () => {

        console.log(`Client disconnected: ${clientId}`);

        clients.delete(clientId);

        broadcast({
            type: "user_left",
            clientId,
        });
    });

    /**
     * Handle errors
     */
    ws.on("error", (error) => {

        console.error(
            `WebSocket error (${clientId}):`,
            error
        );

        clients.delete(clientId);
    });
});

/**
 * Ping clients every 30 sec
 */
const interval = setInterval(() => {

    wss.clients.forEach((ws) => {

        if (ws.isAlive === false) {
            return ws.terminate();
        }

        ws.isAlive = false;

        ws.ping();
    });

}, 30000);

/**
 * Cleanup on server close
 */
wss.on("close", () => {
    clearInterval(interval);
});

/**
 * Graceful shutdown
 */
process.on("SIGINT", () => {

    console.log("Shutting down server...");

    wss.clients.forEach((ws) => {
        ws.close();
    });

    server.close(() => {
        process.exit(0);
    });
});

/**
 * Start server
 */
const PORT = process.env.WS_PORT || 7000;

server.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});