/* Histormania path validator.
 * Port of validate() from plot/player.html, extended with the optional
 * display fields (path.cover, node.age, node.image, ending node.title).
 * UMD: usable from the browser (window.HMValidate) and from Node (require). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HMValidate = factory();
})(this, function () {
  "use strict";

  var ARCHETYPES = ["playful", "serious", "fearful", "neutral", "passionate", "ambitious", "hardworking"];
  var ENDING_TYPES = ["good", "neutral", "bad", "death"];
  var ID_RE = /^[a-z0-9_]+$/;
  var UNSAFE_KEYS = { "__proto__": 1, "constructor": 1, "prototype": 1 };
  var PATH_KEYS = ["$schema", "id", "title", "era", "cover", "contentWarnings", "character", "startingHearts",
    "maxHearts", "startNode", "heartsDepletedNode", "nodes"];
  var NODE_KEYS = ["text", "ending", "endingType", "twist", "revealedIdentity", "choices", "age", "image", "title"];
  var CHOICE_KEYS = ["id", "text", "next", "consequence", "heartsDelta", "fatal"];

  function hasOwn(obj, key) { return obj != null && Object.prototype.hasOwnProperty.call(obj, key); }
  function wordCount(s) { return String(s || "").trim().split(/\s+/).filter(Boolean).length; }

  function validate(raw) {
    var errors = [], warnings = [];
    function err(code, message, where) { errors.push({ code: code, severity: "error", message: message, where: where || {} }); }
    function warn(code, message, where) { warnings.push({ code: code, severity: "warning", message: message, where: where || {} }); }
    function unknownKeys(obj, allowed, label, where) {
      Object.keys(obj).forEach(function (k) {
        if (allowed.indexOf(k) === -1) warn("W020", label + " has unknown field '" + k + "' (typo?).", where);
      });
    }

    if (!raw || typeof raw !== "object") { err("E000", "Path is not a JSON object."); return { errors: errors, warnings: warnings, stats: {} }; }

    ["id", "title", "era", "character", "startingHearts", "maxHearts", "startNode", "heartsDepletedNode", "nodes"].forEach(function (f) {
      if (!hasOwn(raw, f)) err("E002", "Missing required top-level field '" + f + "'.");
    });
    unknownKeys(raw, PATH_KEYS, "Path");
    if (raw.id != null && !ID_RE.test(raw.id)) err("E003", "Path id '" + raw.id + "' must match ^[a-z0-9_]+$.");
    if (raw.cover != null && (typeof raw.cover !== "string" || !ID_RE.test(raw.cover))) err("E040", "cover must be an image key matching ^[a-z0-9_]+$.");
    if (raw.character) {
      if (raw.character.archetype && ARCHETYPES.indexOf(raw.character.archetype) === -1) {
        err("E004", "character.archetype '" + raw.character.archetype + "' is not one of: " + ARCHETYPES.join(", ") + ".");
      }
      if (!raw.character.name) err("E004b", "character.name is required.");
      if (!raw.character.role) err("E004c", "character.role is required.");
    }
    ["startingHearts", "maxHearts"].forEach(function (f) {
      var v = raw[f];
      if (v != null && (!Number.isInteger(v) || v < 1 || v > 10)) err("E005", "'" + f + "' must be an integer 1..10.");
    });
    if (Number.isInteger(raw.startingHearts) && Number.isInteger(raw.maxHearts) && raw.startingHearts > raw.maxHearts) {
      err("E006", "startingHearts (" + raw.startingHearts + ") exceeds maxHearts (" + raw.maxHearts + ").");
    }

    var nodes = (raw.nodes && typeof raw.nodes === "object") ? raw.nodes : null;
    if (!nodes) { err("E011", "'nodes' is missing or not an object."); return { errors: errors, warnings: warnings, stats: {} }; }
    var nodeIds = Object.keys(nodes).filter(function (k) { return hasOwn(nodes, k); });
    if (nodeIds.length === 0) err("E011", "'nodes' is empty.");

    nodeIds.forEach(function (id) {
      if (UNSAFE_KEYS[id]) err("E012", "Node key '" + id + "' is an unsafe reserved word and must be renamed.", { nodeId: id });
      else if (!ID_RE.test(id)) err("E012", "Node key '" + id + "' must match ^[a-z0-9_]+$.", { nodeId: id });
    });

    if (raw.startNode != null && !hasOwn(nodes, raw.startNode)) err("E007", "startNode '" + raw.startNode + "' is not a key in nodes.");
    if (raw.heartsDepletedNode != null) {
      if (!hasOwn(nodes, raw.heartsDepletedNode)) {
        err("E009", "heartsDepletedNode '" + raw.heartsDepletedNode + "' is not a key in nodes.");
      } else {
        var hn = nodes[raw.heartsDepletedNode];
        if (!hn.ending || hn.endingType !== "death") {
          err("E010", "heartsDepletedNode '" + raw.heartsDepletedNode + "' must be an ending node with endingType \"death\".", { nodeId: raw.heartsDepletedNode });
        }
      }
    }
    if (raw.startNode != null && hasOwn(nodes, raw.startNode) && nodes[raw.startNode].ending) {
      err("E008", "startNode '" + raw.startNode + "' is an ending node — a path can't start already finished.", { nodeId: raw.startNode });
    }

    var fatalCount = 0;
    var heartAffectingCount = 0;

    nodeIds.forEach(function (id) {
      var node = nodes[id];
      var where = { nodeId: id };
      if (!node || typeof node !== "object") { err("E020", "Node '" + id + "' is not an object.", where); return; }
      unknownKeys(node, NODE_KEYS, "Node '" + id + "'", where);
      if (typeof node.text !== "string" || !node.text.trim()) err("E020", "Node '" + id + "' has missing/empty text.", where);
      if (hasOwn(node, "age") && (!Number.isInteger(node.age) || node.age < 0 || node.age > 150)) {
        err("E041", "Node '" + id + "' age must be an integer 0..150.", where);
      }
      if (hasOwn(node, "image") && (typeof node.image !== "string" || !ID_RE.test(node.image))) {
        err("E042", "Node '" + id + "' image must be a key matching ^[a-z0-9_]+$.", where);
      }

      var isEnding = node.ending === true;
      if (isEnding) {
        if (!node.endingType || ENDING_TYPES.indexOf(node.endingType) === -1) {
          err("E023", "Ending node '" + id + "' has missing/invalid endingType.", where);
        }
        if (hasOwn(node, "choices")) err("E022", "Ending node '" + id + "' must not have choices.", where);
        if (node.twist === true && !node.revealedIdentity) {
          err("E025", "Node '" + id + "' has twist:true but no revealedIdentity.", where);
        }
        if (hasOwn(node, "revealedIdentity") && node.twist !== true) {
          err("E026", "Node '" + id + "' has revealedIdentity without twist:true.", where);
        }
        if (!node.title) warn("W021", "Ending '" + id + "' has no title — the endings gallery will show its type instead.", where);
      } else {
        if (hasOwn(node, "endingType") || hasOwn(node, "twist") || hasOwn(node, "revealedIdentity") || hasOwn(node, "title")) {
          err("E024", "Non-ending node '" + id + "' must not carry endingType/twist/revealedIdentity/title.", where);
        }
        var choices = node.choices;
        if (!Array.isArray(choices) || choices.length !== 2) {
          err("E021", "Non-ending node '" + id + "' must have exactly 2 choices (found " +
            (Array.isArray(choices) ? choices.length : "none") + ").", where);
        } else {
          var seenIds = {};
          choices.forEach(function (c, idx) {
            var cwhere = { nodeId: id, choiceId: c && c.id };
            if (!c || typeof c !== "object") { err("E030", "Choice #" + idx + " on '" + id + "' is not an object.", cwhere); return; }
            unknownKeys(c, CHOICE_KEYS, "Choice '" + id + "." + c.id + "'", cwhere);
            if (!c.id || !c.text || !c.next) err("E030", "Choice on '" + id + "' is missing id/text/next.", cwhere);
            if (c.id) {
              if (seenIds[c.id]) err("E032", "Duplicate choice id '" + c.id + "' on node '" + id + "'.", cwhere);
              seenIds[c.id] = true;
            }
            if (c.next != null && !hasOwn(nodes, c.next)) {
              err("E031", "Choice '" + id + "." + c.id + "' points to next '" + c.next + "', which doesn't exist.", cwhere);
            }
            if (hasOwn(c, "heartsDelta")) {
              heartAffectingCount++;
              if (!Number.isInteger(c.heartsDelta) || c.heartsDelta < -3 || c.heartsDelta > 1) {
                err("E033", "heartsDelta on '" + id + "." + c.id + "' must be an integer -3..1.", cwhere);
              }
            }
            if (c.fatal === true) {
              fatalCount++;
              if (hasOwn(c, "heartsDelta")) err("E034", "Choice '" + id + "." + c.id + "' has fatal:true and heartsDelta together.", cwhere);
              if (c.next && hasOwn(nodes, c.next)) {
                var tgt = nodes[c.next];
                if (!tgt.ending || tgt.endingType !== "death") {
                  err("E035", "fatal choice '" + id + "." + c.id + "' must target a death ending (got '" + c.next + "').", cwhere);
                }
              }
            }
            if (c.next === id) warn("W013", "Choice '" + id + "." + c.id + "' loops back to its own node.", cwhere);
            if (c.text && (wordCount(c.text) < 2 || wordCount(c.text) > 6)) {
              warn("W015", "Choice text on '" + id + "." + c.id + "' is " + wordCount(c.text) + " words (guideline: 2-6).", cwhere);
            }
            if (c.consequence && c.consequence.length > 200) {
              warn("W016", "consequence on '" + id + "." + c.id + "' exceeds 200 chars.", cwhere);
            }
          });
          if (choices[0] && choices[1] && choices[0].text && choices[1].text) {
            var wa = wordCount(choices[0].text), wb = wordCount(choices[1].text);
            if (wa > 0 && wb > 0 && (wa / wb >= 2.5 || wb / wa >= 2.5)) {
              warn("W008", "Choices on '" + id + "' have very unbalanced length (" + wa + " vs " + wb + " words) — this can telegraph which is 'safer'. See GAME_DESIGN.md §4.", where);
            }
          }
        }
      }
      if (node.text && node.text.length > 260) warn("W012", "Node '" + id + "' text is long (" + node.text.length + " chars) — consider splitting into two nodes.", where);
    });

    if (fatalCount > 1) warn("W017", "Path has " + fatalCount + " fatal choices — GAME_DESIGN.md §3 recommends at most 1 per path.");

    // Reachability: BFS rooted at startNode AND heartsDepletedNode (the latter is reached
    // structurally via hearts hitting 0, never via a choice's `next`).
    if (raw.startNode && raw.heartsDepletedNode) {
      var seen = {};
      var queue = [];
      [raw.startNode, raw.heartsDepletedNode].forEach(function (id) {
        if (hasOwn(nodes, id) && !seen[id]) { seen[id] = true; queue.push(id); }
      });
      while (queue.length) {
        var cur = queue.shift();
        var n = nodes[cur];
        if (n && Array.isArray(n.choices)) {
          n.choices.forEach(function (c) {
            if (c && c.next && hasOwn(nodes, c.next) && !seen[c.next]) { seen[c.next] = true; queue.push(c.next); }
          });
        }
      }
      nodeIds.forEach(function (id) {
        if (!seen[id]) warn("W010", "Node '" + id + "' is unreachable from startNode or heartsDepletedNode.", { nodeId: id });
      });

      var canReachEnding = {};
      var changed = true;
      while (changed) {
        changed = false;
        nodeIds.forEach(function (id) {
          if (canReachEnding[id]) return;
          var n = nodes[id];
          if (!n) return;
          if (n.ending) { canReachEnding[id] = true; changed = true; return; }
          if (Array.isArray(n.choices) && n.choices.some(function (c) { return c && hasOwn(nodes, c.next) && canReachEnding[c.next]; })) {
            canReachEnding[id] = true; changed = true;
          }
        });
      }
      nodeIds.forEach(function (id) {
        if (seen[id] && !canReachEnding[id]) err("E028", "No ending is reachable from node '" + id + "' (dead end / closed loop).", { nodeId: id });
      });
    }

    var endingCount = nodeIds.filter(function (id) { return nodes[id] && nodes[id].ending; }).length;
    if (nodeIds.length < 12 || nodeIds.length > 25) warn("G01", "Node count is " + nodeIds.length + " (guideline: 12-25).");
    if (endingCount < 3 || endingCount > 6) warn("G02", "Distinct endings: " + endingCount + " (guideline: 3-6).");
    if (heartAffectingCount < 3 || heartAffectingCount > 14) warn("G03", "Heart-affecting choices: " + heartAffectingCount + " across all branches (guideline: 3-6 per playthrough).");

    var stats = {
      nodes: nodeIds.length,
      endings: endingCount,
      twistEndings: nodeIds.filter(function (id) { return nodes[id] && nodes[id].twist; }).length,
      heartAffectingChoices: heartAffectingCount,
      fatalChoices: fatalCount
    };
    return { errors: errors, warnings: warnings, stats: stats };
  }

  return { validate: validate, ARCHETYPES: ARCHETYPES, ENDING_TYPES: ENDING_TYPES };
});
