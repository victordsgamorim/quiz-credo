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

Because a shield can block a disadvantage that came before it, the effects of Steal and Freeze
(still to come, see below) must only count as final once the question is over, or be undone when
the target's shield shows up.

**Animation:** a force field of hexagons closing in from the edges of the screen, two energy rings,
and a glow along the edges.

### Steal (disadvantage)

> "Rouba pontos de um adversário"

The player picks another player to steal points from. If the target has the shield on that
question, the steal is blocked.

**Animation:** coins flying in from all around the screen to a magnet.

**Effect:** how many points it steals isn't defined yet. For now, the server records who stole
from whom and whether the shield blocked it, and both players are told the outcome.

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
| It hit                         | "Bia usou Roubar em você!"           | "Roubar acertou Ana!"                 |
| The target's shield blocked it | "Seu escudo bloqueou Roubar de Bia!" | "O escudo de Ana bloqueou seu Roubar" |

A blocked disadvantage shows the shield's emblem; one that hit shows its own emblem. If the target's
shield comes after the disadvantage, both players get a second toast saying it was blocked.

The other players aren't told about disadvantages they aren't part of. A player can't see in
advance who has a shield up.

## How it works

### Client

| File                                          | What it does                                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/quiz/powerUps.tsx`            | The catalog: each power-up's id, kind (`boost` or `attack`), colors and art        |
| `src/components/quiz/PowerUpBar.tsx`          | The emblems, turning the disadvantages off when nobody can be picked               |
| `src/components/quiz/PowerUpTargetPicker.tsx` | The list of players a disadvantage is used on                                      |
| `src/components/quiz/usePowerUpNotices.tsx`   | The toasts telling how each disadvantage turned out                                |
| `src/components/quiz/GameScreen.tsx`          | Opens the list for a disadvantage, uses an advantage at once                       |
| `src/hooks/useQuiz.ts`                        | `spendPowerUp(id, targetId?)` keeps the rules and sends the power-up to the server |
| `src/hooks/useSocket.ts`                      | `sendPowerUp` and the `powerUpOutcomes` received from the server                   |
| `src/pages/Index.tsx`                         | Builds the list of players from the room's devices                                 |

### Server (`quiz-credo-server/server.js`)

- **`use-power-up`** (client to server): `{ channelId, powerUpId, targetDeviceId? }`. The server
  rejects it, and logs why, when:
  - the power-up is unknown;
  - the device isn't a player;
  - the question is closed (answered, or time is up);
  - the power-up was already used in this game, or another one on this question;
  - for a disadvantage, the target isn't another player of the game.
- **`power-up-outcome`** (server to the attacker and the target):
  `{ questionIndex, powerUpId, attacker: { id, name }, target: { id, name }, isBlocked }`. It is
  sent when a disadvantage is used, and sent again, with `isBlocked: true`, for each earlier
  disadvantage when the target then uses the shield.
- **`isAttackBlocked(powerUps, attack)`** is the shield rule: it's true when the target used the
  shield on the same question. The effects of Steal and Freeze must check it before they apply.
- The used power-ups are kept in `channel.gameState.powerUps`, and emptied on every new game
  (`load-questions`) and on `reset-game`.

The power-up ids and kinds (`POWER_UP_KINDS` in `server.js`) must match the catalog in
`powerUps.tsx`.

## Adding a power-up

Use the `power-up-creator` skill (`/power-up-creator`): it walks through the art, the animation,
the strings, the tests and the checks.
