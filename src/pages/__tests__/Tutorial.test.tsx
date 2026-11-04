import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import Tutorial from "../Tutorial";

const strings = translations["pt-BR"].tutorial;

const renderPage = (entries: string[]) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <LocaleProvider>
        <Routes>
          <Route path="/" element={<p>home</p>} />
          <Route path="/tutorial" element={<Tutorial />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>
  );

describe("Tutorial page", () => {
  it("shows the tutorial with its tabs", () => {
    renderPage(["/tutorial"]);

    expect(screen.getByRole("heading", { level: 1, name: strings.title })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("goes back to the home screen it came from", async () => {
    const user = userEvent.setup();
    renderPage(["/", "/tutorial"]);

    await user.click(screen.getByRole("button", { name: strings.back }));

    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("goes to the home screen when opened by its link", async () => {
    const user = userEvent.setup();
    renderPage(["/tutorial"]);

    await user.click(screen.getByRole("button", { name: strings.back }));

    expect(screen.getByText("home")).toBeInTheDocument();
  });
});
