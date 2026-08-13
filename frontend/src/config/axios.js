import axios from 'axios';

// A relative base URL keeps production requests on the Render origin. Local
// Vite development may still opt into a separately running API server.
const API_URL = import.meta.env.VITE_API_URL || '/';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance;
