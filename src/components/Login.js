import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraphQLClient, gql } from 'graphql-request';
import { handleLogin } from '../utils/auth.js';

import appImage from '../5.png';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [googleOAuthUrl, setGoogleOAuthUrl] = useState('');
    const navigate = useNavigate();

    const client = new GraphQLClient('http://localhost:8585/graphql/auth', {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const LOGIN_MUTATION = gql`
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                message
                user {
                    email
                    admin 
                }
                token
            }
        }
    `;

    const fetchGoogleOAuthUrl = async () => {
        try {
            const response = await fetch('http://localhost:8585/posts/oauth');
            const data = await response.json();
            setGoogleOAuthUrl(data.oauthUrl);
            
        } catch (error) {
            console.error('Error fetching Google OAuth URL:', error);
        }
    };

    useEffect(() => {
        fetchGoogleOAuthUrl();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await client.request(LOGIN_MUTATION, { email, password });

            if (!data.login || !data.login.token) {
                setErrorMessage(data.login?.message || 'Invalid login credentials.');
                return;
            }

            const userToken = data.login.token;
            const userEmail = email;

            console.log('User Token:', userToken);
            console.log('User Email:', userEmail);


            handleLogin(userToken, userEmail);



            navigate('/mapscooter');
        } catch (error) {
            setErrorMessage(error.response?.errors?.[0]?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-comp">
            <img src={appImage} alt="App visual" className="scooter-img" />
            <h2>Scooti.</h2>

            <form onSubmit={handleSubmit}>
        <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <button type="submit" className="login-button">Login</button>
    </form>
    {googleOAuthUrl && (
        <button
            onClick={() => window.location.href = googleOAuthUrl}
            className="google-button"
        >
            Continue with Google
        </button>
    )}
    <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
    <div className="terms">
        By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
    </div>
</div>

    );
}

export default Login;
