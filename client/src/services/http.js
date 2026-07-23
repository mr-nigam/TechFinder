import api from "./axios";


export const getData = async (url) => {
  const { data } = await api.get(url);
  return data;
};

export const postData = async (url, body) => {
  const { data } = await api.post(url, body);
  return data;
};

export const putData = async (url, body) => {
  const { data } = await api.put(url, body);
  return data;
};

export const patchData = async (url, body) => {
  const { data } = await api.patch(url, body);
  return data;
};

export const deleteData = async (url) => {
  const { data } = await api.delete(url);
  return data;
};




// Feature API Example
// import {
//   getData,
//   postData,
//   putData,
//   patchData,
//   deleteData,
// } from "./crud";

// export const getUsers = () => getData("/users");

// export const getUser = (id) =>
//   getData(`/users/${id}`);

// export const createUser = (body) =>
//   postData("/users", body);

// export const updateUser = (id, body) =>
//   putData(`/users/${id}`, body);

// export const editUser = (id, body) =>
//   patchData(`/users/${id}`, body);

// export const removeUser = (id) =>
//   deleteData(`/users/${id}`);


// import { useEffect, useState } from "react";
// import { getUsers } from "../api/userApi";

// function Users() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   async function loadUsers() {
//     try {
//       const data = await getUsers();
//       setUsers(data);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   return <div>{JSON.stringify(users)}</div>;
// }




// npm install socket.io-client

// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_SOCKET_URL, {
//   autoConnect: false,
//   transports: ["websocket"],
// });

// export default socket;


// import { useEffect } from "react";
// import socket from "../api/websocket";

// export default function useSocket(event, callback) {
//   useEffect(() => {
//     socket.connect();

//     socket.on(event, callback);

//     return () => {
//       socket.off(event, callback);
//     };
//   }, [event, callback]);
// }


// import socket from "../api/websocket";

// socket.emit("chat", {
//   message: "Hello Server",
// });

// import useSocket from "../hooks/useSocket";

// function Chat() {
//   useSocket("chat", (data) => {
//     console.log(data);
//   });

//   return <div>Chat</div>;
// }

// import socket from "../api/websocket";

// socket.disconnect();


// src/
// └── api/
//     ├── axios.js        // Axios instance + interceptors
//     ├── http.js         // Generic GET, POST, PUT, PATCH, DELETE methods
//     ├── authApi.js      // Authentication endpoints
//     ├── userApi.js      // User endpoints
//     ├── productApi.js   // Product endpoints
//     └── websocket.js    // Socket.IO client