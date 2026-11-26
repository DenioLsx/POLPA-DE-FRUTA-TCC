'use strict';

// Atalho pra pegar elemento por ID e lista das frutas (id, nome, cor de fundo, cor de destaque, descrição)
const $ = id => document.getElementById(id);

const fruits = [
  ['morango', 'Morango', '#490b15', '#ff8495', 'Sabor delicado e marcante.'],
  ['manga', 'Manga', '#493108', '#ffd071', 'Sabor tropical e intenso.'],
  ['acai', 'Açaí', '#29133e', '#d1a0ff', 'Sabor característico da Amazônia.'],
  ['melancia', 'Melancia', '#123a24', '#8de6a9', 'Leveza e frescor.'],
  ['maracuja', 'Maracujá', '#503008', '#ffc16c', 'Aroma tropical e acidez característica.'],
  ['goiaba', 'Goiaba', '#492337', '#ffacc5', 'Sabor suave e aromático.']
];

// Chave do localStorage, tamanho de 1 dia em ms e funções de data / cálculo de validade
const key = 'fruto-minas-v1';
const day = 86400000;
const today = () => {
  let d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dateNum = s => Date.parse(s + 'T00:00:00Z');
const addDays = (s, n) => new Date(dateNum(s) + n * day).toISOString().slice(0, 10);
const fmt = s => s.split('-').reverse().join('/');
const remaining = l => (dateNum(l.expiry) - dateNum(today())) / day;

// Define o nível de alerta (0 = ok, 1 = até 10 dias, 2 = até 5, 3 = até 2, 4 = vencido)
const status = l => remaining(l) < 0 ? 4 : remaining(l) <= 2 ? 3 : remaining(l) <= 5 ? 2 : remaining(l) <= 10 ? 1 : 0;
const names = ['Regular', 'Preventivo', 'Atenção', 'Urgente', 'Vencido'];
const messages = [
  '',
  'Ainda há tempo para comercialização, se o produto estiver adequado. Acompanhe a validade.',
  'Priorize a saída deste lote.',
  'Vencimento iminente. Confira o saldo.',
  'Bloqueado para saída regular. Confira o descarte.'
];

// Estado atual da aplicação na memória e controle da tela ativa
let state = { lots: [], history: [], next: 1 };
let page = 'home';
let active = null;
let pinned = null;
let operation = 'entry';
let expanded = { entry: false, exit: false };

// Valida se a data está no formato AAAA-MM-DD e se o estado salvo não está corrompido
function validDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(dateNum(s)) && new Date(dateNum(s)).toISOString().slice(0, 10) === s;
}

function validate(s) {
  return s &&
    Array.isArray(s.lots) &&
    Array.isArray(s.history) &&
    Number.isSafeInteger(s.next) &&
    s.next > 0 &&
    s.lots.every(l =>
      Number.isSafeInteger(l.id) &&
      l.id > 0 &&
      l.id < s.next &&
      fruits.some(f => f[0] === l.fruit) &&
      Number.isSafeInteger(l.qty) &&
      l.qty >= 0 &&
      validDate(l.received) &&
      validDate(l.expiry) &&
      l.expiry >= l.received &&
      Number.isInteger(l.ack) &&
      l.ack >= 0 &&
      l.ack <= 4
    ) &&
    new Set(s.lots.map(l => l.id)).size === s.lots.length &&
    s.history.every(h =>
      ['entry', 'exit'].includes(h.type) &&
      fruits.some(f => f[0] === h.fruit) &&
      Number.isSafeInteger(h.qty) &&
      h.qty > 0 &&
      typeof h.time === 'string' &&
      Number.isFinite(Date.parse(h.time)) &&
      Array.isArray(h.parts) &&
      h.parts.every(p => Number.isSafeInteger(p.id) && Number.isSafeInteger(p.qty) && p.qty > 0) &&
      h.parts.reduce((a, p) => a + p.qty, 0) === h.qty &&
      ['normal', 'discard', 'entry'].includes(h.reason)
    );
}

// Mostra aviso rápido no canto (toast) e salva alterações no localStorage
function notify(s) {
  $('toast').textContent = s;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => $('toast').textContent = '', 5500);
}

