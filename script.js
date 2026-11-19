(() => {
  const C = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Контент ----------
  $("introText").textContent = C.introText;
  $("herName").textContent = C.herName;
  $("lampText").innerHTML = esc(C.lightText || "Гэрэл асаах") + (C.lightHint ? `<small>${esc(C.lightHint)}</small>` : "");
  if (C.birthDate) {
    const b = new Date(C.birthDate + "T00:00:00"), n = new Date();
    if (!isNaN(b)) {
      let age = n.getFullYear() - b.getFullYear();
      if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
      if (age > 0) {
        $("cakeAge").textContent = age;
      }
    }
  }
  $("giftName").textContent = C.giftName || "";
  $("giftText").textContent = C.giftText || "";
  if (!C.introText && !C.giftName && !C.giftText) document.querySelector(".gift-section .caption").hidden = true;
  $("noteText").textContent = "Төрсөн өдрийн мэнд, " + C.herName + "!";
  $("sign").textContent = "— " + C.myName;
  $("footer").textContent = C.footer;

  $("letterBody").innerHTML = C.letter.map((t) => `<p>${esc(t)}</p>`).join("");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- Хамт байсан хугацаа ----------
  function renderCounter() {
    const el = $("counter");
    if (!C.togetherSince) return;
    const start = new Date(C.togetherSince + "T00:00:00");
    if (isNaN(start)) return;
    const tick = () => {
      const now = new Date();
      let y = now.getFullYear() - start.getFullYear();
      let m = now.getMonth() - start.getMonth();
      let d = now.getDate() - start.getDate();
      if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      const days = Math.floor((now - start) / 864e5);
      el.innerHTML = `<p class="counter-title">${esc(C.togetherLabel || "Бид хамт байгаа")}</p>` +
        [[y, "жил"], [m, "сар"], [d, "өдөр"], [days.toLocaleString("en-US"), "нийт өдөр"]]
          .map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join("");
    };
    tick();
    el.hidden = false;
  }

  // ---------- Бичигдэх эффект ----------
  function typeTagline() {
    const el = $("tagline");
    el.classList.remove("done");
    if (reduceMotion) { el.textContent = C.tagline; el.classList.add("done"); return; }
    el.textContent = "";
    let i = 0;
    const t = setInterval(() => {
      el.textContent = C.tagline.slice(0, ++i);
      if (i >= C.tagline.length) { clearInterval(t); el.classList.add("done"); }
    }, 55);
  }

  // ---------- Scroll reveal ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ---------- Canvas: хөвөгч зүрх ----------
  const hc = $("hearts"), hx = hc.getContext("2d");
  let hearts = [];
  function sizeCanvas(c) { c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; }
  function resize() { sizeCanvas(hc); sizeCanvas(cc); }
  const cc = $("confetti"), cx = cc.getContext("2d");
  addEventListener("resize", resize); resize();

  function spawnHeart() {
    hearts.push({
      x: Math.random() * hc.width, y: hc.height + 20,
      s: (8 + Math.random() * 18) * devicePixelRatio, v: (0.4 + Math.random() * 0.9) * devicePixelRatio,
      d: Math.random() * Math.PI * 2, a: 0.15 + Math.random() * 0.35,
    });
  }
  function drawHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s / 4);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
    ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.75, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.75, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
    ctx.fill();
  }
  function loopHearts() {
    hx.clearRect(0, 0, hc.width, hc.height);
    if (Math.random() < 0.06 && hearts.length < 40) spawnHeart();
    hearts = hearts.filter((h) => h.y > -40);
    hearts.forEach((h) => {
      h.y -= h.v; h.d += 0.02;
      hx.fillStyle = `rgba(255,122,168,${h.a})`;
      drawHeart(hx, h.x + Math.sin(h.d) * 20 * devicePixelRatio, h.y, h.s);
    });
    requestAnimationFrame(loopHearts);
  }
  if (!reduceMotion) loopHearts();

  // ---------- Canvas: конфетти ----------
  let bits = [], running = false;
  const colors = ["#ffd27a", "#ff7aa8", "#fff4f0", "#ff9ec0", "#f5b94d", "#c24d7e"];
  function burst(n = 160) {
    if (reduceMotion) return;
    const dpr = devicePixelRatio;
    for (let i = 0; i < n; i++) {
      const fromLeft = i % 2 === 0;
      bits.push({
        x: fromLeft ? 0 : cc.width, y: cc.height * 0.7,
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 12) * dpr, vy: -(10 + Math.random() * 16) * dpr,
        w: (6 + Math.random() * 6) * dpr, h: (4 + Math.random() * 8) * dpr,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[(Math.random() * colors.length) | 0], life: 0,
      });
    }
    if (!running) { running = true; requestAnimationFrame(loopConfetti); }
  }
  function loopConfetti() {
    cx.clearRect(0, 0, cc.width, cc.height);
    bits.forEach((b) => {
      b.vy += 0.35 * devicePixelRatio; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life++;
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.fillStyle = b.c;
      cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    });
    bits = bits.filter((b) => b.y < cc.height + 40 && b.life < 400);
    if (bits.length) requestAnimationFrame(loopConfetti);
    else { running = false; cx.clearRect(0, 0, cc.width, cc.height); }
  }

  // ---------- Хөгжим ----------
  const audio = $("music");
  if (C.music) audio.src = C.music;

  // ---------- Төрсөн өдрийн ая ----------
  // config.js-д music файл байвал түүнийг, үгүй бол хөтөч дотор Web Audio-оор аялгуу тоглуулна.
  let actx = null, master = null, muted = false, loopTimer = null;
  const LOOP_GAP = 1.5; // давталтын хооронд хэдэн секунд амрах
  const NOTE = { G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const SONG = [["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1],
    ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3]];
  function playTune() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      actx = actx || new AC();
      if (actx.resume) actx.resume();
      clearTimeout(loopTimer);
      if (master) master.disconnect();
      master = actx.createGain();
      master.gain.value = 0.9;
      master.connect(actx.destination);
      const beat = 0.58;
      let t = actx.currentTime + 0.08;
      SONG.forEach(([n, d]) => {
        const len = d * beat, end = t + Math.max(len * 1.7, 0.6);
        [[1, 0.5], [2, 0.17], [3, 0.07]].forEach(([mult, amp]) => {
          const o = actx.createOscillator(), g = actx.createGain();
          o.type = "sine";
          o.frequency.value = NOTE[n] * mult;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(amp * 0.32, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0006, end);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(end + 0.05);
        });
        t += len;
      });
      // Дуусмагц тасралтгүй дахин эхлүүлнэ
      loopTimer = setTimeout(() => { if (!muted) playTune(); }, (t - actx.currentTime + LOOP_GAP) * 1000);
    } catch (e) { /* дуу гарахгүй байсан ч хуудас ажиллана */ }
  }
  function startMusic() {
    if (muted) return;
    if (C.music) audio.play().catch(() => {});
    else playTune();
  }
  const soundBtn = $("soundBtn");
  soundBtn.addEventListener("click", () => {
    muted = !muted;
    soundBtn.textContent = muted ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-pressed", String(muted));
    soundBtn.setAttribute("aria-label", muted ? "Дууг нээх" : "Дууг хаах");
    if (muted) {
      clearTimeout(loopTimer);
      if (C.music) audio.pause();
      else if (master) master.gain.setTargetAtTime(0, actx.currentTime, 0.05);
    } else startMusic();
  });

  // ---------- Бэлэг задлах (хуудасны хамгийн доор) ----------
  const giftSec = $("giftSection"), giftBtn = $("openBtn");
  giftBtn.addEventListener("click", () => {
    giftBtn.disabled = true;
    giftSec.classList.add("opened");
    $("giftbox").classList.add("open");
    burst(160);
    setTimeout(() => giftSec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 300);
    setTimeout(() => {
      giftSec.classList.add("revealed");
      burst(140);
    }, 2600);
  });

  // ---------- Дурсамжийн зураг ----------
  const rots = [-2, 1.5, -1, 2, -1.5, 1, -2.5];
  const photos = (C.photos || []).filter((p) => p && p.src);
  if (photos.length) {
    $("gallery").innerHTML = photos.map((p, i) =>
      `<button class="pol" type="button" data-i="${i}" style="--r:${rots[i % rots.length]}deg" aria-label="Зургийг томруулах">` +
      `<img src="${esc(p.src)}" alt="${esc(p.caption || "Дурсамжийн зураг")}"${p.w && p.h ? ` width="${p.w}" height="${p.h}"` : ""} decoding="async" onerror="this.closest('.pol').remove()">` +
      (p.caption ? `<span>${esc(p.caption)}</span>` : "") + `</button>`
    ).join("");
  } else {
    $("memories").hidden = true;
  }

  const lb = $("lightbox"), lbImg = $("lbImg");
  let cur = 0, lastFocus = null;
  function showPhoto(i) {
    cur = (i + photos.length) % photos.length;
    lbImg.src = photos[cur].src;
    lbImg.alt = photos[cur].caption || "Дурсамжийн зураг";
  }
  function openLb(i) { lastFocus = document.activeElement; showPhoto(i); lb.hidden = false; lb.querySelector(".lb-close").focus(); }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute("src"); if (lastFocus) lastFocus.focus(); }
  $("gallery").addEventListener("click", (e) => {
    const b = e.target.closest(".pol");
    if (b) openLb(+b.dataset.i);
  });
  lb.addEventListener("click", (e) => {
    if (e.target.closest(".lb-prev")) showPhoto(cur - 1);
    else if (e.target.closest(".lb-next")) showPhoto(cur + 1);
    else if (e.target !== lbImg) closeLb();
  });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") showPhoto(cur - 1);
    else if (e.key === "ArrowRight") showPhoto(cur + 1);
  });

  // ---------- Эхний дэлгэц: гэрэл асаах ----------
  const dark = $("darkIntro"), lampBtn = $("lightBtn");
  let lit = false;
  lampBtn.addEventListener("click", () => {
    if (lit) return;
    lit = true;
    dark.classList.add("on");
    const t = reduceMotion ? 0 : 1000;
    setTimeout(() => {
      $("site").classList.remove("hidden");
      scrollTo(0, 0);
      renderCounter();
      typeTagline();
      burst(180);
      soundBtn.hidden = false;
      startMusic();
    }, t);
    setTimeout(() => dark.classList.add("gone"), t + 200);
    setTimeout(() => dark.remove(), t + 1400);
  });

  // ---------- Захидал задлах ----------
  const env = $("envelope"), wrap = $("letterWrap");
  env.addEventListener("click", () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    env.setAttribute("aria-expanded", "true");
    wrap.classList.add("show");
    burst(80);
    setTimeout(() => $("letter").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), 900);
  });

  // ---------- Лаа үлээх ----------
  $("blowBtn").addEventListener("click", () => {
    $("cake").classList.add("out");
    $("blowBtn").disabled = true;
    $("wish").textContent = C.wishText;
    burst(260);
    startMusic();
  });

  // ---------- Дахин ----------
  $("replayBtn").addEventListener("click", () => {
    scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    $("cake").classList.remove("out");
    $("blowBtn").disabled = false;
    $("wish").textContent = "";
    giftSec.classList.remove("opened", "revealed");
    $("giftbox").classList.remove("open");
    giftBtn.disabled = false;
    env.classList.remove("open");
    env.setAttribute("aria-expanded", "false");
    wrap.classList.remove("show");
    typeTagline();
    burst(220);
  });
})();
