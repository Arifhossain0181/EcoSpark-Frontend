import axios from "axios";
import Cookies from "js-cookie";



const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers:{
        "content-type": "application/json",
        "Authorization": `Bearer ${Cookies.get("token")}`

    }
})
api.interceptors.request.use((config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
        return config;
})
api.interceptors.response.use((res) =>res ,(err) =>{
    if (err.response.status === 401) {
        Cookies.remove("token");
        
    
    if(typeof window !== "undefined"){
        window.location.href = "/auth/login";
    }
}
return Promise.reject(err);
})

export default api;