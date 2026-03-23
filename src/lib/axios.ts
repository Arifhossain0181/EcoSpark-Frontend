import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "content-type": "application/json",
    },
});

// Always attach the latest access token from cookies
api.interceptors.request.use((config) => {
    const token = Cookies.get("accessToken");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        delete config.headers["Authorization"];
    }
    return config;
});

// Handle auth errors globally: if token is invalid/expired, clear auth and redirect
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const message = err?.response?.data?.message as string | undefined;

        if (
            status === 401 &&
            (message === "Invalid token" || message === "Unauthorized")
        ) {
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            Cookies.remove("ecospark_user");

            if (typeof window !== "undefined") {
                // Avoid redirect loops on auth pages
                const path = window.location.pathname;
                if (!path.startsWith("/auth")) {
                    window.location.href = "/auth/login";
                }
            }
        }

        return Promise.reject(err);
    }
);

export default api;