import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../components/Register";
import "@testing-library/jest-dom";

// Mock `graphql-request` module
jest.mock("graphql-request", () => {
  const originalModule = jest.requireActual("graphql-request");
  return {
    ...originalModule,
    GraphQLClient: jest.fn().mockImplementation(() => ({
      request: jest.fn(),
    })),
  };
});

// Mock `react-router-dom`'s `useNavigate`
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Register Component", () => {
  const mockNavigate = jest.fn();
  const mockRequest = jest.fn();

  beforeEach(() => {
    const { GraphQLClient } = require("graphql-request");
    GraphQLClient.mockImplementation(() => ({
      request: mockRequest,
    }));

    const { useNavigate } = require("react-router-dom");
    useNavigate.mockReturnValue(mockNavigate);

    mockNavigate.mockClear();
    mockRequest.mockClear();
  });

  it("renders the registration form correctly", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your surname/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("shows a success message and navigates to login on successful registration", async () => {
    mockRequest.mockResolvedValueOnce({
      register: {
        message: "Registration successful!",
        user: {
          email: "test@example.com",
          admin: false,
          amount: 0,
        },
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your surname/i), { target: { value: "User" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText(/registration successful!/i)).toBeInTheDocument();
    });

  });

  it("shows an error message on registration failure", async () => {
    mockRequest.mockRejectedValueOnce({
      response: {
        errors: [{ message: "Registration failed. Email already exists." }],
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your surname/i), { target: { value: "User" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/registration failed. email already exists./i)).toBeInTheDocument();
    });

    // Ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
