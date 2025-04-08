import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")); // Parse the user object

    if (!token || !user) {
        return <Navigate to="/login" />;
    }

    const role = user.role; // Extract role from user object

    // If a role is not allowed, redirect to login
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
