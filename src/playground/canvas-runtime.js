// Runs INSIDE the playground canvas (imported ?raw and inlined into the
// iframe's srcdoc as a classic script, untouched by the bundler).
//
// The canvas is sandboxed WITHOUT allow-same-origin, so the reader's own
// script can't reach the docs page; the page can't reach in either. All
// talk goes through postMessage, tagged and stamped with this document's
// generation so a message from a replaced canvas is ignored:
//   in : html (morph the body to it), css (replace the stylesheet), dark
//   out: ready, classes (newly seen class names), console, clear
(function () {
  var me = document.currentScript;
  var GEN = Number(me.getAttribute('data-gen'));
  // the reader's script starts this many lines into the document
  var OFFSET = Number(me.getAttribute('data-offset'));
  var TAG = 'kbach-playground';

  function post(msg) {
    msg.kb = TAG;
    msg.gen = GEN;
    try {
      parent.postMessage(msg, '*');
    } catch (e) {
      // not cloneable: nothing to do
    }
  }

  // --- console ---------------------------------------------------------------
  function show(value, depth) {
    if (typeof value === 'string') return depth ? JSON.stringify(value) : value;
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'function') return 'ƒ ' + (value.name || 'anonymous') + '()';
    if (typeof value === 'symbol' || typeof value === 'bigint') return String(value);
    if (typeof value !== 'object') return String(value);
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (value instanceof Element) {
      var cls = value.getAttribute('class');
      return '<' + value.tagName.toLowerCase() + (value.id ? '#' + value.id : '') + (cls ? ' class="' + cls + '"' : '') + '>';
    }
    if (depth > 2) return Array.isArray(value) ? '[…]' : '{…}';
    try {
      if (Array.isArray(value)) return '[' + value.slice(0, 50).map(function (v) { return show(v, depth + 1); }).join(', ') + (value.length > 50 ? ', …' : '') + ']';
      if (value instanceof Map) return 'Map(' + value.size + ')';
      if (value instanceof Set) return 'Set(' + value.size + ') ' + show(Array.from(value), depth + 1);
      var keys = Object.keys(value);
      return '{ ' + keys.slice(0, 30).map(function (k) { return k + ': ' + show(value[k], depth + 1); }).join(', ') + (keys.length > 30 ? ', …' : '') + ' }';
    } catch (e) {
      return Object.prototype.toString.call(value);
    }
  }

  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      post({ type: 'console', level: level === 'debug' ? 'log' : level, text: args.map(function (a) { return show(a, 0); }).join(' ') });
      return original.apply(console, args);
    };
  });
  var originalClear = console.clear;
  console.clear = function () {
    post({ type: 'clear' });
    return originalClear.call(console);
  };

  /** A line in the reader's script, or null when the error came from somewhere else. */
  function scriptLine(lineno) {
    var line = lineno - OFFSET;
    return OFFSET > 0 && line >= 1 ? line : null;
  }

  window.addEventListener('error', function (e) {
    var line = e.error && typeof e.error.kbLine === 'number' ? e.error.kbLine : e.lineno ? scriptLine(e.lineno) : null;
    post({ type: 'console', level: 'error', text: e.message || 'Error', line: line });
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    post({ type: 'console', level: 'error', text: 'Unhandled promise rejection: ' + (r && r.message ? r.message : show(r, 0)) });
  });

  // dialogs can't open in the sandbox; say what they would have shown
  window.alert = function (m) {
    console.info('alert: ' + show(m, 0));
  };
  window.confirm = function (m) {
    console.info('confirm: ' + show(m, 0) + ' (answered OK)');
    return true;
  };
  window.prompt = function (m, d) {
    console.info('prompt: ' + show(m, 0) + ' (answered with the default)');
    return d === undefined ? null : String(d);
  };

  // --- loop guard: the playground's transform calls this in every loop body --
  var loopStart = 0;
  var loopLast = 0;
  window.__kbLoop = function (line) {
    var now = performance.now();
    if (now - loopLast > 50) loopStart = now; // a new burst of looping
    loopLast = now;
    if (now - loopStart > 2000) {
      loopLast = 0;
      var err = new RangeError('Stopped the loop on line ' + line + ': it ran for over 2 seconds without a break (an infinite loop?)');
      err.kbLine = line; // thrown from here, but it's the script's line that matters
      throw err;
    }
  };

  // --- links and forms are for looking at, not for going anywhere -------------
  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href], area[href]') : null;
      if (!a) return;
      e.preventDefault();
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        var id = decodeURIComponent(href.slice(1));
        var target = id ? document.getElementById(id) : null;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // as a browser does: "#" and "#top" (with no element of that id) are the top of the page
        else if (!id || id.toLowerCase() === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    true,
  );
  document.addEventListener('submit', function (e) { e.preventDefault(); }, true);

  // --- class names: report each new one, so the page can generate its CSS ----
  var seen = new Set();
  var pending = false;
  function collect() {
    pending = false;
    var fresh = [];
    var els = document.querySelectorAll('[class]');
    for (var i = 0; i < els.length; i++) {
      var list = (els[i].getAttribute('class') || '').split(/\s+/);
      for (var j = 0; j < list.length; j++) {
        var c = list[j];
        if (c && !seen.has(c)) {
          seen.add(c);
          fresh.push(c);
        }
      }
    }
    if (fresh.length) post({ type: 'classes', list: fresh });
  }
  function schedule() {
    if (pending) return;
    pending = true;
    Promise.resolve().then(collect);
  }

  // --- morph: change only what differs, so animations and hover state survive
  function sameKind(a, b) {
    return a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName);
  }
  function syncNode(live, next) {
    if (live.nodeType !== 1) {
      if (live.nodeValue !== next.nodeValue) live.nodeValue = next.nodeValue;
      return;
    }
    var i;
    var attrs = Array.prototype.slice.call(live.attributes);
    for (i = 0; i < attrs.length; i++) if (!next.hasAttribute(attrs[i].name)) live.removeAttribute(attrs[i].name);
    var nextAttrs = next.attributes;
    for (i = 0; i < nextAttrs.length; i++) if (live.getAttribute(nextAttrs[i].name) !== nextAttrs[i].value) live.setAttribute(nextAttrs[i].name, nextAttrs[i].value);
    syncChildren(live, next);
  }
  function syncChildren(live, next) {
    var liveKids = Array.prototype.slice.call(live.childNodes);
    var nextKids = Array.prototype.slice.call(next.childNodes);
    for (var i = 0; i < nextKids.length; i++) {
      var l = liveKids[i];
      var n = nextKids[i];
      if (!l) live.appendChild(n);
      else if (sameKind(l, n)) syncNode(l, n);
      else live.replaceChild(n, l);
    }
    for (var k = nextKids.length; k < liveKids.length; k++) live.removeChild(liveKids[k]);
  }
  function morph(html) {
    var template = document.createElement('template'); // parsed inert: nothing runs
    template.innerHTML = html;
    syncChildren(document.body, template.content);
  }

  function setCss(css) {
    var style = document.getElementById('kb-css');
    if (style && style.textContent !== css) {
      style.textContent = css;
      applyScheme();
    }
  }

  // The moon button and @media (prefers-color-scheme): a sandboxed srcdoc page
  // always sees the OS setting, so the canvas rewrites those media rules in its
  // own sheets (kbach.css with darkMode 'media', and the reader's inline
  // <style>s) to match the button. The text the reader sees is untouched.
  var schemeQuery = /prefers-color-scheme\s*:\s*(dark|light)/;
  function applyScheme() {
    var dark = document.documentElement.classList.contains('dark');
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try {
        rules = document.styleSheets[i].cssRules;
      } catch (e) {
        continue; // a cross-origin sheet (the fonts)
      }
      schemeRules(rules, dark);
    }
  }
  function schemeRules(rules, dark) {
    for (var j = 0; j < rules.length; j++) {
      var rule = rules[j];
      if (rule.media && rule.cssRules) {
        var original = rule.__kbScheme || rule.media.mediaText;
        var m = schemeQuery.exec(original);
        if (m) {
          rule.__kbScheme = original;
          var on = (m[1] === 'dark') === dark;
          // keep the rest of the query (not print and (prefers-color-scheme: dark), …)
          var rest = original.replace(/^\s*not\s+/i, '');
          var negated = rest !== original;
          rule.media.mediaText = (on !== negated) ? 'all' : 'not all';
        }
        schemeRules(rule.cssRules, dark);
      } else if (rule.cssRules) {
        schemeRules(rule.cssRules, dark);
      }
    }
  }

  // --- inspector: hover shows the box model, click selects ----------------------
  // An element is addressed by its trail from <body>: at each level its tag
  // and which one of that tag it is among its siblings ({tag:'div', n:1} is
  // the second div). The page maps the same trail onto the source, so a click
  // here can find the tag in the editor, and the cursor there can find the
  // element here. Elements the script made have no place in the source.
  // a canvas that reloads while inspecting starts out inspecting (no gap where a click falls through)
  var inspecting = me.hasAttribute('data-inspect');
  var hovered = null;
  var selected = null;
  var selectedTrail = null; // to find it again if the page replaces it
  var highlighted = null;
  // element -> { order: its classes as written, off: the ones switched off here }
  var toggles = new Map();

  var host = document.createElement('kb-inspector');
  host.style.cssText = 'all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;';
  var shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML =
    '<style>' +
    '.b{position:fixed;box-sizing:border-box;display:none}' +
    // the box model, tinted lightly (the page stays readable under it); the content box outlined
    '.m{background:rgba(246,178,107,.12)}.bd{background:rgba(255,229,153,.18)}.p{background:rgba(147,196,125,.14)}' +
    '.c{background:rgba(111,168,220,.12);outline:1px solid rgba(111,168,220,.8);outline-offset:-1px}' +
    '.sel{outline:2px solid #c7a25d;outline-offset:-1px}.hl{outline:2px dashed #c7a25d;outline-offset:-1px;background:rgba(199,162,93,.08)}' +
    '.l{position:fixed;display:none;font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:#1a2125;color:#ece6d8;border:1px solid #33424a;' +
    'border-radius:6px;padding:3px 7px;white-space:nowrap;max-width:min(90vw,420px);overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '.l b{color:#e5a07e;font-weight:600}.l i{color:#8fc7d9;font-style:normal}.l s{color:#7f9198;text-decoration:none;margin-left:6px}' +
    '</style>' +
    '<div class="b m"></div><div class="b bd"></div><div class="b p"></div><div class="b c"></div><div class="b sel"></div><div class="b hl"></div><div class="l"></div>';
  var boxes = shadow.querySelectorAll('.b');
  var label = shadow.querySelector('.l');
  document.documentElement.appendChild(host);
  if (inspecting) document.documentElement.style.cursor = 'crosshair';

  function px(v) {
    return parseFloat(v) || 0;
  }
  function place(div, x, y, w, h) {
    div.style.display = w > 0 && h > 0 ? 'block' : 'none';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = Math.max(0, w) + 'px';
    div.style.height = Math.max(0, h) + 'px';
  }
  function boxModel(el) {
    var s = getComputedStyle(el);
    var side = function (prefix, suffix) {
      return { t: px(s[prefix + 'Top' + suffix]), r: px(s[prefix + 'Right' + suffix]), b: px(s[prefix + 'Bottom' + suffix]), l: px(s[prefix + 'Left' + suffix]) };
    };
    return { margin: side('margin', ''), border: side('border', 'Width'), padding: side('padding', '') };
  }
  function describe(el) {
    var cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls.length ? '.' + cls.slice(0, 3).join('.') + (cls.length > 3 ? '…' : '') : '');
  }
  function drawHover(el) {
    var m = boxes[0], bd = boxes[1], p = boxes[2], c = boxes[3];
    if (!el) {
      [m, bd, p, c].forEach(function (d) { d.style.display = 'none'; });
      label.style.display = 'none';
      return;
    }
    var r = el.getBoundingClientRect();
    var bm = boxModel(el);
    place(m, r.left - bm.margin.l, r.top - bm.margin.t, r.width + bm.margin.l + bm.margin.r, r.height + bm.margin.t + bm.margin.b);
    place(bd, r.left, r.top, r.width, r.height);
    place(p, r.left + bm.border.l, r.top + bm.border.t, r.width - bm.border.l - bm.border.r, r.height - bm.border.t - bm.border.b);
    place(c, r.left + bm.border.l + bm.padding.l, r.top + bm.border.t + bm.padding.t,
      r.width - bm.border.l - bm.border.r - bm.padding.l - bm.padding.r, r.height - bm.border.t - bm.border.b - bm.padding.t - bm.padding.b);
    var name = describe(el);
    var dot = name.search(/[#.]/);
    label.innerHTML = '';
    var tag = document.createElement('b');
    tag.textContent = dot < 0 ? name : name.slice(0, dot);
    label.appendChild(tag);
    if (dot >= 0) {
      var rest = document.createElement('i');
      rest.textContent = name.slice(dot);
      label.appendChild(rest);
    }
    var size = document.createElement('s');
    size.textContent = Math.round(r.width * 100) / 100 + ' × ' + Math.round(r.height * 100) / 100;
    label.appendChild(size);
    label.style.display = 'block';
    var top = r.top - bm.margin.t - 26;
    label.style.top = (top < 4 ? r.bottom + bm.margin.b + 6 : top) + 'px';
    label.style.left = Math.max(4, Math.min(r.left, innerWidth - label.offsetWidth - 4)) + 'px';
  }
  function drawOutline(div, el) {
    if (!el || !el.isConnected) {
      div.style.display = 'none';
      return;
    }
    var r = el.getBoundingClientRect();
    place(div, r.left, r.top, r.width, r.height);
  }
  // Keep the boxes on their elements through scrolling, resizing and
  // transitions. When nothing is left to show, clear them once (a stopped
  // loop would leave the last boxes drawn).
  var drawn = false;
  (function loop() {
    if (selected && !selected.isConnected) {
      // the page replaced it (a re-render) or the script removed it
      var again = selectedTrail ? byTrail(selectedTrail) : null;
      if (again) select(again);
      else {
        selected = null;
        selectedTrail = null;
        post({ type: 'inspect-lost' });
      }
    }
    if (hovered && !hovered.isConnected) hovered = null;
    if (highlighted && !highlighted.isConnected) highlighted = null;
    if (inspecting || selected || highlighted || drawn) {
      drawHover(inspecting ? hovered : null);
      drawOutline(boxes[4], selected);
      drawOutline(boxes[5], highlighted && highlighted !== selected ? highlighted : null);
      drawn = !!(inspecting || selected || highlighted);
    }
    requestAnimationFrame(loop);
  })();

  function classList(el) {
    return (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
  }
  /** The element's classes in written order, the switched-off ones in their place. */
  function classesOf(el) {
    var now = classList(el);
    var rec = toggles.get(el);
    if (!rec) return { classes: now, off: [] };
    var order = rec.order.filter(function (c) { return now.indexOf(c) >= 0 || rec.off.has(c); });
    now.forEach(function (c) { if (order.indexOf(c) < 0) order.push(c); });
    rec.order = order;
    return { classes: order, off: Array.from(rec.off) };
  }
  /** After the page re-renders an element's classes from the code, switch the same ones off again. */
  function reapplyToggles() {
    toggles.forEach(function (rec, el) {
      if (!el.isConnected) {
        toggles.delete(el);
        return;
      }
      var written = classList(el);
      rec.order = written.slice();
      rec.off.forEach(function (c) {
        if (written.indexOf(c) < 0) rec.off.delete(c); // gone from the code: nothing to switch off
        else el.classList.remove(c);
      });
      if (!rec.off.size) toggles.delete(el);
    });
  }

  function trailOf(el) {
    var trail = [];
    for (var node = el; node && node !== document.body; node = node.parentElement) {
      var parentEl = node.parentElement;
      if (!parentEl) return null; // outside <body>
      var tag = node.tagName.toLowerCase();
      var n = 0;
      for (var sib = parentEl.firstElementChild; sib && sib !== node; sib = sib.nextElementSibling) if (sib.tagName === node.tagName) n++;
      trail.unshift({ tag: tag, n: n });
    }
    return node === document.body ? trail : null;
  }
  function byTrail(trail) {
    var node = document.body;
    for (var i = 0; node && i < trail.length; i++) {
      var step = trail[i];
      // the parser adds <tbody> around table rows the source wrote straight into <table>
      if (node.tagName === 'TABLE' && step.tag === 'tr' && !node.querySelector(':scope > tr')) node = node.querySelector(':scope > tbody') || node;
      var k = -1;
      var found = null;
      for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
        if (c.tagName.toLowerCase() === step.tag && ++k === step.n) {
          found = c;
          break;
        }
      }
      node = found;
    }
    return node && node !== document.body ? node : null;
  }

  var SHOWN_STYLES = ['display', 'position', 'width', 'height', 'margin', 'padding', 'gap', 'flex-direction', 'justify-content', 'align-items',
    'grid-template-columns', 'color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'text-align', 'border-radius', 'border-width', 'border-color', 'box-shadow', 'opacity', 'transform', 'filter', 'z-index', 'overflow', 'transition'];

  function info(el) {
    var s = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var styles = {};
    SHOWN_STYLES.forEach(function (prop) {
      styles[prop] = s.getPropertyValue(prop);
    });
    var ancestors = [];
    for (var a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) ancestors.unshift({ name: describe(a), trail: a === document.body ? [] : trailOf(a) });
    var cls = classesOf(el);
    return {
      trail: trailOf(el),
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: cls.classes,
      off: cls.off,
      width: Math.round(r.width * 100) / 100,
      height: Math.round(r.height * 100) / 100,
      box: boxModel(el),
      styles: styles,
      ancestors: ancestors,
      children: el.children.length,
      text: (el.textContent || '').trim().slice(0, 80),
    };
  }
  function select(el) {
    selected = el;
    selectedTrail = el ? trailOf(el) : null;
    post(el ? Object.assign({ type: 'inspect-select' }, info(el)) : { type: 'inspect-select', trail: null });
  }

  function targetOf(e) {
    var t = e.target;
    return t && t.nodeType === 1 && t !== document.documentElement && t !== host ? t : null;
  }
  // while inspecting, the page itself gets no clicks: they select instead
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'dblclick', 'contextmenu'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (!inspecting) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (type === 'click') {
        var t = targetOf(e);
        if (t && t !== document.body) select(t);
      }
    }, true);
  });
  window.addEventListener('pointermove', function (e) {
    if (inspecting) hovered = targetOf(e) === document.body ? null : targetOf(e);
  }, true);
  document.addEventListener('pointerleave', function () {
    hovered = null;
  });
  window.addEventListener('keydown', function (e) {
    if (inspecting && e.key === 'Escape') post({ type: 'inspect-exit' });
  }, true);

  // --- console input: run a line of JavaScript in the page ----------------------
  function evaluate(code) {
    var result;
    try {
      result = (0, eval)(code); // global scope, like a devtools console
    } catch (err) {
      post({ type: 'console', level: 'error', text: (err && err.name ? err.name + ': ' + err.message : String(err)) });
      return;
    }
    if (result && typeof result.then === 'function') {
      result.then(
        function (v) { post({ type: 'console', level: 'result', text: 'Promise → ' + show(v, 1) }); },
        function (err) { post({ type: 'console', level: 'error', text: 'Promise rejected: ' + (err && err.message ? err.message : show(err, 0)) }); },
      );
      return;
    }
    post({ type: 'console', level: 'result', text: show(result, 1) });
  }

  window.addEventListener('message', function (e) {
    if (e.source !== parent) return;
    var d = e.data;
    if (!d || d.kb !== TAG) return;
    if (d.type === 'css') setCss(d.css);
    else if (d.type === 'html') {
      if (typeof d.css === 'string') setCss(d.css);
      morph(d.html);
      reapplyToggles();
      applyScheme(); // the reader's inline <style>s may be new
    } else if (d.type === 'dark') {
      // the class and data-theme for darkMode 'class' and 'attribute'; the
      // prefers-color-scheme rules for 'media' (applyScheme)
      document.documentElement.classList.toggle('dark', !!d.on);
      if (d.on) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      applyScheme();
    }
    else if (d.type === 'inspect') {
      inspecting = !!d.on;
      document.documentElement.style.cursor = inspecting ? 'crosshair' : '';
      if (!inspecting) hovered = null;
    } else if (d.type === 'inspect-trail') {
      // (re)select by trail: after the page changed, or from the breadcrumb
      var el = d.trail ? byTrail(d.trail) : null;
      if (d.trail && !el) post({ type: 'inspect-lost' });
      else select(el);
    } else if (d.type === 'highlight-trail') {
      highlighted = d.trail ? byTrail(d.trail) : null;
      if (highlighted && d.scroll) highlighted.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else if (d.type === 'toggle-class' && selected) {
      var rec = toggles.get(selected);
      if (!rec) {
        rec = { order: classList(selected), off: new Set() };
        toggles.set(selected, rec);
      } else classesOf(selected); // the script may have changed its classes since
      if (d.on) {
        rec.off.delete(d.cls);
        // back in its place: rebuild the attribute in the written order
        selected.setAttribute('class', rec.order.filter(function (c) { return !rec.off.has(c); }).join(' '));
      } else {
        rec.off.add(d.cls);
        selected.classList.remove(d.cls);
      }
      select(selected);
    } else if (d.type === 'eval' && typeof d.code === 'string') evaluate(d.code);
  });

  // --- scroll: the page remembers it, so a re-run lands where the reader was ---
  var restoreTo = (me.getAttribute('data-scroll') || '').split(',').map(Number);
  var scrollPending = false;
  window.addEventListener('scroll', function () {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(function () {
      scrollPending = false;
      post({ type: 'scroll', x: scrollX, y: scrollY });
    });
  }, { passive: true });
  function restoreScroll() {
    // instant: a page with scroll-smooth would otherwise glide there from the top on every re-run
    if (restoreTo.length === 2 && (restoreTo[0] || restoreTo[1])) window.scrollTo({ left: restoreTo[0], top: restoreTo[1], behavior: 'instant' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    new MutationObserver(schedule).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    collect();
    restoreScroll();
    applyScheme();
    post({ type: 'ready' });
  });
  // again once fonts and images have their size (the page can be taller by then)
  window.addEventListener('load', function () {
    restoreScroll();
    restoreTo = [];
  });
})();
