import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";

import { TutorialContent } from "../TutorialContent";

const strings = translations["pt-BR"].tutorial;
const powerUpStrings = translations["pt-BR"].quiz.gameScreen.powerUps;
const tryLabel = (id: keyof typeof strings.powerUps.summaries) =>
  strings.powerUps.tryLabel.replace("{power}", powerUpStrings[id].name);

const renderTutorial = () => {
  const user = userEvent.setup();
  render(
    <LocaleProvider>
      <TutorialContent header={<p>header</p>} />
    </LocaleProvider>
  );
  return user;
};

const openTab = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole("tab", { name }));

// eslint-disable-next-line max-lines-per-function
describe("TutorialContent", () => {
  it("shows the game, the points and the power-ups in tabs, the game first", () => {
    renderTutorial();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      strings.tabs.game,
      strings.tabs.points,
      strings.tabs.powerUps,
    ]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("header")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.game.room.title })).toBeInTheDocument();
  });

  it("keeps the power-ups in a tab of their own", async () => {
    const user = renderTutorial();

    expect(screen.queryByRole("heading", { name: strings.powerUps.rules.title })).toBeNull();
    await openTab(user, strings.tabs.powerUps);

    expect(screen.getByRole("heading", { name: strings.powerUps.rules.title })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: strings.game.room.title })).toBeNull();
    expect(
      screen.getByRole("heading", { name: strings.powerUps.advantages.title })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: strings.powerUps.disadvantages.title })
    ).toBeInTheDocument();
  });

  it("reveals the sample question's answer once one is picked", async () => {
    const user = renderTutorial();
    const reveal = screen.getByRole("button", { name: strings.game.question.reveal });

    expect(reveal).toBeDisabled();
    await user.click(screen.getByRole("button", { name: strings.game.question.options.b }));
    await user.click(reveal);

    expect(screen.getByText(strings.game.question.correct)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: strings.game.question.again }));
    expect(screen.getByText(strings.game.question.pick)).toBeInTheDocument();
  });

  it("tells a wrong answer apart", async () => {
    const user = renderTutorial();

    await user.click(screen.getByRole("button", { name: strings.game.question.options.a }));
    await user.click(screen.getByRole("button", { name: strings.game.question.reveal }));

    expect(screen.getByText(strings.game.question.wrong)).toBeInTheDocument();
  });

  it("fills the streak bar with right answers and empties it with a wrong one", async () => {
    const user = renderTutorial();
    await openTab(user, strings.tabs.points);
    const bar = screen.getByRole("progressbar", {
      name: translations["pt-BR"].quiz.gameScreen.streak.label,
    });

    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole("button", { name: strings.points.streak.hit }));
    }
    // Supercharged: the next 30-point question is worth 45
    expect(bar).toHaveAttribute("aria-valuetext", "Multiplicador ×1,5 ativo");
    expect(screen.getByText("45")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: strings.points.streak.miss }));
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("climbs the ranking with every right answer", async () => {
    const user = renderTutorial();
    await openTab(user, strings.tabs.points);
    const climb = () => screen.getByRole("button", { name: /Somar/ });

    await user.click(climb());
    await user.click(climb());
    await user.click(climb());

    expect(screen.getByRole("button", { name: strings.points.ranking.reset })).toBeInTheDocument();
  });

  it("tries an advantage out from its own card, at once", async () => {
    const user = renderTutorial();
    await openTab(user, strings.tabs.powerUps);

    // The card's button and its emblem both try it
    const [emblem, button] = screen.getAllByRole("button", { name: tryLabel("shield") });
    await user.click(button);

    expect(document.querySelector('[data-power-up="shield"]')).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    // Not used up: it can be tried again
    expect(emblem).toBeEnabled();
  });

  it("asks a disadvantage for an opponent first", async () => {
    const user = renderTutorial();
    await openTab(user, strings.tabs.powerUps);

    await user.click(screen.getAllByRole("button", { name: tryLabel("steal") })[0]);
    const picker = screen.getByRole("dialog");
    // The hints leave the admin's numbers out
    expect(within(picker).getByText(strings.powerUps.summaries.steal)).toBeInTheDocument();
    expect(document.querySelector("[data-power-up]")).toBeNull();
    await user.click(within(picker).getByRole("button", { name: "Jogador 1" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.querySelector('[data-power-up="steal"]')).toBeInTheDocument();
  });

  it("tells the rules without the admin's settings", async () => {
    const user = renderTutorial();
    const pageText = () => document.body.textContent ?? "";

    expect(pageText()).not.toMatch(/\d+ categorias|1 minuto|\d+ segundos/);
    await openTab(user, strings.tabs.powerUps);
    expect(pageText()).not.toMatch(/30 pontos|60 pontos|\d+ perguntas|recebe \d/);
  });
});
