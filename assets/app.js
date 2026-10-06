const DATA_URL = 'data/public/dfo/2026/factors.csv';
const state = { factors: [], query: '', type: 'all' };

function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ';') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function formatValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat('nb-NO', { maximumSignificantDigits: 5 }).format(n) : value;
}

function typeName(type) { return type === 'activity' ? 'Aktivitet' : 'Innkjøp'; }
function yesNo(value) { return String(value).toLowerCase() === 'true' ? 'Ja' : 'Nei'; }

function filteredFactors() {
  const q = state.query.trim().toLocaleLowerCase('nb-NO');
  return state.factors.filter(f => {
    const typeMatch = state.type === 'all' || f.factor_type === state.type;
    const haystack = [f.konto_ns_4102, f.kontonavn_ns_4102, f.category, f.source, f.artskonto_dfo].join(' ').toLocaleLowerCase('nb-NO');
    return typeMatch && (!q || haystack.includes(q));
  });
}

function render() {
  const factors = filteredFactors();
  const body = document.querySelector('#factor-rows');
  body.innerHTML = factors.map((f, index) => `
    <tr class="factor-row" data-index="${state.factors.indexOf(f)}">
      <td class="account">${escapeHTML(f.konto_ns_4102)}</td>
      <td>${escapeHTML(f.kontonavn_ns_4102 || f.category || 'Uspesifisert')}</td>
      <td class="value">${formatValue(f.factor_value)}<small>${escapeHTML(f.unit)}</small></td>
      <td><span class="tag">${typeName(f.factor_type)}</span></td>
      <td><button class="row-button" type="button" aria-label="Vis detaljer for ${escapeHTML(f.kontonavn_ns_4102)}">›</button></td>
    </tr>`).join('');
  document.querySelector('#empty-state').hidden = factors.length > 0;
  document.querySelector('#result-summary').textContent = `${factors.length} av ${state.factors.length} faktorer vises`;
  body.querySelectorAll('tr').forEach(row => row.addEventListener('click', () => showDetails(state.factors[Number(row.dataset.index)])));
}

function showDetails(f) {
  const content = document.querySelector('#detail-content');
  content.innerHTML = `
    <div class="detail-kicker">Konto ${escapeHTML(f.konto_ns_4102 || '–')} · ${typeName(f.factor_type)}</div>
    <h2 class="detail-title">${escapeHTML(f.kontonavn_ns_4102 || f.category || 'Klimaintensitet')}</h2>
    <div class="detail-value"><span>Klimaintensitet</span><strong>${formatValue(f.factor_value)}</strong><span>${escapeHTML(f.unit)}</span></div>
    <dl class="detail-grid">
      <div><dt>DFØ artskonto</dt><dd>${escapeHTML(f.artskonto_dfo || 'Ikke angitt')}</dd></div>
      <div><dt>Datagrunnlag</dt><dd>${escapeHTML(f.source_data_year || 'Ikke angitt')}</dd></div>
      <div><dt>Prisår</dt><dd>${escapeHTML(f.price_year || 'Ikke relevant')}</dd></div>
      <div><dt>KPI-justert</dt><dd>${yesNo(f.cpi_adjusted)}</dd></div>
      <div><dt>Faktorgrunnlag</dt><dd>${escapeHTML(f.factor_basis || 'Ikke angitt')}</dd></div>
      <div><dt>Kilde</dt><dd>${escapeHTML(f.source || 'Ikke angitt')}</dd></div>
    </dl>
    <div class="notice"><strong>Metode:</strong> ${escapeHTML(f.method_version || 'Ikke angitt')}<br><strong>Status:</strong> ${escapeHTML(f.review_status || 'Ikke angitt')}</div>`;
  document.querySelector('#details').showModal();
}

async function init() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.factors = parseCSV(await response.text());
    document.querySelector('#total-count').textContent = state.factors.length;
    document.querySelector('#spend-count').textContent = state.factors.filter(f => f.factor_type === 'spend').length;
    document.querySelector('#activity-count').textContent = state.factors.filter(f => f.factor_type === 'activity').length;
    render();
  } catch (error) {
    document.querySelector('#result-summary').textContent = 'Datasettet kunne ikke lastes. Last siden på nytt eller last ned CSV-filen.';
    console.error(error);
  }
}

document.querySelector('#search').addEventListener('input', e => { state.query = e.target.value; render(); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  state.type = button.dataset.type;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
  render();
}));
document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#details').close());
document.querySelector('#details').addEventListener('click', e => { if (e.target.id === 'details') e.target.close(); });
document.querySelector('#year').textContent = new Date().getFullYear();
init();
