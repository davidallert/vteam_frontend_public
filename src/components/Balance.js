//Balance.js

import React, { useState, useEffect } from "react";
import { getUserEmail, getAuthToken, getUserBalance } from "../utils/auth";

import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";



const Balance = () => {
  const [amount, setAmount] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [updatedBalance, setUpdatedBalance] = useState(null);

  const navigate = useNavigate();
  // Fetch user details
  const email = getUserEmail();
  const authToken = getAuthToken();
  const balance = getUserBalance();
  //const userBalance = balance + Number(amount);


  console.log('Token', authToken);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // GraphQL mutation query as a string
    const UPDATE_BALANCE_MUTATION = `
      mutation {
        updateBalance(email: "${email}", amount: ${amount}) {
          email
          amount
        }
      }
    `;

    try {
      // Send GraphQL request using fetch
      const response = await fetch("http://localhost:8585/graphql/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          query: UPDATE_BALANCE_MUTATION,
        }),
      });

      // Parse response
      const data = await response.json();
      console.log(data);
      

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      // Update state with the new balance
      setUpdatedBalance(data.data.updateBalance.amount);
      setResponseMessage("Balance updated successfully!");
    } catch (error) {
      console.error("Error updating balance:", error);
      setResponseMessage(`Error: ${error.message}`);
    }
  };

    return (
      <>
        <div>
          <button className="pre-button" onClick={() => navigate("/userinfo")}>
            <GrFormPreviousLink size={28} />
          </button>
        </div>
  
        <div className="balance-container">
          <form onSubmit={handleSubmit}>
            <label htmlFor="amount">
              <MdOutlineAccountBalanceWallet size={28} /> {balance} kr
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (e.g., 100)"
              required
            />
            <button type="submit" className="balance-button">
              Update Balance
            </button>
          </form>
  
          {responseMessage && <p>{responseMessage}</p>}
        </div>
      </>
    );
  };


export default Balance;
