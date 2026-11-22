/*
  Pride or Prejudice?
  No libraries. Data comes from the four files in /data.
*/
(function () {
  "use strict";

  var D = window.POP_DATA;
  var TDS = window.POP_TDS;
  var FACTS = window.POP_FACTS;
  var L = window.POP_LETTER;
  if (!D) return;

  var S = D.stats;
  var STANCES = ["agree", "neither", "disagree"];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function fmt(n) { return typeof n === "number" ? n.toLocaleString("en-IE") : n; }
  function dig(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function longDate(iso) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var p = iso.split("-");
    return parseInt(p[2], 10) + " " + months[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  /* ---------------------------------------------------------
     Numbers in the text come from the data, never typed by hand
     --------------------------------------------------------- */
  document.querySelectorAll("[data-stat]").forEach(function (n) {
    var v = dig(S, n.getAttribute("data-stat"));
    if (v != null) n.textContent = fmt(v);
  });
  if (FACTS) {
    document.querySelectorAll("[data-fact]").forEach(function (n) {
      var v = dig(FACTS.emergency, n.getAttribute("data-fact"));
      if (v != null) n.textContent = fmt(v);
    });
  }
  if (TDS) {
    document.querySelectorAll("[data-tds='checked']").forEach(function (n) { n.textContent = longDate(TDS.checked); });
  }

  /* ---------------------------------------------------------
     The opening: "Ireland is ..." finished by seven commenters
     --------------------------------------------------------- */
  (function opening() {
    var ending = $("ending");
    var who = $("who");
    var pause = $("pause");
    if (!ending || !D.opening || !D.opening.length) return;

    var items = D.opening;
    var index = 0;
    var playing = !reduceMotion;
    var onScreen = true;
    var timer = null;
    var STANCE_WORDS = {
      agree: "from someone who agrees with the phrase",
      neither: "from someone who takes no clear side",
      disagree: "from someone who disagrees with the phrase"
    };

    function letter(ch, i) {
      var s = el("span", "ch", ch);
      s.style.setProperty("--i", i);
      s.style.setProperty("--dx", Math.round((Math.random() - 0.5) * 70) + "px");
      s.style.setProperty("--dy", Math.round((Math.random() - 0.5) * 90) + "px");
      s.style.setProperty("--r", Math.round((Math.random() - 0.5) * 50) + "deg");
      return s;
    }

    /* "is" stays still. The ending is built letter by letter after it. An ending such as
       "n't full" has no space in front, so its first word shares a no-break box with "is". */
    function build(item) {
      ending.textContent = "";
      ending.setAttribute("data-stance", item.stance);
      var text = item.text.replace(/…/g, "...");
      var tokens = text.split(/(\s+)/).filter(function (t) { return t !== ""; });
      var first = el("span", "w");
      first.appendChild(el("span", "is", "is"));
      ending.appendChild(first);
      var box = first;
      var i = 0;
      tokens.forEach(function (tok, t) {
        if (/^\s+$/.test(tok)) {
          ending.appendChild(document.createTextNode(" "));
          box = null;
          return;
        }
        if (!box) { box = el("span", "w"); ending.appendChild(box); }
        for (var c = 0; c < tok.length; c++) box.appendChild(letter(tok[c], i++));
      });
    }

    function caption(item) {
      who.textContent = "Comment " + item.n + ", " + STANCE_WORDS[item.stance];
    }

    function show(i, animate) {
      var item = items[i];
      if (!animate) { build(item); caption(item); return; }
      ending.classList.add("away");
      window.setTimeout(function () {
        build(item);
        ending.classList.remove("away");
        ending.classList.add("before");
        caption(item);
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { ending.classList.remove("before"); });
        });
      }, 330);
    }

    function next(animate) {
      index = (index + 1) % items.length;
      show(index, animate);
    }

    function schedule() {
      window.clearInterval(timer);
      timer = null;
      if (playing && onScreen && !document.hidden) {
        timer = window.setInterval(function () { next(true); }, 3600);
      }
    }

    function label() {
      pause.textContent = reduceMotion ? "Next line" : (playing ? "Pause" : "Play");
    }

    pause.addEventListener("click", function () {
      if (reduceMotion) { next(false); return; }
      playing = !playing;
      label();
      schedule();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.2 }).observe(ending);
    }
    document.addEventListener("visibilitychange", schedule);

    show(0, false);
    label();
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(schedule);
  })();

  /* ---------------------------------------------------------
     The three columns and the four ways of reading them
     --------------------------------------------------------- */
  (function room() {
    var cols = $("cols");
    if (!cols) return;

    STANCES.forEach(function (k) { $("col-" + k).innerHTML = D.columns[k]; });

    var point = canHover ? "Point at" : "Tap";
    var NOTES = {
      all: "All " + fmt(S.total) + " comments as they were written. " + point + " a sentence to bring it forward.",
      feel: "Words for how people feel, such as angry, worried, afraid, tired and hopeful. There are " + fmt(S.feel) +
            " of them in " + fmt(S.words) + " words.",
      lost: "Words for what people need, such as housing, services, jobs, trust and dignity. The slogan covers them up. " +
            point + " a bar to uncover the word.",
      phrase: "Every time someone writes “Ireland is full”. Only " + fmt(S.said) + " of the " + fmt(S.total) +
              " comments use the words."
    };
    var COUNTS = {
      all: {
        agree: function (s) { return fmt(s.n) + " comments agree with the phrase"; },
        neither: function (s) { return fmt(s.n) + " take no clear side: questions, jokes and replies"; },
        disagree: function (s) { return fmt(s.n) + " comments disagree with it"; }
      },
      feel: function (s) { return fmt(s.feel) + " feeling words in " + fmt(s.words) + " words"; },
      lost: function (s) { return fmt(s.lost) + " words covered"; },
      phrase: function (s) { return "Written " + fmt(s.uses) + (s.uses === 1 ? " time" : " times"); }
    };

    function setLens(lens) {
      cols.setAttribute("data-lens", lens);
      $("lens-note").textContent = NOTES[lens];
      STANCES.forEach(function (k) {
        var f = COUNTS[lens];
        $("count-" + k).textContent = (typeof f === "function" ? f : f[k])(S.stances[k]);
      });
      cols.querySelectorAll(".on").forEach(function (n) { n.classList.remove("on"); });
    }
    document.querySelectorAll("input[name='lens']").forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) setLens(r.value); });
    });
    setLens("all");

    /* On a phone only one column shows at a time */
    document.querySelectorAll("input[name='stance']").forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) cols.setAttribute("data-show", r.value); });
    });

    /* Tap (or click) to hold a sentence or uncover a word */
    cols.addEventListener("click", function (e) {
      var lens = cols.getAttribute("data-lens");
      var word = e.target.closest ? e.target.closest(".l") : null;
      if (lens === "lost" && word) { word.classList.toggle("on"); return; }
      var s = e.target.closest ? e.target.closest(".s") : null;
      if (!s) return;
      var was = s.classList.contains("on");
      cols.querySelectorAll(".s.on").forEach(function (n) { n.classList.remove("on"); });
      if (!was) s.classList.add("on");
    });

    /* The phrase comes apart while you point at its sentence */
    if (canHover && !reduceMotion) {
      var active = null;
      var jitter = null;

      function split(ph) {
        if (ph.getAttribute("data-split")) return;
        var text = ph.textContent;
        ph.textContent = "";
        ph.setAttribute("aria-label", text);
        for (var i = 0; i < text.length; i++) {
          var c = el("span", "pc", text[i]);
          c.setAttribute("aria-hidden", "true");
          ph.appendChild(c);
        }
        ph.setAttribute("data-split", "1");
      }
      function shake(s) {
        s.querySelectorAll(".ph .pc").forEach(function (c) {
          var x = (Math.random() - 0.5) * 9, y = (Math.random() - 0.5) * 11, r = (Math.random() - 0.5) * 22;
          c.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + r.toFixed(0) + "deg)";
        });
      }
      function settle(s) {
        s.querySelectorAll(".ph .pc").forEach(function (c) { c.style.transform = ""; });
      }
      cols.addEventListener("mouseover", function (e) {
        var s = e.target.closest ? e.target.closest(".s") : null;
        if (s === active) return;
        if (active) { window.clearInterval(jitter); settle(active); active = null; }
        if (!s || !s.querySelector(".ph")) return;
        s.querySelectorAll(".ph").forEach(split);
        active = s;
        shake(s);
        jitter = window.setInterval(function () { shake(s); }, 260);
      });
      cols.addEventListener("mouseleave", function () {
        if (active) { window.clearInterval(jitter); settle(active); active = null; }
      });
    }
  })();

  /* ---------------------------------------------------------
     The crawl of official figures
     --------------------------------------------------------- */
  (function ticker() {
    var track = $("ticker-track");
    var wrap = $("ticker");
    if (!track || !FACTS) return;

    function item(f, hidden) {
      var li = el("li");
      var a = el("a", null, f.text + ".");
      a.href = f.url;
      a.target = "_blank";
      a.rel = "noopener";
      li.appendChild(a);
      li.appendChild(document.createTextNode(" "));
      li.appendChild(el("span", "src", f.source));
      if (hidden) {
        li.setAttribute("aria-hidden", "true");
        a.tabIndex = -1;
      }
      return li;
    }
    FACTS.then.forEach(function (f) { track.appendChild(item(f, false)); });
    FACTS.then.forEach(function (f) { track.appendChild(item(f, true)); });

    function pace() { track.style.setProperty("--crawl", Math.max(30, Math.round(track.scrollWidth / 2 / 55)) + "s"); }
    pace();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(pace);

    var btn = $("ticker-pause");
    btn.addEventListener("click", function () {
      var paused = wrap.classList.toggle("paused");
      btn.textContent = paused ? "Play" : "Pause";
    });
  })();

  /* ---------------------------------------------------------
     The two figures
     --------------------------------------------------------- */
  (function figures() {
    var NAMES = { agree: "Agree with the phrase", neither: "No clear side", disagree: "Disagree with the phrase" };
    var SHORT = { agree: "Agree", neither: "No clear side", disagree: "Disagree" };

    var split = $("split");
    var legend = $("split-legend");
    if (split) {
      split.setAttribute("role", "img");
      split.setAttribute("aria-label", STANCES.map(function (k) {
        return NAMES[k] + ": " + S.stances[k].pct + "%";
      }).join(". "));
      STANCES.forEach(function (k) {
        var s = S.stances[k];
        var seg = el("div", "seg seg-" + k, s.pct + "%");
        seg.style.flex = s.n + " 1 0";
        seg.title = NAMES[k] + ": " + fmt(s.n) + " of " + fmt(S.total) + " comments";
        split.appendChild(seg);

        var li = el("li");
        li.appendChild(el("i", "sw sw-" + k));
        li.appendChild(el("span", null, NAMES[k] + " (" + fmt(s.n) + ")"));
        legend.appendChild(li);
      });
    }

    var body = document.querySelector("#topics tbody");
    if (body) {
      S.topics.forEach(function (t) {
        var tr = el("tr");
        var th = el("th", null, t.label);
        th.scope = "row";
        tr.appendChild(th);
        STANCES.forEach(function (k) {
          var td = el("td");
          var cell = el("div", "cell");
          cell.title = fmt(t[k].n) + " of " + fmt(S.stances[k].n) + " comments";
          cell.appendChild(el("span", "cell-k", SHORT[k]));
          cell.appendChild(el("span", null, t[k].pct + "%"));
          var bar = el("i", "bar bar-" + k);
          bar.style.width = Math.max(t[k].pct, 1) + "%";
          cell.appendChild(bar);
          td.appendChild(cell);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }

    var lists = $("wordlists");
    if (lists) {
      var add = function (title, words) {
        lists.appendChild(el("dt", null, title));
        lists.appendChild(el("dd", null, words));
      };
      S.topics.forEach(function (t) { add("Counted as “" + t.label + "”", t.terms); });
      add("Feeling words", S.feelWords.join(", "));
      add("Words that get covered up", S.lostWords.join(", "));
    }

    var sources = $("sources");
    if (sources && FACTS) {
      var row = function (text, src, url) {
        var li = el("li");
        var a = el("a", null, text);
        a.href = url; a.target = "_blank"; a.rel = "noopener";
        li.appendChild(a);
        li.appendChild(el("span", "src", src));
        sources.appendChild(li);
      };
      FACTS.then.forEach(function (f) { row(f.text, f.source + ". " + f.title, f.url); });
      var now = FACTS.emergency.now;
      row(fmt(now.total) + " people were living in emergency accommodation in " + now.month + ", " +
          fmt(now.children) + " of them children", now.source + ". " + now.title, now.url);
    }
  })();

  /* ---------------------------------------------------------
     Email your TDs
     --------------------------------------------------------- */
  (function mail() {
    var form = $("mail-form");
    if (!form || !TDS || !L) return;

    var con = $("con"), list = $("tds"), nameIn = $("name"), placeIn = $("place");
    var asksBox = $("asks"), subject = $("subject"), letter = $("letter");
    var sendMail = $("send-mail"), sendGmail = $("send-gmail"), copyLetter = $("copy-letter"), copyTo = $("copy-to");
    var status = $("status"), rebuildRow = $("rebuild-row");
    var edited = false;

    TDS.constituencies.forEach(function (c, i) {
      var o = el("option", null, c.name);
      o.value = String(i);
      con.appendChild(o);
    });

    L.asks.forEach(function (a) {
      var label = el("label", "ask");
      var box = el("input");
      box.type = "checkbox"; box.checked = true; box.value = a.id; box.name = "ask";
      label.appendChild(box);
      label.appendChild(el("span", null, a.label));
      asksBox.appendChild(label);
    });

    subject.value = L.subject;

    function chosen() {
      return Array.prototype.slice.call(list.querySelectorAll("input:checked")).map(function (b) {
        return { name: b.getAttribute("data-name"), email: b.value };
      });
    }

    function drawTds() {
      list.textContent = "";
      var c = TDS.constituencies[con.value];
      if (!c) return;
      c.tds.forEach(function (t) {
        var li = el("li");
        var label = el("label", "td");
        var box = el("input");
        box.type = "checkbox"; box.name = "td"; box.value = t.email; box.setAttribute("data-name", t.name);
        if (t.email) box.checked = true; else box.disabled = true;
        label.appendChild(box);
        label.appendChild(el("span", "td-name", t.name));
        var meta = el("span", "td-meta");
        if (t.email) {
          meta.textContent = t.party + ", " + t.email;
        } else {
          meta.appendChild(document.createTextNode(t.party + ". No email is listed yet. "));
          var a = el("a", null, "See their Oireachtas page");
          a.href = encodeURI(t.page); a.target = "_blank"; a.rel = "noopener";
          meta.appendChild(a);
        }
        label.appendChild(meta);
        li.appendChild(label);
        list.appendChild(li);
      });
    }

    function compose() {
      var c = TDS.constituencies[con.value];
      var tds = chosen();
      var name = nameIn.value.trim(), place = placeIn.value.trim();
      var where = c ? c.name : "[your constituency]";
      var lines = [];
      lines.push(tds.length === 1 ? L.greetingOne.replace("{td}", tds[0].name) : L.greetingMany);
      lines.push("");
      lines.push((place ? L.introWithPlace : L.introNoPlace).replace("{place}", place).replace("{constituency}", where));
      lines.push("");
      lines.push(L.figure);
      lines.push("");
      lines.push(L.why);
      var asks = L.asks.filter(function (a) {
        var b = asksBox.querySelector("input[value='" + a.id + "']");
        return b && b.checked;
      });
      if (asks.length) {
        lines.push("");
        lines.push(L.asksIntro);
        lines.push("");
        asks.forEach(function (a, i) { lines.push((i + 1) + ". " + a.text); });
        lines.push("");
        lines.push(L.close);
      }
      lines.push("");
      lines.push(L.signoff);
      lines.push(name || L.namePlaceholder);
      lines.push(place || L.placePlaceholder);
      return lines.join("\n");
    }

    function grow() {
      letter.style.height = "auto";
      letter.style.height = letter.scrollHeight + 2 + "px";
    }

    function links() {
      var to = chosen().map(function (t) { return t.email; });
      var ready = to.length > 0;
      var body = letter.value.replace(/\r?\n/g, "\r\n");
      var enc = encodeURIComponent;
      if (ready) {
        sendMail.href = "mailto:" + to.join(",") + "?subject=" + enc(subject.value) + "&body=" + enc(body);
        sendGmail.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + enc(to.join(",")) +
                         "&su=" + enc(subject.value) + "&body=" + enc(body);
      } else {
        sendMail.href = "#";
        sendGmail.href = "#";
      }
      sendMail.setAttribute("aria-disabled", String(!ready));
      sendGmail.setAttribute("aria-disabled", String(!ready));
      copyTo.disabled = !ready;
    }

    function refresh() {
      if (!edited) letter.value = compose();
      grow();
      links();
    }

    function say(msg) {
      status.textContent = msg;
      window.clearTimeout(say.t);
      say.t = window.setTimeout(function () { status.textContent = ""; }, 6000);
    }

    function copy(text, done) {
      var fallback = function () {
        var t = el("textarea");
        t.value = text;
        t.setAttribute("readonly", "");
        t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(t);
        say(ok ? done : "Your browser would not copy that. Select the text and copy it yourself.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { say(done); }, fallback);
      } else {
        fallback();
      }
    }

    con.addEventListener("change", function () { drawTds(); refresh(); });
    list.addEventListener("change", refresh);
    asksBox.addEventListener("change", refresh);
    nameIn.addEventListener("input", refresh);
    placeIn.addEventListener("input", refresh);
    subject.addEventListener("input", links);
    letter.addEventListener("input", function () {
      edited = true;
      rebuildRow.hidden = false;
      grow();
      links();
    });
    $("rebuild").addEventListener("click", function () {
      edited = false;
      rebuildRow.hidden = true;
      refresh();
    });

    function guard(e) {
      if (e.currentTarget.getAttribute("aria-disabled") === "true") {
        e.preventDefault();
        say("Choose your constituency first, so the letter has someone to go to.");
        con.focus();
      }
    }
    sendMail.addEventListener("click", guard);
    sendGmail.addEventListener("click", guard);
    copyLetter.addEventListener("click", function () { copy(letter.value, "Letter copied."); });
    copyTo.addEventListener("click", function () {
      copy(chosen().map(function (t) { return t.email; }).join(", "), "Addresses copied.");
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    window.addEventListener("resize", grow);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(grow);

    refresh();
  })();

  /* ---------------------------------------------------------
     Sound. Nothing is downloaded until it is switched on.
     --------------------------------------------------------- */
  (function sound() {
    var btn = $("sound");
    if (!btn) return;
    var audio = null;
    var fade = null;

    function ramp(to, then) {
      window.clearInterval(fade);
      fade = window.setInterval(function () {
        var v = audio.volume + (to > audio.volume ? 0.04 : -0.04);
        if ((to > audio.volume && v >= to) || (to <= audio.volume && v <= to)) {
          audio.volume = to;
          window.clearInterval(fade);
          if (then) then();
        } else {
          audio.volume = Math.max(0, Math.min(1, v));
        }
      }, 60);
    }

    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      if (!audio) {
        audio = new Audio("audio/air.mp3");
        audio.loop = true;
        audio.volume = 0;
      }
      if (on) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
        ramp(0.5);
      } else {
        ramp(0, function () { audio.pause(); });
      }
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Sound on" : "Sound off";
    });
  })();
})();
