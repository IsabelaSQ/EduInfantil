const App = (() => {

    /* ---- Estado global ---- */
    const state = {
      currentPage: 'home',
      lang: 'br',
      currentExplorer: null,
      senhaSequencia: [],       // animais escolhidos na senha
      senhaCorreta: null,       // senha do explorador selecionado
    };
  
    /* ---- Dados dos exploradores ---- */
    const explorers = [
      { id: 1, nome: 'Ana',   emoji: '👧', senha: ['🦁','🐘','🐒'], moedas: 24 },
      { id: 2, nome: 'Pedro', emoji: '👦', senha: ['🦒','🦓','🐯'], moedas: 10 },
      { id: 3, nome: 'Luna',  emoji: '👧🏾', senha: ['🐼','🐨','🐰'], moedas: 5  },
      { id: 4, nome: 'Danto', emoji: '👦🏻', senha: ['🐊','🦊','🐻'], moedas: 0  },
    ];
  
    /* ---- Lista de animais para a senha ---- */
    const animais = [
      { emoji: '🦁', label: 'Leão'     },
      { emoji: '🐘', label: 'Elefante' },
      { emoji: '🐒', label: 'Macaco'   },
      { emoji: '🦒', label: 'Girafa'   },
      { emoji: '🦓', label: 'Zebra'    },
      { emoji: '🐯', label: 'Tigre'    },
      { emoji: '🐼', label: 'Panda'    },
      { emoji: '🐨', label: 'Coala'    },
      { emoji: '🐰', label: 'Coelho'   },
    ];
  
    /* ====================================================
       NAVEGAÇÃO
    ==================================================== */
    function goTo(page) {
      if (page === 'exploradores') {
        window.location.href = 'exploradores.html';
      } 
      else if (page === 'senha') {
        window.location.href = 'senha_bichos.html';
      } 
      else if (page === 'pais') {
        window.location.href = 'pais.html';
      }
      else if (page === 'home') {
        window.location.href = 'index.html';
      }
      else if (page === 'mapa') {
        window.location.href = 'mapa.html';
      }
      else if (page === 'trilha') {
        window.location.href = 'trilha.html';
      }
      else if (page === 'ponte') {
        window.location.href = 'ponte.html';
      }
      else if (page === 'bolhas') {
        window.location.href = 'bolhas.html';
      }
      else if (page === 'livro') {
        window.location.href = 'livro.html';
      }
    }
  
    /* ====================================================
       PÁGINA: EXPLORADORES
    ==================================================== */
    function renderExplorers() {
      const grid = document.getElementById('explorers-grid');
      grid.innerHTML = '';
  
      explorers.forEach(exp => {
        const btn = document.createElement('button');
        btn.className = 'explorer-btn';
        btn.innerHTML = `
          <div class="explorer-avatar">${exp.emoji}</div>
          <span class="explorer-name">${exp.nome}</span>
        `;
        btn.onclick = () => selectExplorer(exp);
        grid.appendChild(btn);
      });
    }
  
    function selectExplorer(exp) {
      state.currentExplorer = exp;
      state.senhaCorreta    = exp.senha;
      state.senhaSequencia  = [];
      
      sessionStorage.setItem('explorerAtivo', exp.id);
      
      goTo('senha');
    }
  
    function novoExplorador() {
      openModal('➕', 'Novo Explorador',
        'Funcionalidade disponível em breve!\nConecte ao servidor PHP para criar perfis.',
        null, 'OK');
    }
  
    /* ====================================================
       ABA DE TOPO (TOAST NOTIFICATION)
    ==================================================== */
    function mostrarAvisoTopo(emoji, mensagem, callback) {
      // Cria a caixinha no HTML
      const banner = document.createElement('div');
      banner.className = 'top-banner';
      banner.innerHTML = `<span>${emoji}</span> <span>${mensagem}</span>`;
      
      document.body.appendChild(banner);

      // Faz a aba descer
      setTimeout(() => banner.classList.add('show'), 10);

      // Espera 2 segundos, sobe a aba de volta e vai pro mapa
      setTimeout(() => {
        banner.classList.remove('show'); // Sobe
        setTimeout(() => {
          banner.remove(); // Limpa do HTML
          if (callback) callback(); // Vai pro mapa
        }, 500); 
      }, 2000); 
    }

    /* ====================================================
       PÁGINA: SENHA DOS BICHINHOS
    ==================================================== */
    function renderSenha() {
      state.senhaSequencia = [];
  
      // Slots
      const slots = document.querySelectorAll('.slot');
      slots.forEach(s => {
        s.textContent = '❓';
        s.classList.remove('filled');
      });
  
      // Grade de animais
      const grid = document.getElementById('animais-grid');
      grid.innerHTML = '';
      animais.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.dataset.emoji = a.emoji;
        btn.innerHTML = `
          <span class="animal-emoji">${a.emoji}</span>
          <span class="animal-label">${a.label}</span>
        `;
        btn.onclick = () => escolherAnimal(a.emoji, btn);
        grid.appendChild(btn);
      });
    }
  
    function escolherAnimal(emoji, btn) {
      if (state.senhaSequencia.length >= 3) return;
  
      state.senhaSequencia.push(emoji);
      btn.classList.add('selected');
  
      // Atualiza slot visual
      const idx   = state.senhaSequencia.length - 1;
      const slot  = document.querySelector(`.slot[data-index="${idx}"]`);
      if (slot) {
        slot.textContent = emoji;
        slot.classList.add('filled');
      }
  
      // Verifica quando 3 forem escolhidos
      if (state.senhaSequencia.length === 3) {
        setTimeout(verificarSenha, 500);
      }
    }
  
    function removeSlot(index) {
      const slot = document.querySelector(`.slot[data-index="${index}"]`);
      if (!slot || !slot.classList.contains('filled')) return;
  
      // Remove do array
      const removedEmoji = state.senhaSequencia.splice(index, 1)[0];
      slot.textContent = '❓';
      slot.classList.remove('filled');
  
      // Reagrupa slots restantes
      const slots = document.querySelectorAll('.slot');
      state.senhaSequencia.forEach((e, i) => {
        slots[i].textContent = e;
        slots[i].classList.add('filled');
      });
      for (let i = state.senhaSequencia.length; i < 3; i++) {
        slots[i].textContent = '❓';
        slots[i].classList.remove('filled');
      }
  
      // Reabilita botão do animal removido
      document.querySelectorAll('.animal-btn').forEach(btn => {
        if (btn.dataset.emoji === removedEmoji) btn.classList.remove('selected');
      });
    }
  
    function verificarSenha() {
      const correta  = state.senhaCorreta;
      const escolhida = state.senhaSequencia;

      const ok = correta.every((e, i) => e === escolhida[i]);

      if (ok) {
        // SUcesso: Salva e abre o Modal de comemoração
        salvarLogin(state.currentExplorer.id);
        openModal('🎉', `Bem-vindo, ${state.currentExplorer.nome}!`, 'Senha correta! Vamos explorar o mapa?', () => goTo('mapa'), 'Vamos lá!');
      } else {
        // Erro: Abre o Modal avisando que errou e reseta os slots
        openModal('❌', 'Ah não...', 'A senha dos bichinhos está diferente. Que tal tentar de novo?', () => renderSenha(), 'Tentar Novamente');
      }
     }
    /* ====================================================
       PÁGINA: MAPA
    ==================================================== */
    function updateTopbar() {
      const exp = state.currentExplorer;
      if (!exp) return;
      document.getElementById('topbar-name').textContent   = exp.nome;
      document.getElementById('topbar-avatar').textContent = exp.emoji;
      document.getElementById('topbar-coins').textContent  = exp.moedas;
    }
  
    function openLevel(section, level) {
      const sectionNames = {
        fazendinha: 'Fazendinha 🐄',
        floresta:   'Floresta 🌳',
        savana:     'Savana 🦁',
        mar:        'Fundo do Mar 🐠',
      };
  
      openModal(
        '🎮', 
        `${sectionNames[section]} - Fase ${level}`, 
        `Preparado para jogar? Bora aprender!`, 
        () => {
          // *** NOVA LINHA: GUARDA O NÍVEL NA MEMÓRIA! ***
          sessionStorage.setItem('currentLevel', level);

          if (section === 'fazendinha') goTo('trilha');
          else if (section === 'savana') goTo('ponte');
          else if (section === 'mar') goTo('bolhas');
          else alert("O jogo da Floresta chega em breve!"); 
        }, 
        'Jogar!'
      );
    }

    /* ====================================================
       PESQUISA E NAVEGAÇÃO DO MAPA
    ==================================================== */
    function openSearch() {
      openModal('🔍', 'Pesquisar', 'Busca de fases em breve!', null, 'OK');
    }
    function abrirMapaIlustrado() {
      // Aqui você coloca o caminho da imagem do seu mapa maravilhoso
      // Se a imagem se chamar "mapa.png" e estiver na pasta imagens, ajuste o src=""
      const imgHtml = `<img src="../assets/img/mapa_biomas.png" style="width: 100%; border-radius: 12px; margin-top: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">`;
      
      openModal('🗺️', 'Mapa Maravilhoso', imgHtml, null, 'Uau, legal!');
    }

    function setNav(btn) {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  
    /* ====================================================
       MODAL
    ==================================================== */
    function openModal(emoji, title, desc, actionCallback, actionText) {
      // 1. Encontra a tela escura
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return; // Segurança caso a página não tenha modal

      // 2. Preenche os textos DENTRO da caixa branca
      document.getElementById('modal-emoji').innerHTML = emoji;
      document.getElementById('modal-title').innerText = title;
      document.getElementById('modal-desc').innerHTML = desc;

      // 3. Configura o botão de ação (Tentar Novamente / Vamos lá!)
      const btnAction = document.getElementById('modal-action');
      if (btnAction) {
        btnAction.innerText = actionText || 'Confirmar';
        btnAction.onclick = () => {
          closeModal();
          if (actionCallback) actionCallback();
        };
      }

      // 4. Mostra o modal (Adiciona a classe que criamos no CSS ou força o display)
      overlay.style.display = 'flex';
      overlay.classList.add('open');
    }

    function closeModal() {
      const overlay = document.getElementById('modal-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.classList.remove('open');
      }
    }
  
    /* ====================================================
       IDIOMA
    ==================================================== */
    function setLang(lang) {
      state.lang = lang;
      document.getElementById('lang-br').classList.toggle('active', lang === 'br');
      document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    }
  
    /* ====================================================
       COMUNICAÇÃO COM PHP (API)
    ==================================================== */
    async function salvarLogin(explorerId) {
      try {
        const res = await fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', explorer_id: explorerId }),
        });
        const data = await res.json();
        if (data.moedas !== undefined) {
          state.currentExplorer.moedas = data.moedas;
          document.getElementById('topbar-coins').textContent = data.moedas;
        }
      } catch (err) {
        console.warn('API indisponível (modo offline):', err.message);
      }
    }
  
    async function carregarExploradores() {
      try {
        const res  = await fetch('api.php?action=exploradores');
        const data = await res.json();
        if (data.exploradores && Array.isArray(data.exploradores)) {
          explorers.length = 0;
          data.exploradores.forEach(e => explorers.push(e));
        }
      } catch (err) {
        console.warn('API indisponível — usando dados locais.');
      }
    }
  
    async function salvarProgresso(explorerId, section, level, estrelas) {
      try {
        await fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'progresso',
            explorer_id: explorerId,
            section,
            level,
            estrelas,
          }),
        });
      } catch (err) {
        console.warn('Falha ao salvar progresso:', err.message);
      }
    }
  
    /* ====================================================
       DADOS DOS MINI-GAMES
    ==================================================== */
    const gameData = {
      trilha: { 
        1: { letter: 'A', word: 'Abelha', emoji: '🐝' },
        2: { letter: 'E', word: 'Elefante', emoji: '🐘' },
        3: { letter: 'I', word: 'Iguana', emoji: '🦎' }
      },
      ponte: { 
        1: { word: 'Macaco', syllables: ['MA', 'CA', 'CO'], emoji: '🐒' },
        2: { word: 'Naja', syllables: ['NA', 'JA'], emoji: '🐍' } // O jogo da letra N!
      },
      bolhas: { 
        1: { target: 'T', letters: ['A', 'T', 'E', 'I', 'T', 'O', 'T', 'U'] } // Alvo T!
      }
    };
  
    /* ====================================================
       JOGO 1: TRILHA DA FORMIGUINHA
    ==================================================== */
    function renderTrilha() {
      // Pega a fase atual salva (ou usa 1 como padrão)
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.trilha[level];

      const box = document.getElementById('trace-letter');
      box.innerHTML = `${data.letter} <span class="ant-icon">🐜</span>`; 
      document.getElementById('trilha-animal').innerText = `${data.emoji} ${data.word}`;
      
      box.classList.remove('traced');
      box.classList.add('untraced');
      
      box.onclick = () => {
        if(box.classList.contains('traced')) return;
        box.classList.remove('untraced');
        box.classList.add('traced');
        
        setTimeout(() => {
          salvarProgresso(state.currentExplorer?.id, 'fazendinha', level, 1);
          openModal('🎉', 'Parabéns!', `Você ajudou a formiguinha e traçou a letra ${data.letter}!`, () => goTo('mapa'), 'Voltar pro Mapa');
        }, 1200);
      };
    }
  
    /* ====================================================
       JOGO 2: PONTE DOS CROCODILOS
    ==================================================== */
    function renderPonte() {
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.ponte[level];

      state.ponteSelecionadas = [];
      document.getElementById('ponte-animal').innerText = data.emoji;
      
      const slots = document.getElementById('ponte-slots');
      slots.innerHTML = data.syllables.map(() => `<div class="syl-slot">?</div>`).join('');
      
      const crocs = document.getElementById('ponte-crocs');
      const shuffled = [...data.syllables].sort(() => Math.random() - 0.5);
      
      crocs.innerHTML = shuffled.map((syl, i) => `
        <button class="btn-croc" id="btn-croc-${i}" onclick="App.escolherSilaba('${syl}', 'btn-croc-${i}')">
          🐊 ${syl}
        </button>
      `).join('');
    }
  
    function escolherSilaba(syl, btnId) {
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.ponte[level];

      if(state.ponteSelecionadas.length >= data.syllables.length) return;
      
      document.getElementById(btnId).classList.add('used');
      state.ponteSelecionadas.push(syl);
      
      const slots = document.getElementById('ponte-slots').children;
      const idx = state.ponteSelecionadas.length - 1;
      slots[idx].innerText = syl;
      slots[idx].classList.add('filled');
      
      if(state.ponteSelecionadas.length === data.syllables.length) {
        setTimeout(verificarPonte, 500);
      }
    }
  
    function verificarPonte() {
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.ponte[level];

      const correto = data.syllables.join('');
      const escolhido = state.ponteSelecionadas.join('');
      
      if(correto === escolhido) {
        salvarProgresso(state.currentExplorer?.id, 'savana', level, 1);
        openModal('🏆', 'Parabéns!', `A ponte formou ${correto}!`, () => goTo('mapa'), 'Voltar pro Mapa');
      } else {
        openModal('❌', 'Ops!', 'A ponte balançou! Vamos tentar de novo?', () => renderPonte(), 'Tentar Novamente');
      }
    }
  
    /* ====================================================
       JOGO 3: RESGATE DAS BOLHAS
    ==================================================== */
    function renderBolhas() {
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.bolhas[level];

      document.getElementById('bolhas-target').innerText = data.target;
      state.bolhasEstouradas = 0;
      state.bolhasTotal = data.letters.filter(v => v === data.target).length;
  
      const sky = document.getElementById('bolhas-sky');
      sky.innerHTML = '';
      
      data.letters.forEach((v, i) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerText = v;
        bubble.style.left = `${Math.random() * 80 + 10}%`; 
        bubble.style.animationDuration = `${Math.random() * 4 + 4}s`;
        bubble.style.animationDelay = `${Math.random() * 2}s`;
        const size = Math.random() * 30 + 50;
        bubble.style.width = `${size}px`; bubble.style.height = `${size}px`;
        
        bubble.onclick = () => estourarBolha(v, bubble);
        sky.appendChild(bubble);
      });
    }
  
    function estourarBolha(letra, el) {
      const level = sessionStorage.getItem('currentLevel') || 1;
      const data = gameData.bolhas[level];

      if(letra === data.target) {
        el.style.display = 'none';
        state.bolhasEstouradas++;
  
        if (state.bolhasEstouradas === state.bolhasTotal) {
          salvarProgresso(state.currentExplorer?.id, 'mar', level, 1);
          openModal('🫧', 'Fantástico!', `Você encontrou todas as bolhas com a letra ${letra}!`, () => goTo('mapa'), 'Voltar pro Mapa');
        }
      } else {
        el.style.background = 'rgba(255,0,0,0.4)'; 
        setTimeout(() => el.style.background = 'rgba(255, 255, 255, 0.4)', 500);
      }
    }

    /* =============================INIT ============================*/
    async function init() {
      await carregarExploradores();
      
      if (document.getElementById('page-exploradores')) {
        renderExplorers();
      } 
      else if (document.getElementById('page-senha')) {
        const explorerId = sessionStorage.getItem('explorerAtivo');
        if (explorerId) {
          state.currentExplorer = explorers.find(e => e.id == explorerId);
          state.senhaCorreta = state.currentExplorer.senha;
          renderSenha();
        } else {
          goTo('exploradores'); 
        }
      } 
      else if (document.getElementById('page-mapa')) {
        const explorerId = sessionStorage.getItem('explorerAtivo');
        if (explorerId) {
          state.currentExplorer = explorers.find(e => e.id == explorerId);
          updateTopbar();
        } else {
          goTo('exploradores');
        }
      }

      else if (document.getElementById('page-trilha')) { 
        renderTrilha(); 
      }

      else if (document.getElementById('page-ponte')) { 
        renderPonte(); 
      }

      else if (document.getElementById('page-bolhas')) { 
        renderBolhas(); 
      }
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
      goTo,
      setLang,
      novoExplorador,
      escolherAnimal,
      removeSlot,
      openLevel,
      openSearch,
      setNav,
      openModal,
      closeModal,
      escolherSilaba,
      estourarBolha,
      salvarProgresso,
      abrirMapaIlustrado
    };
  
  })();

