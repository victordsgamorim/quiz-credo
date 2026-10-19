# Power-ups

Power-ups let the players of a room interact with each other during a question. Every player who
answers gets the same set at the start of each game.

## The rules for every power-up

- **Once per game.** A used power-up stays off (gray) for the rest of the game. A new game gives
  them all back.
- **One per question.** Once a player uses a power-up on a question, their other power-ups wait for
  the next question.
- **Only while the question is open.** The power-ups are locked once the answer is shown or the time
  is up.
- **Only for the players who answer.** That means the guests, and the admin in debug mode. An admin
  who doesn't answer gets no power-ups.

In a room's game the realtime server checks every one of these rules again, so a player can't get
around them from their own device.

## The two kinds

| Kind                                       | Acts on                           | Picking a player                                | Power-ups     |
| ------------------------------------------ | --------------------------------- | ----------------------------------------------- | ------------- |
| **Advantage** (vantagem, ventaja)          | The player who uses it            | None. It's used as soon as it's pressed         | Shield        |
| **Disadvantage** (desvantagem, desventaja) | Another player of the room's game | Required. Pressing it opens the list of players | Steal, Freeze |

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
| Bia uses Steal and Caio uses Freeze on Ana, Ana has the shield  | Both are blocked                                |
| Ana used the shield on question 2, Bia uses Steal on question 3 | Hit: the shield only lasts for its own question |

Because a shield can block a disadvantage that came before it, a steal it blocks afterwards is
undone: the target gets their points back (see Steal below). The effect of Freeze, still to come,
must work the same way.

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

### Freeze (disadvantage)

> "Congela o tempo de um adversário"

The player picks another player to freeze. If the target has the shield on that question, the
freeze is blocked.

**Animation:** frost creeping in from the corners, ice cracks, and falling snow.

**Effect:** what freezing does (how long it lasts, and whether it blocks answering) isn't defined
yet. For now, as with Steal, the server records the outcome and tells both players.

## What the players see

When a disadvantage is used, the attacker and the target each get a toast at the top of the screen:

| Situation                      | Target sees                          | Attacker sees                         |
| ------------------------------ | ------------------------------------ | ------------------------------------- |
| It hit (Freeze)                | "Bia usou Congelar em você!"         | "Congelar acertou Ana!"               |
| A steal took points            | "Bia roubou 30 pontos de você!"      | "Você roubou 30 pontos de Ana!"       |
| A steal found nothing to take  | (nothing)                            | "Ana não tinha pontos para roubar"    |
| The target's shield blocked it | "Seu escudo bloqueou Roubar de Bia!" | "O escudo de Ana bloqueou seu Roubar" |

A blocked disadvantage shows the shield's emblem; one that hit shows its own emblem. Whenever an
outcome changes (the target's shield comes after it, or a steal takes other points after one was
undone), both players get a new toast.

The score at the top of the screen, and the one on the results screen, include the points the
player stole and the points stolen from them.

The other players aren't told about disadvantages they aren't part of. A player can't see in
advance who has a shield up.

## How it works

### Client

| File                                          | What it does                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/components/quiz/powerUps.tsx`            | The catalog: each power-up's id, kind (`boost` or `attack`), colors and art           |
| `src/components/quiz/PowerUpBar.tsx`          | The emblems, turning the disadvantages off when nobody can be picked                  |
| `src/components/quiz/PowerUpTargetPicker.tsx` | The list of players a disadvantage is used on                                         |
| `src/components/quiz/usePowerUpNotices.tsx`   | The toasts telling how each disadvantage turned out                                   |
| `src/lib/powerUpScore.ts`                     | `getStealBalance`: the points the player won and lost to steals, added to their score |
| `src/components/quiz/GameScreen.tsx`          | Opens the list for a disadvantage, uses an advantage at once                          |
| `src/hooks/useQuiz.ts`                        | `spendPowerUp(id, targetId?)` keeps the rules and sends the power-up to the server    |
| `src/hooks/useSocket.ts`                      | `sendPowerUp` and the `powerUpOutcomes` received from the server                      |
| `src/pages/Index.tsx`                         | Builds the list of players from the room's devices                                    |

### Server (`quiz-credo-server/server.js`)

- **`use-power-up`** (client to server): `{ channelId, powerUpId, targetDeviceId? }`. The server
  rejects it, and logs why, when:
  - the power-up is unknown;
  - the device isn't a player;
  - the question is closed (answered, or time is up);
  - the power-up was already used in this game, or another one on this question;
  - for a disadvantage, the target isn't another player of the game.
- **`power-up-outcome`** (server to the attacker and the target):
  `{ questionIndex, powerUpId, attacker: { id, name }, target: { id, name }, isBlocked, points? }`,
  with `points` for a steal (the points it took). It is sent when a disadvantage is used, and sent
  again whenever it changes.
- **`isAttackBlocked(powerUps, attack)`** is the shield rule: it's true when the target used the
  shield on the same question.
- **`replayScores(gameState)`** works out every player's points by replaying the game's answers and
  steals in order: a steal takes `STEAL_POINTS` (30), or what the target has when that's less, and
  nothing when blocked. The ranking (`calculateRanking`) uses it, so the final ranking counts the
  steals.
- The used power-ups are kept in `channel.gameState.powerUps`, and emptied on every new game
  (`load-questions`) and on `reset-game`.

The power-up ids and kinds (`POWER_UP_KINDS` in `server.js`) must match the catalog in
`powerUps.tsx`.

## Adding a power-up

Use the `power-up-creator` skill (`/power-up-creator`): it walks through the art, the animation,
the strings, the tests and the checks.
