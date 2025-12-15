import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { AnswerOption } from "../AnswerOption";

// eslint-disable-next-line max-lines-per-function
describe("AnswerOption", () => {
  const defaultProps = {
    option: "Test Answer",
    index: 0,
    isSelected: false,
    isCorrect: false,
    isShowingFeedback: false,
    correctAnswerIndex: 2,
    onSelect: vi.fn(),
    disabled: false,
  };

  it("renders the option text correctly", () => {
    render(<AnswerOption {...defaultProps} />);
    expect(screen.getByText("Test Answer")).toBeInTheDocument();
  });

  it("renders correct option label (A, B, C, D)", () => {
    const { rerender } = render(<AnswerOption {...defaultProps} index={0} />);
    expect(screen.getByText("A")).toBeInTheDocument();

    rerender(<AnswerOption {...defaultProps} index={1} />);
    expect(screen.getByText("B")).toBeInTheDocument();

    rerender(<AnswerOption {...defaultProps} index={2} />);
    expect(screen.getByText("C")).toBeInTheDocument();

    rerender(<AnswerOption {...defaultProps} index={3} />);
    expect(screen.getByText("D")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AnswerOption {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it("does not call onSelect when disabled", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<AnswerOption {...defaultProps} onSelect={onSelect} disabled={true} />);

    await user.click(screen.getByRole("button"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("applies selected styling when selected", () => {
    render(<AnswerOption {...defaultProps} isSelected={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("selected");
  });

  it("applies correct styling when showing correct feedback", () => {
    render(
      <AnswerOption {...defaultProps} isShowingFeedback={true} index={2} correctAnswerIndex={2} />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("correct");
    expect(button).toHaveClass("animate-bounce-in");
  });

  it("applies incorrect styling when showing incorrect feedback", () => {
    render(
      <AnswerOption
        {...defaultProps}
        isSelected={true}
        isShowingFeedback={true}
        isCorrect={false}
        correctAnswerIndex={2}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("incorrect");
    expect(button).toHaveClass("animate-shake");
  });

  it("applies disabled styling when disabled", () => {
    render(<AnswerOption {...defaultProps} disabled={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("cursor-not-allowed");
    expect(button).toHaveClass("opacity-70");
  });

  it("applies correct indicator color when showing feedback", () => {
    const { container } = render(
      <AnswerOption {...defaultProps} isShowingFeedback={true} index={2} correctAnswerIndex={2} />
    );
    const indicator = container.querySelector(".bg-success");
    expect(indicator).toBeInTheDocument();
  });

  it("applies incorrect indicator color when showing wrong answer feedback", () => {
    const { container } = render(
      <AnswerOption
        {...defaultProps}
        isSelected={true}
        isShowingFeedback={true}
        isCorrect={false}
      />
    );
    const indicator = container.querySelector(".bg-destructive");
    expect(indicator).toBeInTheDocument();
  });
});
