# Histormania — Game Design Doc (Plot/Content Layer)

Working title placeholder. This doc defines how "paths" (historical playthroughs)
are built: structure, hearts economy, character rules, and writing style. It is
the contract that every path's JSON content must follow.

Reference for tone/mechanics comparison: `choice of life.html` (Twine/Harlowe
export of "Choice of Life"). We borrow its narrative voice and branching feel,
but NOT its length or its lack of stakes — our paths are shorter, and hearts
make choices matter.

---

## 1. Core concept

- The player is dropped into one **path**: a specific person, in a specific
  historical moment, for a relatively short branching story (not a full
  cradle-to-grave life like Choice of Life).
- Many paths exist across eras, regions, and social classes. Replayability
  comes from breadth (pick a different path) and from branching within a path
  (different choices → different scenes → different endings), not from
  path length.
- Every path is self-contained: its own character, its own hearts pool, its
  own endings. Nothing carries over between paths (no meta-currency yet — out
  of scope for this doc).

## 2. Structure: Path → Node → Choice

- **Path**: one playable scenario. Has a title, an era/setting, a main
  character, a starting heart count, a start node, and a set of nodes.
- **Node**: one scene/beat of narration. Has display text and either:
  - exactly **2 choices** (the standard case — always 2, never 1 or 3+), or
  - no choices, meaning it's an **ending**.
- **Choice**: short player-facing action text, a target node, and an optional
  heart delta. Most choices do NOT touch hearts — only *some* decisions are
  flagged as consequential (see §3).

Target path size: **12–25 nodes**, with **3–6 heart-affecting decision
points** and **3–6 distinct endings**. Shorter than a Choice of Life full
life; long enough to feel like a real arc with a beginning, a turn, and a
consequence.

## 3. The hearts system

