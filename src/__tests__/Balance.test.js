import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Balance from "../components/Balance";
import { getUserEmail, getAuthToken, getUserBalance, handleBalance } from "../utils/auth";
import "@testing-library/jest-dom";


jest.mock("../utils/auth", () => ({
  getUserEmail: jest.fn(() => "test@example.com"),
  getAuthToken: jest.fn(() => "mockAuthToken"),
  getUserBalance: jest.fn(() => "500"),
  handleBalance: jest.fn(),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        data: {
          updateBalance: {
            email: "test@example.com",
            amount: 100,
          },
        },
      }),
  })
);

describe("Balance Component", () => {
  test("renders balance component correctly", () => {
    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    expect(screen.getByText("500.00 kr")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter amount (e.g., 100)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update balance/i })).toBeInTheDocument();
  });

  test("updates balance on successful API call", async () => {
    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("Enter amount (e.g., 100)");
    fireEvent.change(input, { target: { value: "100" } });

    const button = screen.getByRole("button", { name: /update balance/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Balance updated successfully!")).toBeInTheDocument();
    });

    expect(handleBalance).toHaveBeenCalledWith(600);
  });

  test("handles API error gracefully", async () => {
    // Mock a failed API response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ errors: [{ message: "Failed to update balance" }] }),
      })
    );

    render(
      <MemoryRouter>
        <Balance />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("Enter amount (e.g., 100)");
    fireEvent.change(input, { target: { value: "100" } });

    const button = screen.getByRole("button", { name: /update balance/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to update balance/i)).toBeInTheDocument();
    });
  });
});
