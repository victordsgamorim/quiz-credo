import { Layers, RotateCcw, Sparkles } from "lucide-react";

import { PowerUpEmblem } from "@/components/quiz/PowerUpEmblem";
import { POWER_UPS } from "@/components/quiz/powerUps";
import { PowerUpSettingsContext, usePowerUpHint } from "@/components/quiz/usePowerUpSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { interpolate, useLocale } from "@/contexts/LocaleContext";
import { POWER_UP_IDS } from "@/lib/powerUpHand";
import {
  DEFAULT_POWER_UP_SETTINGS,
  POWER_UP_SETTINGS_LIMITS,
  type PowerUpSettings,
} from "@/types/powerUpSettings";
import type { PowerUpId } from "@/types/quiz";

type PowerUpSettingsCardProps = {
  settings: PowerUpSettings;
  onChange: (settings: PowerUpSettings) => void;
  disabled?: boolean;
};

type ValueSetting = keyof Pick<PowerUpSettings, "freezeQuestions" | "stealPoints" | "bonusPoints">;

// The power-ups with a value of their own, and the setting that holds it
const VALUE_SETTINGS: Partial<Record<PowerUpId, ValueSetting>> = {
  freeze: "freezeQuestions",
  steal: "stealPoints",
  bonus: "bonusPoints",
};

/*
 * The admin's power-up settings in the lobby: whether the game has power-ups at all, how many each
 * player gets, and for each power-up whether it's in the game and what it's worth. Each power-up's
 * hint shows the values set. With the power-ups off, the rest is locked: they aren't in the game.
 */
export const PowerUpSettingsCard = ({ settings, onChange, disabled }: PowerUpSettingsCardProps) => {
  const { t } = useLocale();
  const isLocked = disabled || !settings.isEnabled;

  return (
    <PowerUpSettingsContext.Provider value={settings}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => onChange(DEFAULT_POWER_UP_SETTINGS)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            disabled={disabled}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {t.lobby.gameSettings.restoreDefaults}
          </Button>
        </div>
        <PowerUpsSwitch settings={settings} onChange={onChange} disabled={disabled} />
        <div
          data-enabled={settings.isEnabled}
          className="space-y-6 transition-opacity data-[enabled=false]:opacity-50"
        >
          <HandSizeSetting settings={settings} onChange={onChange} disabled={isLocked} />
          <ul className="space-y-3">
            {POWER_UPS.map((powerUp) => (
              <PowerUpSettingRow
                key={powerUp.id}
                powerUp={powerUp}
                settings={settings}
                onChange={onChange}
                disabled={isLocked}
              />
            ))}
          </ul>
        </div>
      </div>
    </PowerUpSettingsContext.Provider>
  );
};

// Whether the game has power-ups at all, and a note when it doesn't
const PowerUpsSwitch = ({ settings, onChange, disabled }: PowerUpSettingsCardProps) => {
  const { t } = useLocale();
  const strings = t.lobby.powerUpSettings.isEnabled;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor="power-ups-enabled" className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-4 h-4" />
          {strings.label}
        </Label>
        <p className="text-xs text-muted-foreground">{strings.description}</p>
        {!settings.isEnabled && (
          <p role="status" className="text-xs font-medium text-accent">
            {strings.off}
          </p>
        )}
      </div>
      <Switch
        id="power-ups-enabled"
        checked={settings.isEnabled}
        onCheckedChange={(isEnabled) => onChange({ ...settings, isEnabled })}
        disabled={disabled}
      />
    </div>
  );
};

