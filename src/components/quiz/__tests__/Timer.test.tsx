import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timer } from "../Timer";

describe("Timer", () => {
  it("renders time in correct format", () => {
    render(<Timer timeLeft={65} progress={50} isLowTime={false} isCriticalTime={false} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("renders time with leading zero for seconds", () => {
    render(<Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={false} />);
    expect(screen.getByText("0:05")).toBeInTheDocument();
  });

  it("applies critical time styling when isCriticalTime is true", () => {
    render(<Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={true} />);
    const timeElement = screen.getByText("0:05");
    expect(timeElement).toHaveClass("text-destructive");
    expect(timeElement).toHaveClass("animate-pulse");
  });

  it("applies low time styling when isLowTime is true", () => {
    render(<Timer timeLeft={15} progress={30} isLowTime={true} isCriticalTime={false} />);
    const timeElement = screen.getByText("0:15");
    expect(timeElement).toHaveClass("text-primary");
  });

  it("renders progress bar with correct width", () => {
    const { container } = render(
      <Timer timeLeft={30} progress={75} isLowTime={false} isCriticalTime={false} />
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("displays correct label text", () => {
    render(<Timer timeLeft={30} progress={50} isLowTime={false} isCriticalTime={false} />);
    expect(screen.getByText("Tempo restante")).toBeInTheDocument();
  });

  it("applies destructive color to progress bar when critical", () => {
    const { container } = render(
      <Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={true} />
    );
    const progressBar = container.querySelector(".bg-destructive");
    expect(progressBar).toBeInTheDocument();
  });

  it("applies primary color to progress bar when low time", () => {
    const { container } = render(
      <Timer timeLeft={15} progress={30} isLowTime={true} isCriticalTime={false} />
    );
    const progressBar = container.querySelector(".bg-primary");
    expect(progressBar).toBeInTheDocument();
  });
});
