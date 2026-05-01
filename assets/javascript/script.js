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
        // Envia para o PHP via fetch
        salvarLogin(state.currentExplorer.id);
        
        // Exibe a aba de sucesso e redireciona
        mostrarAvisoTopo('🎉', `Senha correta, ${state.currentExplorer.nome}!`, () => goTo('mapa'));
        
      } else {
        // Senha errada — shake + reset
        const slots = document.querySelectorAll('.slot');
        slots.forEach(s => s.classList.add('shake'));
        setTimeout(() => {
          slots.forEach(s => s.classList.remove('shake'));
          renderSenha();
        }, 700);
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
      openModal('🎮', `${sectionNames[section]}`,
        `Preparado para a Fase ${level}? Bora aprender!`,
        null, 'Em breve!');
    }
  
    function openSearch() {
      openModal('🔍', 'Pesquisar', 'Busca de fases em breve!', null, 'OK');
    }
  
    function setNav(btn) {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  
    /* ====================================================
       MODAL
    ==================================================== */
    function openModal(emoji, title, desc, action, actionLabel) {
      document.getElementById('modal-emoji').textContent    = emoji;
      document.getElementById('modal-title').textContent    = title;
      document.getElementById('modal-desc').textContent     = desc;
  
      const btn = document.getElementById('modal-action');
      btn.textContent = actionLabel || 'OK';
      btn.onclick = action ? () => { closeModal(); action(); } : closeModal;
  
      document.getElementById('modal-overlay').classList.add('open');
    }
  
    function closeModal(e) {
      if (e && e.target !== document.getElementById('modal-overlay')) return;
      document.getElementById('modal-overlay').classList.remove('open');
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
      salvarProgresso
    };
  
  })();