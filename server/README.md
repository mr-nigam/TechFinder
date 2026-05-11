# TechFinder

TechFinder is a full-stack web application that connects users with nearby technicians for services such as electrical work, plumbing, appliance repair, and other home maintenance needs. The platform supports both scheduled bookings and real-time emergency service requests.

The application is designed to provide a seamless experience for users searching for reliable technicians while giving technicians a platform to manage bookings, services, and customer interactions efficiently.

---

## Features

### Platform Features
- User & Technician Authentication
- Real-time Technician Location Tracking
- Nearby Technician Matching
- Booking Request & Acceptance Flow
- Booking Lifecycle Management
- Live Booking Tracking with WebSockets
- Dynamic Fare Calculation
- Redis Geo Queries
- Queue-based Background Jobs
- Payment & Refund System
- Ratings & Reviews
- Notifications System
- PostgreSQL + PostGIS Support
- Scalable Modular Architecture
- Transaction-safe database operations
- Cloudinary media management
- File/document cleanup on account deletion
- Real-time Event-driven Workflow Processing
- Redis-powered Session & Cache Management
- Asynchronous Booking Assignment System

### User Features
- User registration and authentication
- Search nearby technicians
- Book scheduled services
- Request emergency services
- Upload address-related assets/images
- Track booking status
- Manage profile and addresses
- Receive email notifications
- Permanent account deletion

### Technician Features
- Technician registration and verification
- Upload technician documents
- Manage services and availability
- Accept or reject bookings
- Handle emergency requests
- Manage profile and work details

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- PostGIS

### Cache & Queues
- Redis
- BullMQ

### Realtime
- Socket.io

### Maps & Geolocation
- Mapbox

### Services & Tools
- Cloudinary (media storage)
- Nodemailer (emails)
- JWT Authentication
- bcrypt (password hashing)
- Twilio (messages)

---

## Core Architecture

- Modular Monolith Architecture
- Event-driven Queue System
- WebSocket-based Realtime Communication
- Redis GEO Technician Search
- State Machine-based Ride Lifecycle


## Main Modules

- Authentication
- Users
- Technicians
- Bookings
- Payments
- Reviews & Ratings
- Notifications
- Realtime Sockets
- Queue Workers
- Maps & ETA Services
- Chat System


Author
Developed by Parvesh Nigam