/* Optional audio. Plays only the files the build found in assets/audio/
 * (see HM_ASSETS.audio); with no files the game is simply silent.
 * Sound names: click, heart_loss, heart_gain, ending_death, ending_bad,
 * ending_neutral, ending_good, music (looped background track). */
(function (root) {
  "use strict";
  var files = (root.HM_ASSETS && root.HM_ASSETS.audio) || {};
  var cache = {};
  var enabled = true;
  var music = null;

  function el(name) {
    if (!files[name]) return null;
    if (!cache[name]) {
      var a = new Audio("assets/audio/" + files[name]);
      a.preload = "auto";
      cache[name] = a;
    }
    return cache[name];
  }

  function play(name, volume) {
    if (!enabled) return;
    var a = el(name);
    if (!a) return;
    try {
      a.currentTime = 0;
      a.volume = volume == null ? 0.8 : volume;
      var p = a.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked until a tap */ });
    } catch (e) { /* ignore */ }
  }

  function startMusic() {
    if (!enabled || !files.music) return;
    if (!music) { music = el("music"); music.loop = true; music.volume = 0.35; }
    var p = music.play();
    if (p && p.catch) p.catch(function () {});
  }

  root.HMAudio = {
    play: play,
    startMusic: startMusic,
    setEnabled: function (on) {
      enabled = !!on;
      if (!enabled && music) music.pause();
      if (enabled) startMusic();
    },
    hasAny: function () { return Object.keys(files).length > 0; }
  };
})(this);