- Each path starts with a small pool of hearts (default **5**, tunable per
  path — a path about a soldier in a siege might reasonably start at 3; a
  path about a merchant's apprentice might start at 5). `startingHearts`
  must not exceed `maxHearts`.
- Only *some* choices carry a heart delta (`-3 … +1` range; positive
  deltas are rarer and smaller than negative ones — this is a survival
  pressure, not a scoring game). A positive delta clamps at `maxHearts`.
- Every path names a `heartsDepletedNode`: a specific ending node
  (`endingType: "death"`) that the engine routes to the instant hearts hit
  0. **This overrides the triggering choice's own `next`, unconditionally**
  — even if that `next` pointed at a good ending. A choice that drops the
  player to 0 hearts always ends the path in the depleted-hearts death,
  never wherever the choice was nominally headed. Keep this in mind when
  placing negative deltas: a `-2` at 2 hearts remaining preempts whatever
  scene was supposed to come next.
- Hearts are invisible-ish in-fiction: the UI shows the heart meter, but the
  *narration* never says "you lose 1 heart." It describes what happened
  (a flogging, a fever, a public humiliation) and the meter just moves. The
  fiction and the number are separate layers. See `choice.consequence` in
  §7 — this is where that aftermath line lives.
- A choice may also be flagged **fatal**: it routes straight to its `next`
  (which must itself be an ending node with `endingType: "death"`) and
  skips heart arithmetic entirely — the meter doesn't move, win or lose.
  `fatal` and `heartsDelta` are mutually exclusive on the same choice. Use
  fatal **rarely — at most one per path** and reserve it for a genuinely
  reckless/absurd option, mirroring the dark humor of the reference
  material (e.g. mouthing off to an executioner). Overusing it turns the
  hearts system into decoration.
- Hearts-remaining-gated ending *variants* (e.g. "barely scraped by" vs.
  "thrived" text for the same outcome node) are a **future idea, not yet
  supported** by `path.schema.json` or `player.html` — see §9. Don't author
  against it yet.

## 4. Choice design rules (the hard part)

This is the single most important craft rule in the whole doc:

> **Choices must not visibly telegraph "safe" vs. "risky."** The player
> should not be able to pattern-match the UI (word length, phrasing tone,
> position) to guess which option is the trap.

Guidelines:
- Never phrase one option as obviously cautious and the other as obviously
  reckless. Both should sound like reasonable things a person in that moment
  might do.
- Rotate which position (first/second) carries the risk — don't let players
  learn "the second option is always the safe one."
- The "convenient"-sounding choice should sometimes be the wrong one, and
  the unappealing/boring-sounding choice should sometimes be correct — this
  mirrors real historical uncertainty (deference to authority looks safe and
  isn't; defiance looks risky and sometimes pays off).
- Ground risk in the character's situation, not in genre-savvy meta-cues.
  A blacksmith's apprentice sassing a noble should feel period-plausible,
  not flagged with ominous language.
- Avoid moralizing tells ("but that would be wrong...") — let consequences
  speak, not the prose leading up to the choice.

## 5. Characters

- Every path has exactly one player-character with a **fixed personality
  archetype** that stays consistent across all of that path's nodes —
  narration voice, available choice phrasing, and reactions should all read
  as coming from the same person.
- Archetype list (draw from this pool across paths for variety; a given path
  picks one):
  - **Playful** — treats danger like a game, quips even under pressure
  - **Serious** — measured, duty-first, rarely jokes
  - **Fearful** — hyperaware of risk, prone to freezing or over-caution
  - **Neutral** — pragmatic everyman, reacts plainly, least stylized voice
  - **Passionate** — driven by conviction/emotion, impulsive under pressure
  - **Ambitious** — always calculating the angle, status-conscious
  - **Hardworking** — grounded in labor/duty, distrusts shortcuts
- Secondary NPCs (king, priest, neighbor, commanding officer, etc.) should
  also stay consistent within a path, but don't need the full archetype
  treatment — a line or two of flavor is enough.
- Archetype should color *how* a choice is offered, not *which* choice is
  correct — a Fearful character still has real risky options, just phrased
  through their lens (e.g. hesitation, bargaining) rather than confidence.

### 5a. Character scope & twist reveals

Not every protagonist has to be an anonymous commoner. Vary the *scope* of
who the player plays across paths:

- **Ordinary person** — a baker's son, an exam candidate, a conscript.
  The bread-and-butter case, and still most paths.
- **Openly notable figure** — the player knowingly plays someone with real
  stakes from the outset (a young monarch, a general early in their career).
  No mystery here — the drama is in the decisions, not the identity.
- **Hidden-identity twist** — the character's true identity or eventual
  fate is concealed for the whole path and only revealed at specific
  ending(s), recontextualizing everything the player just did. Example: the
  player spends the path as a struggling, anonymous-seeming writer, and a
  good ending reveals "Congratulations — you were [famous historical
  figure], and unlike in real history, you dodged the illness that killed
  them and lived to become king."

Rules for the twist-reveal case:
- Use it **sparingly** — if every path ends with "surprise, you were
  actually famous," the twist stops being a twist. A small minority of
  paths, not the default.
- The reveal is a **payoff for a specific ending** (often the best one, but
  not required to be — a twist can also land on a bittersweet or bad
  ending), not something spoiled mid-path. Nodes before the reveal should
  read exactly as they would for an anonymous character — no wink-nudge
  foreshadowing that breaks the surprise.
- The path still has to work as a real dilemma-driven story on its own
  terms; the twist is a bonus gut-punch at the end, not a substitute for
  the choices mattering along the way.
- Diverging from a real figure's actual historical fate (dying young,
  losing a war, etc.) is fair game and encouraged for a triumphant ending —
  this is a game, not a textbook — but keep the divergence clearly framed
  as "what if," not stated as real history.
- See `path.schema.json`: `character.trueIdentity` (author-facing, the
  intended reveal — not shown to the player during play) and a node's
  `twist` + `revealedIdentity` (the actual reveal text shown to the player
  at that specific ending).

## 6. Tone & prose style

Derived from `choice of life.html`:

- **Second person, present-tense feel.** "You..." not "The peasant..."
- **Blunt, short sentences.** No purple prose. One or two sentences of setup
  per node, occasionally a punchline sentence.
- **Dark comedy, deadpan delivery.** Historical hardship played straight but
  landing as absurd/funny (infant mortality, plague, feudal indignities) —
  never mean-spirited toward real historical suffering of a group; the humor
  targets absurd systems (bureaucracy, superstition, class), not victims.
- **Direct address / mock-congratulatory framing** works well for openers
  ("CONGRATULATIONS, YOU ARE BORN...") but shouldn't be the *only* opener
  pattern across paths — vary it so paths don't feel copy-pasted.
- **Historically flavored specificity beats generic fantasy vagueness.**
  Name real institutions, real hardships, real texture of the period (tithes,
  guild dues, conscription, quarantine) — this is what makes it "historical"
  rather than generic fairy-tale.
- Node text length: **1–4 short lines**. If a node needs a paragraph, split
  it into two nodes.
