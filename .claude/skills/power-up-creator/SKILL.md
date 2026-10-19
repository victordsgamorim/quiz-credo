---
name: power-up-creator
description: Adds or changes a power-up in Quiz Credo, the options a player uses during a question to hurt another player or help themselves (like Freeze, Steal and Shield). Covers the two kinds (advantages for the player, disadvantages against a player picked from the room), the game rules (once per game, one per question), the hand-drawn emblem art, the bottom bar, the full-screen animation, the strings in the three locales, the tests and the checks. Use it whenever the user asks for a new power-up, or to change one's look, animation or rules.
---

# Power-up Creator

## What a power-up is

Power-ups take the game past plain questions and answers: they let the players interact with
each other. During a question, every player who answers has a set of power-ups.

## The two kinds of power-up

Every power-up is one of exactly two kinds. The kind decides **who it acts on**, and so whether
the player has to pick a target.

| Kind                                                       | In the code      | Acts on                                     | Target picker | Examples                                                                                             |
| ---------------------------------------------------------- | ---------------- | ------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **Advantage** (pt-BR "vantagem", es-BO "ventaja")          | `kind: "boost"`  | The player who uses it                      | No            | **Shield** (blocks disadvantages), **Freeze** (keeps the streak 2 questions), **Bonus** (+60 points) |
| **Disadvantage** (pt-BR "desvantagem", es-BO "desventaja") | `kind: "attack"` | Another player, who loses something from it | Yes, required | **Steal** (takes up to 30 points), **Break** (resets their streak)                                   |

- **Advantage:** it benefits the current player, so it needs no choice. Pressing the emblem uses
  it at once on the player themselves and plays its animation.
- **Disadvantage:** the player takes advantage of someone else, so they must say who. Pressing
  the emblem **opens a list of the players in the room's game** to pick the target from. The
  power-up is only used once a player is picked (see "Picking the target" below).

When a new power-up is added, its kind must be one of these two. If the user's idea doesn't say
whether it helps the player or hurts someone else, ask before building it.

## Picking the target (disadvantage power-ups)

The user's decision: a disadvantage power-up opens a selection list of the players who are
playing the game in the room, and the player picks the one to target. It is built
(`PowerUpTargetPicker.tsx`, opened by `GameScreen`), with these rules:

- **Who is listed:** the other players of the current room's game, by name (and avatar, if the
  player has one). Leave out the player themselves: you can't attack yourself. Leave out the admin
  when the admin isn't playing (only players who answer are in the game). The room's players come
  from the realtime room state that the lobby and the ranking already use; don't fetch them some
  other way.
- **When it opens:** pressing the emblem of a disadvantage power-up opens the list instead of using
  it. An advantage power-up never opens it.
- **Using it:** picking a player uses the power-up on them: it is marked as used (once per game,
  one per question, as before) and the animation plays. The target goes with it, so `onUse` /
  `spendPowerUp` gain a target id for disadvantages (for example
  `spendPowerUp(id, targetId?)`, and `UsedPowerUp` gains `targetId?`).
- **Cancelling:** closing the list (the close button, Escape, a tap outside) doesn't use the
  power-up. It stays available.
- **Time and locks:** the list closes on its own when the question gets locked (time up, or the
  answer shown), without using the power-up. Opening it doesn't pause the countdown, and it
  doesn't count as the question's power-up until a player is picked.
- **Nobody to pick:** in a standalone game, or when the player is alone in the room, there is no
  target. Disable the disadvantage power-ups then (with a hint saying why) rather than opening an
  empty list.
- **Look:** the game's `Dialog` (`src/components/ui/dialog.tsx`), so focus, Escape and screen
  readers work for free. On phones it is pinned to the bottom of the screen like a sheet
  (`max-sm:` classes); on wider screens it's a centered dialog. The title is "Em quem usar
  {power}?" beside the power-up's emblem, in its palette; each player is a `.power-up-target`
  button with their initial in the power-up's color.
- **Who is listed, in code:** `getPowerUpTargets` in `src/pages/Index.tsx`, from
  `socket.channelDevices`. Standalone games pass no targets.
