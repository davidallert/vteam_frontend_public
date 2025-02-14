import React, { useState } from "react";
import { GrFormPreviousLink } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();
  const steps = [
    {
      title: "How to Rent",
      description:
        "Use the map to find a scooter. Click on the scooter you want to rent, then click on Join Button to start your trip!",
    },
    {
      title: "How to start moving",
      description:
        "Press the green 'Start' button to activate the scooter. Once started, you can adjust the speed and monitor the scooter's position for a seamless ride.",
    },
    {
      title: "How to park",
      description:
        "Park in designated areas highlighted on the map to avoid extra charges. You can also park elsewhere, but additional fees will apply. Don’t forget to end your ride after parking.",
    },
    {
      title: "How to Pay",
      description:
        "To rent a scooter, ensure your account balance has sufficient funds. Once your trip ends, the cost will be automatically deducted from your balance.",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <div className="component-container">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="pre-button" onClick={() => navigate("/mapscooter")} aria-label="Back">
          <GrFormPreviousLink size={28} />
        </button>
      </div>

      {/* Steps Container */}
      <div className="steps-container">
        {/* Render the current step */}
        <div className="step">
          <h2 className="step-title">{steps[activeStep].title}</h2>
          <p className="step-description">{steps[activeStep].description}</p>
        </div>

        {/* Pagination */}
        <div className="pagination">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`dot ${activeStep === index ? "active" : ""}`}
            ></span>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="navigation">
          <button
            className="previous-button"
            onClick={handlePrevious}
            disabled={activeStep === 0}
          >
            Previous
          </button>
          <button
            className="next-button"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      {/* Info Section */}
    </div>
  );
};

export default Help;
