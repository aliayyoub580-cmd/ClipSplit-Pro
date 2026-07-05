import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VideoUploader from "./VideoUploader";

vi.mock("../utils/serverVideoService", () => ({
  splitVideoOnServer: vi.fn()
}));

vi.mock("../utils/zipUtils", () => ({
  downloadClipsZip: vi.fn()
}));

describe("VideoUploader", () => {
  it("renders upload controls and duration selector", () => {
    render(<VideoUploader />);
    expect(screen.getByText("Video splitter tool")).toBeInTheDocument();
    expect(screen.getByLabelText("Clip duration in seconds")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /split video/i })).toBeDisabled();
  });
});
