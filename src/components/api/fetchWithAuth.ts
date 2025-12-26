export async function fetchWithAuth(url:string, options: any = {})  {
    const token = sessionStorage.getItem('token');

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}` 
    }

    const res = await fetch(url, { ...options, headers})
    return res;
}