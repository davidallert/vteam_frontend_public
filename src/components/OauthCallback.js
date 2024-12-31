import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { handleLogin } from '../utils/auth.js';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {

    const params = new URLSearchParams(location.search);
    //console.log(params);
    const user = params.get('user');

    const token = params.get('token');

    const userToken = token;
    const userEmail = user;

    console.log('User Token:', userToken);
    console.log('User Email:', user);
    
    
    handleLogin(userToken, userEmail);
    //console.log('token:',token);

      if (user && token) {
        // Step 1: Save the token and user data (e.g., in context or local storage)
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);

        // Step 2: Redirect to the mapscooter after successful login
        navigate('/mapscooter');
      } else {
        console.error('Error: Missing user or token parameters');
      }

  }, [navigate]);

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default GoogleCallback;
