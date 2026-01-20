import axios from "axios";

//export const baseURL = 'http://192.168.1.138:8000'
export const baseURL = ' https://wet-kings-cross.loca.lt'

export const httpClient = axios.create({
    baseURL: baseURL,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json'
    }
})