import React, { useState } from "react";
import { getUserEmail, getAuthToken, getUserBalance, handleBalance } from "../utils/auth";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const Balance = () => {
  const [amount, setAmount] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [updatedBalance, setUpdatedBalance] = useState(Number(getUserBalance()));

  const navigate = useNavigate();

  // Fetch user details
  const email = getUserEmail();
  const authToken = getAuthToken();

  const handleSubmit = async (e) => {
    e.preventDefault();


    const UPDATE_BALANCE_MUTATION = `
      mutation {
        updateBalance(email: "${email}", amount: ${amount}) {
          email
          amount
        }
      }
    `;

    try {
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


      const data = await response.json();
      console.log(data);

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }


      const newBalance = updatedBalance + Number(amount);
      setUpdatedBalance(newBalance);
      handleBalance(newBalance);

      setResponseMessage("Balance updated successfully!");
      setAmount("");
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
            <MdOutlineAccountBalanceWallet size={28} /> {updatedBalance} kr
          </label>
          <input
            type="number"
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
