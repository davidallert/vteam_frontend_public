import React, { useState, useEffect } from "react";
import { getUserEmail, getAuthToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { GrFormPreviousLink } from "react-icons/gr";

const Receipts = () => {
  const [trips, setTrips] = useState([]);
  const email = getUserEmail();
  const userToken = getAuthToken();
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const response = await fetch("http://localhost:8585/graphql/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          query: `
            query {
              tripsByEmail(email: "${email}") {
                startTime
                cost
              }
            }
          `,
        }),
      });

      const data = await response.json();

      if (data.data && data.data.tripsByEmail) {
        setTrips(data.data.tripsByEmail);
      } else {
        console.error("Error fetching trips:", data.errors);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="trips-history">
      <button onClick={() => navigate(-1)} className="pre-button">
        <GrFormPreviousLink size={24} />
      </button>
      <ul>
        {trips.map((trip, index) => (
          <li key={index}>
            <strong>
              {trip.startTime ? new Date(trip.startTime).toISOString().split("T")[0] : "N/A"}
            </strong>
            <p>
              {trip.cost ? `${trip.cost} SEK` : "N/A"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Receipts;