try {
  let raw = localStorage.getItem(key);
  if (raw) {
    let s = JSON.parse(raw);
    if (!validate(s)) throw Error();
    state = s;
  }
} catch {
  notify('Não foi possível ler o armazenamento local. Verifique os dados antes de registrar novas movimentações.');
}

function commit(next) {
  try {
    localStorage.setItem(key, JSON.stringify(next));
    state = next;
    return true;
  } catch {
    notify('Falha ao salvar. Nenhuma movimentação aplicada.');
    return false;
  }
}

// Soma o estoque de uma fruta e lista os lotes em alerta ordenados pelo vencimento mais próximo
const stock = id => state.lots.filter(l => l.fruit === id).reduce((a, l) => a + l.qty, 0);
const alerts = () => state.lots.filter(l => l.qty > 0 && status(l) > 0).sort((a, b) => remaining(a) - remaining(b));

// Cria elementos HTML na mão e troca a cor do tema conforme a fruta selecionada na home
function el(tag, cls, text) {
  let e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function setActive(id) {
  active = id;
  let f = fruits.find(f => f[0] === id);
  document.body.style.setProperty('--theme', page === 'home' && f ? f[2] : '#242426');
  document.body.style.setProperty('--accent', f ? f[3] : '#fff');
  $('gallery').classList.toggle('has-active', !!f);
  for (let b of $('gallery').children) {
    let on = b.dataset.fruit === id;
    b.classList.toggle('active', on);
    b.setAttribute('aria-expanded', String(on));
  }
}

// Monta os painéis interativos da galeria de frutas e liga hover, clique e foco
function buildGallery() {
  for (let f of fruits) {
    let b = el('button', 'panel');
    b.dataset.fruit = f[0];
    b.setAttribute('aria-label', f[1]);

    let wall = el('img', 'wall');
    wall.src = `assets/${f[0]}-wall.jpg`;
    wall.alt = '';

    let copy = el('div', 'panel-copy');
    copy.append(
      el('strong', '', f[1]),
      el('p', '', f[4]),
      el('small', '', 'ESTOQUE TOTAL'),
      el('span', 'count', '0')
    );

    let icon = el('img', 'fruit-icon');
    icon.src = `assets/${f[0]}.svg`;
    icon.alt = '';

    b.append(wall, copy, icon);
    b.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse') setActive(f[0]);
    });
    b.addEventListener('click', () => {
      pinned = pinned === f[0] ? null : f[0];
      setActive(pinned);
    });
    b.addEventListener('focus', () => setActive(f[0]));
    $('gallery').append(b);
  }

  $('gallery').addEventListener('pointerleave', () => setActive(pinned));
  $('gallery').addEventListener('focusout', e => {
    if (!$('gallery').contains(e.relatedTarget)) setActive(pinned);
  });
}

// Atualiza contadores, badge de alertas não confirmados, totais, histórico e cartões de validade
function render() {
  let a = alerts();
  $('expiryNav').hidden = !a.length;
  $('badge').textContent = a.filter(l => l.ack < status(l)).length || '';
  if (page === 'expiry' && !a.length) go('home');

  for (let b of $('gallery').children) {
    let n = stock(b.dataset.fruit);
    b.querySelector('.count').textContent = String(n).padStart(2, '0') + ' un.';
    b.setAttribute('aria-label', `${fruits.find(f => f[0] === b.dataset.fruit)[1]}, ${n} unidades`);
  }

  $('totals').replaceChildren(...fruits.map(f => {
    let e = el('div', 'total', f[1]);
    e.append(el('strong', '', stock(f[0])));
    return e;
  }));

  renderHistory();
  renderAlerts();
}

