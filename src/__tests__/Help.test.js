import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Help from "../components/Help";
import "@testing-library/jest-dom";

// Mock `useNavigate`
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Help Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    const { useNavigate } = require("react-router-dom");
    useNavigate.mockReturnValue(mockNavigate);
    mockNavigate.mockClear();
  });

  it("renders the initial step correctly", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Verify the first step is displayed
    expect(screen.getByText(/how to rent/i)).toBeInTheDocument();
    expect(
      screen.getByText(/use the map to find a scooter/i)
    ).toBeInTheDocument();

    // Verify "Previous" button is disabled
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();

    // Verify "Next" button is enabled
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("navigates to the next step when 'Next' is clicked", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Click the "Next" button
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Verify the second step is displayed
    expect(screen.getByText(/how to start moving/i)).toBeInTheDocument();
    expect(
      screen.getByText(/press the green 'start' button/i)
    ).toBeInTheDocument();

    // Verify "Previous" button is enabled
    expect(screen.getByRole("button", { name: /previous/i })).toBeEnabled();
  });

  it("navigates to the previous step when 'Previous' is clicked", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Navigate to the second step
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Click the "Previous" button
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));

    // Verify the first step is displayed again
    expect(screen.getByText(/how to rent/i)).toBeInTheDocument();
    expect(
      screen.getByText(/use the map to find a scooter/i)
    ).toBeInTheDocument();
  });

  it("disables the 'Next' button on the last step", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Navigate to the last step
    const nextButton = screen.getByRole("button", { name: /next/i });
    for (let i = 0; i < 3; i++) {
      fireEvent.click(nextButton);
    }

    // Verify the last step is displayed
    expect(screen.getByText(/how to pay/i)).toBeInTheDocument();
    expect(
      screen.getByText(/to rent a scooter, ensure your account balance/i)
    ).toBeInTheDocument();

    // Verify "Next" button is disabled
    expect(nextButton).toBeDisabled();
  });

  it("navigates to /mapscooter when the back button is clicked", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Click the back button
    fireEvent.click(screen.getByRole("button", { name: "" }));

    // Verify navigation to "/mapscooter"
    expect(mockNavigate).toHaveBeenCalledWith("/mapscooter");
  });

  it("renders the info section correctly", () => {
    render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    // Verify all info items are displayed
    expect(screen.getByText(/wear a helmet when riding/i)).toBeInTheDocument();
    expect(
      screen.getByText(/you must be 18 or older to ride an e-scooter/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/never ride under the influence of alcohol or drugs/i)
    ).toBeInTheDocument();
  });
});
