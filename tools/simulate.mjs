// Exhaustively plays every choice sequence of each path through the real engine.
// Checks: every run terminates, every ending is reachable, 0 hearts always lands on
// heartsDepletedNode. Reports ending odds for a player picking 50/50 at random.
// Usage: node tools/simulate.mjs [pathId ...]   (default: all paths in the build list)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INCLUDE } from "./build.config.mjs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const Engine = require(join(ROOT, "game/js/engine.js"));

const MAX_DEPTH = 200;
let failed = false;

for (const id of process.argv.slice(2).length ? process.argv.slice(2) : INCLUDE) {
  const path = JSON.parse(readFileSync(join(ROOT, "plot/paths", id + ".json"), "utf8"));
  const odds = {};
  const heartDecisions = [];
  let runs = 0;

  function walk(run, prob, depth, heartNodes) {
    if (depth > MAX_DEPTH) { console.error(`  ✗ run exceeded ${MAX_DEPTH} steps at ${run.nodeId}`); failed = true; return; }
    const node = Engine.currentNode(path, run);
    if (node.ending) {
      runs++;
      odds[run.nodeId] = (odds[run.nodeId] || 0) + prob;
      heartDecisions.push(heartNodes);
      if (run.hearts <= 0 && run.nodeId !== path.heartsDepletedNode) {
        console.error(`  ✗ hearts at 0 but ended at ${run.nodeId}`); failed = true;
      }
      if (run.endingReason === "hearts" && run.nodeId !== path.heartsDepletedNode) {
        console.error(`  ✗ hearts ending routed to ${run.nodeId}`); failed = true;
      }
      return;
    }
    const touchesHearts = node.choices.some(c => c.heartsDelta);
    node.choices.forEach((_, i) => {
      const next = Engine.choose(path, structuredClone(run), i);
      walk(next, prob / node.choices.length, depth + 1, heartNodes + (touchesHearts ? 1 : 0));
    });
  }

  walk(Engine.newRun(path), 1, 0, 0);

  console.log(`\n${path.title} (${id}) — ${runs} distinct playthroughs`);
  for (const e of Engine.endingIds(path)) {
    const p = odds[e] || 0;
    const n = path.nodes[e];
    console.log(`  ${(p * 100).toFixed(1).padStart(5)}%  ${n.endingType.padEnd(7)} ${e}${n.title ? "  — " + n.title : ""}`);
    if (!p) { console.error(`  ✗ ending ${e} is never reached`); failed = true; }
  }
  const avg = heartDecisions.reduce((a, b) => a + b, 0) / heartDecisions.length;
  console.log(`  heart-affecting decisions per playthrough: ${Math.min(...heartDecisions)}–${Math.max(...heartDecisions)} (avg ${avg.toFixed(1)})`);
}

if (failed) { console.error("\nSimulation found problems."); process.exit(1); }
console.log("\nAll checks passed.");
