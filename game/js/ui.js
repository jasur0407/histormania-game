/* Histormania UI (desktop): screens, rendering, mouse + keyboard input.
 * Game rules live in engine.js. */
(function () {
  "use strict";

  var Engine = window.HMEngine, Store = window.HMStorage, Audio = window.HMAudio;
  var PATHS = window.HM_PATHS || [];
  var IMAGES = (window.HM_ASSETS && window.HM_ASSETS.images) || {};

  var STAGE_W = 1280, STAGE_H = 720;
  var ARCHETYPE_LABEL = {
    playful: "Playful", serious: "Serious", fearful: "Fearful", neutral: "Neutral",
    passionate: "Passionate", ambitious: "Ambitious", hardworking: "Hard-working"
  };
  var BANNER = { death: "You are dead", bad: "A bad end", neutral: "The end", good: "A good life" };
  var TINTS = ["#9a6b3f", "#6f7f5a", "#557a86", "#8a5a4e", "#7a6a8e", "#a0813f", "#5f6f7a", "#8c6d52"];
  var COMING_SOON = 3;
  var BACK = { lives: "title", intro: "lives", gallery: "intro" };

  var state = {
    path: null,        // the path being viewed / played
    run: null,
    newEnding: false,  // the ending on screen was found for the first time
    settings: Store.settings()
  };

  // ------------------------------------------------------------------ helpers
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function screen() { return document.body.dataset.screen; }
  function pathById(id) {
    for (var i = 0; i < PATHS.length; i++) if (PATHS[i].id === id) return PATHS[i];
    return null;
  }
  function imgUrl(key) { var f = IMAGES[key]; return f ? "assets/img/" + f : null; }
  function tintFor(key) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return TINTS[h % TINTS.length];
  }

  // Fills an .art slot with the image for `key`, or a flat tinted placeholder.
  function paintArt(slot, key, label) {
    slot.innerHTML = "";
    slot.style.setProperty("--tint", tintFor(key || "x"));
    var url = key && imgUrl(key);
    if (url) {
      slot.classList.remove("missing");
      var img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.src = url;
      slot.appendChild(img);
    } else {
      slot.classList.add("missing");
      slot.appendChild(el("span", "art-label", label || ""));
    }
  }
  function preload(key) { var url = imgUrl(key); if (url) { var i = new Image(); i.src = url; } }
  function humanize(key) { return String(key || "").replace(/_/g, " "); }

  function heartEl(full) {
    var s = el("span", "heart " + (full ? "full" : "empty"));
    var url = imgUrl(full ? "ui/heart_full" : "ui/heart_empty");
    if (url) { var img = new Image(); img.alt = ""; img.src = url; s.appendChild(img); }
    else s.textContent = full ? "♥" : "♡";
    return s;
  }
  function paintHearts(container, hearts, max, delta) {
    container.innerHTML = "";
    for (var i = 0; i < max; i++) {
      var h = heartEl(i < hearts);
      if (delta < 0 && i >= hearts && i < hearts - delta) h.classList.add("lost");
      if (delta > 0 && i < hearts && i >= hearts - delta) h.classList.add("gained");
      container.appendChild(h);
    }
    container.setAttribute("aria-label", hearts + " of " + max + " hearts");
  }

  function setParagraphs(container, text) {
    container.innerHTML = "";
    String(text || "").split("\n").forEach(function (line) {
      if (line.trim()) container.appendChild(el("p", null, line));
    });
  }

  function flash(kind) {
    var f = $("flash");
    f.className = "";
    void f.offsetWidth;
    f.className = kind;
  }
  function restartAnimation(node) { node.style.animation = "none"; void node.offsetWidth; node.style.animation = ""; }

  function progressFor(pathId) {
    var p = Store.progress()[pathId];
    return { endings: (p && p.endings) || {}, lives: (p && p.lives) || 0 };
  }
  function foundCount(path) {
    var found = progressFor(path.id).endings;
    return Engine.endingIds(path).filter(function (id) { return found[id]; }).length;
  }

  // ------------------------------------------------------------------ stage scaling & fullscreen
  function fitStage() {
    var scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    $("stage").style.setProperty("--scale", String(scale));
  }

  function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        var root = document.documentElement;
        var req = root.requestFullscreen || root.webkitRequestFullscreen;
        var p = req && req.call(root);
        if (p && p.catch) p.catch(function () { /* blocked, e.g. iframe without allowfullscreen */ });
      }
    } catch (e) { /* fullscreen unsupported */ }
  }

  // ------------------------------------------------------------------ navigation
  function go(name) {
    closeModals();
    document.body.dataset.screen = name;
    if (name === "title") renderTitle();
    if (name === "lives") renderLives();
    if (name === "intro") renderIntro();
    if (name === "gallery") renderGallery();
    var scroller = document.querySelector("#s-" + name + " .scroll");
    if (scroller) scroller.scrollTop = 0;
  }

  // ------------------------------------------------------------------ title
  function renderTitle() {
    var saved = Store.savedRun();
    var savedPath = saved && pathById(saved.pathId);
    var ok = savedPath && saved.run && savedPath.nodes[saved.run.nodeId] && !savedPath.nodes[saved.run.nodeId].ending;
    $("btnContinue").hidden = !ok;
    if (ok) {
      $("continueInfo").textContent = savedPath.title + (saved.run.age != null ? " · Age " + saved.run.age : "");
    }
    $("btnPlay").classList.toggle("btn-primary", !ok);
  }

  // ------------------------------------------------------------------ choose a life
  function renderLives() {
    var grid = $("livesGrid");
    grid.innerHTML = "";
    PATHS.forEach(function (path) {
      var card = el("button", "life-card");
      card.type = "button";
      var art = el("div", "art");
      paintArt(art, path.cover ? path.id + "/" + path.cover : null, path.title);
      card.appendChild(art);
      var info = el("div", "life-info");
      info.appendChild(el("span", "life-title", path.title));
      info.appendChild(el("span", "life-era", path.era));
      info.appendChild(el("span", "life-found",
        "Endings " + foundCount(path) + "/" + Engine.endingIds(path).length));
      card.appendChild(info);
      card.addEventListener("click", function () {
        Audio.play("click");
        state.path = path;
        go("intro");
      });
      grid.appendChild(card);
    });
    for (var i = 0; i < COMING_SOON; i++) {
      var soon = el("div", "life-card soon");
      var art = el("div", "art missing");
      art.appendChild(el("span", "art-label", "?"));
      soon.appendChild(art);
      var info = el("div", "life-info");
      info.appendChild(el("span", "life-title", "Coming soon"));
      info.appendChild(el("span", "life-era", "More lives are on the way"));
      soon.appendChild(info);
      grid.appendChild(soon);
    }
  }

  // ------------------------------------------------------------------ intro
  function renderIntro() {
    var path = state.path;
    if (!path) return go("lives");
    paintArt($("introArt"), path.cover ? path.id + "/" + path.cover : null, path.title);
    $("introTitle").textContent = path.title;
    $("introEra").textContent = path.era;
    $("introWho").textContent = "You are " + path.character.name + ". " + path.character.role + ".";
    $("introBio").textContent = path.character.bio || "";
    $("introArchetype").textContent = ARCHETYPE_LABEL[path.character.archetype] || path.character.archetype;
    paintHearts($("introHearts"), path.startingHearts, path.maxHearts, 0);
    var cw = path.contentWarnings || [];
    $("introWarnings").textContent = cw.length ? "Contains: " + cw.join(", ") + "." : "";
    $("galleryLabel").textContent = "Endings found: " + foundCount(path) + "/" + Engine.endingIds(path).length;
    $("btnBegin").focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------ gallery
  function renderGallery() {
    var path = state.path;
    if (!path) return go("lives");
    var found = progressFor(path.id).endings;
    var ids = Engine.endingIds(path);
    var list = $("galleryList");
    list.innerHTML = "";
    ids.forEach(function (id) {
      var n = path.nodes[id];
      var isFound = !!found[id];
      var li = el("li", isFound ? "" : "locked");
      li.appendChild(el("span", "dot " + n.endingType));
      li.appendChild(el("span", "g-title", isFound ? (n.title || BANNER[n.endingType]) : "???"));
      li.appendChild(el("span", "g-type", BANNER[n.endingType]));
      list.appendChild(li);
    });
    var count = ids.filter(function (id) { return found[id]; }).length;
    $("galleryCount").textContent = path.title + " — " + count + " of " + ids.length + " endings found";
  }

  // ------------------------------------------------------------------ play
  function startRun(path) {
    closeModals();
    state.path = path;
    state.run = Engine.newRun(path);
    state.newEnding = false;
    Store.saveRun(state.run);
    document.body.dataset.screen = "play";
    renderPlay(true);
  }

  function resumeRun(saved) {
    var path = pathById(saved.pathId);
    if (!path) return;
    state.path = path;
    state.run = saved.run;
    state.run.lastDelta = 0;
    state.newEnding = false;
    document.body.dataset.screen = "play";
    renderPlay(true);
  }

  function choose(index) {
    var path = state.path, run = state.run;
    if (!run || Engine.isEnding(path, run)) return;
    Engine.choose(path, run, index);
    var ending = Engine.isEnding(path, run);

    if (run.lastDelta < 0) { flash("hurt"); Audio.play("heart_loss"); }
    else if (run.lastDelta > 0) { flash("heal"); Audio.play("heart_gain"); }
    else Audio.play("click", 0.5);

    if (ending) {
      state.newEnding = Store.recordEnding(path.id, run.nodeId);
      Store.clearRun();
      Audio.play("ending_" + path.nodes[run.nodeId].endingType);
    } else {
      state.newEnding = false;
      Store.saveRun(run);
    }
    renderPlay(false);
  }

  function undo() {
    if (!state.run || !state.run.history.length) return;
    Engine.undo(state.run);
    state.newEnding = false;
    Store.saveRun(state.run);
    Audio.play("click", 0.5);
    renderPlay(false);
  }

  function renderPlay(fresh) {
    var path = state.path, run = state.run;
    var node = Engine.currentNode(path, run);
    var ending = !!node.ending;

    $("s-play").classList.toggle("is-ending", ending);
    $("hudTitle").textContent = path.title;
    $("hudAge").textContent = run.age != null ? "Age " + run.age : "";
    var hearts = $("hudHearts");
    paintHearts(hearts, run.hearts, path.maxHearts, fresh ? 0 : run.lastDelta);
    hearts.classList.remove("hit");
    if (!fresh && run.lastDelta < 0) { void hearts.offsetWidth; hearts.classList.add("hit"); }

    var imageKey = run.image;
    paintArt($("sceneArt"), imageKey ? path.id + "/" + imageKey : null, humanize(imageKey) || path.title);

    $("beatCard").hidden = ending;
    $("choices").hidden = ending;
    $("endCard").hidden = !ending;
    $("endActions").hidden = !ending;

    var consClass = "consequence" + (run.lastDelta < 0 ? " hurt" : run.lastDelta > 0 ? " heal" : "");

    if (!ending) {
      restartAnimation($("beatCard"));
      var cons = $("consequence");
      cons.className = consClass;
      cons.textContent = run.consequence || "";
      cons.hidden = !run.consequence;
      $("nextDivider").hidden = !run.consequence;
      setParagraphs($("nodeText"), node.text);
      $("beatCard").scrollTop = 0;

      var box = $("choices");
      box.innerHTML = "";
      node.choices.forEach(function (c, i) {
        var b = el("button", "btn choice");
        b.type = "button";
        b.appendChild(el("kbd", null, String(i + 1)));
        b.appendChild(el("span", null, c.text));
        b.addEventListener("click", function () { choose(i); });
        box.appendChild(b);
        var target = path.nodes[c.next];
        if (target && target.image) preload(path.id + "/" + target.image);
      });
    } else {
      renderEnding(path, run, node, consClass);
    }
  }

  function renderEnding(path, run, node, consClass) {
    var card = $("endCard");
    card.dataset.type = node.endingType;
    restartAnimation(card);

    $("endBanner").textContent = BANNER[node.endingType] || "The end";
    var cons = $("endConsequence");
    cons.className = consClass;
    cons.textContent = run.consequence || "";
    cons.hidden = !run.consequence;

    $("endTitle").textContent = node.title || "";
    $("endTitle").hidden = !node.title;
    $("endNew").hidden = !state.newEnding;
    setParagraphs($("endText"), node.text);

    var reveal = $("reveal");
    reveal.hidden = node.twist !== true;
    if (node.twist === true) {
      $("revealText").textContent = node.revealedIdentity || "";
      $("revealText").hidden = !run.revealShown;
      $("btnReveal").hidden = !!run.revealShown;
    }

    var prog = progressFor(path.id);
    var rows = [
      ["Lived to", run.age != null ? "Age " + run.age : "—"],
      ["Hearts left", run.hearts + " / " + path.maxHearts],
      ["Choices made", String(run.choicesMade)],
      ["Endings found", foundCount(path) + " / " + Engine.endingIds(path).length],
      ["Lives lived", String(prog.lives)]
    ];
    var dl = $("endStats");
    dl.innerHTML = "";
    rows.forEach(function (r) { dl.appendChild(el("dt", null, r[0])); dl.appendChild(el("dd", null, r[1])); });
    card.querySelector(".end-scroll").scrollTop = 0;

    $("btnUndo").disabled = !run.history.length;
  }

  // ------------------------------------------------------------------ modals
  function openModal(id) { $(id).hidden = false; }
  function closeModals() { $("m-menu").hidden = true; $("m-settings").hidden = true; disarmReset(); }
  function anyModalOpen() { return !$("m-menu").hidden || !$("m-settings").hidden; }

  function applySettings() {
    document.body.classList.toggle("large-text", state.settings.largeText);
    Audio.setEnabled(state.settings.sound);
  }
  function openSettings() {
    $("setSound").checked = state.settings.sound;
    $("setLarge").checked = state.settings.largeText;
    $("setFullscreen").checked = isFullscreen();
    $("m-menu").hidden = true;
    openModal("m-settings");
  }
  function onSettingChange() {
    state.settings = { sound: $("setSound").checked, largeText: $("setLarge").checked };
    Store.saveSettings(state.settings);
    applySettings();
  }

  var resetTimer = null;
  function disarmReset() {
    var b = $("btnReset");
    b.classList.remove("armed");
    b.firstElementChild.textContent = "Reset all progress";
    clearTimeout(resetTimer);
  }
  function onReset() {
    var b = $("btnReset");
    if (!b.classList.contains("armed")) {
      b.classList.add("armed");
      b.firstElementChild.textContent = "Click again to erase everything";
      resetTimer = setTimeout(disarmReset, 3500);
      return;
    }
    Store.resetAll();
    disarmReset();
    b.firstElementChild.textContent = "Progress erased";
    if (screen() === "title") renderTitle();
  }

  // ------------------------------------------------------------------ keyboard
  var keyPending = false;

  function pressChoice(idx) {
    var btn = $("choices").children[idx];
    if (!btn || keyPending) return;
    keyPending = true;
    btn.classList.add("pressed");
    setTimeout(function () { keyPending = false; choose(idx); }, 80);
  }

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key;
    var lower = key.length === 1 ? key.toLowerCase() : key;

    if (lower === "f" && !e.repeat) { toggleFullscreen(); return; }

    if (key === "Escape") {
      if (anyModalOpen()) closeModals();
      else if (screen() === "play") openModal("m-menu");
      else if (BACK[screen()]) go(BACK[screen()]);
      return;
    }
    if (anyModalOpen() || screen() !== "play" || !state.run || e.repeat) return;

    if (Engine.isEnding(state.path, state.run)) {
      if (key === "Backspace") { e.preventDefault(); undo(); }
      else if (lower === "r") startRun(state.path);
      else if (lower === "l") go("lives");
      return;
    }
    if (key === "1" || key === "2") pressChoice(Number(key) - 1);
  }

  // ------------------------------------------------------------------ wiring
  function wire() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-go]"), function (b) {
      b.addEventListener("click", function () { Audio.play("click", 0.5); go(b.getAttribute("data-go")); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function (b) {
      b.addEventListener("click", closeModals);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-fullscreen]"), function (b) {
      b.addEventListener("click", toggleFullscreen);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".modal"), function (m) {
      m.addEventListener("click", function (e) { if (e.target === m) closeModals(); });
    });

    $("btnPlay").addEventListener("click", function () {
      Audio.play("click"); Audio.startMusic();
      if (PATHS.length === 1) { state.path = PATHS[0]; go("intro"); } else go("lives");
    });
    $("btnContinue").addEventListener("click", function () {
      Audio.play("click"); Audio.startMusic();
      var saved = Store.savedRun();
      if (saved) resumeRun(saved);
    });
    $("btnSettings").addEventListener("click", openSettings);
    $("btnBegin").addEventListener("click", function () { Audio.play("click"); startRun(state.path); });
    $("btnGallery").addEventListener("click", function () { Audio.play("click", 0.5); go("gallery"); });

    $("btnMenu").addEventListener("click", function () { openModal("m-menu"); });
    $("btnRestart").addEventListener("click", function () { startRun(state.path); });
    $("btnMenuSettings").addEventListener("click", openSettings);
    $("btnQuit").addEventListener("click", function () { go("title"); });

    $("btnUndo").addEventListener("click", undo);
    $("btnAgain").addEventListener("click", function () { startRun(state.path); });
    $("btnOtherLives").addEventListener("click", function () { go("lives"); });
    $("btnReveal").addEventListener("click", function () {
      state.run.revealShown = true;
      $("btnReveal").hidden = true;
      $("revealText").hidden = false;
    });

    ["setSound", "setLarge"].forEach(function (id) { $(id).addEventListener("change", onSettingChange); });
    $("setFullscreen").addEventListener("change", toggleFullscreen);
    document.addEventListener("fullscreenchange", function () { $("setFullscreen").checked = isFullscreen(); });
    $("btnReset").addEventListener("click", onReset);
    if (!Audio.hasAny()) {
      $("rowSound").classList.add("disabled");
      $("rowSound").title = "No sound files in this build yet";
    }

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", fitStage);
  }

  function boot() {
    fitStage();
    var bg = imgUrl("ui/title_bg");
    if (bg) { var img = new Image(); img.alt = ""; img.src = bg; $("titleBg").appendChild(img); }
    var logo = imgUrl("ui/logo");
    if (logo) {
      var l = new Image(); l.alt = "Histormania"; l.src = logo;
      $("logo").innerHTML = ""; $("logo").appendChild(l);
    }
    var icon = imgUrl("ui/icon");
    if (icon) {
      var link = document.createElement("link");
      link.rel = "icon"; link.href = icon;
      document.head.appendChild(link);
    }
    $("buildInfo").textContent = "v1.0" + (window.HM_BUILD ? " · " + window.HM_BUILD : "");
    applySettings();
    wire();
    go("title");
  }

  boot();
})();