// How many power-ups each player gets, and a note when fewer than that are turned on
const HandSizeSetting = ({ settings, onChange, disabled }: PowerUpSettingsCardProps) => {
  const { t } = useLocale();
  const strings = t.lobby.powerUpSettings;
  const enabledCount = POWER_UP_IDS.filter((id) => settings.enabled[id]).length;
  const { min, max, step } = POWER_UP_SETTINGS_LIMITS.handSize;
  // With the power-ups off, the switch above already says so
  const note = !settings.isEnabled
    ? null
    : enabledCount === 0
      ? strings.allOff
      : enabledCount < settings.handSize
        ? interpolate(strings.handSize.limited, { count: enabledCount })
        : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Layers className="w-4 h-4" />
          {strings.handSize.label}
        </Label>
        <Badge variant="outline" className="font-mono">
          {settings.handSize}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{strings.handSize.description}</p>
      <Slider
        aria-label={strings.handSize.label}
        value={[settings.handSize]}
        onValueChange={([handSize]) => onChange({ ...settings, handSize })}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      {note && (
        <p role="status" className="text-xs font-medium text-accent">
          {note}
        </p>
      )}
    </div>
  );
};

// One power-up: its emblem, name, kind and hint, the switch that puts it in the game, and its value
const PowerUpSettingRow = ({
  powerUp,
  settings,
  onChange,
  disabled,
}: PowerUpSettingsCardProps & { powerUp: (typeof POWER_UPS)[number] }) => {
  const { t } = useLocale();
  const strings = t.lobby.powerUpSettings;
  const { id } = powerUp;
  const name = t.quiz.gameScreen.powerUps[id].name;
  const isEnabled = settings.enabled[id];
  const valueKey = VALUE_SETTINGS[id];
  const switchId = `power-up-setting-${id}`;

  return (
    <li
      data-enabled={isEnabled}
      className="rounded-xl border border-border/50 p-3 transition-opacity data-[enabled=false]:opacity-60"
    >
      <div className="flex items-center gap-3">
        <PowerUpSummary powerUp={powerUp} labelFor={switchId} />
        <Switch
          id={switchId}
          aria-label={interpolate(strings.toggle, { power: name })}
          checked={isEnabled}
          onCheckedChange={(checked) =>
            onChange({ ...settings, enabled: { ...settings.enabled, [id]: checked } })
          }
          disabled={disabled}
        />
      </div>
      {valueKey && (
        <ValueSlider
          label={strings[valueKey]}
          name={name}
          valueKey={valueKey}
          settings={settings}
          onChange={onChange}
          disabled={disabled || !isEnabled}
        />
      )}
    </li>
  );
};

// A power-up's emblem, name, kind and hint (with the values set), labelling its switch
const PowerUpSummary = ({
  powerUp: { id, kind, palette, renderArt },
  labelFor,
}: {
  powerUp: (typeof POWER_UPS)[number];
  labelFor: string;
}) => {
  const { t } = useLocale();
  const getHint = usePowerUpHint();

  return (
    <>
      <PowerUpEmblem palette={palette} art={renderArt(palette)} className="h-12 w-12 shrink-0" />
      <div className="min-w-0 flex-1">
        <Label htmlFor={labelFor} className="flex flex-wrap items-center gap-2 font-semibold">
          <span style={{ color: palette.light }}>{t.quiz.gameScreen.powerUps[id].name}</span>
          <Badge variant="secondary" className="text-[0.65rem] font-medium">
            {t.lobby.powerUpSettings.kinds[kind]}
          </Badge>
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{getHint(id)}</p>
      </div>
    </>
  );
};

// The value of a power-up (its points, or the questions it lasts for)
const ValueSlider = ({
  label,
  name,
  valueKey,
  settings,
  onChange,
  disabled,
}: PowerUpSettingsCardProps & { label: string; name: string; valueKey: ValueSetting }) => {
  const { min, max, step } = POWER_UP_SETTINGS_LIMITS[valueKey];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant="outline" className="font-mono text-xs">
          {settings[valueKey]}
        </Badge>
      </div>
      <Slider
        aria-label={`${name}: ${label}`}
        value={[settings[valueKey]]}
        onValueChange={([value]) => onChange({ ...settings, [valueKey]: value })}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};
