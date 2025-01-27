import React, { useState, useEffect } from "react";
import { getUserEmail, getAuthToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { GrFormPreviousLink } from "react-icons/gr";

const TripsHistory = () => {
  const [trips, setTrips] = useState([]);
  const email = getUserEmail();
  const userToken = getAuthToken();
  const navigate = useNavigate();

  
  const TRIPS_BY_EMAIL = `
              query {
              tripsByEmail(email: "${email}") {
                scooterId
                startLocation {
                  coordinates
                }
                endLocation {
                  coordinates
                }
                startTime
                endTime
                duration
                avgSpeed
                cost
              }
            }`

  const fetchTrips = async () => {
    try {
      const response = await fetch("http://localhost:8585/graphql/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          query: TRIPS_BY_EMAIL,
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
      <button onClick={() => navigate(-1)}  className="pre-button">
        <GrFormPreviousLink size={24} />
      </button>
      <ul>
  {trips.map((trip, index) => (
    <li key={index}>
      <p><strong>Scooter ID:</strong> {trip.scooterId}</p>
      <p>
        <strong>Start Location:</strong>{" "}
        {trip.startLocation.coordinates.join(", ")}
      </p>
      <p>
        <strong>End Location:</strong>{" "}
        {trip.endLocation?.coordinates?.join(", ") || "In progress"}
      </p>
      <p><strong>Start Time:</strong> {new Date(trip.startTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> {trip.endTime ? new Date(trip.endTime).toLocaleString() : "In progress"}</p>
      <p><strong>Duration:</strong> {trip.duration ? `${trip.duration} seconds` : "N/A"}</p>
      <p><strong>Average Speed:</strong> {trip.avgSpeed ? `${trip.avgSpeed} km/h` : "N/A"}</p>
      <p><strong>Cost:</strong> {trip.cost ? `${trip.cost} SEK` : "N/A"}</p>
    </li>
  ))}
</ul>

    </div>
  );
};

export default TripsHistory;
