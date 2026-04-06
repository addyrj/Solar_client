// Database/logout.js
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

export const logout = (navigate, message = "Logged out successfully") => {
  const cookies = new Cookies();
  
  // Clear all cookies
  cookies.remove("adminToken");
  cookies.remove("rememberMe");
  
  // Show message
  toast.success(message);
  
  // Redirect to login
  if (navigate && typeof navigate === 'function') {
    navigate("/");
  } else {
    window.location.href = "/";
  }
};

export const checkTokenExpiration = () => {
  const cookies = new Cookies();
  const token = cookies.get("adminToken");
  
  if (!token) return false;
  
  try {
    // Decode token to check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        // Token expired - use window.location since we might not have navigate
        cookies.remove("adminToken");
        cookies.remove("rememberMe");
        toast.error("Your session has expired. Please login again.");
        
        // Small delay to show toast before redirect
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return false;
  }
};