function renderHistory() {
  $('historyLists').replaceChildren(...['entry', 'exit'].map(type => {
    let box = el('article', 'historybox ' + (type === 'entry' ? 'green' : 'red'));
    box.append(el('h2', '', type === 'entry' ? 'Entradas' : 'Saídas'));

    let list = state.history.filter(h => h.type === type).slice().reverse();
    if (!list.length) box.append(el('p', '', 'Nenhum registro.'));

    for (let h of list.slice(0, expanded[type] ? undefined : 5)) {
      let r = el('div', 'record', fruits.find(f => f[0] === h.fruit)[1]);
      r.append(
        el('strong', '', (type === 'entry' ? '+' : '−') + h.qty),
        el('small', '', new Date(h.time).toLocaleString('pt-BR') + ' · ' + (h.reason === 'discard' ? 'Descarte · ' : '') + h.parts.map(p => `Lote ${p.id}: ${p.qty} un.`).join(' / '))
      );
      box.append(r);
    }

    if (list.length > 5) {
      let b = el('button', '', expanded[type] ? 'Ver menos' : 'Ver tudo');
      b.onclick = () => {
        expanded[type] = !expanded[type];
        renderHistory();
      };
      box.append(b);
    }

    return box;
  }));
}

function renderAlerts() {
  $('alerts').replaceChildren(...alerts().map(l => {
    let f = fruits.find(f => f[0] === l.fruit);
    let s = status(l);
    let r = remaining(l);
    let a = el('article', 'alert');
    a.style.setProperty('--fruit', f[3]);

    a.append(
      el('h2', '', `${f[1]} · Lote ${l.id}`),
      el('p', 'severity', `${names[s]} · ${r < 0 ? 'Vencido há ' + (-r) + ' dia(s)' : r === 0 ? 'Vence hoje' : 'Vence em ' + r + ' dia(s)'}`),
      el('p', '', `Recebimento: ${fmt(l.received)} | Vencimento: ${fmt(l.expiry)} | Saldo: ${l.qty} un.`),
      el('p', '', messages[s])
    );

    let b = el('button', '', l.ack >= s ? 'Ciência registrada' : 'OK — Estou ciente');
    b.disabled = l.ack >= s;
    b.onclick = () => {
      let n = structuredClone(state);
      n.lots.find(x => x.id === l.id).ack = s;
      if (commit(n)) render();
    };
    a.append(b);

    return a;
  }));
}

// Troca de tela, abre/fecha o menu e trata atalhos de navegação e tecla Esc
function go(p) {
  if (p === 'expiry' && !alerts().length) p = 'home';
  page = p;
  for (let s of document.querySelectorAll('main>section')) s.hidden = s.id !== p;
  for (let b of document.querySelectorAll('nav [data-page]')) b.setAttribute('aria-current', b.dataset.page === p ? 'page' : 'false');
  pinned = null;
  setActive(null);
  toggleMenu(false);
  $('main').focus();
}

function toggleMenu(open) {
  $('nav').hidden = !open;
  $('menu').setAttribute('aria-expanded', String(open));
  $('menu').setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

$('menu').onclick = () => toggleMenu($('nav').hidden);
document.querySelectorAll('[data-page]').forEach(b => b.onclick = () => go(b.dataset.page));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('nav').hidden) {
      toggleMenu(false);
      $('menu').focus();
    } else {
      pinned = null;
      setActive(null);
    }
  }
});

// Filtra lotes elegíveis (vencidos no descarte, não vencidos na saída regular) e calcula o plano FEFO
function candidates() {
  return state.lots
    .filter(l => l.fruit === $('fruit').value && l.qty > 0 && ($('reason').value === 'discard' ? remaining(l) < 0 : remaining(l) >= 0))
    .sort((a, b) => a.expiry.localeCompare(b.expiry) || a.received.localeCompare(b.received) || a.id - b.id);
}

function refreshLots() {
  let old = $('lot').value;
  $('lot').replaceChildren(
    new Option('Sugestão automática (FEFO)', 'auto'),
    ...candidates().map(l => new Option(`Lote ${l.id} · ${fmt(l.expiry)} · ${l.qty} un.`, String(l.id)))
  );
  if ([...$('lot').options].some(o => o.value === old)) $('lot').value = old;
}

