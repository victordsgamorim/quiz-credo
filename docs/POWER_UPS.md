# Power-ups

Power-ups let the players of a room interact with each other during a question. There are 5 of
them, and every player who answers gets **3, picked at random for each player**, at the start of
each game (their "hand").

The numbers below are the **defaults**. Before a room's game the admin can change them in the
power-ups dialog (see "The admin's settings").

## The admin's settings

In the lobby, beside the game settings button (the gear), the admin has a power-ups button (the
sparkles). It opens a dialog of its own. At the top, **"Power-ups no jogo"** turns the power-ups
on or off for the whole game: off, they aren't part of the game at all. Nobody gets a hand, there
is no bar, the server refuses every use (`power_ups_off`), and the rest of the dialog is locked
until it's turned back on. With it on (the default), the dialog has:

| Setting                 | Default | Limits           | What it changes                                    |
| ----------------------- | ------- | ---------------- | -------------------------------------------------- |
| Power-ups per player    | 3       | 1 to 5           | The size of each player's hand                     |
| Each power-up on or off | all on  |                  | A power-up turned off is never dealt               |
| Frozen questions        | 2       | 1 to 5           | How many questions Freeze lasts for                |
| Points stolen           | 30      | 10 to 100, by 10 | The most Steal takes (never below zero, as always) |
| Bonus points            | 60      | 10 to 200, by 10 | What Bonus gives                                   |

- With fewer power-ups on than the hand size, each player gets all the ones that are on (the
  dialog says so). With none on, the game has no power-ups and no bar.
- The hints of the power-ups (in the dialog, on the bar's emblems and in the list of players) and
  the Bonus animation show the values set.
- "Restaurar Padrões" in this dialog only restores the power-ups; the one in the game settings
  leaves the power-ups as they are.
- The settings go to the server with the game settings (`gameSettings.powerUps`), so they can't be
  changed once the game started. The server checks them (`isValidPowerUpSettings`) and refuses
  settings out of the limits. Settings without `powerUps` (an older frontend) play with the
  defaults, and so does a standalone game.

## The rules for every power-up

- **A random hand.** Each player gets 3 of the 5 power-ups, picked at random for them, and shown
  in a random order, so the same power-up isn't always in the same spot of the bar. In a room's
  game the power-ups are spread over the players: each one is picked at random among those dealt
  the fewest times so far, so with 3 or more players no power-up is in everyone's hand (with 2
  players, 6 places for 5 power-ups, they share exactly one). A new game deals new hands. In a room's game
  the server deals it, and gives the same hand back after a page reload; a standalone game deals
  its own.
- **Once per game.** A used power-up stays off (gray) for the rest of the game. A new game gives
  them all back.
- **One per question.** Once a player uses a power-up on a question, their other power-ups wait for
  the next question.
- **Only while the question is open.** The power-ups are locked once the answer is shown or the time
  is up.
- **Up to the second-to-last question.** The power-ups don't work on the game's last question: the
  bar shows them all off, with a hint saying so ("Os poderes não valem na última pergunta"). An
  effect that started earlier still counts there (a Freeze used on the second-to-last question also
  covers the last one).
- **Only for the players who answer.** That means the guests, and the admin in debug mode. An admin
  who doesn't answer gets no power-ups.

In a room's game the realtime server checks every one of these rules again, so a player can't get
around them from their own device.

## The two kinds

| Kind                                       | Acts on                           | Picking a player                                | Power-ups             |
| ------------------------------------------ | --------------------------------- | ----------------------------------------------- | --------------------- |
| **Advantage** (vantagem, ventaja)          | The player who uses it            | None. It's used as soon as it's pressed         | Shield, Freeze, Bonus |
| **Disadvantage** (desvantagem, desventaja) | Another player of the room's game | Required. Pressing it opens the list of players | Steal, Break          |

### Advantages

An advantage helps the player who uses it, so there is nobody to pick. Pressing its emblem uses it
on the player and plays its animation over the whole screen.

### Disadvantages

A disadvantage is used against another player, so pressing its emblem opens the list of the other
players of the room's game:

