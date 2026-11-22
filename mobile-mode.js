// ===============================================
//  MOBILE MODE (shared by the home screen and every game)
//
//  The home screen has a little PC / phone switch in the top right.
//  The choice is saved, and each game reads it with:
//
//      CousinMode.isMobile()      // true in mobile mode
//
//  To give a game touch controls, add this near the end of its index.html:
//
//      <script src="../../mobile-mode.js"></script>
//      <script>
//        CousinMode.touchPad({
//          stick:   { left: "KeyA", right: "KeyD", up: "KeyW", down: "KeyS" }, // optional joystick
//          buttons: [ { label: "JUMP", code: "Space" }, { label: "FIRE", code: "KeyF" } ],
//          visible: () => true,   // optional: only show while playing
//        });
//      </script>
//
//  The pad only appears in mobile mode. It presses the game's normal keyboard
//  keys for you, so the game itself does not need to change.
// ===============================================
(function () {
  if (window.CousinMode) return;
  var STORE = "cousinArcadeMode";

  function fromUrl() {
    try {
      var m = new URLSearchParams(location.search).get("mode");
      if (m === "mobile" || m === "pc") return m;
    } catch (e) {}
    return null;
  }
  function fromStore() {
    try {
      var v = localStorage.getItem(STORE);
      if (v === "mobile" || v === "pc") return v;
    } catch (e) {}
    return null;
  }
  function guess() {
    try { return matchMedia("(pointer: coarse)").matches ? "mobile" : "pc"; } catch (e) { return "pc"; }
  }
  function get() { return fromUrl() || fromStore() || guess(); }
  function set(mode) {
    try { localStorage.setItem(STORE, mode); } catch (e) {}
    if (document.documentElement) document.documentElement.classList.toggle("mobile-mode", mode === "mobile");
  }

  // ---------- fake keyboard presses ----------
  var KEYCODES = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Space: 32, Enter: 13, Escape: 27,
    ShiftLeft: 16, ShiftRight: 16, ControlLeft: 17, Period: 190, Slash: 191, Comma: 188, Tab: 9 };
  function keyFor(code) {
    if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
    if (/^Digit\d$/.test(code)) return code.slice(5);
    if (/^Arrow/.test(code) || code === "Enter" || code === "Escape" || code === "Tab") return code;
    if (code === "Space") return " ";
    if (/^Shift/.test(code)) return "Shift";
    if (/^Control/.test(code)) return "Control";
    return { Period: ".", Slash: "/", Comma: "," }[code] || code;
  }
  function keyCodeFor(code) {
    if (/^Key[A-Z]$/.test(code)) return code.charCodeAt(3);
    if (/^Digit\d$/.test(code)) return code.charCodeAt(5);
    return KEYCODES[code] || 0;
  }
  var down = {};
  function send(type, code) {
    var ev = new KeyboardEvent(type, { code: code, key: keyFor(code), bubbles: true, cancelable: true });
    var kc = keyCodeFor(code);
    try {
      Object.defineProperty(ev, "keyCode", { get: function () { return kc; } });
      Object.defineProperty(ev, "which", { get: function () { return kc; } });
    } catch (e) {}
    (document.body || document).dispatchEvent(ev);
  }
  function press(code) { down[code] = (down[code] || 0) + 1; if (down[code] === 1) send("keydown", code); }
  function release(code) {
    if (!down[code]) return;
    down[code]--;
    if (!down[code]) send("keyup", code);
  }
  function tap(code) { press(code); setTimeout(function () { release(code); }, 60); }

  // ---------- on-screen joystick and buttons ----------
  var styled = false;
  function addStyle() {
    if (styled) return; styled = true;
    var s = document.createElement("style");
    s.textContent =
      ".cm-pad{position:fixed;inset:0;z-index:2147483000;pointer-events:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;font-family:system-ui,-apple-system,sans-serif}" +
      ".cm-pad[hidden]{display:none}" +
      ".cm-pad>*{pointer-events:auto;touch-action:none}" +
      ".cm-stick{position:absolute;left:calc(18px + env(safe-area-inset-left,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));width:132px;height:132px;border-radius:50%;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);box-shadow:0 0 0 2px rgba(0,0,0,.15)}" +
      ".cm-knob{position:absolute;left:50%;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 2px 6px rgba(0,0,0,.35);transition:transform .05s}" +
      ".cm-btns{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-wrap:wrap-reverse;flex-direction:row-reverse;gap:10px;max-width:220px;justify-content:flex-start;pointer-events:none}" +
      ".cm-btn{pointer-events:auto;touch-action:none;width:68px;height:68px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:13px;letter-spacing:.03em;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6);background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.45);box-shadow:0 0 0 2px rgba(0,0,0,.15)}" +
      ".cm-btn.big{width:84px;height:84px;font-size:15px}" +
      ".cm-btn.on{background:rgba(255,255,255,.48);transform:scale(.94)}" +
      ".cm-top{position:absolute;top:calc(8px + env(safe-area-inset-top,0px));right:calc(8px + env(safe-area-inset-right,0px));width:44px;height:44px;font-size:16px}";
    (document.head || document.documentElement).appendChild(s);
  }

  function makeButton(b, parent) {
    var el = document.createElement("div");
    el.className = "cm-btn" + (b.big ? " big" : "");
    el.textContent = b.label;
    if (b.color) el.style.background = b.color;
    var ids = {};
    function on(e) {
      e.preventDefault(); e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      if (!ids[e.pointerId]) { ids[e.pointerId] = 1; el.classList.add("on"); if (b.onDown) b.onDown(); else if (b.code) press(b.code); }
    }
    function off(e) {
      if (!ids[e.pointerId]) return;
      delete ids[e.pointerId];
      if (!Object.keys(ids).length) el.classList.remove("on");
      if (b.onUp) b.onUp(); else if (b.code) release(b.code);
    }
    el.addEventListener("pointerdown", on);
    el.addEventListener("pointerup", off);
    el.addEventListener("pointercancel", off);
    el.addEventListener("lostpointercapture", off);
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    parent.appendChild(el);
    return el;
  }

  function makeStick(cfg, parent) {
    var base = document.createElement("div"); base.className = "cm-stick";
    var knob = document.createElement("div"); knob.className = "cm-knob";
    base.appendChild(knob); parent.appendChild(base);
    var id = null, held = {};
    var state = { x: 0, y: 0 };
    function setDir(dir, on) {
      if (!cfg[dir] || !!held[dir] === on) return;
      held[dir] = on;
      if (on) press(cfg[dir]); else release(cfg[dir]);
    }
    function update(e) {
      var r = base.getBoundingClientRect();
      var R = r.width / 2;
      var dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
      var d = Math.hypot(dx, dy), max = R * 0.75;
      if (d > max) { dx *= max / d; dy *= max / d; }
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
      state.x = dx / max; state.y = dy / max;
      var dead = 0.38;
      setDir("left", state.x < -dead); setDir("right", state.x > dead);
      setDir("up", state.y < -dead); setDir("down", state.y > dead);
      if (cfg.onMove) cfg.onMove(state.x, state.y);
    }
    function end(e) {
      if (e.pointerId !== id) return;
      id = null; knob.style.transform = "";
      state.x = state.y = 0;
      ["left", "right", "up", "down"].forEach(function (d) { setDir(d, false); });
      if (cfg.onMove) cfg.onMove(0, 0);
    }
    base.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (id !== null) return;
      id = e.pointerId;
      try { base.setPointerCapture(id); } catch (x) {}
      update(e);
    });
    base.addEventListener("pointermove", function (e) { if (e.pointerId === id) update(e); });
    base.addEventListener("pointerup", end);
    base.addEventListener("pointercancel", end);
    base.addEventListener("lostpointercapture", end);
    return { el: base, state: state, reset: function () { if (id !== null) end({ pointerId: id }); } };
  }

  // opts: { stick, buttons, topButtons, visible }
  function touchPad(opts) {
    opts = opts || {};
    if (!isMobile() && !opts.always) return null;
    function build() {
      addStyle();
      var pad = document.createElement("div"); pad.className = "cm-pad";
      var stick = opts.stick ? makeStick(opts.stick, pad) : null;
      var row = document.createElement("div"); row.className = "cm-btns"; pad.appendChild(row);
      (opts.buttons || []).forEach(function (b) { makeButton(b, row); });
      (opts.topButtons || []).forEach(function (b, i) {
        var el = makeButton(b, pad); el.classList.add("cm-top");
        el.style.right = "calc(" + (8 + i * 52) + "px + env(safe-area-inset-right,0px))";
      });
      document.body.appendChild(pad);
      var shown = true;
      function releaseAll() { for (var c in down) { if (down[c]) { down[c] = 0; send("keyup", c); } } }
      if (opts.visible) {
        (function loop() {
          var v = !!opts.visible();
          if (v !== shown) { shown = v; pad.hidden = !v; if (!v) { if (stick) stick.reset(); releaseAll(); } }
          requestAnimationFrame(loop);
        })();
      }
      api.el = pad; api.stick = stick;
    }
    var api = { el: null, stick: null };
    if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
    return api;
  }

  function isMobile() { return get() === "mobile"; }

  window.CousinMode = { get: get, set: set, isMobile: isMobile, press: press, release: release, tap: tap, touchPad: touchPad };
  if (document.documentElement) document.documentElement.classList.toggle("mobile-mode", isMobile());
})();
