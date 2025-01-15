// src/utils/auth.js

export const isLoggedIn = () => {
    return !!sessionStorage.getItem('authToken');
};

export const handleLogin = (userToken, userEmail) => {
    sessionStorage.setItem('authToken', userToken);
    sessionStorage.setItem('userEmail', userEmail);
};

export const handleBalance = (userAmount) => {
    sessionStorage.setItem('userAmount', userAmount);
};

export const handleName = (userName) => {
    sessionStorage.setItem('userName', userName);
};

export const getUserEmail = () => {
    return sessionStorage.getItem('userEmail') || '';
};

export const getAuthToken = () => {
    return sessionStorage.getItem('authToken') || '';
}

export const getUserBalance = () => {
    return sessionStorage.getItem('userAmount') || '';
}

export const getUserName = () => {
    return sessionStorage.getItem('userName') || '';
}

export default {handleLogin, handleBalance, handleName};