- **Who is listed:** the guests, and the admin when debug mode lets them answer. The player never
  sees themselves in the list.
- **Picking a player** uses the disadvantage on them and plays its animation.
- **Closing the list** (the close button, Escape, or a tap outside) doesn't use it: it stays
  available.
- **The list closes on its own,** without using the disadvantage, once the answer is shown or the
  time is up. The list doesn't pause the countdown.
- **With nobody to pick** (a standalone game, or a player alone in the room), the disadvantages are
  off, and hovering one says another player is needed.

On phones the list is a sheet along the bottom of the screen; on wider screens it's a dialog.

## Each power-up

### Shield (advantage)

> "Protege você das desvantagens desta pergunta"

The shield protects the player from **every disadvantage used on them during the question it's used
on**, whether the disadvantage came **before or after** the shield:

| What happens on the question                                    | Result                                          |
| --------------------------------------------------------------- | ----------------------------------------------- |
| Ana uses the shield, then Bia uses Steal on Ana                 | Blocked: Steal has no effect                    |
| Bia uses Steal on Ana, then Ana uses the shield                 | Blocked too: Steal is undone                    |
| Bia and Caio both use Steal on Ana, Ana has the shield          | Both are blocked                                |
| Ana used the shield on question 2, Bia uses Steal on question 3 | Hit: the shield only lasts for its own question |

Because a shield can block a disadvantage that came before it, a steal it blocks afterwards is
undone: the target gets their points back (see Steal below).

**Animation:** a force field of hexagons closing in from the edges of the screen, two energy rings,
and a glow along the edges.

### Steal (disadvantage)

> "Rouba até 30 pontos de um adversário"

The player picks another player and takes points from them: the points leave the target's score
and go to the attacker's.

- **How many:** 30 points. If the target has less than 30, it takes everything they have, down to
  zero.
- **Never below zero:** a player's score never goes under 0 because of a steal.
- **The shield** blocks it: nothing is taken. If the shield comes after the steal, the steal is
  undone and the points go back to the target.

| Target's score | Points stolen | Target ends with |
| -------------- | ------------- | ---------------- |
| 120            | 30            | 90               |
| 30             | 30            | 0                |
| 12             | 12            | 0                |
| 0              | 0             | 0                |

Several players can steal from the same target on one question; each steal takes from what the
target has left. Example: Ana has 40. Bia steals 30 (Ana 10), then Caio steals the 10 left (Ana 0).

**Undoing in a chain:** the server works the scores out again, in order, whenever a shield undoes a
steal, so a later steal that depended on those points changes too. Example: Bia (0 points) steals
30 from Ana, then Caio steals those 30 from Bia. Ana then uses the shield: Bia's steal is undone,
so Bia had nothing for Caio to take, and Caio's steal becomes 0. Nobody ends below zero.

**Animation:** coins flying in from all around the screen to a magnet.

### Freeze (advantage)

> "Congela sua sequência por 2 perguntas: errar não zera"

Freeze protects the player's **streak** (the supercharge: the bar of correct answers in a row and
its multiplier). While it's frozen, a wrong answer **doesn't reset it**.

- **How long:** 2 questions, counting from the one it's used on: that question and the next one.
- **Wrong answer** on a frozen question: it earns 0 points, as always, and the streak stays exactly
  where it was.
- **Right answer** on a frozen question: it counts as usual, with the multiplier the player already
  had, and the streak grows as usual.
- **It doesn't give points.** Freeze only stops the streak from being reset; it adds no bonus.
- **After the 2 questions,** a wrong answer resets the streak again.
- It's an advantage, so it's used at once, with no player to pick, and it works in a standalone game
  too. No shield is involved.

Example, with the multiplier starting at 3 correct answers in a row:

| Question | Answer | Frozen            | Streak after it | Points (40 per question)   |
| -------- | ------ | ----------------- | --------------- | -------------------------- |
| 1–3      | right  | no                | 3               | 40 each                    |
| 4        | wrong  | yes (uses Freeze) | 3               | 0                          |
| 5        | wrong  | yes               | 3               | 0                          |
| 6        | right  | no                | 4               | 60 (x1.5, the streak kept) |

