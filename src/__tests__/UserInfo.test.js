import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserInfo from "../components/UserInfo.js";
import "@testing-library/jest-dom";

jest.mock("../utils/auth", () => ({
  getUserEmail: () => "test@example.com",
  getUserName: () => "Test User",
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

describe("UserInfo Component", () => {
  it("renders UserInfo component with user details", () => {
    render(
      <MemoryRouter>
        <UserInfo />
      </MemoryRouter>
    );


    expect(screen.getByRole("button", { name: /Previous/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Balance/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /History/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Receipts/i })).toBeInTheDocument();
  });

  it("navigates to the correct routes when buttons are clicked", () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require("react-router-dom"), "useNavigate").mockImplementation(() => mockNavigate);

    render(
      <MemoryRouter>
        <UserInfo />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /balance/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/balance");


    fireEvent.click(screen.getByRole("button", { name: /history/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/trips");


    fireEvent.click(screen.getByRole("button", { name: /receipts/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/receipts");
  });
});