function plan() {
  let q = Number($('qty').value);
  let f = $('fruit').value;
  if (!Number.isSafeInteger(q) || q < 1 || q > 1000000) throw Error('Informe uma quantidade inteira válida.');

  if (operation === 'entry') {
    let r = $('received').value;
    let d = Number($('days').value);
    if (!validDate(r) || r > today()) throw Error('Informe uma data de recebimento válida, não futura.');
    if ($('mode').value === 'days' && (!$('days').value || !Number.isInteger(d) || d < 0 || d > 3650)) throw Error('Informe o prazo restante em dias (0 a 3650).');
    let expiry = $('mode').value === 'days' ? addDays(r, d) : $('date').value;
    if (!validDate(expiry) || expiry < r) throw Error('Informe vencimento igual ou posterior ao recebimento.');
    return { q, f, r, expiry, parts: [{ id: state.next, qty: q }] };
  }

  let left = q;
  let parts = [];
  for (let l of candidates().filter(l => $('lot').value === 'auto' || String(l.id) === $('lot').value)) {
    let take = Math.min(left, l.qty);
    if (take) parts.push({ id: l.id, qty: take });
    left -= take;
    if (!left) break;
  }
  if (left) throw Error('Saldo elegível insuficiente para esta saída.');
  return { q, f, parts };
}

// Atualiza prévia do modal, abre o formulário e salva entrada/saída ao enviar
function preview() {
  $('daysLabel').hidden = $('mode').value !== 'days';
  $('dateLabel').hidden = $('mode').value !== 'date';
  try {
    let p = plan();
    $('preview').textContent = operation === 'entry'
      ? `Vencimento: ${fmt(p.expiry)} · Saldo total após entrada: ${stock(p.f) + p.q}`
      : `Confirme os lotes físicos: ${p.parts.map(x => `Lote ${x.id}: ${x.qty} un.`).join(' / ')} · Saldo total após saída: ${stock(p.f) - p.q}`;
    $('confirm').disabled = false;
    $('error').textContent = '';
  } catch (e) {
    $('preview').textContent = e.message;
    $('confirm').disabled = true;
  }
}

function openForm(type) {
  operation = type;
  $('movement').reset();
  $('modalTitle').textContent = type === 'entry' ? 'Nova entrada' : 'Nova saída';
  $('entryFields').hidden = type !== 'entry';
  $('exitFields').hidden = type !== 'exit';
  $('received').value = today();
  $('days').value = 30;
  $('qty').value = 1;
  refreshLots();
  preview();
  $('modal').showModal();
  $('fruit').focus();
}

$('fruit').replaceChildren(...fruits.map(f => new Option(f[1], f[0])));
$('entry').onclick = () => openForm('entry');
$('exit').onclick = () => openForm('exit');
$('close').onclick = () => $('modal').close();

$('movement').addEventListener('input', e => {
  if (['fruit', 'reason'].includes(e.target.id)) refreshLots();
  preview();
});

$('movement').onsubmit = e => {
  e.preventDefault();
  try {
    let p = plan();
    let n = structuredClone(state);
    if (operation === 'entry') {
      n.lots.push({ id: n.next++, fruit: p.f, qty: p.q, received: p.r, expiry: p.expiry, ack: 0 });
    } else {
      for (let x of p.parts) n.lots.find(l => l.id === x.id).qty -= x.qty;
    }
    n.history.push({
      type: operation,
      fruit: p.f,
      qty: p.q,
      time: new Date().toISOString(),
      parts: p.parts,
      reason: operation === 'entry' ? 'entry' : $('reason').value
    });
    if (commit(n)) {
      $('modal').close();
      render();
      notify('Movimentação registrada.');
    }
  } catch (e) {
    $('error').textContent = e.message;
  }
};

// Atualiza a saudação e sincroniza mudanças entre abas
function tick() {
  let h = new Date().getHours();
  $('greeting').textContent = (h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite') + '! Bem-vindo ao seu estoque.';
  render();
}

window.addEventListener('storage', e => {
  if (e.key === key) {
    try {
      let n = JSON.parse(e.newValue);
      if (validate(n)) {
        state = n;
        render();
        if ($('modal').open) {
          refreshLots();
          preview();
        }
      }
    } catch {}
  }
});

// Inicialização da página e atualização periódica da saudação/validade
buildGallery();
go('home');
tick();
setInterval(tick, 60000);
