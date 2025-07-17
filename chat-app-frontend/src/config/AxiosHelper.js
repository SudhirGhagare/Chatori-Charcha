import axios from "axios";

export const baseURL = 'http://localhost:8000'
export const httpClient = axios.create({
    baseURL:baseURL,
    timeout:1000,
    headers:{
        'Content-Type':'application/json'
    }
})