- **Strings:** `pickTarget`, `noTargets` (the hint of a disadvantage turned off) and `outcomes`
  under `quiz.gameScreen.powerUps`.
- **Tests:** in `GameScreen.test.tsx` ("action bar"): the list opens and isn't used until a player
  is picked, picking uses it with that target, Escape keeps it, the answer shown closes it, an
  advantage is used at once, and the disadvantages are off without targets.

## The shield (built)

The user's rule: the shield blocks **every** disadvantage used on its owner during the question
it was used on, **whether the disadvantage came before or after the shield**. It only lasts for
its own question (one power-up per question means one shield per question anyway).

- **The server decides it.** `isAttackBlocked(powerUps, attack)` in `server.js`: true when the
  target used `shield` on the same `questionIndex`. Never decide it on the client.
- **Before or after:** when a disadvantage is used, the server sends its outcome with `isBlocked`.
  When the target then uses the shield, the server sends again, now blocked, the outcome of every
  disadvantage already used on them on that question.
- **Effects** must check `isAttackBlocked`, and be undone when a shield shows up later, because a
  later shield blocks them too. Steal does it by replaying the scores (see "Steal").
- **What the players see:** `usePowerUpNotices` shows a toast (sonner, `top-center`, so it doesn't
  cover the bottom bar) to the attacker and the target only: with the shield's emblem when blocked,
  the disadvantage's emblem when it hit. A flip from hit to blocked is told again. Other players
  aren't told, so nobody can see who has a shield up.

## Steal (built)

The user's rule: Steal takes **30 points** from its target and gives them to the attacker. When
the target has less than 30, it takes all they have, down to zero. **A player's score must NEVER go
below 0** (the user's emphasis).

- **The server decides it.** `replayScores(gameState)` in `server.js` replays the game's answers and
  steals in timestamp order: each steal takes `Math.min(STEAL_POINTS, targetScore)`, and 0 when
  blocked. Replaying (instead of applying a steal once) is what keeps the rule when a later shield
  undoes a steal: every steal after it is worked out again from the new scores, so nobody can go
  negative (a chain like Bia steals from Ana, Caio steals from Bia, Ana shields, gives Caio 0).
- **The ranking** (`calculateRanking`) takes each player's points from `replayScores`, not from the
  sum of their answers.
- **Outcomes:** a steal's `power-up-outcome` carries `points`. `emitPowerUpOutcomes` sends every
  outcome of the question whose `isBlocked` or `points` changed (kept in `lastOutcomeKey`).
- **The client's score:** `getStealBalance(outcomes, selfId)` in `src/lib/powerUpScore.ts` (stolen
  points minus points lost), added to `gameState.score` in `Index.tsx`, on the game screen and the
  results screen. The client never works the points out itself.
- **Toasts:** `stealHitYou`, `stealYouHit`, and `stealNothing` (only to the attacker, when the
  target had no points).
- **Check it end to end** with these cases: 40 points stolen twice (30, then the 10 left); a steal
  undone by a later shield; and the chain above. All final scores must be ≥ 0.

## Freeze (built)

The user's decision: Freeze is an **advantage** (it used to be a disadvantage). It freezes the
player's **supercharge**, the streak of correct answers and its multiplier (`StreakBar`), so a
wrong answer doesn't reset it, for **2 questions counting from the one it's used on**. The user
stressed: **Freeze is not a way to earn points**; it only keeps the streak from being reset.

- **Rule:** a wrong (or missing) answer on a frozen question is skipped by the streak: it neither
  breaks it nor adds to it, and earns 0 points as always. A right answer counts as usual, with the
  multiplier the player already had. No bonus of any kind.
- **Client:** `FREEZE_QUESTIONS`, `getFrozenQuestions(freezeQuestionIds, questionIds)` and
  `withoutFrozenMisses(answers, frozenQuestions)` in `src/lib/scoring.ts`. `useQuiz` builds
  `frozenQuestions` from `usedPowerUps` and filters the answers through `withoutFrozenMisses`
  before `countStreak` / `getQuestionMultiplier` (in `recordAnswer` too), and sets
  `streak.isFrozen` for the current question.
