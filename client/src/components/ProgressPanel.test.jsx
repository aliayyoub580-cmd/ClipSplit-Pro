import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgressPanel from "./ProgressPanel";

describe("ProgressPanel", () => {
  it("renders processing state", () => {
    render(<ProgressPanel isProcessing progress={{ percent: 45, currentClip: 9, totalClips: 20, remainingMs: 120000 }} onCancel={vi.fn()} />);
    expect(screen.getByText("Clip 9 of 20")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });
});
