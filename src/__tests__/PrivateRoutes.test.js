import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoutes";
import { isLoggedIn } from "../utils/auth";
import "@testing-library/jest-dom";
import { Navigate } from "react-router-dom";


jest.mock("../utils/auth", () => ({
  isLoggedIn: jest.fn(),
}));


const ProtectedComponent = () => <h1>Protected Content</h1>;

describe("PrivateRoute Component", () => {
  test("renders the protected component when user is logged in", () => {
    isLoggedIn.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute element={ProtectedComponent} />} />
        </Routes>
      </MemoryRouter>
    );


    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to home when user is not logged in", () => {
    isLoggedIn.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute element={ProtectedComponent} />} />
          <Route path="/" element={<h1>Login Page</h1>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
