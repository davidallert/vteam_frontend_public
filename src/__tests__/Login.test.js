import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../components/Login";
import { GraphQLClient } from "graphql-request";
import { handleLogin, handleName, handleBalance } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";


jest.mock("../utils/auth", () => ({
  handleLogin: jest.fn(),
  handleName: jest.fn(),
  handleBalance: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

// Mock GraphQLClient
jest.mock("graphql-request", () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
}));

describe("Login Component", () => {
  let mockNavigate;
  let mockGraphQLClient;
  
  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    mockGraphQLClient = new GraphQLClient();
    GraphQLClient.mockImplementation(() => mockGraphQLClient);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText("Scooti.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

});
