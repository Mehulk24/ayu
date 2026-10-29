// Personalise via URL:  index.html?name=Aarav&from=Riya&date=28%20September
const q = new URLSearchParams(location.search);
const NAME = q.get("name") || "Aarav",
  FROM = q.get("from") || "Riya",
  DATE = q.get("date") || "28 September";
document.querySelectorAll(".name").forEach((e) => (e.textContent = NAME));
document.querySelectorAll(".from").forEach((e) => (e.textContent = FROM));
document.getElementById("date").textContent = "🎂 " + DATE;

// Bunting flags
const cols = ["#ffc8d8", "#c8f0d8", "#fff0a8", "#cdb8f5", "#bfe6ff"];
bunting.innerHTML =
  '<svg viewBox="0 0 430 70" preserveAspectRatio="none"><path d="M0 8Q215 30 430 8" stroke="#8a7a8f" fill="none" stroke-width="1.5"/>' +
  Array.from({ length: 10 }, (_, i) => {
    const x = i * 43 + 4,
      y = 8 + 22 * Math.sin((Math.PI * (i + 0.5)) / 10);
    return `<polygon points="${x},${y} ${x + 36},${y} ${x + 18},${y + 36}" fill="${cols[i % 5]}"/>`;
  }).join("") +
  "</svg>";

// Responsive scaling: wrap each scene's content and scale it to the viewport
document.querySelectorAll(".scene").forEach((s) => {
  const w = document.createElement("div");
  w.className = "inner";
  [...s.children]
    .filter((e) => !e.classList.contains("deco"))
    .forEach((e) => w.appendChild(e));
  s.appendChild(w);
});
const fit = () =>
  document.documentElement.style.setProperty(
    "--k",
    Math.max(0.7, Math.min(innerWidth / 430, innerHeight / 780, 1.8)).toFixed(
      3,
    ),
  );
addEventListener("resize", fit);
fit();

const scenes = [...document.querySelectorAll(".scene")];
const dots = document.getElementById("dots");
scenes.slice(1).forEach(() => dots.appendChild(document.createElement("i")));
let cur = 0,
  loop;

function go(i) {
  cur = i;
  clearInterval(loop);
  scenes.forEach((s, k) => s.classList.toggle("active", k === i));
  [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i - 1));
  const id = scenes[i].dataset.scene;
  if (id === "hello") {
    confetti(40);
    typeText(helloName, NAME);
  }
  if (id === "cake") resetCake();
  if (id === "wish") resetWish();
  if (id === "finale") {
    confetti(80);
    loop = setInterval(() => confetti(25), 2500);
  }
}
const next = () => go(Math.min(cur + 1, scenes.length - 1));
document.querySelectorAll("[data-next]").forEach((b) => (b.onclick = next));
replay.onclick = () => go(1);
setTimeout(next, 2800); // loading -> envelope

function typeText(el, txt) {
  el.textContent = "";
  let i = 0;
  const t = setInterval(() => {
    el.textContent = txt.slice(0, ++i);
    if (i >= txt.length) clearInterval(t);
  }, 150);
}

// Envelope: knob slides, card rises, bear + bunny pop in, then lights-off room
let opened = false;
openBtn.onclick = () => {
  if (opened) return;
  opened = true;
  openBtn.classList.add("go");
  env.classList.add("open");
  setTimeout(() => confetti(25), 600);
  setTimeout(() => {
    next();
    opened = false;
    env.classList.remove("open");
    openBtn.classList.remove("go");
  }, 2200);
};
// Lights: flash, then party room
lightBtn.onclick = () => {
  flash.classList.add("on");
  setTimeout(next, 350);
  setTimeout(() => flash.classList.remove("on"), 700);
};

function confetti(n) {
  const c = ["#ff7a9c", "#ffd166", "#9be7c4", "#b9a3ff", "#7cc8ff"];
  for (let i = 0; i < n; i++) {
    const e = document.createElement("i");
    e.className = "conf";
    e.style.cssText = `left:${Math.random() * 100}%;background:${c[i % 5]};animation-duration:${2.5 + Math.random() * 3}s;animation-delay:${Math.random() * 1.2}s`;
    scenes[cur].appendChild(e);
    setTimeout(() => e.remove(), 7000);
  }
}

// Cake: real image split into two halves, swipe top -> bottom to cut
function resetCake() {
  cake.className = "cake-wrap";
  cake.innerHTML = `
    <div class="cake-half left"><img src="images/teddy_cake.webp" alt="Birthday cake"></div>
    <div class="cake-half right"><img src="images/teddy_cake.webp" alt="Birthday cake"></div>
    <div class="cut-line"></div>
    <div class="knife-hint">👆 swipe down to cut</div>
  `;
  cakeTitle.textContent = "Make the first cut ✨";
  cakeSub.textContent = "Swipe down across the cake, top to bottom.";
  cakeBtn.classList.add("hidden");
}
let y0 = null, dragging = false;
cake.addEventListener("pointerdown", (e) => {
  y0 = e.clientY;
  dragging = false;
  cake.setPointerCapture(e.pointerId);
});
cake.addEventListener("pointermove", (e) => {
  if (y0 !== null && e.clientY - y0 > 18) dragging = true;
});
cake.addEventListener("pointerup", (e) => {
  if (dragging && e.clientY - y0 > 50 && !cake.classList.contains("cut")) {
    cake.classList.add("cut");
    confetti(50);
    cakeTitle.textContent = "You did it! 🎉";
    cakeSub.textContent = "The first slice is always the sweetest one.";
    cakeBtn.classList.remove("hidden");
  }
  y0 = null;
  dragging = false;
});

// Wish: candles go out
function resetWish() {
  wishScene.classList.remove("out");
  wishTitle.textContent = "Close your eyes...";
  wishSub.textContent = "Make a little wish for the year ahead.";
  wishBtn.textContent = "I made my wish ✨";
  wishBtn.onclick = () => {
    wishScene.classList.add("out");
    confetti(20);
    wishTitle.innerHTML = "Your wish is<br>on its way ✨";
    wishSub.textContent = "Somewhere, a tiny star just said yes.";
    wishBtn.textContent = "Continue 💫";
    wishBtn.onclick = next;
  };
}

// Auto-start music on first interaction
let ac, timer;
const notes = [262, 262, 294, 262, 349, 330, 262, 262, 294, 262, 392, 349];
function startMusic() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  let i = 0;
  timer = setInterval(() => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle";
    o.frequency.value = notes[i++ % notes.length] * 2;
    g.gain.setValueAtTime(0.08, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.5);
  }, 420);
}
document.addEventListener("pointerdown", startMusic, { once: true });
