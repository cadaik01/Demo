import { requestJson } from "./apiClient";

export function getAccounts(){
    return requestJson('/accounts');
}

export function createAccount(payLoad, token){
    return requestJson('/accounts',{
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payLoad)
    })
}