import { HelmetProvider } from "react-helmet-async";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SEO from "./SEO";

describe("SEO", () => {
  it("renders title metadata", async () => {
    render(
      <HelmetProvider>
        <SEO title="Test Title" description="Test description" path="/test" />
      </HelmetProvider>
    );
    await waitFor(() => expect(document.title).toContain("Test Title"));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Test description");
  });
});
