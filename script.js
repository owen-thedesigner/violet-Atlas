(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const gameContent = $("#game-content");
  const gameTitle = $("#game-title");
  const toastEl = $("#toast");
  let toastTimer;
  let soundOn = false;
  let audioContext = null;

  const toast = (message) => {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  };
  $("#year").textContent = new Date().getFullYear();

  // Sound effects are opt-in and only run after a user gesture.
  const tinySound = (frequency = 520, duration = .075, type = "sine") => {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gain.gain.setValueAtTime(.055, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
    } catch (error) { /* Sound is optional; the site still works without it. */ }
  };
  $("#sound-toggle").addEventListener("click", () => {
    soundOn = !soundOn;
    $("#sound-toggle").textContent = soundOn ? "SOUND ON" : "SOUND OFF";
    $("#sound-toggle").setAttribute("aria-pressed", String(soundOn));
    if (soundOn) tinySound(660, .11, "triangle");
    else toast("Sound effects off.");
  });

  // Small, optional celebration animation. It never blocks the page.
  const confettiCanvas = $("#confetti");
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiFrame = 0;
  let confettiParticles = [];
  const resizeConfetti = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = Math.round(window.innerWidth * ratio);
    confettiCanvas.height = Math.round(window.innerHeight * ratio);
    confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  window.addEventListener("resize", resizeConfetti);
  resizeConfetti();
  const celebrate = () => {
    const colors = ["#b99aff", "#dcff6c", "#ff916b", "#ff9dc8", "#a9d9ff"];
    confettiParticles = Array.from({ length: 78 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -15 - Math.random() * 80,
      vx: (Math.random() - .5) * 4,
      vy: 2 + Math.random() * 4,
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 6,
      spin: (Math.random() - .5) * .2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    cancelAnimationFrame(confettiFrame);
    const draw = () => {
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiParticles.forEach((particle) => {
        particle.x += particle.vx; particle.y += particle.vy; particle.rotation += particle.spin; particle.vy += .025;
        confettiCtx.save(); confettiCtx.translate(particle.x, particle.y); confettiCtx.rotate(particle.rotation);
        confettiCtx.fillStyle = particle.color; confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * .65);
        confettiCtx.restore();
      });
      confettiParticles = confettiParticles.filter((particle) => particle.y < window.innerHeight + 20);
      if (confettiParticles.length) confettiFrame = requestAnimationFrame(draw);
      else confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
    confettiFrame = requestAnimationFrame(draw);
    tinySound(760, .15, "triangle");
  };

  const quizQuestions = [
    { q: "Which animal has fingerprints that can look surprisingly human?", a: ["Koala", "Penguin", "Cheetah", "Llama"], correct: 0, why: "Koala fingerprints are remarkably similar to human fingerprints." },
    { q: "What is the dot over a lowercase i called?", a: ["A speck", "A tittle", "A nib", "A fleck"], correct: 1, why: "It's a tittle. An oddly satisfying word for a tiny dot." },
    { q: "Which planet has a day longer than its year?", a: ["Mars", "Venus", "Jupiter", "Neptune"], correct: 1, why: "Venus rotates so slowly that one rotation takes longer than its trip around the Sun." },
    { q: "What is the only mammal capable of true powered flight?", a: ["Flying squirrel", "Sugar glider", "Bat", "Colugo"], correct: 2, why: "Bats are the only mammals capable of powered flight. Gliders only glide." },
    { q: "Which of these is a real instrument?", a: ["Theremin", "Cloudophone", "Wobblehorn", "Air kazoo"], correct: 0, why: "A theremin is played without touching it. Your hands control the sound." },
    { q: "What is the smallest country in the world by area?", a: ["Monaco", "San Marino", "Liechtenstein", "Vatican City"], correct: 3, why: "Vatican City is the world's smallest independent state by area." },
    { q: "Which animal has three hearts?", a: ["Octopus", "Dolphin", "Crocodile", "Sea turtle"], correct: 0, why: "An octopus has three hearts: two pump blood to the gills and one to the body." },
    { q: "What was Nintendo originally founded to make?", a: ["Radios", "Playing cards", "Toy trains", "Board games"], correct: 1, why: "Nintendo began in 1889 making handmade hanafuda playing cards." },
    { q: "Which bird can fly backwards?", a: ["Hummingbird", "Eagle", "Owl", "Puffin"], correct: 0, why: "Hummingbirds can hover and fly backwards thanks to their special wing movement." },
    { q: "Which of these is botanically a berry?", a: ["Strawberry", "Raspberry", "Banana", "Blackberry"], correct: 2, why: "A banana is botanically a berry. A strawberry is not. Plants love plot twists." },
    { q: "What is a group of flamingos called?", a: ["A sparkle", "A flamboyance", "A pink parade", "A shimmer"], correct: 1, why: "A group of flamingos is called a flamboyance. Honestly, perfect." },
    { q: "Which animal is known for cube-shaped droppings?", a: ["Capybara", "Wombat", "Badger", "Beaver"], correct: 1, why: "Wombats produce cube-shaped droppings. Nature got creative." }
  ];
  const riddles = [
    { q: "I have cities but no houses, forests but no trees, and rivers but no water. What am I?", hint: "You might unfold me before a road trip.", answer: "a map", variants: ["map", "a map"] },
    { q: "The more you take, the more you leave behind. What are they?", hint: "Think about walking.", answer: "footsteps", variants: ["footsteps", "foot steps"] },
    { q: "I get wetter the more I dry. What am I?", hint: "You probably have one near a sink.", answer: "a towel", variants: ["towel", "a towel"] },
    { q: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?", hint: "You're probably near one right now.", answer: "a keyboard", variants: ["keyboard", "a keyboard"] },
    { q: "What has one eye but cannot see?", hint: "You might use it with thread.", answer: "a needle", variants: ["needle", "a needle"] },
    { q: "What can travel around the world while staying in one corner?", hint: "It's tiny and goes on an envelope.", answer: "a stamp", variants: ["stamp", "a stamp"] },
    { q: "What has a neck but no head?", hint: "You might pour something from it.", answer: "a bottle", variants: ["bottle", "a bottle"] },
    { q: "What has many teeth but cannot bite?", hint: "It can get tangled in your hair.", answer: "a comb", variants: ["comb", "a comb"] },
    { q: "What goes up but never comes down?", hint: "You get one every birthday.", answer: "your age", variants: ["age", "your age"] },
    { q: "What has hands but cannot clap?", hint: "It helps you know when lunch is.", answer: "a clock", variants: ["clock", "a clock"] },
    { q: "What has to be broken before you can use it?", hint: "Breakfast is a clue.", answer: "an egg", variants: ["egg", "an egg"] },
    { q: "I shave every day, but my beard stays the same. Who am I?", hint: "Someone you might find at a barber shop.", answer: "a barber", variants: ["barber", "a barber"] },
    { q: "What runs but never walks, has a mouth but never talks?", hint: "You might find it in the mountains.", answer: "a river", variants: ["river", "a river"] },
    { q: "What has words but never speaks?", hint: "You're reading something like it now.", answer: "a book", variants: ["book", "a book"] },
    { q: "What can fill a room but takes up no space?", hint: "Flip a switch and see.", answer: "light", variants: ["light"] },
    { q: "What has four wheels and flies?", hint: "You might see it near a barn.", answer: "a garbage truck", variants: ["garbage truck", "a garbage truck", "a rubbish truck"] },
    { q: "What begins with T, ends with T, and has T in it?", hint: "It's a container you might drink from.", answer: "a teapot", variants: ["teapot", "a teapot"] },
    { q: "I am always in front of you but can't be seen. What am I?", hint: "It hasn't happened yet.", answer: "the future", variants: ["future", "the future"] },
    { q: "What has a thumb and four fingers but is not alive?", hint: "You wear it when it's cold.", answer: "a glove", variants: ["glove", "a glove"] },
    { q: "What building has the most stories?", hint: "You can borrow books from it.", answer: "a library", variants: ["library", "a library"] }
  ];
  const choices = [
    ["Have a pause button for real life", "Have a rewind button for real life", "⏸️", "⏪"],
    ["Only communicate through song", "Only communicate through movie quotes", "🎤", "🎬"],
    ["Live in a giant treehouse", "Live in a submarine", "🌳", "🌊"],
    ["Eat breakfast for every meal", "Eat dinner for every meal", "🥞", "🍝"],
    ["Be able to talk to animals", "Speak every human language", "🐈", "🌎"],
    ["Have a personal theme song", "Have a personal entrance sound effect", "🎵", "📣"],
    ["Explore outer space", "Explore the deepest ocean", "🚀", "🐙"],
    ["Have a pet dragon", "Have a pet dinosaur", "🐉", "🦖"],
    ["Never lose your keys again", "Never forget a name again", "🔑", "🧠"],
    ["Visit the past for one day", "Visit the future for one day", "🕰️", "🔮"],
    ["Always have perfect snacks", "Always have perfect music", "🍿", "🎧"],
    ["Be able to teleport", "Be able to fly", "🌀", "🪽"],
    ["Have a tiny elephant friend", "Have a giant hamster friend", "🐘", "🐹"],
    ["Make any food taste like pizza", "Make any drink taste like a milkshake", "🍕", "🥤"],
    ["Live in a world with no Mondays", "Live in a world with 3-day weekends", "📆", "🏖️"]
  ];
  const facts = [
    ["A group of flamingos is called a flamboyance.", "🦩"],
    ["Octopuses have three hearts. Two help pump blood through the gills; one pumps it around the body.", "🐙"],
    ["Wombats produce cube-shaped droppings. Yes, cubes.", "🧊"],
    ["The dot above a lowercase i or j is called a tittle.", "🔎"],
    ["Nintendo was founded in 1889 as a playing-card company.", "🃏"],
    ["A day on Venus is longer than a year on Venus.", "🪐"],
    ["Hummingbirds can fly backwards.", "🐦"],
    ["Butterflies taste using sensors on their feet.", "🦋"],
    ["Bananas are berries in botanical terms. Strawberries are not.", "🍌"],
    ["A koala's fingerprints can look surprisingly similar to a human's.", "🐨"],
    ["The first computer mouse was made of wood.", "🖱️"],
    ["A standard deck of cards has 52 cards, not counting jokers.", "🂡"],
    ["Sharks appeared millions of years before the first trees.", "🦈"],
    ["The unicorn is the national animal of Scotland.", "🦄"],
    ["A cloud is made of tiny water droplets or ice crystals, not fluffy cotton.", "☁️"]
  ];
  const missions = [
    ["Invent a new holiday.", "Name it, choose the date, and decide what completely unnecessary tradition everyone has to follow."],
    ["Design a restaurant for aliens.", "Give it a name, invent one menu item, and decide what the aliens think is a normal tip."],
    ["Make up a new sport.", "It needs a name, one ridiculous rule, and a trophy nobody would want to dust."],
    ["Create a superhero with a useless power.", "Maybe they can warm one sock at a time. Give them a name and a dramatic origin story."],
    ["Invent a flavor of ice cream.", "Choose the ingredients, design the tub, and write the slogan."],
    ["Draw a creature that does not exist.", "Give it at least three unusual features and a name that sounds way too official."],
    ["Write a movie title for a film that should never exist.", "Add a one-sentence plot and cast the most unexpected lead actor."],
    ["Create a new emoji.", "Describe what it looks like and the exact situation where everyone would use it."],
    ["Build the world's least useful invention.", "Explain what it does, why anyone made it, and how much it costs."],
    ["Invent a secret handshake for a club.", "Give the club a name and make the handshake have at least four steps."],
    ["Make a playlist for a very specific moment.", "Think: entering a room like a movie villain, or making a sandwich at midnight."],
    ["Rename three everyday objects.", "A spoon, a lamp, and a backpack deserve more interesting names. Go."],
    ["Write a tiny mystery in three sentences.", "There is a missing object, one suspicious clue, and an unexpected reveal."],
    ["Create a mascot for your school or town.", "It can be an animal, an object, or something absolutely confusing."],
    ["Design a dream arcade game.", "Name it, describe the goal, and invent the power-up everyone wants."],
    ["Invent a new word.", "Define it, use it in a sentence, and make it sound like it has always existed."]
  ];
  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
  const shuffled = (items) => [...items].sort(() => Math.random() - .5);
  const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

  let currentGame = null;
  let quizState = null;
  let memoryState = null;
  let riddleIndex = -1;
  let choiceState = null;
  let bubblePopped = 0;

  const showGame = (name, title) => {
    currentGame = name;
    gameTitle.textContent = title;
    gameContent.innerHTML = "";
    $("#game-zone").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const gameHeader = (left, right = "") => `<div class="${currentGame}-game-top"><span>${left}</span><span>${right}</span></div>`;
  const renderQuiz = () => {
    showGame("quiz", "Brain Blender");
    quizState = { questions: shuffled(quizQuestions).slice(0, 5), index: 0, score: 0, locked: false };
    drawQuizQuestion();
  };
  const drawQuizQuestion = () => {
    const state = quizState;
    if (!state || state.index >= state.questions.length) return drawQuizResult();
    const item = state.questions[state.index];
    gameContent.innerHTML = `${gameHeader(`QUESTION ${state.index + 1} / 5`, `${state.score} RIGHT SO FAR`)}<div class="game-progress"><span style="width:${state.index / 5 * 100}%"></span></div><h3 class="quiz-question">${item.q}</h3><div class="answer-grid">${item.a.map((answer, i) => `<button class="answer-button" data-answer="${i}">${String.fromCharCode(65 + i)}. ${answer}</button>`).join("")}</div><div class="game-feedback" id="quiz-feedback" aria-live="polite"></div><div id="quiz-next-wrap"></div>`;
    $$("[data-answer]", gameContent).forEach((button) => button.addEventListener("click", () => {
      if (state.locked) return;
      state.locked = true;
      const selected = Number(button.dataset.answer);
      const correct = selected === item.correct;
      if (correct) state.score++;
      $$("[data-answer]", gameContent).forEach((answerButton) => {
        const n = Number(answerButton.dataset.answer);
        answerButton.disabled = true;
        if (n === item.correct) answerButton.classList.add("correct");
        else if (n === selected) answerButton.classList.add("wrong");
      });
      $("#quiz-feedback").textContent = `${correct ? "YES!" : "NOT QUITE."} ${item.why}`;
      $("#quiz-next-wrap").innerHTML = `<button class="game-primary-button" id="quiz-next">${state.index === 4 ? "See my results ↗" : "Next question →"}</button>`;
      $("#quiz-next").addEventListener("click", () => { state.index++; state.locked = false; tinySound(430); drawQuizQuestion(); });
      tinySound(correct ? 740 : 220, .1, correct ? "triangle" : "sine");
    }));
  };
  const drawQuizResult = () => {
    const score = quizState.score;
    const title = score === 5 ? "ABSOLUTE LEGEND." : score >= 3 ? "BRAIN = WORKING." : score === 0 ? "A BEAUTIFUL MYSTERY." : "GOOD WARM-UP.";
    gameContent.innerHTML = `<div class="game-result"><div class="big-result">${score}/5</div><h3>${title}</h3><p>${score === 5 ? "You got every question. Please remain humble." : "That was a delightfully random five questions."}</p><button class="game-primary-button" id="quiz-again">Run it back ↻</button></div>`;
    celebrate();
    $("#quiz-again").addEventListener("click", renderQuiz);
  };

  const renderMemory = () => {
    showGame("memory", "Flip Frenzy");
    const symbols = shuffled(["🍋", "👾", "🍄", "🎸", "🧃", "🛼"]);
    memoryState = { deck: shuffled([...symbols, ...symbols]), first: null, second: null, locked: false, moves: 0, matches: 0, started: false };
    drawMemory();
  };
  const drawMemory = () => {
    const state = memoryState;
    gameContent.innerHTML = `${gameHeader(`${state.matches} / 6 MATCHED`, `${state.moves} MOVES`)}<div class="memory-board">${state.deck.map((symbol, i) => `<button class="memory-tile" data-tile="${i}" aria-label="Card ${i + 1}">?</button>`).join("")}</div><div class="game-feedback" id="memory-feedback" aria-live="polite">Flip two cards. Find the matching pairs.</div><div style="text-align:center;margin-top:10px"><button class="game-secondary-button" id="memory-reset">Shuffle cards ↻</button></div>`;
    $$("[data-tile]", gameContent).forEach((button) => button.addEventListener("click", () => flipMemory(Number(button.dataset.tile), button)));
    $("#memory-reset").addEventListener("click", renderMemory);
  };
  const flipMemory = (index, button) => {
    const state = memoryState;
    if (state.locked || button.classList.contains("revealed") || button.classList.contains("matched")) return;
    button.textContent = state.deck[index];
    button.classList.add("revealed");
    button.setAttribute("aria-label", `Card ${index + 1}: ${state.deck[index]}`);
    tinySound(520 + index * 17, .045);
    if (state.first === null) { state.first = { index, button }; return; }
    state.second = { index, button };
    state.moves++;
    state.locked = true;
    if (state.deck[state.first.index] === state.deck[state.second.index]) {
      state.first.button.classList.add("matched"); state.second.button.classList.add("matched");
      state.first.button.disabled = true; state.second.button.disabled = true;
      state.first = null; state.second = null; state.locked = false; state.matches++;
      $(".memory-game-top span:first-child", gameContent).textContent = `${state.matches} / 6 MATCHED`;
      $(".memory-game-top span:last-child", gameContent).textContent = `${state.moves} MOVES`;
      $("#memory-feedback").textContent = "MATCH! Your memory is doing its thing.";
      tinySound(820, .12, "triangle");
      if (state.matches === 6) {
        $("#memory-feedback").innerHTML = `YOU DID IT IN ${state.moves} MOVES. <button class="game-primary-button" id="memory-again">Play again ↻</button>`;
        celebrate();
        $("#memory-again").addEventListener("click", renderMemory);
      }
    } else {
      $(".memory-game-top span:last-child", gameContent).textContent = `${state.moves} MOVES`;
      $("#memory-feedback").textContent = "No match this time. Try to remember where they were.";
      setTimeout(() => {
        if (!state.first || !state.second) return;
        state.first.button.textContent = "?"; state.second.button.textContent = "?";
        state.first.button.classList.remove("revealed"); state.second.button.classList.remove("revealed");
        state.first.button.setAttribute("aria-label", `Card ${state.first.index + 1}`); state.second.button.setAttribute("aria-label", `Card ${state.second.index + 1}`);
        state.first = null; state.second = null; state.locked = false;
      }, 750);
    }
  };

  const renderRiddle = () => {
    showGame("riddle", "Riddle Me This");
    nextRiddle();
  };
  const nextRiddle = () => {
    let next = Math.floor(Math.random() * riddles.length);
    if (next === riddleIndex && riddles.length > 1) next = (next + 1) % riddles.length;
    riddleIndex = next;
    const item = riddles[next];
    gameContent.innerHTML = `${gameHeader("A LITTLE BRAIN TEASER", `RIDDLE ${next + 1} / ${riddles.length}`)}<p class="riddle-question-main">${item.q}</p><p class="riddle-hint" id="riddle-hint">Need a nudge? The hint is hiding.</p><input class="riddle-answer" id="riddle-answer" type="text" maxlength="80" placeholder="Type your guess…" autocomplete="off"><div class="riddle-actions"><button class="game-primary-button" id="riddle-check">Lock it in</button><button class="game-secondary-button" id="riddle-hint-button">Give me a hint</button><button class="game-secondary-button" id="riddle-next">New riddle ↻</button></div><div class="game-feedback" id="riddle-feedback" aria-live="polite"></div>`;
    const check = () => {
      const guess = normalize($("#riddle-answer").value);
      if (!guess) { $("#riddle-feedback").textContent = "Put a guess in first. Even a wild one."; return; }
      if (item.variants.includes(guess) || guess === normalize(item.answer)) {
        $("#riddle-feedback").textContent = "YOU GOT IT. That brain is switched on.";
        celebrate();
      } else $("#riddle-feedback").textContent = "Not that one. Have another go, or ask for a hint.";
    };
    $("#riddle-check").addEventListener("click", check);
    $("#riddle-answer").addEventListener("keydown", (event) => { if (event.key === "Enter") check(); });
    $("#riddle-hint-button").addEventListener("click", () => { $("#riddle-hint").textContent = `HINT: ${item.hint}`; tinySound(390); });
    $("#riddle-next").addEventListener("click", nextRiddle);
  };

  const renderChoices = () => {
    showGame("choice", "This or That");
    choiceState = { rounds: shuffled(choices).slice(0, 5), index: 0, picks: [] };
    drawChoice();
  };
  const drawChoice = () => {
    const state = choiceState;
    if (state.index >= state.rounds.length) {
      const summary = state.picks.map((pick, i) => `<span>${state.rounds[i][pick + 1]} ${state.rounds[i][pick]}</span>`).join("<br>");
      gameContent.innerHTML = `<div class="game-result"><div class="big-result">5/5</div><h3>DECISIONS WERE MADE.</h3><p>And not a single one was legally binding.</p><div style="color:#cbbddd;font-size:11px;line-height:2;margin:15px 0">${summary}</div><button class="game-primary-button" id="choices-again">One more round ↻</button></div>`;
      celebrate(); $("#choices-again").addEventListener("click", renderChoices); return;
    }
    const item = state.rounds[state.index];
    gameContent.innerHTML = `${gameHeader(`CHOICE ${state.index + 1} / 5`, "TRUST YOUR GUT") }<div class="game-progress"><span style="width:${state.index / 5 * 100}%"></span></div><h3 class="choice-question">Would you rather…</h3><div class="choice-options"><button class="choice-option" data-choice="0"><span>${item[2]}</span>${item[0]}</button><button class="choice-option" data-choice="1"><span>${item[3]}</span>${item[1]}</button></div><div class="game-feedback" id="choice-feedback" aria-live="polite"></div>`;
    $$("[data-choice]", gameContent).forEach((button) => button.addEventListener("click", () => {
      const picked = Number(button.dataset.choice); state.picks.push(picked);
      $$("[data-choice]", gameContent).forEach((other) => { other.disabled = true; if (other === button) other.style.background = "#dcff6c"; other.style.color = "#20182a"; });
      $("#choice-feedback").innerHTML = `Officially, you are team <b>${picked === 0 ? item[0] : item[1]}</b>. <button class="game-primary-button" id="choice-next">Next dilemma →</button>`;
      $("#choice-next").addEventListener("click", () => { state.index++; drawChoice(); });
      tinySound(560 + picked * 110);
    }));
  };

  const renderBubble = () => {
    showGame("bubble", "Bubble Trouble");
    bubblePopped = 0;
    const makeBubbles = () => {
      gameContent.innerHTML = `${gameHeader("A VERY IMPORTANT TASK", `${bubblePopped} / 32 POPPED`)}<div class="bubble-wrap">${Array.from({ length: 32 }, (_, i) => `<button class="real-bubble" data-bubble="${i}" aria-label="Pop bubble ${i + 1}"></button>`).join("")}</div><div class="game-feedback" id="bubble-feedback" aria-live="polite">No goals. No pressure. Just pop.</div><div class="bubble-tools"><button class="game-secondary-button" id="bubble-reset">Fresh sheet ↻</button><button class="game-secondary-button" id="bubble-pop-all">Pop all</button></div>`;
      $$("[data-bubble]", gameContent).forEach((button) => button.addEventListener("click", () => {
        if (button.classList.contains("popped")) return;
        button.classList.add("popped"); button.disabled = true; button.setAttribute("aria-label", `Popped bubble ${Number(button.dataset.bubble) + 1}`);
        bubblePopped++; $(".bubble-game-top span:last-child", gameContent).textContent = `${bubblePopped} / 32 POPPED`;
        tinySound(280 + (Number(button.dataset.bubble) % 7) * 45, .045, "triangle");
        if (bubblePopped === 32) { $("#bubble-feedback").textContent = "THE SHEET IS POPPED. A tiny victory."; celebrate(); }
      }));
      $("#bubble-reset").addEventListener("click", makeBubbles);
      $("#bubble-pop-all").addEventListener("click", () => { $$("[data-bubble]", gameContent).forEach((button) => { if (!button.disabled) button.click(); }); });
    };
    makeBubbles();
  };

  const storyBits = {
    hero: ["a retired superhero", "a very confident pigeon", "a time-traveling chef", "a detective with no clues", "a tiny dragon with big plans", "a billionaire raccoon", "a wizard who lost the instructions", "a robot learning sarcasm", "a mysterious substitute teacher", "a professional nap champion"],
    mission: ["find the world's last waffle", "win a staring contest with the moon", "return a library book from 400 years ago", "stop a suspiciously smart sandwich", "organize the clouds", "solve the case of the missing left shoe", "enter the underground dance tournament", "deliver a pizza to a parallel universe", "become mayor of a goldfish bowl", "rescue the last working TV remote"],
    twist: ["but everyone is speaking in rhymes", "while wearing roller skates", "and the villain is actually very polite", "before the world's biggest sneeze", "with a budget of exactly $3", "but nobody can remember Tuesday", "and the only clue is a kazoo solo", "while being followed by 400 ducks", "but the map is upside down", "and the narrator keeps interrupting"]
  };
  const renderStory = () => {
    showGame("story", "Plot Twist Machine");
    const generate = () => {
      const a = randomItem(storyBits.hero), b = randomItem(storyBits.mission), c = randomItem(storyBits.twist);
      $("#story-prompt").innerHTML = `<span>${a}</span> must ${b}, <span>${c}</span>.`;
    };
    gameContent.innerHTML = `${gameHeader("YOUR NEXT BLOCKBUSTER", "INFINITE NONSENSE") }<div class="story-prompt" id="story-prompt">Tap the button to invent your next masterpiece.</div><div class="story-controls"><button class="game-primary-button" id="story-generate">Plot twist ↻</button><button class="game-secondary-button" id="story-copy">Copy my story</button></div><div class="game-feedback" id="story-feedback" aria-live="polite"></div>`;
    generate();
    $("#story-generate").addEventListener("click", () => { generate(); $("#story-feedback").textContent = "A cinematic masterpiece is taking shape."; tinySound(610); });
    $("#story-copy").addEventListener("click", async () => {
      const text = $("#story-prompt").textContent;
      try { await navigator.clipboard.writeText(text); $("#story-feedback").textContent = "Copied. Go write the blockbuster."; }
      catch (error) { $("#story-feedback").textContent = text; }
    });
  };

  const games = {
    quiz: renderQuiz, memory: renderMemory, riddle: renderRiddle,
    choices: renderChoices, bubble: renderBubble, story: renderStory
  };
  $$("[data-open-game]").forEach((button) => button.addEventListener("click", () => games[button.dataset.openGame]?.()));
  $("#close-game").addEventListener("click", () => {
    currentGame = null; gameTitle.textContent = "Choose a game above.";
    gameContent.innerHTML = `<div class="empty-game"><span class="empty-game-icon">🎮</span><p>Your game will appear here.<br>Pick one from the arcade to get started.</p></div>`;
  });

  // Random facts: no fake loading screens, and every button reveals a real new item.
  let lastFact = -1;
  const nextFact = () => {
    let index = Math.floor(Math.random() * facts.length);
    if (index === lastFact) index = (index + 1) % facts.length;
    lastFact = index;
    $("#fact-number").textContent = `FACT #${String(index + 1).padStart(3, "0")}`;
    $("#fact-text").textContent = facts[index][0];
    $("#fact-doodle").textContent = facts[index][1];
    tinySound(430 + index * 18, .07, "triangle");
  };
  $("#next-fact").addEventListener("click", nextFact);

  // Rotating creative missions are intentionally not tied to a streak or deadline.
  let missionIndex = -1;
  const nextMission = () => {
    let index = Math.floor(Math.random() * missions.length);
    if (index === missionIndex) index = (index + 1) % missions.length;
    missionIndex = index;
    $("#challenge-number").textContent = String(index + 1).padStart(3, "0");
    $("#challenge-title").textContent = missions[index][0];
    $("#challenge-description").textContent = missions[index][1];
    $("#mission-done").classList.remove("show");
    $("#done-challenge").textContent = "I did it ✓";
    tinySound(510);
  };
  $("#new-challenge").addEventListener("click", nextMission);
  $("#done-challenge").addEventListener("click", () => {
    const done = $("#mission-done");
    if (done.classList.contains("show")) return;
    done.classList.add("show");
    $("#done-challenge").textContent = "Done ✓";
    toast("Sidequest complete. Very official.");
    celebrate();
  });

  // The big random button chooses a real activity and opens it.
  const randomRoutes = [
    { label: "A five-question brain workout", action: () => renderQuiz() },
    { label: "A quick memory challenge", action: () => renderMemory() },
    { label: "A riddle that needs solving", action: () => renderRiddle() },
    { label: "A very serious would-you-rather", action: () => renderChoices() },
    { label: "Thirty-two virtual bubbles", action: () => renderBubble() },
    { label: "A movie plot that should not exist", action: () => renderStory() },
    { label: "One fact you didn't need but now know", action: () => { nextFact(); document.querySelector("#odd-stuff").scrollIntoView({ behavior: "smooth" }); } },
    { label: "A completely new creative mission", action: () => { nextMission(); document.querySelector("#challenge").scrollIntoView({ behavior: "smooth", block: "center" }); } }
  ];
  const pickRandom = () => {
    const pick = randomItem(randomRoutes);
    $("#random-result").textContent = `Your next sidequest: ${pick.label}.`;
    pick.action();
    tinySound(700, .13, "triangle");
  };
  $("#big-random").addEventListener("click", pickRandom);
  $("#surprise-me").addEventListener("click", pickRandom);

  // Mobile navigation.
  const menuButton = $("#menu-button");
  menuButton.addEventListener("click", () => {
    const nav = $(".main-nav");
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  $$(".main-nav a").forEach((link) => link.addEventListener("click", () => {
    $(".main-nav").classList.remove("open"); menuButton.setAttribute("aria-expanded", "false");
  }));
})();