- **Server:** `getFrozenQuestions(powerUps, deviceId)` and `countStreakBefore(..., frozenQuestions)`
  in `server.js`, used by `submit-answer` for each answer's multiplier, so the ranking matches.
  Keep `FREEZE_QUESTIONS` the same on both sides.
- **On screen:** `StreakBar`'s `isFrozen` (`data-frozen`): ice over the track, a snowflake icon,
  paused lightning, and the `streak.frozen` string as title and screen-reader text.
- **Tests:** `scoring.test.ts` ("frozen streak"), `useQuiz.test.ts` (two frozen misses keep the
  x1.5), `GameScreen.test.tsx` (the iced bar). End to end: a player who freezes and misses twice
  keeps the multiplier; one who doesn't loses it.

## Break (built)

The user's rule: Break is a **disadvantage** that breaks the target's multiplier: their streak
(supercharge) is reset to 0, so the multiplier goes back to x1.

- **Rule:** the streak counts only from the question the Break was used on: the target's answer to
  it is worth x1, and a right answer there makes the streak 1. Points already earned stay. The
  shield blocks it (before or after). **Freeze doesn't stop it** (Freeze is about wrong answers);
  this was a choice made without the user, tell them if they ask.
- **Client:** `sinceStreakBreak(answers, breakQuestionIds, questionIds)` in `src/lib/scoring.ts`.
  `useQuiz` takes the Break outcomes aimed at the player and not blocked (from
  `socket.powerUpOutcomes`) and filters the answers through it, together with
  `withoutFrozenMisses`, in `toStreakAnswers` (used by the streak, the multiplier and
  `recordAnswer`).
- **Server:** `getStreakStart(powerUps, deviceId, questionIndex)` and `getStreakRules` in
  `server.js`; `countStreakBefore` doesn't count before the start.
- **Toasts:** `breakHitYou`, `breakYouHit`.
- **Tests:** `scoring.test.ts` ("broken streak"), `useQuiz.test.ts` (the streak reset, and a
  blocked Break changing nothing), `usePowerUpNotices.test.tsx`. End to end: the target's answers
  after it are worth x1 (240 against 360 for a player not hit), and a shield after it keeps x1.5.

## Bonus (built)

The user's rule: Bonus is an **advantage** that adds **60 points** as a bonus. "Apenas isso": no
other effect.

- **Rule:** the 60 points go into the score the moment it's used, whatever the answer, with no
  multiplier and no change to the streak. A later Steal can take them like any points.
- **Client:** `BONUS_POINTS` in `src/lib/powerUpScore.ts`; `spendPowerUp` in `useQuiz` adds it to
  `gameState.score` with the use (so it also counts in a standalone game and in the history).
- **Server:** `BONUS_POINTS` and `BONUS_POWER_UP` in `server.js`; `replayScores` adds a bonus
  event at the use's timestamp, so the ranking counts it and steals after it can take from it.
- **Tests:** `useQuizPowerUps.test.ts` (60 at once, kept after a wrong answer, once per game). End
  to end: 60 from the bonus, 30 of it stolen afterwards, +40 for a right answer gives 70.

## The hand: 3 random power-ups per player (built)

The user's decision: **the bar stays at 3 power-ups**. There are 5, and each player gets 3 of them
**picked at random for them**, every game. The user noticed Break and Bonus "always" showing for
everyone: the draw was fair, but the bar sorted the hand in catalog order (so the last power-ups
always sat at the end) and each hand was dealt alone. So now:

- **Spread over the room:** the server picks each power-up of a hand at random among those dealt
  the fewest times in the room's game so far. With 3+ players no power-up is in every hand; with 2
  (6 places, 5 power-ups) they share exactly one.
- **Random order:** the hand is shuffled, and the bar shows it in the hand's order, so every
  power-up shows up in every spot.

