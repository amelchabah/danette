import { io } from 'socket.io-client';

export const socket = io("http://localhost:5001", {
    autoConnect: false,
});

socket.onAny((event, ...args) => {
    console.log("event received", event, args);
});