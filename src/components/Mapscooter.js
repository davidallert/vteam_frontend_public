import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Correctly import icons from react-icons/fa
import { FaRegUser,  FaRegMap  } from "react-icons/fa";
import { LuScanQrCode } from "react-icons/lu";
import { MdOutlineElectricScooter } from "react-icons/md";


import mapboxgl from "mapbox-gl";


mapboxgl.accessToken = "pk.eyJ1Ijoic2FyYWhhYmFuYWtlaCIsImEiOiJjbTR1aHBjcDEwZzYyMmpyOTVjNDAzOGI5In0.Hvlp_wf9aHAioM6_8hw9TA"; // Replace with your Mapbox token

function Mapscooter() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [18.06324, 59.334591],
      zoom: 12,
    });
  }, []);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      {/* Bottom navigation */}
      <div className="map-buttons">
        <button className="map-button"
        onClick={() => navigate("/mapscooter")}
        >
          <FaRegMap size={28} />
        </button>
        <button className="map-button">
          <MdOutlineElectricScooter size={28} />
        </button>
        <button className="map-button">
          <LuScanQrCode size={28} />
        </button>
        <button className="map-button"
        onClick={() => navigate("/userinfo")}>
          <FaRegUser size={28} />
        </button>
      </div>
    </div>
  );
}


export default Mapscooter;