// =============================================
//  CADERNO DE EXPLORAÇÃO — Script
// =============================================

const ANIMALS = [
  { id: 1, emoji: '🐄', pt: 'Vaca',      en: 'Cow'      },
  { id: 2, emoji: '🐓', pt: 'Galo',      en: 'Rooster'  },
  { id: 3, emoji: '🐷', pt: 'Porco',     en: 'Pig'      },
  { id: 4, emoji: '🦁', pt: 'Leão',      en: 'Lion'     },
  { id: 5, emoji: '🐘', pt: 'Elefante',  en: 'Elephant' },
  { id: 6, emoji: '🐒', pt: 'Macaco',    en: 'Monkey'   },
  { id: 7, emoji: '🐠', pt: 'Peixe',     en: 'Fish'     },
  { id: 8, emoji: '🐳', pt: 'Baleia',    en: 'Whale'    },
];

// State
let discovered = new Set([1, 2]); // Start with Vaca and Galo discovered (as per original)
let isEnglish = false;

// DOM refs
const gridBR      = document.getElementById('gridBR');
const gridGB      = document.getElementById('gridGB');
const counterBR   = document.getElementById('counterBR');
const counterGB   = document.getElementById('counterGB');
const footerCount = document.getElementById('footerCount');
const btnLang     = document.getElementById('btnLang');
const btnPrint    = document.getElementById('btnPrint');
const dotsBR      = document.getElementById('dotsBR');
const headerTitle = document.getElementById('headerTitle');

