import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {getAuthToken} from "../utils/auth";

import { FaRegUser, FaRegMap } from "react-icons/fa";
import { LuScanQrCode } from "react-icons/lu";
import { MdOutlineElectricScooter } from "react-icons/md";
import { TbScooter, TbCurrentLocation } from "react-icons/tb";
import mapboxgl from "mapbox-gl";
import { createRoot } from 'react-dom/client';
import 'mapbox-gl/dist/mapbox-gl.css';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function Mapscooter() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();
  const [scooters, setScooters] = useState([]);

  const token = getAuthToken();
  //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdiMDdjYjE5ZTllM2IzMTc2MTU2NDEiLCJ1c2VyIjoidGVzdEBleGFtcGxlLmNvbSIsImFkbWluIjpmYWxzZSwiaWF0IjoxNzM2MTE2ODE4LCJleHAiOjE3MzYyMDMyMTh9.KHZWBERuwCy7gK_Bqc4gkKhqIkm4-dR56rzZIjzh2cQ'

  const fetchScooters = async () => {
    const query = `
      query {
        scooters {
          _id
          status
          speed
          battery_level
          current_location {
            coordinates
          }
        }
      }
    `;

    const response = await fetch("http://localhost:8585/graphql/scooters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    console.log('Fetched data:', data);

    if (data.data && data.data.scooters) {
      setScooters(data.data.scooters);
      console.log('Setting scooters:', data.data.scooters);
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
  
    // Fetch user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];
  

          const userMarker = document.createElement("div");
          userMarker.className = "user-marker";
  

          const root = createRoot(userMarker);
          root.render(
            <TbCurrentLocation size={35} color="#f75a5a" />
          );
  
          new mapboxgl.Marker(userMarker)
            .setLngLat(userCoordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setText("You are here")
            )
            .addTo(map.current);
  

          map.current.setCenter(userCoordinates);
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  
    fetchScooters();
  }, []);


  useEffect(() => {
    if (scooters.length > 0 && map.current) {
      scooters.forEach((scooter) => {
        const [lng, lat] = scooter.current_location.coordinates;
        
        const markerElement = document.createElement('div');
        markerElement.className = 'scooter-marker';
        
        const root = createRoot(markerElement);
        root.render(
          <TbScooter size={35} color="black" />
        );
  
        new mapboxgl.Marker(markerElement)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                `<h4>Scooter ID: ${scooter._id}</h4>
                <p>Status: ${scooter.status}</p>
                <p>Battery: ${scooter.battery_level}%</p>
                <p>Speed: ${scooter.speed} km/h</p>`
              )
          )
          .addTo(map.current);
      });
    }
  }, [scooters]);
  

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
          <LuScanQrCode size={28} />
        </button>
        <button className="map-button" onClick={() => navigate("/userinfo")}>
          <FaRegUser size={24} />
        </button>
      </div>
    </div>
  );
}

export default Mapscooter;
