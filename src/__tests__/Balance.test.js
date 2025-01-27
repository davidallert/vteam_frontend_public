import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Balance from "../components/Balance";
import "@testing-library/jest-dom";

// Mock utility functions
jest.mock("../utils/auth", () => ({
  getUserEmail: () => "test@example.com",
  getAuthToken: () => "mocked-token",
  getUserBalance: () => "100",
  handleBalance: jest.fn(),
}));

// Mock the `react-router-dom` module
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

describe("Balance Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    const { useNavigate } = require("react-router-dom");
    useNavigate.mockReturnValue(mockNavigate);
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  it("renders the component with the initial balance and input field", () => {
    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    // Check for initial balance display
    expect(screen.getByText(/100 kr/i)).toBeInTheDocument();

    // Check for input field
    expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();

    // Check for the "Update Balance" button
    expect(screen.getByRole("button", { name: /update balance/i })).toBeInTheDocument();
  });

  it("updates balance when form is submitted successfully", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        data: {
          updateBalance: {
            email: "test@example.com",
            amount: 200,
          },
        },
      }),
    });

    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    // Enter an amount and submit the form
    fireEvent.change(screen.getByPlaceholderText(/enter amount/i), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update balance/i }));

    // Wait for the balance update message
    await waitFor(() => {
      expect(screen.getByText(/balance updated successfully!/i)).toBeInTheDocument();
    });

    // Check if the updated balance is displayed
    expect(screen.getByText(/150 kr/i)).toBeInTheDocument();
  });

  it("displays an error message when the mutation fails", async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        errors: [{ message: "Failed to update balance" }],
      }),
    });

    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    // Enter an amount and submit the form
    fireEvent.change(screen.getByPlaceholderText(/enter amount/i), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update balance/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/error: failed to update balance/i)).toBeInTheDocument();
    });

    // Ensure the balance hasn't changed
    expect(screen.getByText(/100 kr/i)).toBeInTheDocument();
  });

  it("navigates back to user info when the back button is clicked", () => {
    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(mockNavigate).toHaveBeenCalledWith("/userinfo");
  });
});
