import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { translations } from "@/locales";
import { DEFAULT_GAME_SETTINGS } from "@/types/gameSettings";

import { GameSettingsCard } from "../GameSettingsCard";

const localeStrings = translations["pt-BR"];
const gameSettingsStrings = localeStrings.lobby.gameSettings;

const renderWithLocale = (component: React.ReactElement) =>
  render(<LocaleProvider>{component}</LocaleProvider>);

// eslint-disable-next-line max-lines-per-function
describe("GameSettingsCard", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    settings: DEFAULT_GAME_SETTINGS,
    onChange: mockOnChange,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and description", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.title)).toBeInTheDocument();
    expect(screen.getByText(gameSettingsStrings.description)).toBeInTheDocument();
  });

  it("renders question count setting", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.questionCount.label)).toBeInTheDocument();
    expect(screen.getByText(gameSettingsStrings.questionCount.description)).toBeInTheDocument();
  });

  it("renders timer duration setting", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.timerDuration.label)).toBeInTheDocument();
    expect(screen.getByText(gameSettingsStrings.timerDuration.description)).toBeInTheDocument();
  });

  it("renders max category selections setting", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.maxCategorySelections.label)).toBeInTheDocument();
    expect(
      screen.getByText(gameSettingsStrings.maxCategorySelections.description)
    ).toBeInTheDocument();
  });

  it("renders top categories count setting", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.topCategoriesCount.label)).toBeInTheDocument();
    expect(
      screen.getByText(gameSettingsStrings.topCategoriesCount.description)
    ).toBeInTheDocument();
  });

  it("renders enable question cache toggle", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.enableQuestionCache.label)).toBeInTheDocument();
    expect(
      screen.getByText(gameSettingsStrings.enableQuestionCache.description)
    ).toBeInTheDocument();
  });

  it("toggles question cache setting when switch is clicked", async () => {
    const user = userEvent.setup();
    renderWithLocale(<GameSettingsCard {...defaultProps} />);

    const toggleSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableQuestionCache.label,
    });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toBeChecked(); // Default is true

    await user.click(toggleSwitch);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_GAME_SETTINGS,
      enableQuestionCache: false,
    });
  });

  it("displays correct initial state for question cache toggle", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    const toggleSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableQuestionCache.label,
    });
    expect(toggleSwitch).toBeChecked();
  });

  it("displays unchecked state when enableQuestionCache is false", () => {
    const settings = { ...DEFAULT_GAME_SETTINGS, enableQuestionCache: false };
    renderWithLocale(<GameSettingsCard {...defaultProps} settings={settings} />);
    const toggleSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableQuestionCache.label,
    });
    expect(toggleSwitch).not.toBeChecked();
  });

  it("disables toggle when disabled prop is true", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} disabled={true} />);
    const toggleSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableQuestionCache.label,
    });
    expect(toggleSwitch).toBeDisabled();
  });

  it("calls onChange with correct values when toggle is enabled", async () => {
    const user = userEvent.setup();
    const settings = { ...DEFAULT_GAME_SETTINGS, enableQuestionCache: false };
    renderWithLocale(<GameSettingsCard {...defaultProps} settings={settings} />);

    const toggleSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableQuestionCache.label,
    });
    await user.click(toggleSwitch);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_GAME_SETTINGS,
      enableQuestionCache: true,
    });
  });

  it("renders debug mode toggle disabled by default", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.enableDebugMode.description)).toBeInTheDocument();
    const debugSwitch = screen.getByRole("switch", {
      name: gameSettingsStrings.enableDebugMode.label,
    });
    expect(debugSwitch).not.toBeChecked();
  });

  it("enables debug mode when debug switch is clicked", async () => {
    const user = userEvent.setup();
    renderWithLocale(<GameSettingsCard {...defaultProps} />);

    await user.click(
      screen.getByRole("switch", { name: gameSettingsStrings.enableDebugMode.label })
    );

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_GAME_SETTINGS,
      enableDebugMode: true,
    });
  });

  it("renders restore defaults button", () => {
    renderWithLocale(<GameSettingsCard {...defaultProps} />);
    expect(screen.getByText(gameSettingsStrings.restoreDefaults)).toBeInTheDocument();
  });

  it("restores default settings when restore button is clicked", async () => {
    const user = userEvent.setup();
    const customSettings = {
      ...DEFAULT_GAME_SETTINGS,
      questionCount: 20,
      enableQuestionCache: false,
    };
    renderWithLocale(<GameSettingsCard {...defaultProps} settings={customSettings} />);

    const restoreButton = screen.getByText(gameSettingsStrings.restoreDefaults);
    await user.click(restoreButton);

    expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_GAME_SETTINGS);
  });
});
