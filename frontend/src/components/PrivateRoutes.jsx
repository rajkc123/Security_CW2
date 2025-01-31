// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // 1. Check for a token in local storage
    const token = localStorage.getItem('token');

    // 2. If no token, redirect to "/"
    //    (your login path is "/")
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // 3. Otherwise, render the child route
    return children;
};

export default PrivateRoute;
