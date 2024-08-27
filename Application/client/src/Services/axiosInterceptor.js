import axios from "axios";

// Create an Axios instance with a base URL and timeout
const instance = axios.create({
  baseURL: "http://localhost:9000/", // Base URL for requests
  timeout: 2000, // Request timeout in milliseconds (2 seconds)
});

export default instance;
