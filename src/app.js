/* Sonde — page behaviour.
   One timeline owner for scroll (GSAP ScrollTrigger); the demo is plain script;
   nothing is fetched. Full motion on every device by owner policy. */

import { buildPlate, buildSection } from './geology.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ——————————————————————————————— hero plate ——— */
const plateHost = $('.plate');
const plate = buildPlate({ jitter: true });
plateHost.append(plate);

function fitPlate() {
  const phone = window.matchMedia('(max-width: 860px)').matches;
  plate.setAttribute('viewBox', phone ? '620 200 700 800' : '0 0 1600 1000');
}
fitPlate();
window.addEventListener('resize', fitPlate);

/* ——————————————————————————————— intro ——— */
const reduce = 1; // owner policy: full motion always
const intro = gsap ? gsap.timeline({ defaults: { ease: 'expo.out' } }) : null;

if (intro) {
  intro
    .from('.nav-pill', { y: -18, opacity: 0, duration: 1 }, 0)
    .from('.ly-sky .star', { opacity: 0, duration: 1.6, stagger: { amount: 0.9, from: 'random' } }, 0.1)
    .from('.ly-ridges path', { y: 14, opacity: 0, duration: 1.4, stagger: 0.12 }, 0.15)
    .from('.ly-surface > *', { y: 10, opacity: 0, duration: 1.1, stagger: 0.05 }, 0.5)
    .from('.band', { y: (i) => 8 + i * 1.6, opacity: 0, duration: 1.1, stagger: 0.045 }, 0.35)
    .from('.ground-rim', { opacity: 0, duration: 1.2 }, 0.6)
    .from('.casing-line, .casing-dark', { scaleY: 0, transformOrigin: 'top center', duration: 1.1 }, 0.9)
    .from('.lateral-line, .lateral-dark', { opacity: 0, duration: 0.8 }, 1.5)
    .from('.perf, .casing-hot', { opacity: 0, duration: 0.6, stagger: 0.03 }, 1.7)
    .from('.res-glow, .res-ambient', { opacity: 0, scale: 0.7, transformOrigin: 'center', duration: 1.4 }, 1.35)
    .from('.res-body, .res-crest, .res-core', { opacity: 0, duration: 1.1 }, 1.4)
    .from('.annot', { opacity: 0, x: -8, duration: 0.9, stagger: 0.1 }, 1.9)
    .from('.ruler', { opacity: 0, duration: 0.9 }, 2)
    .from('.hero .chip', { y: 10, opacity: 0, duration: 0.8 }, 0.7)
    .from('.hero h1 .ln > span', { yPercent: 108, duration: 1.35, stagger: 0.09 }, 0.75)
    .from('.hero .lede', { y: 14, opacity: 0, duration: 1 }, 1.05)
    .from('.hero .cta-row > *', { y: 12, opacity: 0, duration: 0.9, stagger: 0.07 }, 1.2)
    .from('.hero .micro', { opacity: 0, duration: 0.8 }, 1.45)
    .from('.hero-foot > *', { y: 12, opacity: 0, duration: 0.9, stagger: 0.06 }, 1.35);

  /* the query pulse, forever: down the bore, then the reservoir answers */
  const pulse = $('.pulse');
  if (pulse) {
    gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 3.4 })
      .fromTo(pulse, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
      .to(pulse, { y: 404, duration: 2.5, ease: 'power2.inOut' }, 0.2)
      .to(pulse, { opacity: 0, duration: 0.6 }, 2.5)
      .fromTo('.res-core', { opacity: 0.1, scale: 0.92 }, { opacity: 0.45, scale: 1.06, duration: 0.9, yoyo: true, repeat: 1, transformOrigin: 'center', ease: 'sine.inOut' }, 2.3);
  }
  /* the flare breathes, slowly — well under three flashes a second */
  gsap.to('.flare', { opacity: 0.72, scale: 1.05, transformOrigin: 'center', duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.beacon', { opacity: 0.25, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  /* hero parallax: the section falls away as the page starts */
  gsap.to('.plate', {
    yPercent: 9,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
  });
  gsap.to('.hero-copy', {
    y: -50, opacity: 0.15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: 0.5 },
  });
}

/* ——————————————————————————————— the descent ——— */
const sectionHost = $('.section-host');
const secSVG = buildSection({ h: 3000 });
secSVG.classList.add('section-svg');
sectionHost.append(secSVG);

const depthEl = $('#depth');
const chapters = $$('.chapter');
let travel = 0;

function measure() {
  const stageH = $('.descent-stage').clientHeight;
  const svgH = secSVG.getBoundingClientRect().height;
  travel = Math.max(0, svgH - stageH);
}
measure();
window.addEventListener('resize', measure);

if (gsap) {
  gsap.set(chapters, { autoAlpha: 0 });
  gsap.set(chapters[0], { autoAlpha: 1 });
}

