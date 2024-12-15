import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraphQLClient, gql } from 'graphql-request';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const navigate = useNavigate();

    // GraphQL client
    const client = new GraphQLClient('http://localhost:8585/graphql/auth', {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // GraphQL mutation for registering a user
    const REGISTER_MUTATION = gql`
        mutation Register($email: String!, $password: String!, $admin: Boolean!) {
            register(email: $email, password: $password, admin: $admin) {
                message
                user {
                    email
                }
            }
        }
    `;


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await client.request(REGISTER_MUTATION, { email, password, admin: false });
            setResponseMessage(data.register.message);

            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setResponseMessage(error.response?.errors?.[0]?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className='register-comp'>
            <h2>Scooti.</h2>
            <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                <button type="submit" className="login-button">Register</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
};

export default Register;
