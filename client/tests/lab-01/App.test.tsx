import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.js";

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the TokTickIT heading", () => {
    render(<App />);

    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument();
  });

  it("shows the main navigation buttons", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /My Tickets/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Create Ticket/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /User Management/i })
    ).toBeInTheDocument();
  });

  it("shows the requester loading state on initial render", () => {
    render(<App />);

    expect(screen.getByText(/Loading requesters/i)).toBeInTheDocument();
  });
});