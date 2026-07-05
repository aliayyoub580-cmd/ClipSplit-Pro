import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ErrorMessage from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("announces errors", () => {
    render(<ErrorMessage message="Video engine failed to load." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Video engine failed to load.");
  });
});
