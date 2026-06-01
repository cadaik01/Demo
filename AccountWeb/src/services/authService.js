import { requestJson } from "./apiClient";

export function registerUser(payLoad){
    return requestJson('/auth/register',{
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payLoad)
    })
}

export function login(payLoad){
    return requestJson('/auth/login',{
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payLoad)
    })
}