const API_BASE = import.meta.env.API_BASE || 'http://localhost:3000/api';

async function parseResponse(res) {
    const contentType = res.headers.get('Content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();

    if(!res.ok){
        const message = typeof data === 'string' ? data : data.message ||'Request failed.';
        throw new Error(message);
    }
    return data;
}

export async function requestJson(path, option={}){
    const res = await fetch (`${API_BASE}${path}`, option);
    return parseResponse(res);
}