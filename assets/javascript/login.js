/* =====================================================
   Zoológico — script.js
   Navegação entre telas + handlers de formulário
===================================================== */

'use strict';

// ── Utilitários ──────────────────────────────────────

/**
 * Troca a página visível animando a saída e entrada do card.
 * @param {string} targetId - id do elemento .page de destino
 */
function showPage(targetId) {
  const current = document.querySelector('.page.active');
  const next    = document.getElementById(targetId);
  if (!next || current === next) return;

  // Saída
  const currentCard = current.querySelector('.card');
  if (currentCard) {
    currentCard.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
    currentCard.style.opacity    = '0';
    currentCard.style.transform  = 'translateY(20px) scale(0.97)';
  }

  setTimeout(() => {
    current.classList.remove('active');
    next.classList.add('active');

    // Entrada
    const nextCard = next.querySelector('.card');
    if (nextCard) {
      nextCard.style.transition = 'none';
      nextCard.style.opacity    = '0';
      nextCard.style.transform  = 'translateY(30px) scale(0.97)';

      // Força repaint antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nextCard.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
          nextCard.style.opacity    = '1';
          nextCard.style.transform  = 'translateY(0) scale(1)';
        });
      });
    }
  }, 220);
}

/** Botão "Voltar" genérico — volta para a tela de login */
function goBack() {
  // Se a pessoa estiver no login e quiser voltar, manda pra Home!
  window.location.href = 'index.html'; 
}

// ── Validações ───────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function showInputError(input, msg) {
  clearInputError(input);
  input.style.borderColor = '#e05252';
  input.style.boxShadow   = '0 0 0 3px rgba(224,82,82,0.15)';

  const err = document.createElement('span');
  err.className   = 'input-error';
  err.textContent = msg;
  err.style.cssText = 'display:block;color:#c0392b;font-size:12px;margin-top:4px;font-weight:600;';
  input.parentNode.appendChild(err);
}

function clearInputError(input) {
  input.style.borderColor = '';
  input.style.boxShadow   = '';
  const prev = input.parentNode.querySelector('.input-error');
  if (prev) prev.remove();
}

function clearAllErrors(form) {
  form.querySelectorAll('input').forEach(clearInputError);
}

// ── Login ─────────────────────────────────────────────

function handleLogin(e) {
  e.preventDefault();
  const form  = e.target;
  const email = document.getElementById('login-email');
  const pass  = document.getElementById('login-pass');
  let valid   = true;

  clearAllErrors(form);

  if (!isValidEmail(email.value)) {
    showInputError(email, 'Informe um e-mail válido.');
    valid = false;
  }
  if (pass.value.length < 6) {
    showInputError(pass, 'A senha deve ter ao menos 6 caracteres.');
    valid = false;
  }

  if (!valid) return;

  // Simula login
  const btn = form.querySelector('.btn-cta');
  setLoading(btn, true, 'Entrando…');

  setTimeout(() => {
    setLoading(btn, false, 'Continuar');
    document.getElementById('success-msg').innerHTML =
      `Olá de volta! Bem-vindo ao Zoológico.<br>Prepare-se para explorar! 🌿`;
    showPage('page-success');
    form.reset();
  }, 1400);
}

// ── Cadastro ─────────────────────────────────────────

function handleRegister(e) {
  e.preventDefault();
  const form  = e.target;
  const fname = document.getElementById('reg-fname');
  const lname = document.getElementById('reg-lname');
  const email = document.getElementById('reg-email');
  const pass  = document.getElementById('reg-pass');
  const pass2 = document.getElementById('reg-pass2');
  let valid   = true;

  clearAllErrors(form);

  if (fname.value.trim().length < 2) {
    showInputError(fname, 'Informe seu nome.');
    valid = false;
  }
  if (lname.value.trim().length < 2) {
    showInputError(lname, 'Informe seu sobrenome.');
    valid = false;
  }
  if (!isValidEmail(email.value)) {
    showInputError(email, 'Informe um e-mail válido.');
    valid = false;
  }
  if (pass.value.length < 8) {
    showInputError(pass, 'A senha deve ter ao menos 8 caracteres.');
    valid = false;
  }
  if (pass2.value !== pass.value) {
    showInputError(pass2, 'As senhas não coincidem.');
    valid = false;
  }

  if (!valid) return;

  const btn = form.querySelector('.btn-cta');
  setLoading(btn, true, 'Criando conta…');

  setTimeout(() => {
    setLoading(btn, false, 'Criar minha conta');
    const name = fname.value.trim();
    document.getElementById('success-msg').innerHTML =
      `Conta criada com sucesso, <strong>${name}</strong>!<br>O zoológico está esperando por você. 🦁`;
    showPage('page-success');
    form.reset();
  }, 1600);
}

// ── Login social ─────────────────────────────────────

function socialLogin(provider) {
  const label = provider === 'google' ? 'Google' : 'Apple';
  // Em produção: redirecionar para OAuth
  showToast(`Redirecionando para o ${label}…`);
}

// ── Helpers de UI ─────────────────────────────────────

function setLoading(btn, loading, text) {
  btn.disabled     = loading;
  btn.textContent  = loading ? `⏳ ${text}` : text;
  btn.style.opacity = loading ? '0.75' : '1';
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(60,35,10,0.92); color: #fff;
    padding: 12px 24px; border-radius: 50px;
    font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: toastIn 0.3s ease; z-index: 999;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity:0; transform: translateX(-50%) translateY(12px); }
      to   { opacity:1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity    = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── Pequenas melhorias de UX ──────────────────────────

// Limpa erro quando o usuário começa a digitar
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearInputError(input));
  });
});