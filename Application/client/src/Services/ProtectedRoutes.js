import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoutes = () => {
  // Check if there is a valid authentication token in local storage
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  // If authenticated, render the nested routes using Outlet
  // If not authenticated, navigate to the "/login" route
  const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
  };

  console.log("Is token expired:", isTokenExpired(token));

  return !token || isTokenExpired(token) ? <Navigate to="/auth" /> : <Outlet />;
};

export default ProtectedRoutes;