Without Freeze, question 4 would reset the streak to 0, and question 6 would be worth 40.

**On screen:** while it's frozen, the streak bar is covered in ice, its lightning icon turns into a
snowflake and its lightning stops, and hovering it says "Congelado: errar não zera a sequência".

**Animation:** frost creeping in from the corners, ice cracks, and falling snow.

### Bonus (advantage)

> "Ganha 60 pontos de bônus na hora"

The player gets **60 points** at once, added to their score as soon as they use it. That's all it
does.

- **Whatever the answer:** the 60 points stay even if the answer to that question is wrong.
- **No multiplier:** it's always 60, whatever the streak, and it doesn't change the streak.
- **It's an advantage,** so it's used at once, with no player to pick, and it works in a standalone
  game too.
- **Steal can take them:** once they're in the score, a later Steal takes from them like any other
  points.

**Animation:** "+60" rising over the emblem, in a burst of confetti.

### Break (disadvantage)

> "Zera a sequência e o multiplicador de um adversário"

The player picks another player and **resets their streak** (the supercharge): the correct answers
in a row go back to 0, and with them the multiplier.

- **From when:** the question it's used on. The target's answer to that question is worth x1, and
  their streak starts again from it: a right answer there makes it 1.
- **Points already earned stay.** Break takes no points; it only takes the multiplier away.
- **The shield** blocks it, before or after, like every disadvantage: the streak stays as it was.
- **Freeze doesn't stop it.** Freeze only keeps the streak through wrong answers; a Break still
  resets it.

Example, with the multiplier starting at 3 correct answers in a row, every answer right:

| Question | Bia (Ana used Break on her on question 4) | Caio (no Break) |
| -------- | ----------------------------------------- | --------------- |
| 1–3      | 40 each, streak 3                         | 40 each         |
| 4        | 40 (x1, the streak reset), streak 1       | 60 (x1.5)       |
| 5        | 40, streak 2                              | 80 (x2)         |
| 6        | 40, streak 3                              | 100 (x2.5)      |

**On screen:** the target's streak bar goes back to empty, and its next question is worth the plain
points.

**Animation:** the screen cracks from the middle like a smashed window, and pieces of the
lightning bolt fly out to the edges.

## What the players see

