import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleLogin, handleName, handleBalance } from '../utils/auth.js';
import { GraphQLClient, gql } from 'graphql-request';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const user = params.get('user');
    const token = params.get('token');

    if (user && token) {
      manualLogin(user, 'generatedTempPassword', token);
    } else {
      console.error('Error: Missing user or token parameters');
    }
  }, [location]);

  /**
   * Perform manual login with email and temporary password
   * @param {string} email - User's email
   * @param {string} password - Temporary password
   * @param {string} googleToken - Google authentication token
   */
  const manualLogin = async (email, password, googleToken) => {
    try {
      const client = new GraphQLClient('http://localhost:8585/graphql/auth', {
        headers: { 'Content-Type': 'application/json' },
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

      const response = await client.request(LOGIN_MUTATION, { email, password });
      const userToken = response.login?.token;

      if (userToken) {
        handleLogin(userToken, email);
        fetchUserData(email, userToken);
      } else {
        console.error('Login failed:', response.login?.message);
      }
    } catch (error) {
      console.error('Error during manual login:', error);
    }
  };

  /**
   * Fetch user data using GraphQL query
   * @param {string} email - User's email
   * @param {string} token - User's authentication token
   */
  const fetchUserData = async (email, token) => {
    try {
      const query = `
        query {
          userDataByEmail(email: "${email}") {
            email
            name
            surname
            amount
          }
        }
      `;

      const response = await fetch("http://localhost:8585/graphql/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (result.errors) {
        console.error("Failed to fetch user data:", result.errors);
        return;
      }

      const { name, surname, amount } = result.data.userDataByEmail;

      // Update user details
      const userName = `${name} ${surname}`;
      handleName(userName, userName);
      handleBalance(amount, amount);

      // Navigate to the next page
      navigate('/mapscooter');
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default GoogleCallback;
