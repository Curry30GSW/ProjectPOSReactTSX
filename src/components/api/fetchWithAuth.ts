// export async function fetchWithAuth(url:string, options: any = {})  {
//     const token = sessionStorage.getItem('token');

//     const headers = {
//         "Content-Type": "application/json",
//         ...(options.headers || {}),
//         "Authorization": `Bearer ${token}` 
//     }

//     const res = await fetch(url, { ...options, headers})
//     return res;
// }


export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = sessionStorage.getItem("token");

  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {} 
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(
    `http://localhost:3000${endpoint}`, 
    {
      ...options,
      headers,
    } 
  );

  return res;
}
