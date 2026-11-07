(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle (dark is the default)
  var toggle = document.getElementById("theme-toggle");
  toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // Mobile menu
  var menuBtn = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  menuBtn.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Nav border once scrolled
  var nav = document.getElementById("nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Rotating word in the hero chip
  var words = ["automations", "dashboards", "web apps", "SOPs", "Paloro"];
  var el = document.getElementById("rotator");
  if (el && !reduceMotion) {
    var w = 0, i = words[0].length, deleting = true;
    var tick = function () {
      var word = words[w];
      if (deleting) {
        i--;
        if (i <= 0) { deleting = false; w = (w + 1) % words.length; }
      } else {
        i++;
        if (i >= words[w].length) { deleting = true; el.textContent = words[w]; return setTimeout(tick, 1800); }
      }
      el.textContent = words[w].slice(0, Math.max(i, 0)) || " ";
      setTimeout(tick, deleting ? 45 : 85);
    };
    setTimeout(tick, 2000);
  }

  // Count-up numbers
  var countUp = function (node) {
    var to = parseInt(node.dataset.to, 10);
    if (reduceMotion || !to) return;
    var start = null, dur = 1400;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(to * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll(".count").forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (n, idx) {
      n.style.transitionDelay = (idx % 4) * 70 + "ms";
      io.observe(n);
    });
  } else {
    revealEls.forEach(function (n) { n.classList.add("in"); });
  }

  // Highlight the nav link for the section in view
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) spy.observe(s);
    });
  }

  // Copy email
  var copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.dataset.email;
      var done = function () {
        copyBtn.textContent = "Copied ✓";
        setTimeout(function () { copyBtn.textContent = "Copy email"; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () {});
    });
  }

  // Paloro flashcard demo
  var deck = [
    ["saudade", "noun", "a deep longing for someone or something you love", "“Tô com saudade de você.” · I miss you."],
    ["gambiarra", "noun", "a clever makeshift fix (every sysadmin's specialty)", "“Isso é uma gambiarra, mas funciona.” · It's a hack, but it works."],
    ["cafuné", "noun", "running your fingers through someone's hair", "“Ela fez cafuné no filho.” · She stroked her son's hair."],
    ["beleza", "interjection", "all good / sounds great (also: beauty)", "“Amanhã às dez? Beleza!” · Tomorrow at ten? Sounds good!"],
    ["jeitinho", "noun", "finding a creative way around a problem", "“Sempre tem um jeitinho.” · There's always a way."],
    ["legal", "adjective", "cool, nice", "“Que legal!” · How cool!"],
    ["padaria", "noun", "bakery, where pão de queijo lives", "“Vamos na padaria?” · Shall we go to the bakery?"],
    ["cabaça", "noun", "gourd", "“A cabaça virou um berimbau.” · The gourd became a berimbau."]
  ];
  var card = document.getElementById("pw-card");
  if (card) {
    var idx = 0;
    var $ = function (id) { return document.getElementById(id); };
    var show = function () {
      var c = deck[idx];
      $("pw-word").textContent = c[0];
      $("pw-pos").textContent = c[1];
      $("pw-trans").textContent = c[2];
      $("pw-ex").textContent = c[3];
      $("pw-count").textContent = (idx + 1) + " / " + deck.length;
      $("pw-fill").style.width = ((idx + 1) / deck.length * 100) + "%";
    };
    card.addEventListener("click", function () { card.classList.toggle("flipped"); });
    document.getElementById("pw-rate").addEventListener("click", function (e) {
      if (e.target.tagName !== "BUTTON") return;
      var wasFlipped = card.classList.contains("flipped");
      card.classList.remove("flipped");
      // swap the word once the card has turned back to the front
      setTimeout(function () { idx = (idx + 1) % deck.length; show(); }, wasFlipped && !reduceMotion ? 250 : 0);
    });
    show();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
