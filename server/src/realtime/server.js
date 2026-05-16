import 'dotenv/config';
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

import {
    handleSearchTechnicians,
    handleGetTechnicianProfile
} from '#modules/bookings/ws/index.js';


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//  Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "WebSocket server running",
    });
});

const server = http.createServer(app);

const wss = new WebSocketServer({
    server,
    clientTracking: true,
});



// Store connected clients

const clients = new Map();

/**
 * Broadcast helper
 */
const broadcast = (data, exclude = null) => {

    const message = JSON.stringify(data);

    for(const [clientId, client] of clients.entries()){

        if(
            client.readyState === client.OPEN &&
            client !== exclude
        ){
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

    // Send initial connection payload
    ws.send(
        JSON.stringify({
            type: "connection",
            message: "Connected successfully",
            clientId,
        })
    );

    ws.on("message", async (message) => {

        try{

            const parsed = JSON.parse(message);

            const {
                event,
                data
            } = parsed;
            
            data.clientId = clientId;

            switch (event){

                case "search_technicians":
                    await handleSearchTechnicians(
                        ws,
                        data
                    );
                    break;
                
                case "technician_profile":
                    await handleGetTechnicianProfile(
                        ws,
                        data
                    )
                    break;
                
                case "send_booking_request":
                    await handleSendBookingRequest(
                        ws,
                        data
                    )
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

        }catch(err){
            console.error("Message handling error:", err);
            ws.send(
                JSON.stringify({
                    event: "error",
                    data: {
                        message: err.message
                    }
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


    ws.on("close", () => {

        console.log(`Client disconnected: ${clientId}`);

        clients.delete(clientId);

        broadcast({
            type: "user_left",
            clientId,
        });
    });

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