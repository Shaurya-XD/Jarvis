import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

let socketInstance = null;

export const initializeSocket = (projectId) => {
    socketInstance?.disconnect();

    const options = {
        auth: {
            token: localStorage.getItem('token')
        },
        query:{
            projectId
        }
    };

    // Omitting the URL uses Socket.IO's default same-origin connection.
    socketInstance = API_URL ? io(API_URL, options) : io(options);

    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
    socketInstance?.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance?.emit(eventName, data);
}

export const disconnectSocket = () => {
    socketInstance?.disconnect();
    socketInstance = null;
};
