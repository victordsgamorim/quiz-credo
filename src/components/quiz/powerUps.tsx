import type { PowerUpId } from "@/types/quiz";

import { FreezeArt, ShieldArt, StealArt, type PowerUpPalette } from "./PowerUpArt";

export type PowerUp = {
  id: PowerUpId;
  // Attacks hurt another player, boosts help the player who uses them
  kind: "attack" | "boost";
  palette: PowerUpPalette;
  renderArt: (palette: PowerUpPalette) => React.ReactNode;
};

// In the colors of the countdown and the streak bar: ice blue, red and green
export const POWER_UPS: PowerUp[] = [
  {
    id: "freeze",
    kind: "boost",
    palette: { light: "#7FDBFF", mid: "#1A8CFF", dark: "#0A2E80", ink: "#06205C" },
    renderArt: (palette) => <FreezeArt {...palette} />,
  },
  {
    id: "steal",
    kind: "attack",
    palette: { light: "#FF8A7A", mid: "#E0213A", dark: "#6B0716", ink: "#4A0410" },
    renderArt: (palette) => <StealArt {...palette} />,
  },
  {
    id: "shield",
    kind: "boost",
    palette: { light: "#7EE6A0", mid: "#1FA855", dark: "#0A4D27", ink: "#063A1C" },
    renderArt: (palette) => <ShieldArt {...palette} />,
  },
];

const POWER_UPS_BY_ID = Object.fromEntries(
  POWER_UPS.map((powerUp) => [powerUp.id, powerUp])
) as Record<PowerUpId, PowerUp>;

export const getPowerUp = (id: PowerUpId) => POWER_UPS_BY_ID[id];
