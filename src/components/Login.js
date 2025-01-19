//Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraphQLClient, gql } from 'graphql-request';
import { handleLogin, handleName, handleBalance } from '../utils/auth.js';
import { getAuthToken } from "../utils/auth";
import appImage from '../5.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [googleOAuthUrl, setGoogleOAuthUrl] = useState('');
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);


    //Manuell Login
    const client = new GraphQLClient(process.env.REACT_APP_API_URL || 'http://localhost:8585/graphql/auth', {
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
//Google Login
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
            console.log('Login Data:', data);

            if (!data.login || !data.login.token) {
                setErrorMessage(data.login?.message || 'Invalid login credentials.');
                return;
            }

            const userToken = data.login.token;
            handleLogin(userToken, email);

            // Fetch user data when manuell login
            const userDataResponse = await fetch("http://localhost:8585/graphql/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
                setErrorMessage("Failed to fetch user data. Please try again.");
                console.error("Error fetching user data:", userDataResult.errors);
                return;
            }

            setUserData(userDataResult.data.userDataByEmail);
            console.log("User Data:", userDataResult.data.userDataByEmail);


            const userAmount = userData.amount;
            const userName = userData.name + ' ' + userData.surname;


            handleName(userName, userName);
            handleBalance(userAmount, userAmount);

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
                {googleOAuthUrl && (
                    <button
                        onClick={() => window.location.href = googleOAuthUrl}
                        className="google-button"
                    >
                        Continue with Google
                    </button>
                )}
            </form>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
            <div className="terms">
                By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
            </div>
        </div>
    );
}

export default Login;
