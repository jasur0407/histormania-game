# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the **content/narrative-design layer** for Histormania, a 2D
branching-story game for desktop browsers, published on itch.io (like "Choice of
Life," but every path is set in a real historical period). The target platform
changed from mobile/Android to **desktop only**. There is no application code
here: this directory holds the game design rules and the path content data
that the game engine in `../game/` consumes. It is not a git repository.

- `GAME_DESIGN.md` — the authoritative ruleset for how paths must be built:
  hearts economy, choice-writing rules (critically: choices must never
  telegraph which option is "safe" vs. "risky"), character archetypes, tone/
  prose style, and path structure conventions. Read this before writing or
  editing any path content.
- `path.schema.json` — the JSON Schema that every path content file must
  validate against (path → node → choice shape, hearts deltas, ending
  types).
- `player.html` — a self-contained HTML/JS player **and validator**. It's
  the closest thing this repo has to a test suite: it structurally
  validates a path on load (unresolvable `next`s, wrong choice counts,
  missing `heartsDepletedNode`, `twist` without `revealedIdentity`,
  unreachable/dead-end nodes, lopsided choice-pair word counts, etc.) before
  letting you play it. **Run any new or edited path through this before
  treating the content as done.** Open it via a local server
  (`python -m http.server` from this folder, then visit
  `player.html`) to auto-load `paths/varangian_guard.json`, or just
  double-click the file and use the drag/drop-or-paste loader — `fetch()`
  can't read sibling files over `file://`, so that fallback is intentional,
  not a bug.
- `paths/` — actual path content files (one JSON per path, e.g.
  `varangian_guard.json`), each conforming to `path.schema.json`.
- `choice of life.html` — a Twine/Harlowe export of the original "Choice of
  Life" game, kept purely as a tone/format reference (blunt second-person
  prose, dark deadpan humor, terse `[[Choice text->Target]]` links). Do not
  treat its mechanics (no hearts, very long single life) as the target
  design — `GAME_DESIGN.md` supersedes it.

## The playable game (`../game/`)

The itch.io-ready HTML5 game lives one level up, in `../game/` (vanilla
HTML/CSS/JS, no framework). It does not read `paths/*.json` at runtime:
`node tools/build.mjs` (run from the repo root) validates the paths listed in
`tools/build.config.mjs`, bundles them into `game/js/paths.generated.js`,
records which art/audio files exist, and zips `dist/histormania.zip`.
`node tools/simulate.mjs` plays every choice sequence of each path to check
that it terminates, that every ending is reachable, and the ending odds.
Rebuild after any edit to a path or after adding images. Image prompts
are in `game/ART_PROMPTS.md`. `varangian_guard.json` is deliberately not
in the build list.

Neither tool touches `player.html`, which remains the self-contained
authoring player/validator for this folder.

## Content architecture

A **path** is one self-contained playthrough: one historical era, one
player character with a fixed personality archetype, a small starting pool
of hearts, and a directed graph of **nodes** (short narration beats) each
offering exactly **2 choices** until an ending node is reached. Paths are
independent of each other — nothing carries over between them.

Key rules to hold in mind when generating or editing path content (full
detail in `GAME_DESIGN.md`):
- Hearts reaching 0 always routes to the path's `heartsDepletedNode`,
  **overriding whatever `next` the triggering choice named** — even a
  choice nominally headed to a good ending. Only some choices carry a
  `heartsDelta`, and the narration never states the number directly — it
  describes what happened (that goes in `choice.consequence`, rendered on
  arrival at the destination node).
- `fatal: true` on a choice routes straight to its (death-ending) `next` and
  skips heart arithmetic entirely; it's mutually exclusive with
  `heartsDelta` and should appear at most once per path.
- Choice text (2-6 words) must not be pattern-matchable as safe vs. risky;
  rotate which slot (first/second) carries the risk.
- One fixed archetype per path character (playful / serious / fearful /
  neutral / passionate / ambitious / hardworking) — it colors voice, not
  which option is objectively correct.
- Node text stays to 1-4 short lines; split longer beats into multiple
  nodes rather than writing a paragraph.
- Protagonists aren't always ordinary/anonymous — a path can openly star a
  notable figure (a young king), or conceal the character's true identity
  and reveal it only at a specific ending as a twist payoff (see
  `GAME_DESIGN.md` §5a and the `character.trueIdentity` /
  node `twist` + `revealedIdentity` fields in `path.schema.json`). Use the
  hidden-identity twist sparingly — most paths still play it straight.

## Note on the sibling instructions file

`C:\Users\abdux\Documents\Repositories\histormania_mobile\Histormania instructions.md`
(one directory up) describes a different, more elaborate design (coins
currency, checkpoint/reconvergence branching, chapters with autosave, etc.).
That direction was explicitly rejected — **do not use it**. `GAME_DESIGN.md`
in this repo is the sole source of truth for game rules.
