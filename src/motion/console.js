// The signature moment: one database agent investigation, replayed in the console.
// Loops only while the console is on screen. Amber marks live state, nothing else.
import { gsap } from './core.js';

const QUESTION = 'Which wells in Sabine Ridge jumped water cut this quarter, and do their allocations reconcile?';

const SQL = `-- wells above 45% water cut, allocation checked
with p as (
  select well_id, day, water_bbl / nullif(oil_bbl + water_bbl, 0) as wc
  from production_daily where day >= current_date - interval '90 days'
)
select p.well_id, round(p.wc * 100, 1) as wc_pct, round(a.alloc - a.meter, 1) as delta
from p join allocations a using (well_id, day)
where p.wc > 0.45 order by delta desc limit 12;`;

const KEYWORDS = new Set(['with', 'as', 'select', 'from', 'where', 'join', 'using', 'on', 'order', 'by', 'desc', 'limit', 'interval', 'nullif', 'round', 'current_date', 'and', 'or']);

const STEPS = [
  { text: 'resolve wells in Sabine Ridge', tables: ['wells', 'production_daily'] },
  { text: 'join production to allocations', tables: ['allocations'] },
  { text: 'scan 90 days · 212,600 wells', tables: ['production_daily'] },
  { text: 'test residual against decline model', tables: ['decline_models'] },
];

const ROWS = [
  ['sab-14h', '61.2%', '+412.6'],
  ['sab-22h', '52.8%', '+98.4'],
  ['kst-07', '47.1%', '−12.2'],
];

