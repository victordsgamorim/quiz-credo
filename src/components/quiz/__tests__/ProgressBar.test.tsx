import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders one dot per total question", () => {
    const { container } = render(<ProgressBar current={0} total={6} />);

    const dots = container.querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(6);
  });

  it("applies visual states for completed, current, and pending dots", () => {
    const { container } = render(<ProgressBar current={2} total={5} />);

    const completedDots = container.querySelectorAll(".bg-success");
    const currentDot = container.querySelector(".animate-pulse-glow");
    const pendingDots = container.querySelectorAll(".bg-secondary");

    expect(completedDots).toHaveLength(2);
    expect(currentDot).not.toBeNull();
    expect(currentDot).toHaveClass("bg-primary");
    expect(pendingDots).toHaveLength(2);
  });
});
