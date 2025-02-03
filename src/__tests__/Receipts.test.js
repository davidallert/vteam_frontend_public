import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Receipts from "../components/Receipts";
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

describe("Receipts Component", () => {
  let mockNavigate;
  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    getUserEmail.mockReturnValue("test@example.com");
    getAuthToken.mockReturnValue("mocked-token");

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              tripsByEmail: [
                { startTime: "2024-02-01T12:00:00.000Z", cost: 50 },
                { startTime: "2024-02-02T14:30:00.000Z", cost: 75 },
              ],
            },
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and displays trips correctly", async () => {
    render(
      <MemoryRouter>
        <Receipts />
      </MemoryRouter>
    );

    expect(screen.getByRole("button")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2024-02-01")).toBeInTheDocument();
      expect(screen.getByText("50 SEK")).toBeInTheDocument();
      expect(screen.getByText("2024-02-02")).toBeInTheDocument();
      expect(screen.getByText("75 SEK")).toBeInTheDocument();
    });
  });



  test("Back button navigates correctly", async () => {
    render(
      <MemoryRouter>
        <Receipts />
      </MemoryRouter>
    );

    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
