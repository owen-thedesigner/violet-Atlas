(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = (message) => {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  };

  $("#year").textContent = new Date().getFullYear();

  // Destination filters
  $$(".filter-chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".filter-chip").forEach((item) => item.classList.toggle("active", item === chip));
    const filter = chip.dataset.filter;
    $$(".destination-card").forEach((card) => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
    });
  }));

  // Destination details
  const destinations = {
    canvas: { kicker:"01 / CREATE", symbol:"✧", title:"The idea garden", description:"A blank page is not empty. It's full of possibilities.", extra:"Try this: write down three ideas you've had recently. Pick the one that makes you a little nervous in a good way. Give it ten minutes.", action:"Open the studio", target:"#studio" },
    archive: { kicker:"02 / EXPLORE", symbol:"∞", title:"Curiosity archive", description:"A collection of tiny sparks for your next deep dive.", extra:"Today's rabbit hole: bioluminescent life. Some living things create their own light, turning the darkest parts of the ocean into something otherworldly.", action:"Find a new signal", target:"#field-notes" },
    pause: { kicker:"03 / PAUSE", symbol:"☾", title:"The quiet room", description:"You don't have to turn every moment into something productive.", extra:"Take one slow breath. Unclench your shoulders. Notice one sound nearby, one color in the room, and one thing you're looking forward to.", action:"Stay here a moment", target:"#field-notes" },
    type: { kicker:"04 / CREATE", symbol:"Aa", title:"Type playground", description:"Letters have shapes, rhythm, weight, and personality.", extra:"A tiny design challenge: choose one word that describes today. Write it in all caps, then all lowercase. Which version feels more like the word?", action:"Make a note", target:"#field-notes" },
    signals: { kicker:"05 / EXPLORE", symbol:"✳", title:"Daily signal", description:"One fresh thought can send you somewhere unexpected.", extra:"What ordinary object would become fascinating if you had to explain its entire history to an alien visitor?", action:"Get a prompt", target:"#field-notes" },
    focus: { kicker:"06 / PAUSE", symbol:"◷", title:"Focus orbit", description:"A little structure can make room for a lot of progress.", extra:"Choose one small task. Set a timer for 25 minutes. Put everything else out of reach and give this one thing your attention.", action:"Go to focus canvas", target:"#studio" }
  };
  const modal = $("#destination-modal");
  const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
  $$(".destination-card").forEach((card) => card.addEventListener("click", () => {
    const item = destinations[card.dataset.destination];
    $("#modal-kicker").textContent = item.kicker;
    $("#modal-symbol").textContent = item.symbol;
    $("#modal-title").textContent = item.title;
    $("#modal-description").textContent = item.description;
    $("#modal-extra").textContent = item.extra;
    $("#modal-action").innerHTML = item.action + " <span>↗</span>";
    $("#modal-action").onclick = () => { closeModal(); document.querySelector(item.target).scrollIntoView({ behavior:"smooth" }); };
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
  }));
  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

  // Surprise button
  $("#surprise-button").addEventListener("click", () => {
    const cards = $$(".destination-card");
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.scrollIntoView({ behavior:"smooth", block:"center" });
    card.animate([{ transform:"scale(1)" },{ transform:"scale(1.025)" },{ transform:"scale(1)" }], { duration:550 });
    setTimeout(() => card.click(), 350);
  });

  // Constellation canvas
  const canvas = $("#starboard");
  const ctx = canvas.getContext("2d");
  let stars = [];
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawStars();
  };
  const drawStars = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    // quiet background specks
    for (let i = 0; i < 52; i++) {
      const x = (i * 97.13) % w, y = (i * 47.71) % h;
      ctx.fillStyle = "rgba(207,185,255,.22)";
      ctx.beginPath(); ctx.arc(x, y, i % 7 === 0 ? 1.1 : .55, 0, Math.PI * 2); ctx.fill();
    }
    // subtle constellation lines
    if (stars.length > 1) {
      ctx.beginPath();
      stars.forEach((star, i) => { if (i === 0) ctx.moveTo(star.x, star.y); else ctx.lineTo(star.x, star.y); });
      ctx.strokeStyle = "rgba(190,160,245,.27)"; ctx.lineWidth = 1; ctx.stroke();
    }
    stars.forEach((star) => {
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 5);
      glow.addColorStop(0, "rgba(238,224,255,.95)");
      glow.addColorStop(.22, "rgba(193,157,255,.5)");
      glow.addColorStop(1, "rgba(160,120,230,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(star.x, star.y, star.r * 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f0e5ff"; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
    });
    $("#star-count").textContent = stars.length + (stars.length === 1 ? " STAR" : " STARS");
  };
  const addStar = (x, y) => { stars.push({ x, y, r: 1.5 + Math.random() * 1.7 }); drawStars(); };
  const randomizeStars = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    stars = Array.from({ length: 9 + Math.floor(Math.random() * 9) }, () => ({ x: 20 + Math.random() * (w - 40), y: 20 + Math.random() * (h - 40), r: 1.5 + Math.random() * 1.7 }));
    drawStars();
  };
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    addStar(event.clientX - rect.left, event.clientY - rect.top);
  });
  $("#random-stars").addEventListener("click", () => { randomizeStars(); toast("A new constellation, just like that."); });
  $("#clear-stars").addEventListener("click", () => { stars = []; drawStars(); toast("A fresh, open sky."); });
  $("#download-stars").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "my-constellation.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast("Your constellation is saved.");
  });
  if ("ResizeObserver" in window) new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener("resize", resizeCanvas);
  randomizeStars();

  // Field note prompts
  const prompts = [
    "What would you make if you knew it didn't have to be perfect?",
    "What's something small that made today better?",
    "If you could learn one new skill overnight, what would it be?",
    "What place would you visit if the journey mattered more than the destination?",
    "What's an idea you keep coming back to?",
    "What would your future self thank you for starting today?",
    "What ordinary thing do you think is secretly amazing?",
    "If today had a soundtrack, what would the first song feel like?"
  ];
  let lastPrompt = 0;
  $("#new-question").addEventListener("click", () => {
    let next = Math.floor(Math.random() * prompts.length);
    if (next === lastPrompt) next = (next + 1) % prompts.length;
    lastPrompt = next;
    $("#note-question").textContent = prompts[next];
  });

  // Local-only field notes
  const storageKey = "violet-atlas-field-notes";
  let notes = [];
  try { notes = JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { notes = []; }
  const saveNotes = () => localStorage.setItem(storageKey, JSON.stringify(notes));
  const renderNotes = () => {
    const host = $("#saved-notes");
    $("#note-total").textContent = notes.length;
    if (!notes.length) {
      host.innerHTML = '<div class="empty-notes"><span>✧</span><p>Your notes will find a home here.</p></div>';
      return;
    }
    host.innerHTML = "";
    notes.slice().reverse().forEach((note) => {
      const article = document.createElement("article");
      article.className = "saved-note";
      const p = document.createElement("p"); p.textContent = note.text;
      const small = document.createElement("small"); small.textContent = note.date;
      const remove = document.createElement("button"); remove.className = "delete-note"; remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", "Delete note");
      remove.addEventListener("click", () => { notes = notes.filter((item) => item.id !== note.id); saveNotes(); renderNotes(); toast("Note removed."); });
      article.append(remove, p, small); host.append(article);
    });
  };
  const noteInput = $("#note-input");
  noteInput.addEventListener("input", () => { $("#char-count").textContent = noteInput.value.length + " / 280"; });
  $("#note-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = noteInput.value.trim();
    if (!value) return;
    notes.push({ id: Date.now() + Math.random(), text: value, date: new Intl.DateTimeFormat(undefined, { dateStyle:"medium", timeStyle:"short" }).format(new Date()) });
    saveNotes(); renderNotes(); noteInput.value = ""; $("#char-count").textContent = "0 / 280"; $("#form-message").textContent = "Saved in this browser. Keep collecting little things.";
    toast("Your thought has a place now.");
  });
  $("#clear-notes").addEventListener("click", () => {
    if (!notes.length) { toast("There are no notes to clear."); return; }
    if (confirm("Clear all your saved field notes from this browser?")) { notes = []; saveNotes(); renderNotes(); toast("Your notes have been cleared."); }
  });
  renderNotes();

  // Command menu
  const command = $("#command-backdrop");
  const commandInput = $("#command-input");
  const openCommand = () => { command.classList.add("open"); commandInput.value = ""; commandInput.focus(); };
  const closeCommand = () => command.classList.remove("open");
  $("#command-open").addEventListener("click", openCommand);
  command.addEventListener("click", (event) => { if (event.target === command) closeCommand(); });
  $$(".command-list button").forEach((button) => button.addEventListener("click", () => { closeCommand(); document.querySelector(button.dataset.jump).scrollIntoView({ behavior:"smooth" }); }));
  commandInput.addEventListener("input", () => {
    const value = commandInput.value.toLowerCase();
    $$(".command-list button").forEach((button) => button.hidden = !button.textContent.toLowerCase().includes(value));
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openCommand(); }
    if (event.key === "Escape") { closeCommand(); closeModal(); }
  });

  // Mobile navigation
  const menuToggle = $("#menu-toggle");
  menuToggle.addEventListener("click", () => {
    const nav = $(".desktop-nav");
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  $$(".desktop-nav a").forEach((link) => link.addEventListener("click", () => {
    $(".desktop-nav").classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
  }));

  // Subtle reveal on scroll
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.animate([{ opacity:0, transform:"translateY(15px)" },{ opacity:1, transform:"translateY(0)" }], { duration:650, easing:"cubic-bezier(.2,.7,.2,1)", fill:"both" }); observer.unobserve(entry.target); }
    }), { threshold:.08 });
    $$(".destination-card,.note-prompt,.note-form,.starboard-wrap").forEach((element) => observer.observe(element));
  }
})();