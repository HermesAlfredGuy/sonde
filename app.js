// Sonde — reveals, tagline, island nav, product window run, form.
// All scroll work goes through IntersectionObserver, never a scroll listener.

/* ---------------- reveals: translateY(64px) + blur(12px) to rest, 800ms ---------------- */
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------------- tagline: each word crosses a trigger line and resolves ---------------- */
const tagline = document.querySelector('[data-words]');
if (tagline) {
  const words = tagline.textContent.trim().split(/\s+/);
  tagline.textContent = '';
  const spans = words.map((word, index) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    // reading order ripple, so the line resolves word by word rather than as a block
    span.style.transitionDelay = `${index * 26}ms`;
    tagline.append(span, document.createTextNode(' '));
    return span;
  });
  const wordObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-on');
      wordObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -35% 0px', threshold: 0 });
  spans.forEach((span) => wordObserver.observe(span));
}

/* ---------------- island nav + overlay ---------------- */
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const navLinks = [...document.querySelectorAll('.pill__links a')];
let menuOpen = false;
let lastFocus = null;

const openMenu = () => {
  lastFocus = document.activeElement;
  menu.inert = false;
  menu.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  requestAnimationFrame(() => menu.classList.add('is-open'));
  menuOpen = true;
  setTimeout(() => menu.querySelector('a')?.focus(), 120);
};
const closeMenu = () => {
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('is-locked');
  menuOpen = false;
  setTimeout(() => { if (!menuOpen) menu.inert = true; }, 700);
  (lastFocus instanceof HTMLElement ? lastFocus : burger).focus();
};
let lastToggle = 0;
const toggleMenu = () => {
  const now = performance.now();
  if (now - lastToggle < 280) return;
  lastToggle = now;
  menuOpen ? closeMenu() : openMenu();
};
burger?.addEventListener('click', toggleMenu);
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menuOpen && closeMenu()));
document.addEventListener('keydown', (event) => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
  if (event.key !== 'Tab') return;
  const focusables = [...menu.querySelectorAll('a, button')];
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
window.addEventListener('resize', () => { if (menuOpen && window.innerWidth >= 900) closeMenu(); });

// current section marked in the nav, so the page never looks like it has no location
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach((a) => {
      const on = a.getAttribute('href') === `#${entry.target.id}`;
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((section) => spy.observe(section));

/* ---------------- the run inside the product window ---------------- */
const QUESTION = 'Which wells in Sabine Ridge jumped water cut this quarter, and do their allocations reconcile?';
const SQL = `-- wells above 45% water cut
with p as (
  select well_id, day,
         water_bbl / nullif(oil_bbl + water_bbl, 0) as wc
  from production_daily
  where day >= now() - interval '90 days'
)
select p.well_id, round(p.wc * 100, 1) as wc_pct,
       round(a.alloc - a.meter, 1) as delta
from p join allocations a using (well_id, day)
where p.wc > 0.45
order by delta desc limit 12;`;
const KEYWORDS = new Set(['with', 'as', 'select', 'from', 'where', 'join', 'using', 'on', 'order', 'by', 'desc', 'limit', 'interval', 'nullif', 'round', 'now', 'and', 'or']);
const ROWS = [['sab-14h', '61.2%', '+412.6'], ['sab-22h', '52.8%', '+98.4'], ['kst-07', '47.1%', '−12.2']];

const win = document.querySelector('.window');
const qEl = document.querySelector('[data-q]');
const sqlEl = document.querySelector('[data-sql] code');
const rowsEl = document.querySelector('[data-rows]');
const gateEl = document.querySelector('[data-gate]');
const gateText = document.querySelector('[data-gate-text]');
const gateChip = document.querySelector('[data-gate-chip]');
const clockEl = document.querySelector('[data-clock]');

const sleep = (ms, token) => new Promise((resolve, reject) => {
  const id = setTimeout(() => (token.dead ? reject(new Error('cancel')) : resolve()), ms);
  token.cancel.push(() => { clearTimeout(id); reject(new Error('cancel')); });
});

const highlight = (src) => src.split('\n').map((line) => {
  const cut = line.indexOf('--');
  const code = cut >= 0 ? line.slice(0, cut) : line;
  const comment = cut >= 0 ? line.slice(cut) : '';
  const html = code
    .replace(/(\b\d[\d_.]*\b)/g, '<span class="op">$1</span>')
    .replace(/([a-z_]+)/gi, (m) => (KEYWORDS.has(m.toLowerCase()) ? `<span class="kw">${m}</span>` : m));
  return html + (comment ? `<span class="cm">${comment}</span>` : '');
}).join('\n');

let token = { dead: false, cancel: [] };
let running = false;
let onScreen = false;

const resetRun = () => {
  qEl.textContent = '';
  sqlEl.innerHTML = '';
  rowsEl.innerHTML = '';
  gateEl.dataset.gate = 'waiting';
  gateText.textContent = 'Proposed fix: rewrite allocations for 14 Aug on 2 wells.';
  gateChip.textContent = 'awaiting approver';
  clockEl.textContent = '00.0 s';
};

async function runOnce() {
  const tk = token;
  resetRun();
  clockEl.textContent = '00.0 s';
  for (let i = 1; i <= QUESTION.length; i++) {
    qEl.textContent = QUESTION.slice(0, i);
    await sleep(16, tk);
  }
  const clock = { v: 0 };
  const tick = setInterval(() => {
    clock.v = Math.min(41, clock.v + 0.7);
    clockEl.textContent = `${clock.v.toFixed(1).padStart(4, '0')} s`;
  }, 120);
  tk.cancel.push(() => clearInterval(tick));

  let typed = '';
  for (const line of SQL.split('\n')) {
    for (let i = 1; i <= line.length; i++) {
      sqlEl.innerHTML = highlight(typed + line.slice(0, i));
      await sleep(6, tk);
    }
    typed += `${line}\n`;
    sqlEl.innerHTML = highlight(typed);
    await sleep(80, tk);
  }

  ROWS.forEach((cells, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${cells[0]}</td><td>${cells[1]}</td><td>${cells[2]}</td>`;
    rowsEl.append(tr);
    setTimeout(() => tr.classList.add('is-in'), 80 + index * 140);
  });
  await sleep(600, tk);
  clearInterval(tick);
  clockEl.textContent = '41.0 s';

  await sleep(2200, tk);
  gateEl.dataset.gate = 'approved';
  gateChip.textContent = 'approved';
  gateText.textContent = 'Applied: 2 allocations rewritten for 14 Aug, rollback stored.';

  await sleep(5200, tk);
}

async function loop() {
  while (onScreen) {
    try {
      await runOnce();
    } catch {
      break;
    }
  }
}

const startRun = () => {
  if (running) return;
  running = true;
  loop().catch(() => {}).finally(() => { running = false; });
};

if (win) {
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onScreen = true;
        startRun();
      } else {
        onScreen = false;
        token.dead = true;
        token.cancel.forEach((fn) => fn());
        token = { dead: false, cancel: [] };
      }
    }
  }, { threshold: 0.2 }).observe(win);
}

/* ---------------- form ---------------- */
const form = document.querySelector('[data-form]');
if (form) {
  const input = form.querySelector('input[type="email"]');
  const msg = form.querySelector('[data-form-msg]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = (input.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    input.setAttribute('aria-invalid', String(!valid));
    msg.classList.toggle('is-ok', valid);
    msg.textContent = valid
      ? 'Thanks. A field engineer will reply inside one business day.'
      : 'That address looks incomplete. Check it and try again.';
    if (valid) form.reset();
  });
}