const sleep = (ms, token) => new Promise((resolve, reject) => {
  const t = setTimeout(() => (token.dead ? reject(new Error('abort')) : resolve()), ms);
  token.cancel.push(() => { clearTimeout(t); reject(new Error('abort')); });
});

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Minimal SQL highlighter: comments, keywords, numbers, punctuation dimmed.
function highlight(src) {
  return src.split('\n').map((line) => {
    const ci = line.indexOf('--');
    const code = ci >= 0 ? line.slice(0, ci) : line;
    const comment = ci >= 0 ? line.slice(ci) : '';
    const head = code.replace(/(\b\d[\d_.]*\b)/g, '<span class="op">$1</span>')
      .replace(/([a-z_]+)/gi, (m) => (KEYWORDS.has(m.toLowerCase()) ? `<span class="kw">${m}</span>` : m))
      .replace(/('[^']*')/g, '<span class="cm">$1</span>');
    return head + (comment ? `<span class="cm">${escapeHtml(comment)}</span>` : '');
  }).join('\n');
}

export function initConsole() {
  const root = document.querySelector('[data-console]');
  if (!root) return;

  const q = root.querySelector('[data-typed]');
  const stateChip = root.querySelector('[data-console-state]');
  const plan = [...root.querySelectorAll('[data-plan] li')];
  const tables = [...root.querySelectorAll('[data-schema-list] li')];
  const sqlBox = root.querySelector('[data-sql] code');
  const tbody = root.querySelector('[data-rows] tbody');
  const spark = root.querySelector('.spark');
  const gate = root.querySelector('[data-gate]');
  const gateBadge = root.querySelector('[data-gate-badge]');
  const gateText = root.querySelector('[data-gate-text]');
  const gateWho = root.querySelector('[data-gate-who]');
  const timer = root.querySelector('[data-console-timer]');
  const note = root.querySelector('[data-console-note]');
  const run = root.querySelector('.run');

  q.textContent = '';
  let token = { dead: false, cancel: [] };
  let visible = false;
  let running = false;

  const setState = (mode, label) => {
    stateChip.dataset.mode = mode;
    stateChip.textContent = label;
  };

  const litTable = (name, on) => {
    const el = tables.find((t) => t.dataset.table === name);
    if (el) el.dataset.on = on ? 'true' : 'false';
  };

  function reset() {
    token.dead = true;
    token.cancel.forEach((c) => c());
    token = { dead: false, cancel: [] };
    q.textContent = '';
    run.classList.remove('done');
    plan.forEach((li) => { li.dataset.state = ''; });
    tables.forEach((t) => { t.dataset.on = 'false'; });
    sqlBox.innerHTML = '';
    tbody.innerHTML = '';
    spark.classList.remove('on');
    gate.dataset.state = '';
    gateBadge.textContent = 'human gate';
    gateText.textContent = 'Proposed fix: rewrite allocations for 14 Aug on 2 wells.';
    gateWho.textContent = 'waiting on priya.r · production data lead';
    timer.textContent = '00.0 s';
    note.textContent = 'read only replica · no writes without approval';
    setState('idle', 'ready');
  }

  async function type(el, text, perChar, tk) {
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await sleep(perChar, tk);
    }
  }

  async function runOnce() {
    reset();
    const tk = token;
    if (!visible) return;

    // 1. the question
    setState('run', 'reading');
    note.textContent = 'resolving entities · sabine ridge';
    await type(q, QUESTION, 22, tk);

    // 2. the plan, table by table (the clock counts for real)
    const elapsed = { v: 0 };
    const clock = gsap.to(elapsed, {
      v: 41, duration: 4.6, ease: 'none',
      onUpdate: () => { timer.textContent = elapsed.v.toFixed(1).padStart(4, '0') + ' s'; },
    });
    tk.cancel.push(() => clock.kill());
    note.textContent = 'planning · 4 steps';
    for (let i = 0; i < STEPS.length; i++) {
      plan[i].dataset.state = 'on';
      await sleep(i === 0 ? 520 : 420, tk);
      plan[i].dataset.state = 'ok';
      STEPS[i].tables.forEach((t) => litTable(t, true));
    }

    // 3. the SQL, typed out
    setState('run', 'writing sql');
    note.textContent = 'write · verify · dry run under ceiling';
    const lines = SQL.split('\n');
    let typed = '';
    for (const line of lines) {
      for (let i = 1; i <= line.length; i++) {
        sqlBox.innerHTML = highlight(typed + line.slice(0, i));
        await sleep(7, tk);
      }
      typed += line + '\n';
      sqlBox.innerHTML = highlight(typed);
      await sleep(70, tk);
    }

    // 4. rows and the excursion
    setState('run', 'running');
    note.textContent = 'executing on replica · 9.7M rows read';
    await sleep(420, tk);
    ROWS.forEach((cells, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${cells[0]}</td><td>${cells[1]}</td><td>${cells[2]}</td>`;
      tbody.append(tr);
      setTimeout(() => tr.classList.add('in'), 40 + i * 130);
    });
    await sleep(260, tk);
    spark.classList.add('on');
    clock.progress(1);
    timer.textContent = '41.0 s';

    // 5. the human gate
    setState('gate', 'awaiting approval');
    gate.dataset.state = 'waiting';
    gateBadge.textContent = 'human gate';
    note.textContent = 'write blocked · approval required';
    await sleep(2500, tk);

    setState('done', 'approved');
    gate.dataset.state = 'approved';
    gateBadge.textContent = 'approved';
    gateText.textContent = 'Applied: 2 allocations rewritten for 14 Aug.';
    gateWho.textContent = 'approved by priya.r · 14:02:44 · rollback ready';
    note.textContent = 'sandbox write · audit log updated';
    run.classList.add('done');

    // 6. hold, then start again
    await sleep(5200, tk);
    if (visible && !tk.dead) runOnce();
  }

  function start() {
    if (running) return;
    running = true;
    runOnce().catch(() => {}).finally(() => { running = false; });
  }

  function stop() {
    visible = false;
    token.dead = true;
    token.cancel.forEach((c) => c());
  }

  // Pause off screen (design-to-motion website rule), resume on return.
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        visible = true;
        if (!running) start();
      } else {
        stop();
      }
    });
  }, { threshold: 0.25 }).observe(root);

  // The hero starts immediately even before the observer settles.
  visible = true;
  start();

  // Replay on click of the caption for anyone who wants the run again.
  const caption = document.querySelector('.console__caption');
  if (caption) {
    caption.style.cursor = 'pointer';
    caption.setAttribute('role', 'button');
    caption.setAttribute('tabindex', '0');
    caption.setAttribute('aria-label', 'Replay the investigation');
    const replay = () => { visible = true; start(); };
    caption.addEventListener('click', replay);
    caption.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); replay(); } });
  }

  // A single gentle entrance for the panel itself.
  gsap.from(root, { y: 28, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.15 });
}
