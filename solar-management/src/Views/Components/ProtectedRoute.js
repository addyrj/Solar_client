// Components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const cookies = new Cookies();
  const token = cookies.get('adminToken');
  
  useEffect(() => {
    // Check if token exists
    if (!token) {
      toast.error('Please login to access this page');
    }
  }, [token]);
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;