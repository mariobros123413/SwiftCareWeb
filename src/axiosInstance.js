import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.6.159:3001/api', // URL del backend
});

export default api;