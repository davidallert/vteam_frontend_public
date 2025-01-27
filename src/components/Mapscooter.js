import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserEmail } from "../utils/auth";
import mapboxgl from "mapbox-gl";
import { FaRegUser, FaRegMap, FaParking, FaChargingStation } from "react-icons/fa";
import { MdOutlineElectricScooter, MdOutlineLiveHelp } from "react-icons/md";
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
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);

  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [tripCost, setTripCost] = useState(null); // Trip cost state


  // Authentication details
  const token = getAuthToken();
  const email = getUserEmail();

  // Fetch inactive scooters from the server
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
      if (data.data?.inactiveScooters) setScooters(data.data.inactiveScooters);
    } catch (error) {
      console.error("Error fetching inactive scooters:", error);
    }
  };

  // Fetch stations and display them on the map
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
          const reactMarkerContainer = document.createElement("div");
          markerElement.appendChild(reactMarkerContainer);

          const root = createRoot(reactMarkerContainer);
          root.render(
            station.charging_station ? (
              <FaChargingStation style={{ fontSize: "24px", color: "black" }} />
            ) : (
              <FaParking style={{ fontSize: "24px", color: "rgb(52, 109, 223)" }} />
            )
          );

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

    // Geolocation to center the map and mark user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.current.setCenter([longitude, latitude]);
        const marker = new mapboxgl.Marker({ color: "#f75a5a" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<h4>Your Location</h4>"))
          .addTo(map.current);
        setCurrentLocationMarker(marker);
      },
      (error) => console.error("Error fetching geolocation:", error),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    fetchScooters();
    fetchStations();
  }, []);

  // Display scooters on the map
  useEffect(() => {
    if (scooters.length > 0 && map.current) {
      scooters.forEach((scooter) => {
        const coordinates = scooter.current_location?.coordinates;
        if (coordinates?.length === 2 && coordinates.every((coord) => !isNaN(coord))) {
          const [lng, lat] = coordinates;
          const markerElement = document.createElement("div");
          markerElement.innerHTML = `
            <div class="circle-icon">
              <span class="circle-text">Scooti.</span>
            </div>
          `;
          const popupContent = document.createElement("div");
          popupContent.innerHTML = `
            <h4>Scooter ID: ${scooter.customid}</h4>
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
        }
      });
    }
  }, [scooters]);

  // Join a scooter
  const handleJoinScooter = (scooterId, currentLocation) => {
    if (!email) return alert("Please log in to join a scooter.");

    const { lon, lat } = currentLocation;
    if (isNaN(lon) || isNaN(lat)) return alert("Invalid scooter location. Try again.");

    setJoinedScooterId(scooterId);
    socket.emit("joinScooter", { scooterId, email, current_location: currentLocation });
    alert(`You have joined scooter ${scooterId}`);

    if (currentLocationMarker) currentLocationMarker.remove();
    if (rentedScooterMarker) rentedScooterMarker.remove();

    const marker = new mapboxgl.Marker({ color: "#f75a5a" }).setLngLat([lon, lat]).addTo(map.current);
    setRentedScooterMarker(marker);
    map.current.flyTo({ center: [lon, lat], zoom: 15 });
  };

  // Real-time scooter position updates
  useEffect(() => {
    socket.on("receivemovingLocation", (location) => {
      const { lon, lat } = location.current_location;
      if (isNaN(lon) || isNaN(lat)) return;

      if (rentedScooterMarker) {
        rentedScooterMarker.setLngLat([lon, lat]);
        map.current.flyTo({ center: [lon, lat], zoom: 25 });
      } else {
        const marker = new mapboxgl.Marker({ color: "#f75a5a" }).setLngLat([lon, lat]).addTo(map.current);
        setRentedScooterMarker(marker);
      }
    });

    return () => socket.off("receivemovingLocation");
  }, [rentedScooterMarker]);

  // Handle trip end
  useEffect(() => {
    socket.on("tripEnded", async ({ scooterId, cost }) => {
      map.current.flyTo({ center: [18.06324, 59.334591], zoom: 12 });
      setTripCost(cost);
      setShowModal(true);

      const query = `
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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        alert(`New balance: SEK ${data.data.updateBalance.amount.toFixed(2)}`);
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    });

    return () => socket.off("tripEnded");
  }, [email, token]);

  const closeModal = () => setShowModal(false);

  // Render the map and buttons
  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Your trip has ended.</h3>
            <p>
              <strong>Total Cost:</strong> SEK {tripCost?.toFixed(1)}
            </p>
            <button onClick={closeModal} className="modal-button">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="map-buttons">
        <button className="map-button" onClick={() => navigate("/mapscooter")}>
          <FaRegMap size={30} />
          <p>Map</p>
        </button>
        <button className="map-button" onClick={() => navigate("/scooter")}>
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
