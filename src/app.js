/* Sonde — page behaviour.
   One timeline owner for scroll (GSAP ScrollTrigger); the demo is plain script;
   nothing is fetched. Full motion on every device by owner policy. */

import { buildPlate, buildSection, formationAt, WELL_D } from './geology.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ——————————————————————————————— hero plate ———
   Desktop keeps the live plate: it owns the intro choreography. A phone has to
   rasterise all of those SVG filters at 3× on every scrolled frame, so it gets the
   same artwork baked once, plus a two-element overlay for the travelling pulse. */
const plateHost = $('.plate');
const PHONE = () => window.matchMedia('(max-width: 860px)').matches;
const PHONE_VB = '640 200 660 800';
const SVGNS = 'http://www.w3.org/2000/svg';
let borePath = null;
let pulseGroup = null;

function svgEl(name, attrs = {}) {
  const n = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

if (PHONE()) {
  const img = new Image();
  img.className = 'plate-img';
  img.alt = '';
  img.decoding = 'async';
  img.src = 'assets/img/hero-plate-phone.webp';
  plateHost.append(img);

  const ov = svgEl('svg', { viewBox: PHONE_VB, preserveAspectRatio: 'xMidYMid slice', class: 'plate-overlay', 'aria-hidden': 'true' });
  borePath = svgEl('path', { d: WELL_D, fill: 'none', stroke: 'none' });
  pulseGroup = svgEl('g', { class: 'pulse', opacity: '0' });
  pulseGroup.append(
    svgEl('circle', { cx: 0, cy: 0, r: 3.4, fill: '#FFE0B4' }),
    svgEl('circle', { cx: 0, cy: 0, r: 9.5, fill: 'none', stroke: '#F0A03C', 'stroke-width': 1, opacity: '0.5' }),
    svgEl('path', { d: 'M0 -3 v-30', stroke: '#F0A03C', 'stroke-width': 1.4, opacity: '0.16' }),
  );
  ov.append(borePath, pulseGroup);
  plateHost.append(ov);
} else {
  const plate = buildPlate({ jitter: true });
  plateHost.append(plate);
  borePath = plate.querySelector('.well-dark');
  pulseGroup = plate.querySelector('.pulse');
}

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
    // the plate arrives under the surface copy rather than popping in at the top
    .fromTo('.section-plate', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0.9)
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

  /* the query pulse: rides the real bore, through the heel and along the lateral.
     It used to translate straight down, which left it gliding past the turn on a
     pipe that no longer exists. */
  if (pulseGroup && borePath) {
    const baseX = Number(pulseGroup.firstElementChild.getAttribute('cx') || 0);
    const baseY = Number(pulseGroup.firstElementChild.getAttribute('cy') || 0);
    const len = borePath.getTotalLength();
    const proxy = { t: 0 };
    const place = () => {
      const pt = borePath.getPointAtLength(proxy.t * len);
      pulseGroup.setAttribute('transform', `translate(${pt.x - baseX} ${pt.y - baseY})`);
    };
    place();
    gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 3.4 })
      .fromTo(pulseGroup, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0)
      .fromTo(proxy, { t: 0 }, { t: 1, duration: 3.2, ease: 'power2.inOut', onUpdate: place }, 0.2)
      .to(pulseGroup, { opacity: 0, duration: 0.6 }, 3.3)
      .fromTo('.res-core', { opacity: 0.1, scale: 0.92 }, { opacity: 0.45, scale: 1.06, duration: 0.9, yoyo: true, repeat: 1, transformOrigin: 'center', ease: 'sine.inOut' }, 2.9);
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
/* The deep section ships as a baked 2400 × 6000 plate. Panning eight megapixels of
   filtered vector re-rasterises the whole drawing every frame; a bitmap composites. */
const secSVG = document.createElement('img');
secSVG.className = 'section-plate';
const phone = matchMedia('(max-width: 743px)').matches;
secSVG.src = phone ? 'assets/img/section-plate-phone.webp' : 'assets/img/section-plate.webp';
secSVG.alt = '';
secSVG.decoding = 'async';
secSVG.setAttribute('fetchpriority', 'low');
sectionHost.append(secSVG);

const depthEl = $('#depth');
const formationEl = $('#formation');
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
  const stageEl = $('.descent-stage');
  let stageH = stageEl.clientHeight;
  let svgH = secSVG.getBoundingClientRect().height;
  // one setter instead of a new gsap.set object every scroll frame
  const setY = gsap.quickSetter(secSVG, 'y', 'px');
  const chTween = chapters.map((ch) => ({
    alpha: gsap.quickTo(ch, 'autoAlpha', { duration: 0.24, overwrite: true }),
    shift: gsap.quickTo(ch, 'y', { duration: 0.34, ease: 'power2.out', overwrite: true }),
  }));
  let lastFt = -1;
  const hudEl = document.querySelector('.descent-hud');

  const st = ScrollTrigger.create({
    trigger: '.descent-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    invalidateOnRefresh: true,
    onRefresh: () => {
      measure();                    // travel must follow the plate's real height
      stageH = stageEl.clientHeight;
      svgH = secSVG.getBoundingClientRect().height;
      lastFt = -1;
    },
    onUpdate: (self) => {
      const p = self.progress;
      setY(-travel * p);
      // depth of the section entering the middle of the stage, from the same mapping the
      // section's own labels use (12,000 ft over the full drawing height)
      const ft = Math.round(((p * travel + stageH * 0.55) / svgH) * 12000 / 10) * 10;
      if (ft !== lastFt) {
        lastFt = ft;
        depthEl.textContent = ft.toLocaleString('en-US');
        if (formationEl) formationEl.textContent = formationAt(ft).name;
      }
      for (let i = 0; i < chapters.length; i++) {
        const centre = i === 2 ? 0.86 : 0.2 + i * 0.32;
        const on = i === 2 ? p > 0.66 : Math.abs(p - centre) < 0.16;
        chTween[i].alpha(on ? 1 : 0);
        chTween[i].shift(on ? 0 : (p < centre ? 22 : -22));
      }
      // the readout belongs to the descent: retire it before the next section arrives,
      // otherwise it sits on top of the demo copy as the track ends
      if (hudEl) hudEl.style.opacity = p > 0.94 ? String(Math.max(0, (1 - p) / 0.06)) : '1';
    },
  });
  st.refresh();
  // the plate has no height until it decodes: re-measure once it does, or travel stays 0
  if (!secSVG.complete) secSVG.addEventListener('load', () => { measure(); st.refresh(); }, { once: true });
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
    q: 'Which Arab-D wells are over 45% water cut this quarter, and what do their allocations owe?',
    sql: `with q as (
  select w.name, p.water_bbl, p.oil_bbl,
         sum(a.delta_bbl) as delta_bbl
  from   prod_monthly p
  join   wells w       on w.id = p.well_id
  join   allocations a on a.well_id = p.well_id
                      and a.month = p.month
  where  p.formation = 'ARAB_D'
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
    rows: [['awd-22h', '61.4%', '−1,284'], ['hry-31h', '53.9%', '−902'], ['utm-14h', '47.2%', '−318']],
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
    rows: [['ghawar north', '4,180', '3.91%'], ['khurais east', '1,265', '2.42%'], ['shaybah south', '404', '0.88%']],
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
where  c.formation = 'ARAB_D'
  and  st_dwithin(c.geom::geography, p.geom::geography, 600)
order  by 3 asc;`,
    rows: [['hry-31h', 'utm-14h', '412'], ['awd-22h', 'utm-14h', '587'], ['—', 'no other pair', '—']],
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
