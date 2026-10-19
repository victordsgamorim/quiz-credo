import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { PointsPopup } from "../PointsPopup";

describe("PointsPopup", () => {
  it("shows the points earned with the multiplier, and its level for the colors", () => {
    const { container } = render(<PointsPopup questionPoints={20} multiplier={2} />);
    const popup = container.querySelector(".points-popup");
    expect(popup).toHaveTextContent("+40");
    expect(popup).toHaveAttribute("data-level", "2");
  });

  it("is hidden from screen readers, since the score shows the points too", () => {
    const { container } = render(<PointsPopup questionPoints={40} multiplier={1} />);
    expect(container.querySelector(".points-popup")).toHaveAttribute("aria-hidden", "true");
  });
});
