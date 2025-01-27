import React, { useEffect, useState } from "react";
import scooterImage from '../scooter.png';
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";


const ActiveScooter = ({ scooterId, socket }) => {
  const [battery, setBattery] = useState(null); // Batterinivå
  const [speed, setSpeed] = useState(null); // Hastighet
  const [tripDuration, setTripDuration] = useState(0); // Lånetid i sekunder
  const [timer, setTimer] = useState(null); // Timer för att hålla koll på tiden

  const navigate = useNavigate();

  useEffect(() => {
    if (!scooterId) return;

    // Starta timern när lånet börjar
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTripDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimer(interval);

    // Lyssna på batteriändringar
    socket.on("receivechangingbattery", ({ scooterId: id, battery: newBattery }) => {
      if (id === scooterId) setBattery(newBattery);
    });

    // Lyssna på hastighetsändringar
    socket.on("receivechangingspeed", (newSpeed) => {
      setSpeed(newSpeed);
    });

    return () => {
      clearInterval(interval); // Stoppa timern
      socket.off("receivechangingbattery");
      socket.off("receivechangingspeed");
    };
  }, [scooterId, socket]);

  // Format för att visa tid
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sek`;
  };

  return (
    <div className="active-scooter-container">
      {/* Back Button */}
      <button className="pre-button" onClick={() => navigate("/mapscooter")}>
        <GrFormPreviousLink size={28} />
      </button>

      {/* Active Scooter Information */}
      <div className="active-scooter-info">

        <h3>
          <strong>Scooter ID:</strong> {scooterId}
        </h3>
        {/* Scooter Image */}
        <img src={scooterImage} alt="Scooter" className="scooter-img" />

        <p>
          <strong>Batterinivå:</strong> {battery !== null ? `${battery}%` : "Laddar..."}
        </p>
        <p>
          <strong>Hastighet:</strong> {speed !== null ? `${speed} km/h` : "Laddar..."}
        </p>
        <p>
          <strong>Lånetid:</strong> {formatDuration(tripDuration)}
        </p>
      </div>
    </div>
  );
};

export default ActiveScooter;