When a player uses a disadvantage, **only they** get a toast at the top of the screen, saying how
it turned out. The player it was used on gets **no toast**: not about the disadvantage, and not
about their shield blocking it (the user's decision). They only see its effect, such as their
score or their streak bar changing.

| Situation                      | The attacker sees                     |
| ------------------------------ | ------------------------------------- |
| A steal took points            | "Você roubou 30 pontos de Ana!"       |
| A steal found nothing to take  | "Ana não tinha pontos para roubar"    |
| A break reset the streak       | "Você quebrou a sequência de Ana!"    |
| The target's shield blocked it | "O escudo de Ana bloqueou seu Roubar" |

A blocked disadvantage shows the shield's emblem; one that hit shows its own emblem. Whenever an
outcome changes (the target's shield comes after it, or a steal takes other points after one was
undone), the attacker gets a new toast.

The score at the top of the screen, and the one on the results screen, include the points the
player stole and the points stolen from them.

The other players aren't told about disadvantages they aren't part of. A player can't see in
advance who has a shield up.

## How it works

### Client

| File                                           | What it does                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/components/quiz/powerUps.tsx`             | The catalog: each power-up's id, kind (`boost` or `attack`), colors and art          |
| `src/components/quiz/PowerUpBar.tsx`           | The emblems, turning the disadvantages off when nobody can be picked                 |
| `src/components/quiz/PowerUpTargetPicker.tsx`  | The list of players a disadvantage is used on                                        |
| `src/components/quiz/usePowerUpNotices.tsx`    | The toasts telling how each disadvantage turned out                                  |
| `src/types/powerUpSettings.ts`                 | The admin's settings: defaults, limits, `getPowerUpSettings`, `getEnabledPowerUps`   |
| `src/components/lobby/PowerUpSettingsCard.tsx` | The admin's power-ups dialog, opened from the lobby (`LobbyScreen`)                  |
| `src/components/quiz/usePowerUpSettings.ts`    | The settings for the game screen (`GameScreen` provides them) and the hints          |
| `src/lib/powerUpScore.ts`                      | `getStealBalance` (steals, added to the score)                                       |
| `src/lib/powerUpHand.ts`                       | `dealPowerUps`: the random power-ups of a standalone game                            |
| `src/lib/scoring.ts`                           | The streak rules, with `withoutFrozenMisses` (Freeze) and `sinceStreakBreak` (Break) |
| `src/components/quiz/GameScreen.tsx`           | Opens the list for a disadvantage, uses an advantage at once                         |
| `src/hooks/useQuiz.ts`                         | `spendPowerUp(id, targetId?)` keeps the rules and sends the power-up to the server   |
| `src/hooks/useSocket.ts`                       | `sendPowerUp` and the `powerUpOutcomes` received from the server                     |
| `src/pages/Index.tsx`                          | Builds the list of players from the room's devices                                   |

### Server (`quiz-credo-server/server.js`)

- **`use-power-up`** (client to server): `{ channelId, powerUpId, targetDeviceId? }`. The server
  rejects it, and logs why, when:
  - the power-up is unknown;
  - the device isn't a player;
  - the question is closed (answered, or time is up);
  - it's the game's last question (`last_question`);
  - the power-up isn't in the player's hand;
  - the power-up was already used in this game, or another one on this question;
  - for a disadvantage, the target isn't another player of the game.
- **`power-up-outcome`** (server to the attacker and the target):
  `{ questionIndex, powerUpId, attacker: { id, name }, target: { id, name }, isBlocked, points? }`,
  with `points` for a steal (the points it took). It is sent when a disadvantage is used, and sent
  again whenever it changes.
- **`power-up-hand`** (server to one player): `{ powerUpIds }`, the player's power-ups. Sent to
  every player when the game's questions load, and again when a player joins back mid-game.
  `dealPowerUps` picks `handSize` of the enabled ones with `crypto.randomInt`, among the power-ups
  dealt the fewest times in the room's game so far, and shuffles the hand.
- **`getPowerUpSettings(channel)`** gives the admin's power-up settings, or the defaults
  (`DEFAULT_POWER_UP_SETTINGS`, the same as `src/types/powerUpSettings.ts`; keep both in sync).
- **`isAttackBlocked(powerUps, attack)`** is the shield rule: it's true when the target used the
  shield on the same question.
- **`getFrozenQuestions(powerUps, deviceId, freezeQuestions)`** gives the questions a player's streak is frozen on,
  and `countStreakBefore` skips the misses on them when it works out the streak multiplier of an
  answer. The frontend does the same with `getFrozenQuestions` and `withoutFrozenMisses` in
  `src/lib/scoring.ts`, with the game's `freezeQuestions`.
- **`getStreakStart(powerUps, deviceId, questionIndex)`** gives the question a player's streak
  counts from: the last one a Break hit them on (not blocked by their shield). `countStreakBefore`
  doesn't look before it. The frontend does the same with `sinceStreakBreak`, from the Break
  outcomes it receives.
- **`replayScores(channel)`** works out every player's points by replaying the game's answers and
  steals in order: a steal takes the game's `stealPoints` (30 by default), or what the target has
  when that's less, and nothing when blocked. A bonus adds `bonusPoints` (60 by default) at the
  moment it was used. The rankings use it (`rankPlayers`, behind the live `ranking-update` and the
  final `calculateRanking`), so both count the bonuses and the steals: using a bonus or a steal
  sends the room a new live ranking at once.
- The used power-ups are kept in `channel.gameState.powerUps`, and emptied on every new game
  (`load-questions`) and on `reset-game`.

The power-up ids and kinds (`POWER_UP_KINDS` in `server.js`) must match the catalog in
`powerUps.tsx`.

## Adding a power-up

Use the `power-up-creator` skill (`/power-up-creator`): it walks through the art, the animation,
the strings, the tests and the checks.
