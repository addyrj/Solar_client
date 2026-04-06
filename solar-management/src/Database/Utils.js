
import Cookies from "universal-cookie";
import toast from "react-hot-toast";
import axios from "axios";

export const getHeaderWithToken = () => {
    const cookies = new Cookies();
    const token = cookies.get("adminToken");
    return {
        headers: {
            Accept: "*/*",
            Authorization: token,
        }
    };
}

export const getHeaderWithoutToken = {
    headers: {
        Accept: "*/*",
    }
}

export const postHeaderWithToken = async () => {
    const cookies = new Cookies();
    const token = await cookies.get("adminToken");
    return {
        headers: {
            Accept: "*/*",
            "Content-Type": "multipart/form-data",
            Authorization: token,
        }
    };
}

export const postHeaderWithoutToken = {
    headers: {
        Accept: "*/*",
        "Content-Type": "multipart/form-data",
    }
}

// Function to handle token expiration and redirect to login
export const handleTokenExpiration = (error) => {
    if (error?.response?.status === 401) {
        const errorCode = error?.response?.data?.code;
        
        if (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN" || errorCode === "NO_TOKEN") {
            // Clear cookies
            const cookies = new Cookies();
            cookies.remove("adminToken");
            cookies.remove("rememberMe");
            
            // Show message
            if (errorCode === "TOKEN_EXPIRED") {
                toast.error("Your session has expired. Please login again.");
            } else {
                toast.error("Please login to continue");
            }
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
            
            return true;
        }
    }
    return false;
}

// Setup axios interceptors
export const setupAxiosInterceptors = () => {
    // Request interceptor to add token
    axios.interceptors.request.use(
        (config) => {
            const cookies = new Cookies();
            const token = cookies.get("adminToken");
            if (token) {
                config.headers.Authorization = token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            handleTokenExpiration(error);
            return Promise.reject(error);
        }
    );
};