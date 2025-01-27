// PrivateRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth.js';

const PrivateRoute = ({ element: Element }) => {
    const location = useLocation();

    return isLoggedIn() ? (
        <Element />
    ) : (
        <Navigate to="/" state={{ from: location }} />
    );
};

export default PrivateRoute;
