/* ============================================================
   SAFARI ALPHA — app.js
   Fluxo completo: 5 telas + validação + confete
   ============================================================ */

(function () {
  "use strict";

  /* ---- ESTADO ---- */
  const state = {
    currentStep: 1,
    totalSteps: 4, // steps visíveis no progress (tela 5 é sucesso)
    name: "",
    age: null,
    time: 30,
    lang: "simultaneous",
    character: null,
    characterEmoji: "🐘",
    hairColor: "#F5C542",
    outfitColor: "#4CAF82",
    accessory: "Nenhum",
    accessoryIcon: "",
  };

  const langLabels = {
    simultaneous: "Igual em PT e EN",
    pt_first: "PT primeiro, EN gradual",
    en_first: "EN primeiro, PT gradual",
  };

  /* ---- ELEMENTOS ---- */
  const progressFill    = document.getElementById("progressFill");
  const stepLabel       = document.getElementById("stepLabel");
  const btnBack         = document.getElementById("btnBack");
  const btnPrev         = document.getElementById("btnPrev");
  const btnNext         = document.getElementById("btnNext");
  const appFooter       = document.getElementById("appFooter");
  const screensContainer = document.getElementById("screensContainer");

  /* ---- TELAS ---- */
  const screens = Array.from(document.querySelectorAll(".screen"));

  /* ============================================================
     NAVEGAÇÃO
  ============================================================ */
  function goTo(step) {
    const prev = state.currentStep;
    state.currentStep = step;

    screens.forEach((s, i) => {
      const n = i + 1;
      s.classList.remove("active", "exit");
      if (n === prev) s.classList.add("exit");
      if (n === step) {
        // Remove exit after anim so it doesn't clash
        setTimeout(() => s.classList.remove("exit"), 420);
        s.classList.add("active");
      }
    });

    updateProgress();
    updateFooter();
  }

  function updateProgress() {
    const step = Math.min(state.currentStep, 4);
    const pct = (step / 4) * 100;
    progressFill.style.width = pct + "%";

    if (state.currentStep <= 4) {
      stepLabel.textContent = `Passo ${state.currentStep} de 4`;
    } else {
      stepLabel.textContent = "Concluído! 🎉";
    }
  }

  function updateFooter() {
    // Tela 5 esconde footer
    if (state.currentStep === 5) {
      appFooter.style.display = "none";
    } else {
      appFooter.style.display = "flex";
    }

    // Tela 1 esconde Voltar
    btnPrev.style.display = state.currentStep === 1 ? "none" : "flex";

    // Texto do botão continuar
    if (state.currentStep === 4) {
      btnNext.textContent = "Finalizar →";
    } else {
      btnNext.textContent = "Continuar →";
    }
  }

  /* ============================================================
     VALIDAÇÃO POR TELA
  ============================================================ */
  function validateStep(step) {
    const err1 = document.getElementById("error1");
    const err3 = document.getElementById("error3");

    if (step === 1) {
      const name = document.getElementById("explorerName").value.trim();
      if (!name) {
        showError(err1, "Por favor, insira o nome ou apelido da criança.");
        return false;
      }
      if (!state.age) {
        showError(err1, "Por favor, selecione a idade.");
        return false;
      }
      hideError(err1);
      state.name = name;
      return true;
    }

    if (step === 2) {
      return true; // Sempre válido (já tem defaults)
    }

    if (step === 3) {
      if (!state.character) {
        showError(err3, "Por favor, escolha um personagem para continuar.");
        return false;
      }
      hideError(err3);
      return true;
    }

    if (step === 4) {
      return true;
    }

    return true;
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add("visible");
    setTimeout(() => el.classList.remove("visible"), 3500);
  }

  function hideError(el) {
    el.classList.remove("visible");
  }

  /* ============================================================
     BOTÕES DE NAVEGAÇÃO
  ============================================================ */
  btnNext.addEventListener("click", () => {
    if (!validateStep(state.currentStep)) return;

    if (state.currentStep === 4) {
      buildSummary();
      goTo(5);
      launchConfetti();
      return;
    }

    const nextStep = state.currentStep + 1;
    goTo(nextStep);

    // Atualiza textos dinâmicos ao entrar em cada tela
    const name = state.name || "Explorador";
    if (nextStep === 2) {
      document.getElementById("screen2Subtitle").textContent =
        `Configure o tempo e o idioma para ${name}`;
    }
    if (nextStep === 4) {
      updateAvatarPreview();
    }
  });

  btnPrev.addEventListener("click", () => {
    if (state.currentStep > 1) {
      goTo(state.currentStep - 1);
    }
  });

  btnBack.addEventListener("click", () => {
    if (state.currentStep > 1) {
      goTo(state.currentStep - 1);
    }
  });

  /* ============================================================
     TELA 1: Nome + Idade
  ============================================================ */
  document.getElementById("explorerName").addEventListener("input", function () {
    state.name = this.value.trim();
  });

  document.getElementById("ageGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".age-btn");
    if (!btn) return;

    document.querySelectorAll(".age-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.age = parseInt(btn.dataset.age, 10);
  });

  /* ============================================================
     TELA 2: Tempo + Idioma
  ============================================================ */
  document.getElementById("timeGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".time-btn");
    if (!btn) return;

    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.time = parseInt(btn.dataset.time, 10);
  });

  document.getElementById("langGroup").addEventListener("click", (e) => {
    const card = e.target.closest(".radio-card");
    if (!card) return;

    document.querySelectorAll(".radio-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    const radio = card.querySelector("input[type='radio']");
    radio.checked = true;
    state.lang = radio.value;
  });

  /* ============================================================
     TELA 3: Personagem
  ============================================================ */
  document.getElementById("characterGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".char-btn");
    if (!btn) return;

    document.querySelectorAll(".char-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.character = btn.dataset.char;
    state.characterEmoji = btn.dataset.emoji;

    // Atualiza preview na tela 4
    updateAvatarPreview();
  });

  /* ============================================================
     TELA 4: Personalização
  ============================================================ */
  function updateAvatarPreview() {
    const emoji = state.characterEmoji;
    const name  = state.name || "Explorador";
    const char  = state.character || "Elefantinho";

    document.getElementById("avatarEmoji").textContent = emoji;
    document.getElementById("avatarLabel").textContent = `${name} — ${char}`;

    const frame = document.getElementById("avatarPreview");
    frame.style.background = `linear-gradient(135deg, ${hexToRgba(state.outfitColor, .25)}, ${hexToRgba(state.hairColor, .2)})`;
    frame.style.borderColor = state.outfitColor;

    const badge = document.getElementById("avatarBadge");
    badge.textContent = state.accessoryIcon;
  }

  // Cores do pelo
  document.getElementById("hairColors").addEventListener("click", (e) => {
    const btn = e.target.closest(".color-dot[data-type='hair']");
    if (!btn) return;
    document.querySelectorAll(".color-dot[data-type='hair']").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.hairColor = btn.dataset.color;
    updateAvatarPreview();
  });

  // Cores do figurino
  document.getElementById("outfitColors").addEventListener("click", (e) => {
    const btn = e.target.closest(".color-dot[data-type='outfit']");
    if (!btn) return;
    document.querySelectorAll(".color-dot[data-type='outfit']").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.outfitColor = btn.dataset.color;
    updateAvatarPreview();
  });

  // Acessórios
  document.getElementById("accessoriesGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".acc-btn");
    if (!btn) return;
    document.querySelectorAll(".acc-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.accessory = btn.dataset.acc;
    state.accessoryIcon = btn.querySelector(".acc-icon").textContent;
    if (state.accessory === "Nenhum") state.accessoryIcon = "";
    updateAvatarPreview();
  });

  /* ============================================================
     TELA 5: Resumo
  ============================================================ */
  function buildSummary() {
    const name  = state.name || "Explorador";
    const age   = state.age || "?";
    const char  = state.character || "Elefantinho";
    const emoji = state.characterEmoji;

    document.getElementById("successTitle").textContent = `Incrível, ${name}!`;
    document.getElementById("successAvatar").textContent = emoji;

    document.getElementById("sumName").textContent  = `Explorador: ${name} (${age} anos)`;
    document.getElementById("sumTime").textContent  = `Tempo diário: ${state.time} minutos`;
    document.getElementById("sumLang").textContent  = `Idiomas: ${langLabels[state.lang]}`;
    document.getElementById("sumChar").textContent  = `Personagem: ${char}`;
  }

  document.getElementById("btnStart").addEventListener("click", () => {
    launchConfetti(true);
    
    setTimeout(() => {
      // Manda a criança para o Mapa!
      window.location.href = "mapa.html";
    }, 1500); // 1.5 segundos para dar tempo de ver a explosão de confetes 🎉
  });

  /* ============================================================
     CONFETI
  ============================================================ */
  function launchConfetti(intense = false) {
    const canvas = document.getElementById("confettiCanvas");
    const ctx    = canvas.getContext("2d");

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";

    const colors = ["#F5C542","#3EAF7C","#E87C3E","#6AB4D8","#E95B8C","#A8DFC0","#fff"];
    const particles = [];
    const count = intense ? 160 : 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x:    Math.random() * canvas.width,
        y:    -20,
        w:    6 + Math.random() * 10,
        h:    10 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx:   -3 + Math.random() * 6,
        vy:   3 + Math.random() * 5,
        rot:  Math.random() * 360,
        dRot: -3 + Math.random() * 6,
        opacity: 1,
        delay: Math.random() * 60,
      });
    }

    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        if (frame < p.delay) continue;
        p.y   += p.vy;
        p.x   += p.vx;
        p.rot += p.dRot;
        p.vy  += 0.08; // gravity
        if (p.y < canvas.height + 30) alive = true;
        if (p.y > canvas.height) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.fill();
        ctx.restore();
      }

      frame++;
      if (alive) {
        requestAnimationFrame(draw);
      } else {
        canvas.style.display = "none";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(draw);
  }

  /* ============================================================
     UTILS
  ============================================================ */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    updateProgress();
    updateFooter();
    updateAvatarPreview();
  }

  init();
})();