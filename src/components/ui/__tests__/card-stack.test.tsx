import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardStack, type CardStackItem } from "../card-stack";

const ITEMS: CardStackItem[] = [
  { id: "first", content: <p>First card</p> },
  { id: "second", content: <p>Second card</p> },
  { id: "third", content: <p>Third card</p> },
];

const getCards = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-state]"));

const getCardOf = (text: string) => screen.getByText(text).closest("[data-state]");

// eslint-disable-next-line max-lines-per-function
describe("CardStack", () => {
  it("renders the content of every card", () => {
    render(<CardStack items={ITEMS} />);

    expect(screen.getByText("First card")).toBeInTheDocument();
    expect(screen.getByText("Second card")).toBeInTheDocument();
    expect(screen.getByText("Third card")).toBeInTheDocument();
  });

  it("puts the first item in front and the rest behind it", () => {
    const { container } = render(<CardStack items={ITEMS} />);

    expect(getCards(container).map((card) => card.dataset.state)).toEqual([
      "front",
      "behind",
      "behind",
    ]);
  });

  it("hides the cards behind the front one from assistive technology", () => {
    render(<CardStack items={ITEMS} />);

    expect(getCardOf("First card")).not.toHaveAttribute("aria-hidden");
    expect(getCardOf("Second card")).toHaveAttribute("aria-hidden", "true");
    expect(getCardOf("Third card")).toHaveAttribute("aria-hidden", "true");
  });

  it("raises and shrinks each card behind the front one", () => {
    render(<CardStack items={ITEMS} offset={12} scaleFactor={0.1} />);

    expect(getCardOf("Second card")).toHaveStyle({ transform: "translateY(-12px) scale(0.9)" });
    expect(getCardOf("Third card")).toHaveStyle({ transform: "translateY(-24px) scale(0.8)" });
  });

  it("reserves room above the front card for the cards peeking out behind it", () => {
    const { container } = render(<CardStack items={ITEMS} offset={12} />);

    expect(container.firstElementChild).toHaveStyle({ paddingTop: "24px" });
  });

  it("hides the cards beyond the visible count", () => {
    const { container } = render(<CardStack items={ITEMS} visibleCount={2} />);

    expect(getCards(container).map((card) => card.dataset.state)).toEqual([
      "front",
      "behind",
      "hidden",
    ]);
  });

  it("moves the same card to the front when the items are reordered", () => {
    const { rerender } = render(<CardStack items={ITEMS} />);
    const thirdCard = getCardOf("Third card");

    rerender(<CardStack items={[ITEMS[2], ITEMS[0], ITEMS[1]]} />);

    expect(getCardOf("Third card")).toBe(thirdCard);
    expect(thirdCard).toHaveAttribute("data-state", "front");
    expect(getCardOf("First card")).toHaveAttribute("data-state", "behind");
  });

  it("applies custom classes to the stack and its cards", () => {
    const { container } = render(
      <CardStack items={ITEMS} className="stack-class" cardClassName="card-class" />
    );

    expect(container.firstElementChild).toHaveClass("stack-class");
    getCards(container).forEach((card) => expect(card).toHaveClass("card-class"));
  });
});
