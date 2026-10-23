import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { DEFAULT_POWER_UP_SETTINGS } from "@/types/powerUpSettings";

import {
  CategoriesRule,
  DifficultyRule,
  PowerUpsRule,
  QuestionsRule,
  StreakRule,
  TimerRule,
} from "../GameRuleCards";

const strings = translations["pt-BR"].quiz.rulesScreen.rules;
const powerUpStrings = translations["pt-BR"].quiz.gameScreen.powerUps;
const categoryNames = translations["pt-BR"].lobby.categoryNames;

const renderRule = (rule: React.ReactElement) => render(<LocaleProvider>{rule}</LocaleProvider>);

describe("QuestionsRule", () => {
  it("shows how many questions the game has and how it's won", () => {
    renderRule(<QuestionsRule count={25} />);

    expect(screen.getByText(strings.questions.title)).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText(strings.questions.description)).toBeInTheDocument();
  });
});

describe("TimerRule", () => {
  it("shows the time for each question like the countdown, in minutes and seconds", () => {
    const { rerender } = renderRule(<TimerRule seconds={90} />);

    expect(screen.getByText(strings.timer.title)).toBeInTheDocument();
    expect(screen.getByText("1:30")).toBeInTheDocument();
    expect(screen.getByText(strings.timer.description)).toBeInTheDocument();

    rerender(
      <LocaleProvider>
        <TimerRule seconds={300} />
      </LocaleProvider>
    );
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("says there's no time limit when the game has none", () => {
    renderRule(<TimerRule seconds={null} />);

    expect(screen.getByText(strings.timer.unlimited)).toBeInTheDocument();
    expect(screen.queryByText(strings.timer.description)).not.toBeInTheDocument();
  });
});

describe("StreakRule", () => {
  it("shows the top multiplier and how many correct answers in a row start it", () => {
    renderRule(<StreakRule threshold={4} />);

    expect(screen.getByText(strings.streak.title)).toBeInTheDocument();
    expect(screen.getByText("×3")).toBeInTheDocument();
    expect(
      screen.getByText("4 acertos seguidos multiplicam seus pontos até ×3")
    ).toBeInTheDocument();
  });

  it("reads differently when a single correct answer starts the multiplier", () => {
    renderRule(<StreakRule threshold={1} />);

    expect(
      screen.getByText("Cada acerto seguido multiplica seus pontos, até ×3")
    ).toBeInTheDocument();
  });
});

describe("DifficultyRule", () => {
  it("shows the points of every level, from the first question to the last", () => {
    renderRule(<DifficultyRule />);

    const levels = screen.getAllByRole("listitem");
    expect(levels.map((level) => level.textContent)).toEqual(["10", "20", "30", "40", "50"]);
    expect(screen.getByText(strings.difficulty.description)).toBeInTheDocument();
  });
});

describe("CategoriesRule", () => {
  it("lists the room's categories by their names", () => {
    renderRule(<CategoriesRule categoryIds={["geography", "pop-culture", "old-category"]} />);

    expect(screen.getByText(strings.categories.title)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      categoryNames.geography,
      categoryNames["pop-culture"],
      "old-category",
    ]);
  });

  it("says the questions come from every category when the room voted for none", () => {
    renderRule(<CategoriesRule categoryIds={[]} />);

    expect(screen.getByRole("listitem")).toHaveTextContent(strings.categories.all);
  });
});

describe("PowerUpsRule", () => {
  it("lists the power-ups that can be dealt and how many each player gets", () => {
    renderRule(<PowerUpsRule settings={DEFAULT_POWER_UP_SETTINGS} />);

    expect(screen.getByText(powerUpStrings.label)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      powerUpStrings.freeze.name,
      powerUpStrings.steal.name,
      powerUpStrings.shield.name,
      powerUpStrings.break.name,
      powerUpStrings.bonus.name,
    ]);
    expect(screen.getByText("Cada jogador ganha 3 para usar uma vez cada")).toBeInTheDocument();
  });

  it("leaves out the power-ups turned off, and deals no more than the ones left", () => {
    const settings = {
      ...DEFAULT_POWER_UP_SETTINGS,
      handSize: 4,
      enabled: { freeze: true, steal: false, shield: false, break: false, bonus: true },
    };
    renderRule(<PowerUpsRule settings={settings} />);

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      powerUpStrings.freeze.name,
      powerUpStrings.bonus.name,
    ]);
    expect(screen.getByText("Cada jogador ganha 2 para usar uma vez cada")).toBeInTheDocument();
  });

  it("reads differently when each player gets a single power-up", () => {
    renderRule(<PowerUpsRule settings={{ ...DEFAULT_POWER_UP_SETTINGS, handSize: 1 }} />);

    expect(screen.getByText(strings.powerUps.descriptionOne)).toBeInTheDocument();
  });

  it("says the game has no power-ups when they're off", () => {
    renderRule(<PowerUpsRule settings={{ ...DEFAULT_POWER_UP_SETTINGS, isEnabled: false }} />);

    expect(screen.getByText(strings.powerUps.off)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("says the game has no power-ups when every one of them is turned off", () => {
    const enabled = { freeze: false, steal: false, shield: false, break: false, bonus: false };
    renderRule(<PowerUpsRule settings={{ ...DEFAULT_POWER_UP_SETTINGS, enabled }} />);

    expect(screen.getByText(strings.powerUps.off)).toBeInTheDocument();
  });
});
