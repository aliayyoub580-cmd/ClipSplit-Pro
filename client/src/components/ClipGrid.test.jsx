import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ClipGrid from "./ClipGrid";

describe("ClipGrid", () => {
  it("renders generated clips", () => {
    render(<ClipGrid clips={[{ id: "clip-001.mp4", name: "clip-001.mp4", number: 1, duration: 3, blob: new Blob(), url: "blob:test" }]} onZip={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText("Clip 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download clip 1/i })).toBeInTheDocument();
  });
});
