import { describe, expect, it } from "vitest";
import {
  calculateClipCount,
  estimateProcessingRisk,
  formatDuration,
  formatFileSize,
  generateClipFilename,
  validateFileSize,
  validateFileType,
  validateVideoDuration
} from "./videoUtils";

describe("videoUtils", () => {
  it("calculates clip count with ceiling", () => {
    expect(calculateClipCount(600, 3)).toBe(200);
    expect(calculateClipCount(10, 3)).toBe(4);
  });

  it("formats file sizes and durations", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("validates files and duration limits", () => {
    const file = new File(["x"], "clip.mp4", { type: "video/mp4" });
    expect(validateFileType(file)).toBe(true);
    expect(validateFileSize(file)).toBe(true);
    expect(validateVideoDuration(1800)).toBe(true);
    expect(validateVideoDuration(1801)).toBe(false);
  });

  it("generates filenames and estimates risk", () => {
    expect(generateClipFilename(0)).toBe("clip-001.mp4");
    expect(estimateProcessingRisk(900 * 1024 * 1024, 10, 60)).toBe("high");
  });
});
