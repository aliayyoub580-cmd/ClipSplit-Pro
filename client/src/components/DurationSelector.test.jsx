import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DurationSelector from "./DurationSelector";

describe("DurationSelector", () => {
  it("selects durations from quick buttons", async () => {
    const onChange = vi.fn();
    render(<DurationSelector value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "10s" }));
    expect(onChange).toHaveBeenCalledWith(10);
  });
});