if (gsap && ScrollTrigger) {
  const st = ScrollTrigger.create({
    trigger: '.descent-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(secSVG, { y: -travel * p });
      // depth of the section entering the middle of the stage, from the same mapping the
      // section's own labels use (14,000 ft over the full drawing height)
      const stageH = $('.descent-stage').clientHeight;
      const svgH = secSVG.getBoundingClientRect().height;
      const ft = Math.round(((p * travel + stageH * 0.55) / svgH) * 14000 / 10) * 10;
      depthEl.textContent = ft.toLocaleString('en-US');
      chapters.forEach((ch, i) => {
        const centre = i === 2 ? 0.86 : 0.2 + i * 0.32;
        const d = Math.abs(p - centre);
        const on = i === 2 ? p > 0.66 : d < 0.16;
        gsap.set(ch, {
          autoAlpha: on ? 1 : 0,
          y: on ? 0 : (p < centre ? 22 : -22),
          duration: 0.2,
        });
      });
    },
  });
  st.refresh();
}

/* ——————————————————————————————— tagline ——— */
const words = $$('#tagline .w');
if (gsap && ScrollTrigger && words.length) {
  ScrollTrigger.create({
    trigger: '#tagline',
    start: 'top 78%',
    end: 'bottom 45%',
    scrub: 0.6,
    onUpdate: (self) => {
      const n = Math.round(self.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    },
  });
}

/* ——————————————————————————————— reveals ——— */
const revealTargets = $$('.shell-head > *, .benefit, .faq-item, .split .col, .tagline .note, .close-inner > *, .ask, .window');
revealTargets.forEach((n) => n.classList.add('rv'));
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
revealTargets.forEach((n) => io.observe(n));
// fail-safe: nothing stays invisible if the observer never fires
setTimeout(() => {
  revealTargets.forEach((n) => {
    if (n.getBoundingClientRect().top < innerHeight) n.classList.add('in');
  });
}, 2600);

/* ——————————————————————————————— nav ——— */
const menuBtn = $('.menu-btn');
const overlay = $('#overlay');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) {
    overlay.hidden = false;
    requestAnimationFrame(() => { overlay.dataset.open = 'true'; });
    document.body.style.overflow = 'hidden';
    $('a', overlay)?.focus();
  } else {
    overlay.dataset.open = 'false';
    document.body.style.overflow = '';
    setTimeout(() => { overlay.hidden = true; }, 620);
  }
}
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('#overlay a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuBtn.focus();
  }
});

/* ——————————————————————————————— demo ——— */
const RUNS = [
  {
    q: 'Which Wolfcamp wells are over 45% water cut this quarter, and what do their allocations owe?',
    sql: `with q as (
  select w.name, p.water_bbl, p.oil_bbl,
         sum(a.delta_bbl) as delta_bbl
  from   prod_monthly p
  join   wells w       on w.id = p.well_id
  join   allocations a on a.well_id = p.well_id
                      and a.month = p.month
  where  p.formation = 'WOLFCAMP_A'
    and  p.month >= date_trunc('quarter', now())
  group  by 1, 2, 3
)
select name,
       round(100 * water_bbl
             / nullif(oil_bbl + water_bbl, 0), 1) as water_cut,
       delta_bbl
from   q
where  water_bbl > 0.45 * (oil_bbl + water_bbl)
order  by 3
limit  10;`,
    rows: [['sab-22h', '61.4%', '−1,284'], ['sab-31h', '53.9%', '−902'], ['sab-14h', '47.2%', '−318']],
    gate: 'Write prepared: 3 allocation rows. Dry run clean, 0 rows changed.',
    foot: 'replica read · 3 rows · writes only through the gate',
    done: 'Approved by you · demo only · rollback sha256:3f2a91c9',
  },
  {
    q: 'Where did we lose the most gas between the separator and the sales meter last month?',
    sql: `select s.pad,
       sum(s.gas_in_mcf - m.gas_out_mcf) as lost_mcf,
       round(100 * sum(s.gas_in_mcf - m.gas_out_mcf)
             / nullif(sum(s.gas_in_mcf), 0), 2) as lost_pct
from   separator_daily s
join   meter_daily m
       on m.pad = s.pad and m.day = s.day
where  s.day >= date_trunc('month', now()) - interval '1 month'
  and  s.day <  date_trunc('month', now())
group  by 1
order  by 2 desc
limit  5;`,
    rows: [['sabine ridge', '4,180', '3.91%'], ['crane north', '1,265', '2.42%'], ['blinebry west', '404', '0.88%']],
    gate: 'Read only. This question changes nothing, so there is nothing to approve.',
    foot: 'replica read · 3 pads · read only, no gate',
    done: 'Read only · no statement to approve',
  },
  {
    q: 'Which laterals came within 600 ft of a parent well on the same pad?',
    sql: `select c.name as child,
       p.name as parent,
       round(st_distance(c.geom::geography,
                         p.geom::geography)) as ft_apart
from   wells c
join   wells p
       on p.pad_id = c.pad_id
      and p.spud_date < c.spud_date
      and c.id <> p.id
where  c.formation = 'WOLFCAMP_A'
  and  st_dwithin(c.geom::geography, p.geom::geography, 600)
order  by 3 asc;`,
    rows: [['sab-31h', 'sab-14h', '412'], ['sab-22h', 'sab-14h', '587'], ['—', 'no other pair', '—']],
    gate: 'Read only. A spacing question, answered without touching a row.',
    foot: 'replica read · 2 pairs · read only, no gate',
    done: 'Read only · no statement to approve',
  },
];

