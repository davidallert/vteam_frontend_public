import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { getAuthToken, getUserEmail } from "../utils/auth";
import mapboxgl from "mapbox-gl";

//icons
import { FaRegUser, FaRegMap } from "react-icons/fa";
import { LuQrCode } from "react-icons/lu";
import { MdOutlineElectricScooter } from "react-icons/md";
import { TbScooter } from "react-icons/tb";

import "mapbox-gl/dist/mapbox-gl.css";
import io from "socket.io-client";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const socket = io("http://localhost:8585");

function Mapscooter() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();
  const [scooters, setScooters] = useState([]);
  const [joinedScooterId, setJoinedScooterId] = useState(null);

  const token = getAuthToken();
  const email = getUserEmail();

  // Fetch scooters from the server
  const fetchScooters = async () => {
    const query = `
      query {
        scooters {
          _id
          customid
          status
          speed
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
      if (data.data?.scooters) {
        setScooters(data.data.scooters);
      }
    } catch (error) {
      console.error("Error fetching scooters:", error);
    }
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.06324, 59.334591],
      zoom: 12,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
  
        // Center the map on the user's current location
        map.current.setCenter([longitude, latitude]);
  
        // Add a marker for the user's location
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
  
    fetchScooters(); // Fetch scooter data to populate the map
  }, []);

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
  
        popupContent.querySelector(".join-scooter-btn").addEventListener("click", () => {
          handleJoinScooter(scooter.customid, { lon: lng, lat });
        });
  
        new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
          .addTo(map.current);
      });

    }
  }, [scooters, joinedScooterId]);
  

  const handleJoinScooter = (scooterId, currentLocation) => {
    if (!email) {
      alert("User email is missing. Please ensure you are logged in.");
      return;
    }
    setJoinedScooterId(scooterId);
    socket.emit("joinScooter", { scooterId, email, current_location: currentLocation });
    alert(`You have joined scooter ${scooterId}`);
  };


  
  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      <div className="map-buttons">
        <button className="map-button" onClick={() => navigate("/mapscooter")}>
          <FaRegMap size={28} />
        </button>
        <button className="map-button">
          <MdOutlineElectricScooter size={28} />
        </button>
        <button className="map-button">
          <LuQrCode size={28} />
        </button>
        <button className="map-button" onClick={() => navigate("/userinfo")}>
          <FaRegUser size={24} />
        </button>
      </div>
    </div>
  );
}

export default Mapscooter;