- **Room's game:** the server deals it (`dealPowerUps`, `getPowerUpHand`, `emitPowerUpHand` in
  `server.js`, with `crypto.randomInt`; `getPowerUpHand` passes the counts of the hands already
  dealt) when the questions load, sends it to each player as
  `power-up-hand { powerUpIds }`, and again when a player joins back mid-game (the same hand).
  `getPowerUpRejection` refuses a power-up outside the hand (`not_in_hand`). `useSocket` keeps it
  in `powerUpHand`, cleared on `game-started` and `game-reset`.
- **Standalone game:** `startGame` deals `GameState.powerUpHand` with `dealPowerUps(POWER_UP_IDS)`
  (`src/lib/powerUpHand.ts`, `crypto.getRandomValues`).
- **Wiring:** `useQuiz` returns `powerUpHand` (the server's in a room, the local one otherwise),
  `spendPowerUp` ignores a power-up outside it, and `Index` → `GameScreen` (`powerUpHand`) →
  `PowerUpBar` (`ids`) shows only those, in the hand's order (`ids.map(getPowerUp)`).
- **Keep in sync:** `POWER_UP_HAND_SIZE` (3) on both sides, and `POWER_UP_IDS` with the catalog
  and `POWER_UP_KINDS`.
- **Tests:** `powerUpHand.test.ts`, `PowerUpBar.test.tsx` (only the dealt ones),
  `useQuizPowerUps.test.ts` (only the hand can be played; the standalone hand is set there with
  `vi.hoisted`, because it's random). The power-up tests of `useQuiz` live in
  `useQuizPowerUps.test.ts`, apart from the scoring ones in `useQuiz.test.ts` (max 250 lines).

So far the **UI, the usage rules, the target picker, the shield, Steal, Freeze, Break, Bonus and
the random hand** all work. When
the user asks for a new power-up or a change, see "Business logic" below. The user-facing explanation of every power-up is in `docs/POWER_UPS.md`: keep it up to date
when a power-up or a rule changes.

## Game rules (already implemented, keep them)

1. **Once per game.** A used power-up stays off for the rest of the game. A new game gives every
   power-up back.
2. **One per question.** Once a power-up is used on a question, the others are locked until the
   next question. Example with 3 power-ups: question 1 uses one; question 2 can use either of the
   two left; question 3 gets the last one.
3. **Locked while the answer is shown.** The power-ups are disabled during feedback, and when the
   time is up (`isSelectionLocked`).
4. **Only players who answer get them.** That means the guests of a synced game, the admin in debug
   mode and standalone players. An admin who doesn't answer gets no power-ups (`canAnswer` in
   `GameScreen`).

Where the rules live:

- `src/types/quiz.ts`: `PowerUpId` (the union of the ids) and
  `GameState.usedPowerUps: UsedPowerUp[]`. Each `UsedPowerUp` is `{ id, questionId, targetId? }`,
  the question the power-up was used on (what enforces "one per question") and, for a
  disadvantage, the player it was used on. `PowerUpPlayer` and `PowerUpOutcome` describe the
  players and the outcomes the server sends.
- `src/hooks/useQuiz.ts`:
  - `spendPowerUp(id, targetId?)` enforces both rules, so a double tap is ignored. It ignores a
    power-up already used, and any power-up when one was already used on the current question.
    In a room's game it also sends it to the server (`socket.sendPowerUp`).
  - `usedPowerUps` is reset to `[]` in `createInitialGameState` and in `startGame`, so every new
    game starts clean. A guest's game also starts from `idle`, so it is reset too.
- `src/pages/Index.tsx` passes `usedPowerUps={gameState.usedPowerUps}` and
  `onUsePowerUp={quiz.spendPowerUp}` to `GameScreen`.
- `src/components/quiz/GameScreen.tsx` turns them into the bar's props:
  - `usedIds`: the ids of the power-ups used so far.
  - `disabled`: `isSelectionLocked`, or a power-up already used on this question.

The state lives in the game state, not in a component, because `GameScreen` can unmount between
questions. The server enforces the same rules again on `use-power-up` (see "Business logic"), and
keeps the used power-ups in `channel.gameState.powerUps`. The client doesn't read them back yet, so
reloading the page mid-game shows the power-ups as available again, but the server rejects them.

## Files

| File                                          | What it holds                                                                                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/quiz/powerUps.tsx`            | **The catalog**: `POWER_UPS` (id, kind, palette, `renderArt`) and `getPowerUp(id)`. The bar and the animation both read it.                                                                          |
| `src/components/quiz/PowerUpArt.tsx`          | The hand-drawn SVG art of each power-up (`FreezeArt`, `StealArt`, `ShieldArt`) and the `PowerUpPalette` type.                                                                                        |
| `src/components/quiz/PowerUpEmblem.tsx`       | `PowerUpEmblem`, the medal around the art, and `PowerUpRibbon`, the name banner.                                                                                                                     |
| `src/components/quiz/PowerUpBar.tsx`          | The bar of emblems: a bottom navigation on phones, beside the countdown on wider screens.                                                                                                            |
| `src/components/quiz/PowerUpCast.tsx`         | The full-screen animation played when a power-up is used, with one effect per power-up.                                                                                                              |
| `src/components/quiz/usePowerUpCast.ts`       | `usePowerUpCast(onUse)`, which uses the power-up (with its target) and starts its animation, and `CAST_DURATION_MS`.                                                                                 |
| `src/components/quiz/PowerUpTargetPicker.tsx` | The list of players a disadvantage is used on.                                                                                                                                                       |
| `src/components/quiz/usePowerUpNotices.tsx`   | The toasts telling the attacker and the target how a disadvantage turned out.                                                                                                                        |
| `src/lib/powerUpHand.ts`                      | `POWER_UP_IDS`, `POWER_UP_HAND_SIZE` and `dealPowerUps`: the random hand of a standalone game.                                                                                                       |
| `src/lib/powerUpScore.ts`                     | `getStealBalance` (the points won and lost to steals, added to the score) and `BONUS_POINTS`.                                                                                                        |
| `src/hooks/useSocket.ts`                      | `sendPowerUp(id, targetId?)` and `powerUpOutcomes` (from the server's `power-up-outcome`).                                                                                                           |
| `../quiz-credo-server/server.js`              | `POWER_UP_KINDS`, `isAttackBlocked`, `getPowerUpRejection` and the `use-power-up` event.                                                                                                             |
| `docs/POWER_UPS.md`                           | The explanation of every advantage and disadvantage, for the team.                                                                                                                                   |
| `src/index.css`                               | The `.power-up*` styles (emblem states) and the `.power-up-cast*` styles plus their `@keyframes` (the animations).                                                                                   |
| `src/locales/{pt-BR,en-UK,es-BO}.ts`          | `quiz.gameScreen.powerUps`: `label`, `used`, and `{ name, hint }` per power-up.                                                                                                                      |
| Tests                                         | `src/components/quiz/__tests__/PowerUpBar.test.tsx`, `PowerUpCast.test.tsx`, `usePowerUpNotices.test.tsx`, `GameScreen.test.tsx` (the "action bar" block) and `src/hooks/__tests__/useQuiz.test.ts`. |

## Adding a power-up, step by step

### 1. Pick the concept

Pick a short name, its kind (an **advantage**, `boost`, or a **disadvantage**, `attack`; see
"The two kinds of power-up"), and a **visual metaphor** that a child can read
at a glance. The name must work in one or two words in pt-BR, en-UK and es-BO, because it has to
fit the ribbon (about 104px wide).

The current ones use these metaphors:

- **Freeze:** an hourglass trapped in a block of ice, the time stopped (the streak kept as it is).
- **Steal:** a magnet pulling in coins.
- **Shield:** a knight's shield split like a coat of arms, with a gold star.
- **Bonus:** a gift box with a gold ribbon and bow (`BonusArt`, `Bow`).
- **Break:** the streak's lightning bolt snapped in two (`BreakArt`, cut with `clipPath`s along a
  jagged line).

Avoid a metaphor too close to an existing one.

### 2. Add the id

In `src/types/quiz.ts`, add the id to `PowerUpId`:

```ts
export type PowerUpId = "freeze" | "steal" | "shield" | "double";
```

TypeScript then points at every place that needs the new power-up, for example the `EFFECTS`
record in `PowerUpCast.tsx` and the locale objects.

### 3. Pick the palette

Each power-up has a `PowerUpPalette` of four colors in hex. The SVG gradient stops need real
colors, so `hsl(var(...))` doesn't work there.

- `light`: the highlight of the emblem's core, the ribbon tails, and the color of the animation's
  effects.
- `mid`: the core's main color, the ribbon, and the glows.
- `dark`: the core's edge, the ribbon tails, and the stroke of the animated name.
- `ink`: the outline of the drawing, darker than `dark`.

Keep it in the family of the project's colors (the countdown and the streak bar) and distinct
from the existing palettes:

- freeze is ice blue: `#7FDBFF` / `#1A8CFF` / `#0A2E80` / `#06205C`
- steal is red: `#FF8A7A` / `#E0213A` / `#6B0716` / `#4A0410`
- shield is green: `#7EE6A0` / `#1FA855` / `#0A4D27` / `#063A1C`
- break is purple: `#D9A8FF` / `#8B3DFF` / `#3A0F80` / `#24085C`
- bonus is orange: `#FFC58A` / `#FF7A1A` / `#8A3A00` / `#5C2400`

Good free hues are teal and pink.

### 4. Draw the art

Add `XxxArt` to `PowerUpArt.tsx`, following these rules:

- **Draw it yourself.** Don't use lucide or another icon set. The user explicitly asked for
  original, hand-drawn art.
- **Box:** draw in the emblem's 100×100 box. The center is (50, 50), and the core visible behind
  the art is a circle of radius 36.5, so keep the drawing roughly within 27..73 on both axes.
- **Style:** cartoon, with a **thick `ink` outline** (stroke 2–2.6, round caps and joins), white or
  very light fills, and a **gold** accent (`GOLD`, `GOLD_DARK`). Add a sparkle (`<Sparkle>`) or two
  for shine.
- **Shapes:** for thick shapes, draw the outline stroke first, then the same path a bit thinner in
  the fill color over it (like the magnet).
- **Small parts:** split a part into its own small component (like `Coin` and `Magnet`) when the
  art grows past about 50 lines. ESLint warns about long functions.
- **Exports:** export only components from this file. Helpers stay unexported, because of
  `react-refresh/only-export-components`.
- **Function parameters:** pass more than 3 arguments as an object (`max-params`).
- **Signature:** every art takes the palette: `({ ink, light }: PowerUpPalette) => <g>…</g>`.

`PowerUpEmblem` already adds a drop shadow in `ink` under the art.

### 5. Add it to the catalog

In `powerUps.tsx`:

```tsx
{
  id: "double",
  kind: "boost",
  palette: { light: "#D9A8FF", mid: "#8B3DFF", dark: "#3A0F80", ink: "#24085C" },
  renderArt: (palette) => <DoubleArt {...palette} />,
},
```

The order of `POWER_UPS` is the order in the bar. The phone bar is a 3-column grid
(`grid-cols-3` in `BAR_CLASS`): it shows the player's hand, which the user wants to stay at **3**
however many power-ups exist, so a new power-up doesn't change the grid. Add its id to
`POWER_UP_IDS` too (see "The hand").

### 6. Add the strings in the three locales

Under `quiz.gameScreen.powerUps` in `src/locales/pt-BR.ts`, `en-UK.ts` and `es-BO.ts`:

```ts
double: { name: "Dobrar", hint: "Dobra os pontos desta pergunta" },
```

- `name` is short. It's shown on the ribbon, as `NAME!` in the animation, and as the button's
  accessible name.
- `hint` is one sentence saying what it does. It's the button's `title`, shown on hover on wider
  screens, where the ribbon is hidden.

Each en-UK and es-BO string adds one `tsc` error. That is a known pattern in this repo, not a new
issue.

### 7. Create the full-screen animation

In `PowerUpCast.tsx`, add an `XxxEffect` component and register it in `EFFECTS`.

**What the base already does** for every power-up, in 1.9s:

1. The screen is tinted with a radial gradient in the palette (`.power-up-cast-backdrop`).
2. The emblem pops in at the center, spinning and bouncing (`.power-up-cast-emblem`).
3. The name appears below it in big uppercase letters with a stroke (`.power-up-cast-name`).
4. Everything grows and fades out at the end.

**The effect's job** is to symbolize what the power-up does across the whole screen. The user's
words were: "if it's a shield, I want a shield animation on the screen, symbolizing protection".
The existing effects:

- **Shield:**
  - A force field of hexagons (an SVG `<pattern>`) covering the screen, masked so it shows
    stronger at the edges, flickering as it holds.
  - Two energy rings expanding from the center (`.power-up-cast-ring`, the second one delayed
    with `[animation-delay:0.55s]`).
  - A glow along the screen's edges (`.power-up-cast-edge`).
- **Freeze:**
  - A frosty mist along the edges (`.power-up-cast-frost`).
  - Ice cracks growing from the four corners: one SVG mirrored with `-scale-x-100` /
    `-scale-y-100`.
  - Falling snowflakes (`.power-up-cast-snow`).
- **Steal:**
  - Coins flying in from all around the screen to the magnet (`.power-up-cast-coin`, starting
    from `--from-x` / `--from-y`).
  - The emblem shaking while it pulls (`.power-up-cast[data-power-up="steal"] .power-up-cast-art`).
- **Break:** cracks growing from the middle of the screen (`.power-up-cast-cracks`), pieces of the
  bolt flying out (`.power-up-cast-shard`), and the emblem hit (`power-up-cast-hit`).
- **Bonus:** confetti thrown up and falling (`.power-up-cast-confetti`), and "+60" rising over the
  emblem (`.power-up-cast-points`).

**Rules for an effect:**

- **Colors:** use the CSS variables the overlay sets: `--cast-light`, `--cast-color` (mid) and
  `--cast-dark`, plus `currentColor`, which is `light`.
- **Particles:** keep them **deterministic**. Compute their positions, delays and sizes at module
  load with formulas (like `SNOWFLAKES` and `COINS`), never with `Math.random()` in render.
  Pass per-particle values through inline `style` (CSS variables, `animationDelay`).
- **Timing:** everything must fit in **1.9s** (`CAST_DURATION_MS`). Fade in quickly (about 12%),
  hold, then fade out by 100%. Use `animation-fill-mode: both` (`… both` in the shorthand), so
  nothing flashes before a delayed start or stays after the end. If you change the duration,
  change `CAST_DURATION_MS` and every `1.9s` in the `.power-up-cast*` styles together.
- **Styles:** add the classes to `src/index.css` inside `@layer components`, next to the other
  `.power-up-cast*` styles. Put the `@keyframes power-up-cast-*` at the end of the file.
- **Reduced motion:** don't add anything for it. The global `prefers-reduced-motion` rule shortens
  every animation, so the overlay just doesn't show.
- **Don't change the overlay's behavior:**
  - It is `pointer-events-none`, so the answers stay clickable through it while the countdown
    runs.
  - It is `aria-hidden`, because the button already says the power-up was used.
  - It sits at `z-50`, above the bottom bar (`z-20`).
- **Same-id SVG defs:** unique ids aren't needed, because only one cast is on screen at a time.

### 8. Tests

Extend the existing tests rather than writing new styles of test:

- `PowerUpBar.test.tsx`: the bar now shows N power-ups, and each one has its `name` and `hint`.
- `PowerUpCast.test.tsx`: add the new id and its effect's class to the `it.each` table.
- `useQuiz.test.ts`: only if the rules change.
- `GameScreen.test.tsx`: only if the wiring changes.

Run the tests with `NODE_OPTIONS=--no-experimental-webstorage npx vitest run`. Node 26's
localStorage breaks them without the flag.

### 9. Check it visually

Screenshot the game on a phone (390×844 and 360×780) and on a desktop (1280×800):

- The bar at rest, after one use, and after a use on the same question (others dimmed).
- The animation at about 350ms, 800ms and 1300ms after the tap. Use Playwright with a small Vite
  harness that renders `GameScreen` with local state for `usedPowerUps`.

Look at the images yourself before saying it works.

### 10. Run the checks

- `npx eslint src`: no new errors, and no new warnings compared with the committed code.
- `npx prettier --check src`.
- `npx tsc -p tsconfig.app.json --noEmit`: there is a large pre-existing baseline. Diff the error
  counts per file against `git stash`, and only the new locale strings may add errors.
- Run `snyk_code_scan` on the changed folders, as AGENTS.md requires.

Reply to the user in **Portuguese (pt-BR)** with what changed and how it was checked. Code,
comments and docs stay in English. Don't commit unless asked.

## The design, so changes keep its look

- **Emblem (`PowerUpEmblem`):**
  - A gold medal with a wavy rim (16 waves) and 8 rivets.
  - A dark bezel, then a glossy core in the palette with 12 faint rays and a shine on top, then
    the art.
  - It has no number or count badge: the user asked for "only the emblem".
- **Bar (`PowerUpBar`):**
  - **Phones:** a fixed bottom navigation of 3 emblems (72px), each with its ribbon. It replaced
    the old bottom action bar.
  - **Admin's actions:** the audio, submit and next buttons now sit beside the countdown. On
    phones the countdown hides its "Time remaining" label there to make room
    (`isLabelHiddenOnPhones`).
  - **Wider screens:** the emblems alone (52px), beside the countdown and the admin's actions,
    with the name as the hover title.
- **States, in `.power-up*`:**
  - Hovered: the emblem lifts and tilts.
  - Pressed: it sinks.
  - Locked for the question (feedback, or another one used): it is dimmed but keeps its color.
  - Used for the game (`data-used="true"`): it turns gray, darker and smaller, with a 0.4s
    transition.
  - Disadvantage without anyone to pick: disabled, with `noTargets` as its title.
  - There is no "picked" state: an advantage is used at once, a disadvantage opens the list.
- **Accessibility:**
  - Each emblem is a real `<button>` inside `<nav aria-label="Poderes">`.
  - The accessible name is the power-up's name, plus ", já usado" once used.
  - The `hint` is the button's title.

## Business logic

- **Server:** the realtime server owns the game and the ranking. Any effect on scores or on other
  players needs `server.js` too, not only the client (see the Supabase and realtime-server notes).
  - `use-power-up` `{ channelId, powerUpId, targetDeviceId? }` is checked by
    `getPowerUpRejection`: unknown id, not a player, question closed (answered or time up),
    already used, one already used on the question, or a disadvantage's target that isn't another
    player of the game. Rejections are only logged.
  - `power-up-outcome` `{ questionIndex, powerUpId, attacker, target, isBlocked }` goes to the
    attacker and the target only.
  - A new power-up needs its id and kind in `POWER_UP_KINDS` too, matching `powerUps.tsx`, and
    its id in `POWER_UP_IDS` (`src/lib/powerUpHand.ts`). It joins the random hands at once.
- **Targets:** built. The player picks the target of a disadvantage from the list of the room's
  players, and an advantage always acts on the player themselves (see "Picking the target").
- **Defenses:** built for the shield (see "The shield"). A new advantage that defends must say
  whether it works before and after, like the shield.
- **Still to come:** reading the used power-ups and the outcomes back after a reload.
- **Changing a power-up's kind** (as Freeze went from disadvantage to advantage): change it in
  `powerUps.tsx` and in `POWER_UP_KINDS`, and update the tests that used it as the other kind.
- **Check it end to end:** start `PORT=3101 node server.js` and drive it with a `socket.io-client`
  script (admin + 3 guests): a disadvantage before the shield, the shield, one after it, and the
  rejections. Stop that server by its PID only: the user may have their own one running.
- **Keep the rules:** once per game and one per question still apply.
