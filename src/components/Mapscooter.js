import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN"; // Replace with your Mapbox token

function Mapscooter() {
  const mapContainer = useRef(null);
  const map = useRef(null);

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
        <button className="map-button">
          <img src="../map.png" alt="Map Icon" />
        </button>
        <button className="map-button">
          <img src="pass-icon.png" alt="current Icon" />
        </button>
        <button className="map-button">
          <img src="scan-icon.png" alt="Scan Icon" />
        </button>
        <button className="map-button">
          <img src="profile-icon.png" alt="Profile Icon" />
        </button>
      </div>
    </div>
  );
}

export default Mapscooter;
