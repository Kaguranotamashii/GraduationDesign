import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const user = useSelector((state) => state.auth.user);

    if (!user || !user.is_staff) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default AdminRoute;