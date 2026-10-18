import {
  Settings,
  RotateCcw,
  Clock,
  Hash,
  ListChecks,
  Bell,
  Database,
  Bug,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { MAX_STREAK_MULTIPLIER } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import {
  type GameSettings,
  DEFAULT_GAME_SETTINGS,
  GAME_SETTINGS_LIMITS,
  TIMER_PRESETS,
} from "@/types/gameSettings";

type GameSettingsCardProps = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  disabled?: boolean;
};

/*
 * Game settings configuration card for admin in lobby.
 */
// eslint-disable-next-line max-lines-per-function
export const GameSettingsCard = ({ settings, onChange, disabled }: GameSettingsCardProps) => {
  const { t } = useLocale();

  const handleQuestionCountChange = (value: number[]) => {
    onChange({ ...settings, questionCount: value[0] });
  };

  const handleTimerDurationChange = (duration: number | null) => {
    onChange({ ...settings, timerDuration: duration });
  };

  const handleMaxCategorySelectionsChange = (value: number[]) => {
    onChange({ ...settings, maxCategorySelections: value[0] });
  };

  const handleTopCategoriesCountChange = (value: number[]) => {
    onChange({ ...settings, topCategoriesCount: value[0] });
  };

  const handleStreakThresholdChange = (value: number[]) => {
    onChange({ ...settings, streakThreshold: value[0] });
  };

  const handleLowTimeThresholdChange = (value: number[]) => {
    onChange({ ...settings, lowTimeThreshold: value[0] });
  };

  const handleCriticalTimeThresholdChange = (value: number[]) => {
    onChange({ ...settings, criticalTimeThreshold: value[0] });
  };

  const handleEnableQuestionCacheChange = (checked: boolean) => {
    onChange({ ...settings, enableQuestionCache: checked });
  };

  const handleEnableDebugModeChange = (checked: boolean) => {
    onChange({ ...settings, enableDebugMode: checked });
  };

  const handleRestoreDefaults = () => {
    onChange(DEFAULT_GAME_SETTINGS);
  };

  const isTimerEnabled = settings.timerDuration !== null;

  return (
    <Card className="glass-card p-6">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t.lobby.gameSettings.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{t.lobby.gameSettings.description}</p>
        </div>
        <Button
          onClick={handleRestoreDefaults}
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={disabled}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {t.lobby.gameSettings.restoreDefaults}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Question Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="w-4 h-4" />
              {t.lobby.gameSettings.questionCount.label}
            </Label>
            <Badge variant="outline" className="font-mono">
              {settings.questionCount}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.questionCount.description}
          </p>
          <Slider
            value={[settings.questionCount]}
            onValueChange={handleQuestionCountChange}
            min={GAME_SETTINGS_LIMITS.questionCount.min}
            max={GAME_SETTINGS_LIMITS.questionCount.max}
            step={GAME_SETTINGS_LIMITS.questionCount.step}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Timer Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              {t.lobby.gameSettings.timerDuration.label}
            </Label>
            <Badge variant={isTimerEnabled ? "outline" : "secondary"} className="font-mono">
              {isTimerEnabled
                ? t.lobby.gameSettings.timerDuration.options[
                    settings.timerDuration as keyof typeof t.lobby.gameSettings.timerDuration.options
                  ] || `${settings.timerDuration}s`
                : t.lobby.gameSettings.timerDuration.unlimited}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.timerDuration.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {TIMER_PRESETS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => handleTimerDurationChange(duration)}
                disabled={disabled}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  settings.timerDuration === duration
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {t.lobby.gameSettings.timerDuration.options[duration]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleTimerDurationChange(null)}
              disabled={disabled}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                settings.timerDuration === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/40 border-border/50 hover:border-primary/50 hover:bg-secondary/60",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {t.lobby.gameSettings.timerDuration.unlimited}
            </button>
          </div>
        </div>

        {/* Max Category Selections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="w-4 h-4" />
              {t.lobby.gameSettings.maxCategorySelections.label}
            </Label>
            <Badge variant="outline" className="font-mono">
              {settings.maxCategorySelections}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.maxCategorySelections.description}
          </p>
          <Slider
            value={[settings.maxCategorySelections]}
            onValueChange={handleMaxCategorySelectionsChange}
            min={GAME_SETTINGS_LIMITS.maxCategorySelections.min}
            max={GAME_SETTINGS_LIMITS.maxCategorySelections.max}
            step={GAME_SETTINGS_LIMITS.maxCategorySelections.step}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Top Categories Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ListChecks className="w-4 h-4" />
              {t.lobby.gameSettings.topCategoriesCount.label}
            </Label>
            <Badge variant="outline" className="font-mono">
              {settings.topCategoriesCount}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.topCategoriesCount.description}
          </p>
          <Slider
            value={[settings.topCategoriesCount]}
            onValueChange={handleTopCategoriesCountChange}
            min={GAME_SETTINGS_LIMITS.topCategoriesCount.min}
            max={GAME_SETTINGS_LIMITS.topCategoriesCount.max}
            step={GAME_SETTINGS_LIMITS.topCategoriesCount.step}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Streak Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4" />
              {t.lobby.gameSettings.streakThreshold.label}
            </Label>
            <Badge variant="outline" className="font-mono">
              {settings.streakThreshold}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {interpolate(t.lobby.gameSettings.streakThreshold.description, {
              max: MAX_STREAK_MULTIPLIER,
            })}
          </p>
          <Slider
            value={[settings.streakThreshold]}
            onValueChange={handleStreakThresholdChange}
            min={GAME_SETTINGS_LIMITS.streakThreshold.min}
            max={GAME_SETTINGS_LIMITS.streakThreshold.max}
            step={GAME_SETTINGS_LIMITS.streakThreshold.step}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Enable Question Cache */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-question-cache"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Database className="w-4 h-4" />
              {t.lobby.gameSettings.enableQuestionCache.label}
            </Label>
            <Switch
              id="enable-question-cache"
              checked={settings.enableQuestionCache}
              onCheckedChange={handleEnableQuestionCacheChange}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.enableQuestionCache.description}
          </p>
        </div>

        {/* Enable Debug Mode */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-debug-mode"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Bug className="w-4 h-4" />
              {t.lobby.gameSettings.enableDebugMode.label}
            </Label>
            <Switch
              id="enable-debug-mode"
              checked={settings.enableDebugMode}
              onCheckedChange={handleEnableDebugModeChange}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t.lobby.gameSettings.enableDebugMode.description}
          </p>
        </div>

        {/* Time Thresholds - Only show if timer is enabled */}
        {isTimerEnabled && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Bell className="w-4 h-4" />
              {t.lobby.gameSettings.timeThresholds.label}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t.lobby.gameSettings.timeThresholds.description}
            </p>

            {/* Low Time Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t.lobby.gameSettings.timeThresholds.lowTime}
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {settings.lowTimeThreshold}s
                </Badge>
              </div>
              <Slider
                value={[settings.lowTimeThreshold]}
                onValueChange={handleLowTimeThresholdChange}
                min={GAME_SETTINGS_LIMITS.lowTimeThreshold.min}
                max={GAME_SETTINGS_LIMITS.lowTimeThreshold.max}
                step={GAME_SETTINGS_LIMITS.lowTimeThreshold.step}
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Critical Time Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t.lobby.gameSettings.timeThresholds.criticalTime}
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {settings.criticalTimeThreshold}s
                </Badge>
              </div>
              <Slider
                value={[settings.criticalTimeThreshold]}
                onValueChange={handleCriticalTimeThresholdChange}
                min={GAME_SETTINGS_LIMITS.criticalTimeThreshold.min}
                max={GAME_SETTINGS_LIMITS.criticalTimeThreshold.max}
                step={GAME_SETTINGS_LIMITS.criticalTimeThreshold.step}
                disabled={disabled}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
