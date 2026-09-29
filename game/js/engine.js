/* Histormania run engine — pure state, no DOM.
 * Rules ported from plot/player.html choose():
 *  - fatal choice: jump to its `next` (a death ending), hearts untouched
 *  - otherwise apply heartsDelta, clamped to 0..maxHearts
 *  - hearts hitting 0 overrides the choice's `next` with heartsDepletedNode
 *  - the choice's consequence is shown on arrival, even when redirected
 * A run is plain JSON so it can be autosaved as-is. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HMEngine = factory();
})(this, function () {
  "use strict";

  function hasOwn(obj, key) { return obj != null && Object.prototype.hasOwnProperty.call(obj, key); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function node(path, id) { return hasOwn(path.nodes, id) ? path.nodes[id] : null; }

  function newRun(path) {
    var start = node(path, path.startNode);
    return {
      pathId: path.id,
      nodeId: path.startNode,
      hearts: clamp(path.startingHearts, 0, path.maxHearts),
      consequence: null,
      lastDelta: 0,
      endingReason: null,
      choicesMade: 0,
      age: start && hasOwn(start, "age") ? start.age : null,
      image: (start && start.image) || null,
      revealShown: false,
      history: []
    };
  }

  function snapshot(run) {
    var s = {};
    Object.keys(run).forEach(function (k) { if (k !== "history") s[k] = run[k]; });
    return s;
  }

  function currentNode(path, run) { return node(path, run.nodeId); }
  function isEnding(path, run) { var n = currentNode(path, run); return !!(n && n.ending); }

  // Mutates and returns `run`.
  function choose(path, run, index) {
    var cur = currentNode(path, run);
    if (!cur || cur.ending || !Array.isArray(cur.choices)) return run;
    var c = cur.choices[index];
    if (!c) return run;

    run.history.push(snapshot(run));
    run.consequence = c.consequence || null;
    run.revealShown = false;
    run.choicesMade += 1;

    if (c.fatal) {
      run.lastDelta = 0;
      run.nodeId = hasOwn(path.nodes, c.next) ? c.next : run.nodeId;
      run.endingReason = "fatal";
    } else {
      var delta = hasOwn(c, "heartsDelta") ? c.heartsDelta : 0;
      var before = run.hearts;
      run.hearts = clamp(before + delta, 0, path.maxHearts);
      run.lastDelta = run.hearts - before;
      if (run.hearts <= 0) {
        run.nodeId = path.heartsDepletedNode;
        run.endingReason = "hearts";
      } else {
        run.nodeId = hasOwn(path.nodes, c.next) ? c.next : run.nodeId;
        run.endingReason = isEnding(path, run) ? "node" : null;
      }
    }

    // Display fields: age and image carry over until a node sets a new one.
    var arrived = currentNode(path, run);
    if (arrived && hasOwn(arrived, "age")) run.age = arrived.age;
    if (arrived && arrived.image) run.image = arrived.image;
    return run;
  }

  function undo(run) {
    if (!run.history.length) return run;
    var snap = run.history.pop();
    Object.keys(snap).forEach(function (k) { run[k] = snap[k]; });
    run.lastDelta = 0;
    return run;
  }

  function endingIds(path) {
    return Object.keys(path.nodes).filter(function (id) { return path.nodes[id].ending; });
  }

  return {
    newRun: newRun, choose: choose, undo: undo,
    currentNode: currentNode, isEnding: isEnding, endingIds: endingIds
  };
});
