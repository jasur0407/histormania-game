/* Persistence. Every localStorage access is wrapped: private windows, blocked
 * storage or itch.io iframes without storage must never break the game. */
(function (root) {
  "use strict";
  var PREFIX = "histormania.v1.";

  function get(key, fallback) {
    try {
      var raw = root.localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function set(key, value) {
    try { root.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }
  function remove(key) {
    try { root.localStorage.removeItem(PREFIX + key); } catch (e) { /* storage unavailable */ }
  }

  var DEFAULT_SETTINGS = { sound: true, largeText: false };

  root.HMStorage = {
    settings: function () {
      var s = get("settings", {});
      var out = {};
      Object.keys(DEFAULT_SETTINGS).forEach(function (k) { out[k] = typeof s[k] === "boolean" ? s[k] : DEFAULT_SETTINGS[k]; });
      return out;
    },
    saveSettings: function (s) { set("settings", s); },

    // { [pathId]: { endings: { [nodeId]: true }, lives: number } }
    progress: function () { return get("progress", {}); },
    recordEnding: function (pathId, nodeId) {
      var p = get("progress", {});
      var entry = p[pathId] || { endings: {}, lives: 0 };
      var isNew = !entry.endings[nodeId];
      entry.endings[nodeId] = true;
      entry.lives = (entry.lives || 0) + 1;
      p[pathId] = entry;
      set("progress", p);
      return isNew;
    },

    // The run in progress: { pathId, run }
    savedRun: function () { return get("save", null); },
    saveRun: function (run) { set("save", { pathId: run.pathId, run: run }); },
    clearRun: function () { remove("save"); },

    resetAll: function () { remove("progress"); remove("save"); }
  };
})(this);
