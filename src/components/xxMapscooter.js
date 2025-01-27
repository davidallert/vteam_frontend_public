import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserEmail} from "../utils/auth";
import mapboxgl from "mapbox-gl";
import { FaRegUser, FaRegMap } from "react-icons/fa";
import { MdOutlineElectricScooter, MdOutlineLiveHelp,  MdOutlineLocalParking, MdOutlineBatteryChargingFull } from "react-icons/md";
import "mapbox-gl/dist/mapbox-gl.css";
import io from "socket.io-client";

import { createRoot } from "react-dom/client";


// Mapbox and socket configurations
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const socket = io("http://localhost:8585");

function Mapscooter() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();

  // State management
  const [scooters, setScooters] = useState([]);
  const [joinedScooterId, setJoinedScooterId] = useState(null);
  const [rentedScooterMarker, setRentedScooterMarker] = useState(null);

  // Authentication details
  const token = getAuthToken();
  const email = getUserEmail();


  // Fetch scooters from the server
  const fetchScooters = async () => {
    const query = `
      query {
        inactiveScooters {
          _id
          customid
          status
          battery_level
          current_location {
            coordinates
          }
        }
      }
    `;


  
    try {
      const response = await fetch("http://localhost:8585/graphql/scooters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
  
      const data = await response.json();
      if (data.data?.inactiveScooters) {
        setScooters(data.data.inactiveScooters);
      }
    } catch (error) {
      console.error("Error fetching inactive scooters:", error);
    }
  };


  // Fetch stations
  const fetchStations = async () => {
    const query = `
      query {
        stations {
          name
          charging_station
          location {
            coordinates
          }
        }
      }
    `;
  
    try {
      const response = await fetch("http://localhost:8585/graphql/scooters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
  
      const data = await response.json();
      if (data.data?.stations) {
        data.data.stations.forEach((station) => {
          const [lng, lat] = station.location.coordinates;
  
          const markerElement = document.createElement("div");
          markerElement.className = "station-marker";
  

          const reactMarkerContainer = document.createElement("div");
          markerElement.appendChild(reactMarkerContainer);
  

          const root = createRoot(reactMarkerContainer);
          root.render(
            station.charging_station ? (
              <MdOutlineBatteryChargingFull style={{ fontSize: "24px", color: "black" }} />
            ) : (
              <MdOutlineLocalParking style={{ fontSize: "24px", color: " rgb(52, 109, 223)" }} />
            )
          );
  
          // Add marker to the map
          new mapboxgl.Marker(markerElement)
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h4>${station.name}</h4>
                <p>Type: ${
                  station.charging_station ? "Charging Station" : "Parking Station"
                }</p>
              `)
            )
            .addTo(map.current);
        });
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };
  

  // Initialize the map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.06324, 59.334591],
      zoom: 12,
      attributionControl: false,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        map.current.setCenter([longitude, latitude]);

        new mapboxgl.Marker({ color: "#f75a5a" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<h4>Your Location</h4>"))
          .addTo(map.current);
      },
      (error) => {
        console.error("Error fetching geolocation:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );

    fetchScooters();
    fetchStations();
  }, []);

  // Display scooters on the map
  useEffect(() => {
    if (scooters.length > 0 && map.current) {
      scooters.forEach((scooter) => {
        const [lng, lat] = scooter.current_location.coordinates;

        const markerElement = document.createElement("div");
        markerElement.className = "scooter-marker";

        markerElement.innerHTML = `
          <div class="circle-icon">
            <span class="circle-text">Scooti.</span>
          </div>
        `;

        const popupContent = document.createElement("div");
        popupContent.classList.add("scooter-popup");

        popupContent.innerHTML = `
          <h4>Scooter ID: ${scooter.customid}</h4>
          <p>Status: ${scooter.status}</p>
          <p>Battery: ${scooter.battery_level}%</p>
          <button class="join-scooter-btn">Join Scooter</button>
        `;

        popupContent
          .querySelector(".join-scooter-btn")
          .addEventListener("click", () => {
            handleJoinScooter(scooter.customid, { lon: lng, lat });
          });

        new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
          .addTo(map.current);
      });
    }
  }, [scooters]);

  // Join a scooter
  const handleJoinScooter = (scooterId, currentLocation) => {
    if (!email) {
      alert("User email is missing. Please ensure you are logged in.");
      return;
    }

    setJoinedScooterId(scooterId);
    socket.emit("joinScooter", { scooterId, email, current_location: currentLocation });
    alert(`You have joined scooter ${scooterId}`);

    // Add a marker for the rented scooter
    if (rentedScooterMarker) rentedScooterMarker.remove();

    const marker = new mapboxgl.Marker({ color: "#FF0000" })
      .setLngLat([currentLocation.lon, currentLocation.lat])
      .addTo(map.current);

    setRentedScooterMarker(marker);
    map.current.flyTo({ center: [currentLocation.lon, currentLocation.lat], zoom: 15 });
  };

  // Update scooter position in real-time
  useEffect(() => {
    socket.on("receivemovingLocation", (location) => {
      if (rentedScooterMarker) {
        rentedScooterMarker.setLngLat([location.lon, location.lat]);
        map.current.flyTo({ center: [location.lon, location.lat], zoom: 25 });
      }
    });

    return () => {
      socket.off("receivemovingLocation");
    };
  }, [rentedScooterMarker]);

//trip ended
useEffect(() => {
  socket.on("tripEnded", async ({ scooterId, cost }) => {
    map.current.flyTo({
      center: [18.06324, 59.334591],
      zoom: 12,
    });

    alert(`Trip with scooter ${scooterId} has ended. Total cost: $${cost.toFixed(1)}`);

    // Update the user's balance
    const UPDATE_BALANCE_MUTATION = `
      mutation {
        updateBalance(email: "${email}", amount: -${cost}) {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: UPDATE_BALANCE_MUTATION }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const updatedBalance = data.data.updateBalance.balance;
      alert(`Your new balance is: sek${updatedBalance.toFixed(2)}`);
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("There was an error updating your balance. Please try again.");
    }
  });

  return () => {
    socket.off("tripEnded");
  };
}, [email, token]);
  
  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      <div className="map-buttons">
        <button className="map-button" onClick={() => navigate("/mapscooter")}>
          <FaRegMap size={30} />
          <p>Map</p>
        </button>
        <button className="map-button">
          <MdOutlineElectricScooter size={30} />
          <p>Scooter</p>
        </button>
        <button className="map-button" onClick={() => navigate("/help")}>
          <MdOutlineLiveHelp size={30} />
          <p>Help</p>
        </button>
        <button className="map-button" onClick={() => navigate("/userinfo")}>
          <FaRegUser size={24} />
          <p>Profile</p>
        </button>
      </div>
    </div>
  );
}

export default Mapscooter;
