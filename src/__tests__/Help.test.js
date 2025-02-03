import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Help from "../components/Help";
import "@testing-library/jest-dom";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe("Help Component", () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );
  });

  test("renders the first step correctly", () => {
    expect(screen.getByText("How to Rent")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Use the map to find a scooter. Click on the scooter you want to rent, then click on Join Button to start your trip!"
      )
    ).toBeInTheDocument();
  });

  test("Next button navigates through steps", () => {
    const nextButton = screen.getByText("Next");

    fireEvent.click(nextButton);
    expect(screen.getByText("How to start moving")).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(screen.getByText("How to park")).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(screen.getByText("How to Pay")).toBeInTheDocument();

    expect(nextButton).toBeDisabled();
  });

  test("Previous button navigates back", () => {
    const nextButton = screen.getByText("Next");
    const prevButton = screen.getByText("Previous");

    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    expect(screen.getByText("How to park")).toBeInTheDocument();

    fireEvent.click(prevButton);
    expect(screen.getByText("How to start moving")).toBeInTheDocument();

    fireEvent.click(prevButton);
    expect(screen.getByText("How to Rent")).toBeInTheDocument();

    expect(prevButton).toBeDisabled();
  });

  test("Back button navigates to /mapscooter", () => {
    const backButton = screen.getByLabelText("Back");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith("/mapscooter");
  });
});
