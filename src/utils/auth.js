// src/utils/auth.js

export const isLoggedIn = () => {
    return !!sessionStorage.getItem('authToken');
};

export const handleLogin = (userToken, userEmail) => {
    sessionStorage.setItem('authToken', userToken);
    sessionStorage.setItem('userEmail', userEmail);
};

export const handleBalance = (userBalance) => {
    sessionStorage.setItem('userBalance', userBalance);
};

export const getUserEmail = () => {
    return sessionStorage.getItem('userEmail') || '';
};

export const getAuthToken = () => {
    return sessionStorage.getItem('authToken') || '';
}

export const getUserBalance = () => {
    return sessionStorage.getItem('userBalance') || '';
}

export default handleLogin;