const qEl = $('#qtext');
const sqlEl = $('#sql code');
const rowsBody = $('#rows tbody');
const gate = $('#gate');
const gateText = $('#gate-text');
const approve = $('#approve');
const footEl = $('#foot');
let runTimers = [];
let current = 0;

function clearTimers() {
  runTimers.forEach(clearTimeout);
  runTimers = [];
}

function typeQuestion(text, done) {
  qEl.innerHTML = '<span class="caret"></span>';
  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      qEl.innerHTML = `${text.slice(0, i).replace(/</g, '&lt;')}<span class="caret"></span>`;
      i += 1 + Math.round(Math.random() * 1.4);
      runTimers.push(setTimeout(tick, 16 + Math.random() * 14));
    } else {
      qEl.innerHTML = text.replace(/</g, '&lt;');
      done();
    }
  };
  tick();
}

function writeSQL(sql, done) {
  sqlEl.textContent = '';
  const lines = sql.split('\n');
  let i = 0;
  const tick = () => {
    if (i <= lines.length) {
      sqlEl.textContent = lines.slice(0, i).join('\n');
      i++;
      runTimers.push(setTimeout(tick, 55));
    } else done();
  };
  tick();
}

function paintRows(rows, done) {
  rowsBody.innerHTML = '';
  rows.forEach((r, i) => {
    runTimers.push(setTimeout(() => {
      const tr = document.createElement('tr');
      r.forEach((c, j) => {
        const td = document.createElement('td');
        td.textContent = c;
        if (j === 1 && c.endsWith('%')) td.className = 'hc';
        tr.append(td);
      });
      rowsBody.append(tr);
      if (i === rows.length - 1) done();
    }, 130 * i));
  });
  if (!rows.length) done();
}

function run(index) {
  clearTimers();
  current = index;
  const d = RUNS[index];
  $$('.ask').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.ask === index)));
  gate.dataset.state = 'idle';
  gateText.textContent = 'Planning the query.';
  approve.hidden = true;
  footEl.textContent = 'replica read · writes only through the gate';
  rowsBody.innerHTML = '';
  sqlEl.textContent = '';

  typeQuestion(d.q, () => {
    runTimers.push(setTimeout(() => {
      gateText.textContent = 'Writing the query under a cost ceiling.';
      writeSQL(d.sql, () => {
        paintRows(d.rows, () => {
          runTimers.push(setTimeout(() => {
            gate.dataset.state = 'waiting';
            gateText.textContent = d.gate;
            footEl.textContent = d.foot;
            if (!/read only/i.test(d.gate)) approve.hidden = false;
          }, 380));
        });
      });
    }, 320));
  });
}

$$('.ask').forEach((b) => b.addEventListener('click', () => run(+b.dataset.ask)));
$('#reset').addEventListener('click', () => run(current));
approve.addEventListener('click', () => {
  const d = RUNS[current];
  gate.dataset.state = 'done';
  gateText.textContent = d.done;
  approve.hidden = true;
  footEl.textContent = 'approved · demo only · nothing was written';
});

run(0);

/* ——————————————————————————————— closing art ——— */
const closeArt = $('.close-art');
closeArt.innerHTML = `
<svg viewBox="0 0 900 620" aria-hidden="true">
  <defs>
    <linearGradient id="caFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#123039" stop-opacity="0"/>
      <stop offset="1" stop-color="#123039" stop-opacity=".55"/>
    </linearGradient>
    <radialGradient id="caGlow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#F0A03C" stop-opacity=".5"/>
      <stop offset="1" stop-color="#F0A03C" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M-20 ${120 + i * 78} C 220 ${96 + i * 78}, 520 ${150 + i * 78}, 920 ${110 + i * 78} L920 620 L-20 620 Z" fill="#0B1E26" opacity="${0.5 + i * 0.07}"/>`).join('')}
  <ellipse cx="470" cy="470" rx="260" ry="60" fill="url(#caGlow)"/>
  <path d="M470 120 V470" stroke="#0A1A20" stroke-width="2"/>
  <path d="M470 470 q0 26 -30 34 H300" stroke="#0A1A20" stroke-width="1.8" fill="none"/>
  <path d="M300 504 H560" stroke="#F0A03C" stroke-width=".8" opacity=".5"/>
  <rect x="-20" y="110" width="940" height="520" fill="url(#caFade)" opacity=".25"/>
</svg>`;
