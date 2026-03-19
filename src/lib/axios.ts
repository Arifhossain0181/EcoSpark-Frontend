import axios from "axios";
import Cookies from "js-cookie";



const api = axios.create({
    // Use the client env that already exists: NEXT_PUBLIC_API_URL=http://localhost:5000/api
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "content-type": "application/json",
        // Use the accessToken that comes from the backend
        Authorization: Cookies.get("accessToken")
            ? `Bearer ${Cookies.get("accessToken")}`
            : undefined,
    },
});
api.interceptors.request.use((config) => {
    const token = Cookies.get("accessToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        delete config.headers["Authorization"];
    }
    return config;
})
api.interceptors.response.use((res) =>res ,(err) =>{
    if (err.response.status === 401) {
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
        
    
    if(typeof window !== "undefined"){
        window.location.href = "/auth/login";
    }
}
return Promise.reject(err);
})

export default api;