// =============================================
//  RENDER
// =============================================

function renderGrids() {
  gridBR.innerHTML = '';
  gridGB.innerHTML = '';

  ANIMALS.forEach(animal => {
    const isUnlocked = discovered.has(animal.id);

    // BR card
    const cardBR = createCard(animal, isUnlocked, 'br');
    gridBR.appendChild(cardBR);

    // GB card
    const cardGB = createCard(animal, isUnlocked, 'gb');
    gridGB.appendChild(cardGB);
  });

  updateCounters();
  renderDots();
}

function createCard(animal, isUnlocked, panel) {
  const card = document.createElement('div');
  card.className = `card ${isUnlocked ? 'unlocked' : 'locked'}`;
  card.dataset.id = animal.id;
  card.dataset.panel = panel;

  if (isUnlocked) {
    const emoji = document.createElement('div');
    emoji.className = 'animal-emoji';
    emoji.textContent = animal.emoji;

    const name = document.createElement('div');
    name.className = 'animal-name';
    name.textContent = panel === 'br'
      ? (isEnglish ? animal.en : animal.pt)
      : animal.en;

    card.appendChild(emoji);
    card.appendChild(name);
  } else {
    const lockDiv = document.createElement('div');
    lockDiv.className = 'lock-icon';
    lockDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    `;

    const label = document.createElement('div');
    label.className = 'lock-label';
    label.textContent = panel === 'br'
      ? (isEnglish ? animal.en : animal.pt)
      : animal.en;

    card.appendChild(lockDiv);
    card.appendChild(label);
  }

  // Click to unlock
  card.addEventListener('click', () => handleCardClick(animal.id, card));

  return card;
}

// =============================================
//  CARD CLICK (UNLOCK)
// =============================================

function handleCardClick(animalId, clickedCard) {
  if (discovered.has(animalId)) return; // Already discovered

  discovered.add(animalId);
  
  // Flash animation before re-render
  clickedCard.classList.add('just-unlocked');

  // Confetti burst
  launchConfetti(clickedCard);

  // Re-render after a short delay
  setTimeout(() => {
    renderGrids();

    // Pulse the newly unlocked cards
    const allCards = document.querySelectorAll(`.card[data-id="${animalId}"]`);
    allCards.forEach(c => {
      c.classList.add('just-unlocked');
      setTimeout(() => c.classList.remove('just-unlocked'), 700);
    });

    // Check for completion
    if (discovered.size === ANIMALS.length) {
      setTimeout(showCompletion, 400);
    }
  }, 150);
}

// =============================================
//  COUNTERS & DOTS
// =============================================

function updateCounters() {
  const count = discovered.size;
  const total = ANIMALS.length;

  counterBR.textContent = `${count}/${total}`;
  counterGB.textContent = `${count}/${total}`;

  const label = isEnglish
    ? `${count} of ${total} stickers`
    : `${count} de ${total} figurinhas`;

  footerCount.textContent = label;
}

function renderDots() {
  dotsBR.innerHTML = '';
  ANIMALS.forEach(animal => {
    const dot = document.createElement('div');
    dot.className = `dot ${discovered.has(animal.id) ? 'active' : ''}`;
    dotsBR.appendChild(dot);
  });
}

// =============================================
//  LANGUAGE TOGGLE
// =============================================

btnLang.addEventListener('click', () => {
  isEnglish = !isEnglish;
  document.body.classList.toggle('lang-en', isEnglish);
  btnLang.classList.toggle('lang-en', isEnglish);

  // Update header title
  headerTitle.textContent = isEnglish
    ? 'Exploration Notebook'
    : 'Caderno de Exploração';

  // Update panel titles
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = isEnglish ? el.dataset.en : el.dataset.pt;
  });

  // Update print button
  const printSpan = btnPrint.querySelector('span');
  printSpan.textContent = isEnglish ? 'Print Page' : 'Imprimir Página';

  // Show tooltip
  showLangTooltip(isEnglish ? 'Switched to English 🇬🇧' : 'Mudado para Português 🇧🇷');

  // Re-render cards with new labels
  renderGrids();
});

function showLangTooltip(message) {
  // Remove existing tooltip
  const old = document.querySelector('.lang-tooltip');
  if (old) old.remove();

  const tooltip = document.createElement('div');
  tooltip.className = 'lang-tooltip';
  tooltip.textContent = message;
  document.querySelector('.header').appendChild(tooltip);

  requestAnimationFrame(() => {
    tooltip.classList.add('show');
  });

  setTimeout(() => {
    tooltip.classList.remove('show');
    setTimeout(() => tooltip.remove(), 300);
  }, 2000);
}

// =============================================
//  PRINT
// =============================================

btnPrint.addEventListener('click', () => {
  window.print();
});

// =============================================
//  CONFETTI
// =============================================

function launchConfetti(sourceEl) {
  const rect = sourceEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const colors = ['#f58220', '#27ae60', '#e74c3c', '#3498db', '#9b59b6', '#f1c40f'];

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = cx + (Math.random() - 0.5) * 60 + 'px';
    particle.style.top = cy + 'px';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
    particle.style.animationDelay = (Math.random() * 0.2) + 's';
    particle.style.transform = `translateX(${(Math.random() - 0.5) * 120}px)`;
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1800);
  }
}

// =============================================
//  COMPLETION MESSAGE
// =============================================

function showCompletion() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 9000; animation: popIn 0.3s ease;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: white; border-radius: 24px; padding: 40px 50px;
    text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-width: 340px; animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  `;

  box.innerHTML = `
    <div style="font-size: 4rem; margin-bottom: 12px;">🎉</div>
    <h2 style="font-family:'Baloo 2',cursive; font-size:1.6rem; color:#27ae60; font-weight:800; margin-bottom:8px;">
      ${isEnglish ? 'Congratulations!' : 'Parabéns!'}
    </h2>
    <p style="font-family:'Nunito',sans-serif; color:#666; font-size:0.95rem; margin-bottom:24px;">
      ${isEnglish
        ? 'You discovered all 8 animals! 🐾'
        : 'Você descobriu todos os 8 animais! 🐾'}
    </p>
    <button onclick="this.closest('[data-overlay]').remove()" style="
      background:#f58220; color:white; border:none; border-radius:24px;
      padding:10px 28px; font-family:'Baloo 2',cursive; font-weight:700;
      font-size:0.95rem; cursor:pointer;
    ">${isEnglish ? 'Close' : 'Fechar'}</button>
  `;

  overlay.dataset.overlay = '1';
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Big confetti
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const fakeEl = { getBoundingClientRect: () => ({
        left: window.innerWidth * Math.random(),
        top: window.innerHeight * 0.3,
        width: 0, height: 0
      })};
      launchConfetti(fakeEl);
    }, i * 200);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// =============================================
//  BACK BUTTON
// =============================================



// =============================================
//  SIDEBAR BUTTONS
// =============================================

document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// =============================================
//  INIT
// =============================================

renderGrids();

  