- Choice text: **2–6 words**, active verb first when possible ("Bribe the
  guard", "Report the theft"), matching the reference's terse link style.

## 7. Content format

Paths are authored as **JSON**, one file per path, validated against
`path.schema.json` (companion file in this folder). JSON was chosen over
Twine/Harlowe HTML because the game engine (../game/) needs to load path data
directly — Twine format is a good *reference for tone*, not a production
format.

See `path.schema.json` for the authoritative shape. Summary:

```
Path
├── id, title, era, cover?, contentWarnings[]
├── character { name, archetype, role, bio, trueIdentity? }
├── startingHearts, maxHearts
├── startNode
├── heartsDepletedNode          // death ending the engine jumps to at 0 hearts
└── nodes: { [nodeId]: Node }

Node
├── text
├── age?, image?                                             // display only; both carry over to later nodes
├── ending (bool, required)
├── title?                                                   // endings only: name in the endings gallery
├── endingType?  ("good" | "neutral" | "bad" | "death")     // required iff ending
├── twist?, revealedIdentity?                                // twist requires revealedIdentity; both forbidden on non-endings
└── choices?: [ { id, text, next, consequence?, heartsDelta?, fatal? } ]
    // exactly 2, required on non-endings, forbidden on endings
    // fatal and heartsDelta are mutually exclusive on the same choice
```

`choice.consequence` is the one-line aftermath of *that specific choice*,
shown above the destination node's text when the player arrives via that
edge — including when hearts-depletion redirects the arrival elsewhere. It
lives on the choice rather than the node because a reconverged-upon node
is reached by more than one edge, each with a different aftermath.

Display-only fields (used by the game in `../game/`, ignored by `player.html`):
- `cover` / node `image` — image *keys*, not file names. The game loads
  `game/assets/img/<pathId>/<key>.(webp|jpg|png)`; a missing file shows a
  flat placeholder, so content never waits on art.
- node `age` — the "life stage" clock borrowed from Choice of Life: shown in
  the HUD and as "Lived to" on the ending screen. It is a label, not a
  variable — nothing branches on it (§9 still holds).
- ending `title` — the ending's name in the endings gallery.

## 8. Era/path backlog (seed list for diversity)

Not commitments — a shortlist to keep future paths spread across time and
place instead of defaulting to medieval Europe every time:

| Era/Region | Possible character | Archetype fit |
|---|---|---|
| Ancient Rome, plebeian bread riot | Baker's son | Passionate |
| Song Dynasty China, civil exam system | Exam candidate | Ambitious |
| Mali Empire, Timbuktu trade caravan | Trader's apprentice | Hardworking |
| Aztec Empire, eve of conquest | Temple novice | Fearful |
| Ottoman Empire, Janissary recruit | Conscripted boy | Serious |
| Edo-period Japan, ronin | Disgraced samurai | Serious |
| Viking Age Scandinavia, raid crew | Young oarsman | Playful |
| Industrial Revolution Manchester | Mill worker | Hardworking |
| French Revolution Paris | Printer's assistant | Passionate |
| Cold War Berlin, wall construction | Border guard | Neutral |

## 9. Open items (not decided yet)

- **No flag/variable system in v1.** Branch state is expressed purely
  structurally (which nodes/choices you passed through) and via the hearts
  number — there is no hidden inventory, no arbitrary named variables. If a
  later path genuinely needs to remember something beyond hearts, that's a
  schema-design conversation, not something to hack in via node text.
- Whether hearts-remaining should ever unlock a "secret" best ending vs.
  just flavoring an existing one (`endingVariants` gated by a minimum
  heart count). Reserved as a future idea; not in `path.schema.json` or
  `player.html` yet — don't author against it.
- Whether some paths intersect (a choice in path A references path B) — 
  default assumption is **no**, paths stay fully independent for v1.
- Localization — English-first, structure should stay translation-friendly
  (no text baked into IDs).

## 10. Reference implementation

`player.html` (same folder) is a self-contained HTML/JS player that loads a
path JSON file, plays it, and — just as importantly — structurally
validates it on load (unresolvable `next`s, wrong choice counts, missing
`heartsDepletedNode`, `twist` without `revealedIdentity`, unreachable or
dead-ending nodes, choice-pair tells like lopsided word counts, etc.). It's
the closest thing this repo has to a test suite: run any new path through
it before treating the content as done. It is a tone/mechanics reference for
the real game engine in ../game/, not the production engine itself.
