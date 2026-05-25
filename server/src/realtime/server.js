import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

import {
    handleInstantTechnicianSearch,
    handleScheduledTechnicianSearch,
    handleEmergencyBooking,
    handleGetTechnicianProfile,
    handleSendBookingRequest,
    handleBookingRequestResponse
} from '#modules/bookings/realtime/index.js';

import {
    technicianSockets,
    addSocket,
    removeSocket,
    getSocket
} from './utils/sockets-manager.js';


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

/**
 * Handle WebSocket connections
 */

wss.on("connection", (ws, req) => {
    const technician = ws.technician;
    const user = ws.user;

    if(user.role === "role"){
        addSocket(technician.id, ws);
    }
    addSocket(user.id,ws);

    // Send initial connection payload
    ws.send(
        JSON.stringify({
            type: "connection",
            message: "Connected successfully",
            clientId,
        })
    );

    ws.on("message", async ( message ) => {

        try{

            const parsed = JSON.parse(message);

            const {
                event,
                data
            } = parsed;
            
            data.clientId = clientId;

            switch (event){

                case "search_instant_technicians":
                    await handleInstantTechnicianSearch(
                        ws,
                        data
                    );
                    break;
                
                 case "search_scheduled_technicians":
                    await handleScheduledTechnicianSearch(
                        ws,
                        data
                    );
                    break;
                
                case "create_emergency_booking":
                    await handleEmergencyBooking(
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

                case "booking_request_response":
                    await handleBookingRequestResponse(
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
        removeSocket(technician?.id);
        removeSocket(user.id);

        console.log(`user disconnected: ${user.id}:${technician?.id}`);
    });

    ws.on("error", (error) => {
        console.error(
            `WebSocket error:`, error);
    });
});


/**
 * Ping clients every 30 sec
 */
const interval = setInterval(() => {

    wss.technicianSockets.forEach((ws) => {

        if(ws.isAlive === false){
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

    wss.technicianSockets.forEach((ws) => {
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