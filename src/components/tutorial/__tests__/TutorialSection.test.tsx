import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { TutorialSection, TutorialStage } from "../TutorialSection";

describe("TutorialSection", () => {
  it("names the section after its title, with its description and pieces", () => {
    render(
      <TutorialSection title="O tempo" description="Cada pergunta tem um tempo">
        <TutorialStage>peças</TutorialStage>
      </TutorialSection>
    );

    const section = screen.getByRole("region", { name: "O tempo" });
    expect(section).toContainElement(screen.getByRole("heading", { level: 2, name: "O tempo" }));
    expect(section).toHaveTextContent("Cada pergunta tem um tempo");
    expect(screen.getByText("peças")).toHaveClass("row-game");
  });

  it("leaves the description out when it has none", () => {
    render(<TutorialSection title="Regras" />);

    expect(screen.getByRole("region", { name: "Regras" }).querySelector("p")).toBeNull();
  });
});
