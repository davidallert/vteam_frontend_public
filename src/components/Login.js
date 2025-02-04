import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraphQLClient, gql } from 'graphql-request';
import { handleLogin, handleName, handleBalance } from '../utils/auth.js';
import appImage from '../image copy 2.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [googleOAuthUrl, setGoogleOAuthUrl] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    // GraphQL client and mutation for manual login
    const client = new GraphQLClient('http://localhost:8585/graphql/auth', {
        headers: { 'Content-Type': 'application/json' },
    });

    const LOGIN_MUTATION = `
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

    // Fetch Google OAuth URL
    useEffect(() => {
        const fetchGoogleOAuthUrl = async () => {
            try {
                const response = await fetch('http://localhost:8585/posts/oauth');
                const data = await response.json();
                setGoogleOAuthUrl(data.oauthUrl);
            } catch (error) {
                console.error('Error fetching Google OAuth URL:', error);
            }
        };
        fetchGoogleOAuthUrl();
    }, []);

    // Handle manual login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await client.request(LOGIN_MUTATION, { email, password });

            if (!data.login?.token) {
                setErrorMessage(data.login?.message || 'Invalid login credentials.');
                return;
            }

            const userToken = data.login.token;
            handleLogin(userToken, email);

            // Fetch user data
            const userDataResponse = await fetch('http://localhost:8585/graphql/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    query: `
                        query {
                            userDataByEmail(email: "${email}") {
                                email
                                name
                                surname
                                amount
                            }
                        }
                    `,
                }),
            });

            const userDataResult = await userDataResponse.json();
            if (userDataResult.errors) {
                setErrorMessage('Failed to fetch user data. Please try again.');
                console.error('Error fetching user data:', userDataResult.errors);
                return;
            }

            const user = userDataResult.data.userDataByEmail;
            setUserData(user);

            const userAmount = user.amount;
            const userName = `${user.name} ${user.surname}`;
            handleName(userName, userName);
            handleBalance(userAmount, userAmount);

            navigate('/mapscooter');
        } catch (error) {
            setErrorMessage(
                error.response?.errors?.[0]?.message || 'Login failed. Please try again.'
            );
        }
    };

    return (
        <div className="login-comp">
            <img src={appImage} alt="App visual" className="scooter-img" />
            <h2>Scooti.</h2>

            <form onSubmit={handleSubmit}>
                <input id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" id= "loginButton" className="login-button">Login</button>
                {googleOAuthUrl && (
                    <button
                        type="button"
                        onClick={() => (window.location.href = googleOAuthUrl)}
                        className="google-button"
                    >
                        Continue with Google
                    </button>
                )}
            </form>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <p>
                Don't have an account? <Link to="/register">Sign up here</Link>
            </p>

        </div>
    );
};

export default Login;
