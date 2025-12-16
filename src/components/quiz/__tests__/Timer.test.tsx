import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { Timer } from "../Timer";

const renderWithLocale = (component: React.ReactElement) => {
  return render(<LocaleProvider>{component}</LocaleProvider>);
};

const timerLabel = translations["pt-BR"].quiz.timer.label;

describe("Timer", () => {
  it("renders time in correct format", () => {
    renderWithLocale(
      <Timer timeLeft={65} progress={50} isLowTime={false} isCriticalTime={false} />
    );
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("renders time with leading zero for seconds", () => {
    renderWithLocale(<Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={false} />);
    expect(screen.getByText("0:05")).toBeInTheDocument();
  });

  it("applies critical time styling when isCriticalTime is true", () => {
    renderWithLocale(<Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={true} />);
    const timeElement = screen.getByText("0:05");
    expect(timeElement).toHaveClass("text-destructive");
    expect(timeElement).toHaveClass("animate-pulse");
  });

  it("applies low time styling when isLowTime is true", () => {
    renderWithLocale(<Timer timeLeft={15} progress={30} isLowTime={true} isCriticalTime={false} />);
    const timeElement = screen.getByText("0:15");
    expect(timeElement).toHaveClass("text-primary");
  });

  it("renders progress bar with correct width", () => {
    const { container } = renderWithLocale(
      <Timer timeLeft={30} progress={75} isLowTime={false} isCriticalTime={false} />
    );
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("displays correct label text", () => {
    renderWithLocale(
      <Timer timeLeft={30} progress={50} isLowTime={false} isCriticalTime={false} />
    );
    expect(screen.getByText(timerLabel)).toBeInTheDocument();
  });

  it("applies destructive color to progress bar when critical", () => {
    const { container } = renderWithLocale(
      <Timer timeLeft={5} progress={10} isLowTime={false} isCriticalTime={true} />
    );
    const progressBar = container.querySelector(".bg-destructive");
    expect(progressBar).toBeInTheDocument();
  });

  it("applies primary color to progress bar when low time", () => {
    const { container } = renderWithLocale(
      <Timer timeLeft={15} progress={30} isLowTime={true} isCriticalTime={false} />
    );
    const progressBar = container.querySelector(".bg-primary");
    expect(progressBar).toBeInTheDocument();
  });
});
