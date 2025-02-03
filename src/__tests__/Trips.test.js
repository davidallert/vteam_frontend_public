import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TripsHistory from "../components/Trips";
import { getUserEmail, getAuthToken } from "../utils/auth";
import "@testing-library/jest-dom";
import { useNavigate } from "react-router-dom";


jest.mock("../utils/auth", () => ({
  getUserEmail: jest.fn(),
  getAuthToken: jest.fn(),
}));


jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe("TripsHistory Component", () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    getUserEmail.mockReturnValue("test@example.com");
    getAuthToken.mockReturnValue("mocked-token");

    // Mock fetch response with sample trip data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              tripsByEmail: [
                {
                  scooterId: "S123",
                  startLocation: { coordinates: [18.06324, 59.334591] },
                  endLocation: { coordinates: [18.0686, 59.3293] },
                  startTime: "2024-02-01T12:00:00.000Z",
                  endTime: "2024-02-01T12:30:00.000Z",
                  duration: 1800,
                  avgSpeed: 25,
                  cost: 50,
                },
                {
                  scooterId: "S456",
                  startLocation: { coordinates: [18.070, 59.340] },
                  endLocation: null,
                  startTime: "2024-02-02T14:30:00.000Z",
                  endTime: null,
                  duration: null,
                  avgSpeed: null,
                  cost: null,
                },
              ],
            },
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Back button navigates correctly", async () => {
    render(
      <MemoryRouter>
        <TripsHistory />
      </MemoryRouter>
    );

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
