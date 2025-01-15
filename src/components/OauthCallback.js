import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { handleLogin, handleName, handleBalance  } from '../utils/auth.js';
import { GraphQLClient, gql } from 'graphql-request';


const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const user = params.get('user');
    const token = params.get('token');

    if (user && token) {
      // Step 1: Manually log in the user with the generated temporary password
      manualLogin(user, 'generatedTempPassword', token);
    } else {
      console.error('Error: Missing user or token parameters');
    }
  }, [navigate]);

  const manualLogin = async (email, password, googleToken) => {
    try {
      // Make the GraphQL request for manual login
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

      const response = await client.request(LOGIN_MUTATION, { email, password });
      if (response.login && response.login.token) {
        const userToken = response.login.token;
        handleLogin(userToken, email);

        // Step 2: Fetch user data after manual login
        fetchUserData(email, userToken);
      } else {
        console.error('Login failed:', response.login?.message);
      }
    } catch (error) {
      console.error('Error during manual login:', error);
    }
  };

  const fetchUserData = async (email, token) => {
    try {
      const userDataResponse = await fetch("http://localhost:8585/graphql/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        console.error("Failed to fetch user data:", userDataResult.errors);
        return;
      }

      const userData = userDataResult.data.userDataByEmail;
      console.log("User Data:", userData);
      const userFirstName = userData.name;
      console.log(userFirstName);
      const userSurName = userData.surname;
      console.log(userSurName);

      const userAmount = userData.amount;
      console.log(userAmount);

      const userName = userData.name + ' ' + userData.surname;
      console.log(userName);

      handleName(userName, userName);
      handleBalance(userAmount, userAmount);


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
