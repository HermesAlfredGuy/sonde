/* Sonde — cross-section artwork generator.
   An illustrative (not surveyed) Eastern Province, Saudi Arabia section: stratified beds with regional dip,
   an anticline trap, two normal faults, a producing well with a lateral, and an instrument
   layer. Deterministic, so the plate is identical on every load. */

const SVGNS = 'http://www.w3.org/2000/svg';

export const PALETTE = {
  ground: '#060F14',
  skyTop: '#040B10',
  skyLow: '#0C2029',
  signal: '#F0A03C',
  ink: '#EFE9DC',
};

function mulberry(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

/* —— stratigraphy ————————————————————————————————————————————
   Depths are plausible Eastern Province (Ghawar-area) values; geometry is illustrative. */
const GROUND = 292;
const FORMATIONS = [
  { name: 'Alluvium',       y0: GROUND, depth: 0,    thick: 8,   c: '#2E3A36', grain: 0.30 },
  { name: 'Dammam',         y0: 300,    depth: 810,  thick: 30,  c: '#4A3731', grain: 0.34 },
  { name: 'Umm er Radhuma', y0: 330,    depth: 1290, thick: 22,  c: '#35443F', grain: 0.34 },
  { name: 'Aruma',          y0: 352,    depth: 1650, thick: 34,  c: '#293C41', grain: 0.32 },
  { name: 'Wasia',          y0: 386,    depth: 2190, thick: 24,  c: '#31423C', grain: 0.32 },
  { name: "Shu'aiba",       y0: 410,    depth: 2570, thick: 22,  c: '#263B3F', grain: 0.30 },
  { name: 'Biyadh',         y0: 432,    depth: 2920, thick: 46,  c: '#22363B', grain: 0.28 },
  { name: 'Sulaiy',         y0: 478,    depth: 3660, thick: 62,  c: '#2A3F42', grain: 0.26 },
  { name: 'Yamama',         y0: 540,    depth: 4650, thick: 54,  c: '#20323A', grain: 0.24 },
  { name: 'Hith',           y0: 594,    depth: 5510, thick: 96,  c: '#1B2C34', grain: 0.22 },
  { name: 'Arab-D',         y0: 690,    depth: 7050, thick: 40,  c: '#172831', grain: 0.20, reservoir: true },
  { name: 'Jubaila',        y0: 730,    depth: 7690, thick: 38,  c: '#142229', grain: 0.18 },
  { name: 'Khuff',          y0: 768,    depth: 8290, thick: 232, c: '#101B23', grain: 0.14 },
];


/* the formation a given depth sits in — used by the descent HUD */
export function formationAt(ft) {
  let hit = FORMATIONS[0];
  for (const f of FORMATIONS) if (ft >= f.depth) hit = f;
  return { name: hit.name, depth: hit.depth, reservoir: !!hit.reservoir };
}

/* Normal faults: tip depth, throw, dip as dx per dy. */
const FAULTS = [
  { x: 352,  top: 356, t: 13, dip: 0.28, soft: 4 },
  { x: 1442, top: 452, t: 21, dip: 0.32, soft: 5 },
];

const CREST_X = 1090, CREST_W = 320;

const faultX = (f, y) => f.x - f.dip * (y - f.top);
const faultThrow = (f, y) => (y < f.top ? 0 : f.t * smooth((y - f.top) / 90));

function boundaryY(x, i, cfg) {
  const last = FORMATIONS[FORMATIONS.length - 1];
  const base = i >= FORMATIONS.length ? last.y0 + last.thick : FORMATIONS[i].y0;
  let y = base;
  y += 10 * (1 - x / 1600);
  y -= 30 * Math.exp(-Math.pow((x - CREST_X) / CREST_W, 2));
  y += 3.6 * Math.sin(x / 410 + i * 0.55);
  y += 1.4 * Math.sin(x / 131 + i * 1.7);
  if (cfg.jitter) {
    y += 1.4 * Math.sin(x / (57 + i * 3) + i * 2.1);
    y += 0.8 * Math.sin(x / (21 + i) + i * 5.3);
  }
  for (const f of FAULTS) {
    const fy = faultThrow(f, y);
    if (!fy) continue;
    const fx = faultX(f, y);
    // drag: beds bend into the fault plane before they break
    y -= fy * 0.42 * Math.exp(-Math.pow((x - fx + 26) / 46, 2));
    y += fy * smooth((x - fx) / f.soft);
  }
  return y;
}

const boundaryPath = (i, cfg, step = 6) => {
  const pts = [];
  for (let x = -24; x <= 1624; x += step) pts.push([x, boundaryY(x, i, cfg)]);
  return pts;
};
const toPath = (pts) => pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const bandPath = (top, bot) => `${toPath(top)} ${bot.slice().reverse().map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`;

const el = (name, attrs = {}, children = []) => {
  const n = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
  for (const c of children) n.appendChild(c);
  return n;
};
const txt = (s) => document.createTextNode(s);

export function buildPlate({ jitter = true, withSky = true } = {}) {
  const cfg = { jitter };
  const rand = mulberry(20261026);
  const px = 1090;
  const root = el('svg', {
    viewBox: '0 0 1600 1000', preserveAspectRatio: 'xMidYMid slice', class: 'plate-svg',
    role: 'img', 'aria-label': 'Illustrative cross section: a producing well descends through twelve sedimentary formations into the Arab-D limestone of eastern Saudi Arabia, where a horizontal lateral is completed.',
  });
  const defs = el('defs');

  const grad = (id, stops, attrs = {}) => {
    const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1, ...attrs });
    stops.forEach(([o, c, op]) => g.append(el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
    return g;
  };
  const rad = (id, stops, attrs = {}) => {
    const g = el('radialGradient', { id, cx: '0.5', cy: '0.5', r: '0.5', ...attrs });
    stops.forEach(([o, c, op]) => g.append(el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })));
    return g;
  };

  const sky = grad('sky', [[0, PALETTE.skyTop, 1], [0.55, '#07151D', 1], [0.86, '#0D222B', 1], [1, '#123039', 1]]);
  const haze = grad('haze', [[0, '#0B1B22', 0], [1, '#1B4650', 0.28]]);
  const bandShade = grad('bandShade', [[0, '#E6F1EC', 0.10], [0.26, '#FFFFFF', 0], [0.74, '#000000', 0.05], [1, '#000000', 0.34]]);
  const depthHaze = grad('depthHaze', [[0, '#030D13', 0], [0.35, '#030D13', 0.08], [0.68, '#020A0F', 0.26], [1, '#02070B', 0.58]]);
  const keyLight = grad('keyLight', [[0, '#9FC6C4', 0.10], [1, '#9FC6C4', 0]]);
  const scrim = grad('scrim', [[0, '#050E13', 0.94], [0.52, '#050E13', 0.55], [1, '#050E13', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const vig = rad('vig', [[0.34, '#03090D', 0], [1, '#03090D', 0.62]], { cx: '0.44', cy: '0.44', r: '0.8' });
  const resFill = grad('res', [[0, '#FFD79B', 0.85], [0.30, '#F0A03C', 0.55], [0.78, '#B0661C', 0.22], [1, '#8A4E15', 0.06]]);
  const resEdge = grad('resEdge', [[0, '#F0A03C', 0], [0.32, '#FFE0B4', 0.95], [0.7, '#F0A03C', 0.55], [1, '#F0A03C', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const flareGlow = rad('flareGlow', [[0, '#FFC078', 0.5], [0.35, '#DB8230', 0.15], [1, '#DB8230', 0]]);
  const resGlow = rad('resGlow', [[0, '#F0A03C', 0.42], [0.45, '#B2661F', 0.14], [1, '#B2661F', 0]]);
  const resAmbient = rad('resAmbient', [[0, '#C9812C', 0.30], [0.5, '#8C5A1E', 0.10], [1, '#8C5A1E', 0]], { cx: '0.5', cy: '0.5', r: '0.5' });

  /* photographic rock: normalised to mid-grey so overlay blend carries its own contrast */
  const rockNorm = el('filter', { id: 'rockNorm', x: '0', y: '0', width: '100%', height: '100%' });
  rockNorm.append(
    el('feColorMatrix', { type: 'saturate', values: '0' }),
    el('feComponentTransfer', {}, [
      el('feFuncR', { type: 'linear', slope: '1.25', intercept: '0.02' }),
      el('feFuncG', { type: 'linear', slope: '1.25', intercept: '0.02' }),
      el('feFuncB', { type: 'linear', slope: '1.25', intercept: '0.02' }),
    ]),
  );
  const rockPat = (id, href, w, h) => {
    const p = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: w, height: h });
    p.append(el('image', { href, width: w, height: h, preserveAspectRatio: 'xMidYMid slice', filter: 'url(#rockNorm)' }));
    return p;
  };
  /* clast speckle: high-frequency material that flat fills never have */
  const speckle = el('pattern', { id: 'speckle', patternUnits: 'userSpaceOnUse', width: 140, height: 140 });
  const srand = mulberry(4242);
  for (let k = 0; k < 150; k++) {
    speckle.append(el('circle', {
      cx: (srand() * 140).toFixed(1), cy: (srand() * 140).toFixed(1), r: (0.35 + srand() * 1.5).toFixed(2),
      fill: srand() > 0.42 ? '#EAF3EF' : '#02070B', opacity: (0.05 + srand() * 0.22).toFixed(2),
    }));
  }
  /* displacement gives every bed edge and lamina a natural irregularity */
  const rough = el('filter', { id: 'rough', x: '-5%', y: '-5%', width: '110%', height: '110%' });
  rough.append(
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.011 0.02', numOctaves: '3', seed: '11', result: 'n' }),
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '9', xChannelSelector: 'R', yChannelSelector: 'G' }),
  );
  const soft = el('filter', { id: 'soft', x: '-20%', y: '-20%', width: '140%', height: '140%' });
  soft.append(el('feGaussianBlur', { stdDeviation: '2.4' }));
  const grain = el('filter', { id: 'grain', x: '0', y: '0', width: '100%', height: '100%' });
  grain.append(
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.85', numOctaves: '4', stitchTiles: 'stitch', result: 'n' }),
    el('feColorMatrix', { in: 'n', type: 'saturate', values: '0' }),
    el('feComponentTransfer', {}, [el('feFuncA', { type: 'linear', slope: '0.75', intercept: '0' })]),
  );
  const pore = el('pattern', { id: 'pore', patternUnits: 'userSpaceOnUse', width: 7, height: 7 });
  pore.append(
    el('circle', { cx: 1.6, cy: 1.8, r: 0.7, fill: '#FFD79B', opacity: '0.35' }),
    el('circle', { cx: 5, cy: 5.2, r: 0.55, fill: '#FFD79B', opacity: '0.22' }),
  );
  defs.append(sky, haze, bandShade, depthHaze, scrim, vig, resFill, resEdge, flareGlow, resGlow, resAmbient,
    rockNorm, rough, soft, grain, pore, speckle,
    rockPat('rockA', 'assets/img/tex-cliff.webp', 1560, 1300),
    rockPat('rockC', 'assets/img/tex-cliff.webp', 620, 620),
    rockPat('rockD', 'assets/img/tex-cliff.webp', 280, 280),
    rockPat('rockB', 'assets/img/tex-dark.webp', 760, 760));
  root.append(defs);

  const gSky = el('g', { class: 'ly-sky' });
  const gRidges = el('g', { class: 'ly-ridges' });
  const gSurface = el('g', { class: 'ly-surface' });
  const gSection = el('g', { class: 'ly-section' });
  const gRes = el('g', { class: 'ly-res' });
  const gBore = el('g', { class: 'ly-bore' });
  const gLabels = el('g', { class: 'ly-labels' });
  const gFx = el('g', { class: 'ly-fx' });

  /* —— sky —— */
  gSky.append(el('rect', { x: 0, y: 0, width: 1600, height: 320, fill: 'url(#sky)' }));
  for (let i = 0; i < 150; i++) {
    const x = rand() * 1600, y = rand() * 256;
    const r = 0.3 + Math.pow(rand(), 2.6) * 1.2;
    gSky.append(el('circle', {
      cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(2), fill: i % 13 === 0 ? '#CFE0DC' : '#EFE9DC',
      opacity: ((0.1 + rand() * 0.5) * (1 - y / 340) * 1.7).toFixed(3), class: 'star',
    }));
  }
  // a faint band of the galactic plane, turned across the frame
  const gBand = el('g', { class: 'galaxy', transform: 'rotate(-14 800 130)' });
  for (let k = 0; k < 9; k++) {
    gBand.append(el('ellipse', {
      cx: 760 + (rand() - 0.5) * 240, cy: 92 + (rand() - 0.5) * 60,
      rx: 300 + rand() * 380, ry: 30 + rand() * 46,
      fill: k % 3 === 0 ? '#8FB4C8' : '#B9C9CF', opacity: (0.012 + rand() * 0.018).toFixed(3),
      filter: 'url(#soft)',
    }));
  }
  gSky.append(gBand);
  gSky.append(el('rect', { x: 0, y: 150, width: 1600, height: 160, fill: 'url(#haze)' }));
  // low moon, behind the ridge: the reason the horizon has a rim light
  gSky.append(el('ellipse', { cx: 232, cy: 262, rx: 190, ry: 62, fill: '#9FC0C4', opacity: '0.05', filter: 'url(#soft)' }));
  gSky.append(el('ellipse', { cx: 1500, cy: 274, rx: 230, ry: 84, fill: 'url(#flareGlow)', class: 'flare' }));

  const ridge = (pts, fill, cls) =>
    el('path', {
      d: pts.map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y.toFixed(1)}`).join(' ') + ' L1600 306 L0 306 Z',
      fill, class: cls,
    });
  gRidges.append(
    ridge([[0, 266], [150, 258], [280, 262], [400, 251], [520, 257], [640, 248], [770, 255], [900, 247], [1040, 253], [1180, 245], [1320, 251], [1450, 243], [1600, 249]], '#0C1F28', 'ridge far'),
    ridge([[0, 278], [150, 272], [300, 276], [420, 267], [540, 273], [680, 265], [820, 272], [980, 264], [1140, 271], [1300, 265], [1460, 272], [1600, 266]], '#081820', 'ridge mid'),
    ridge([[0, 290], [240, 288], [440, 291], [640, 287], [840, 290], [1040, 286], [1240, 290], [1440, 287], [1600, 291]], '#040C11', 'ridge near'),
  );
  gRidges.append(el('path', {
    d: 'M1040 253 L1180 245 L1320 251 L1450 243 L1600 249',
    fill: 'none', stroke: '#8FB4B4', 'stroke-width': '0.7', opacity: '0.22', class: 'ridge-rim',
  }));

  /* —— surface plant: silhouettes with a rim light, for scale —— */
  const LO = '#030A0E';
  const RIM = '#7BA0A6';
  const sil = (d, extra = {}) => el('path', { d, fill: LO, ...extra });
  const rim = (d, w = 0.7, op = 0.6) => el('path', { d, fill: 'none', stroke: RIM, 'stroke-width': w, opacity: op });

  // wellhead: pad, casing head, valve stack, crown
  gSurface.append(
    sil(`M${px - 26} 292 v-5 h52 v5 z`),
    sil(`M${px - 9} 287 v-20 h18 v20 z`),
    sil(`M${px - 12} 269 h24 v4 h-24 z`),
    sil(`M${px - 6} 265 v-16 h12 v16 z`),
    sil(`M${px - 9} 251 h18 v4 h-18 z`),
    sil(`M${px - 4} 247 v-9 h8 v9 z`),
    rim(`M${px - 9} 287 v-20 M${px - 6} 265 v-16 M${px - 4} 247 v-9`, 0.7, 0.5),
    // flowline west to the separator, on two saddles
    el('path', { d: `M${px + 9} 281 H${px + 48} q12 0 12 8 V292`, fill: 'none', stroke: LO, 'stroke-width': '2.2' }),
    el('path', { d: `M${px + 9} 281 H${px + 48} q12 0 12 8 V292`, fill: 'none', stroke: RIM, 'stroke-width': '0.5', opacity: '0.3' }),
    el('path', { d: `M${px + 24} 281 v11 M${px + 42} 281 v11`, stroke: LO, 'stroke-width': '1.4' }),
    // tank battery: two stock tanks, separator, pipe rack
    sil('M1352 292 v-34 a7 7 0 0 1 7 -7 h24 a7 7 0 0 1 7 7 v34 z'),
    sil('M1396 292 v-28 a6 6 0 0 1 6 -6 h20 a6 6 0 0 1 6 6 v28 z'),
    sil('M1436 292 v-15 h34 v15 z'),
    sil('M1474 292 v-40 h3 v40 z'),
    rim('M1352 258 a7 7 0 0 1 7 -7 h24 a7 7 0 0 1 7 7', 0.6, 0.28),
    el('path', { d: 'M1440 279 h26 M1372 262 h22', stroke: '#132A31', 'stroke-width': '0.9' }),
    // shed with one lit window — the only human sign in the frame
    sil('M1490 292 v-18 h26 v18 z'),
    el('rect', { x: 1497, y: 280, width: 5, height: 4, fill: '#F0A03C', opacity: '0.75', class: 'shed-light' }),
    // mast with a beacon
    el('path', { d: 'M1544 292 v-52', stroke: LO, 'stroke-width': '1.3' }),
    el('circle', { cx: 1544, cy: 239, r: 1.7, fill: '#E0703C', class: 'beacon' }),
  );

  // pumpjack: A-frame with cross bracing, horsehead, beam, crank, motor skid
  const pjx = 1226, pjy = 292;
  gSurface.append(
    el('path', {
      d: `M${pjx - 44} ${pjy} L${pjx - 24} ${pjy - 70} L${pjx + 24} ${pjy - 70} L${pjx + 44} ${pjy}
          M${pjx - 24} ${pjy - 70} L${pjx + 26} ${pjy}
          M${pjx + 24} ${pjy - 70} L${pjx - 26} ${pjy}
          M${pjx - 34} ${pjy - 24} H${pjx + 34}
          M${pjx - 29} ${pjy - 45} H${pjx + 29}`,
      fill: 'none', stroke: LO, 'stroke-width': '2.2',
    }),
    sil(`M${pjx - 54} ${pjy - 92} q28 -13 55 0 l-5 11 q-22 -8 -45 0 z`),
    sil(`M${pjx - 4} ${pjy - 74} l40 -12 3 4 -41 12 z`),
    el('circle', { cx: pjx + 30, cy: pjy - 26, r: 10, fill: 'none', stroke: LO, 'stroke-width': '2' }),
    sil(`M${pjx + 30} ${pjy - 26} l7 -8 3 2.6 -7 8 z`),
    sil(`M${pjx + 12} ${pjy} v-12 h20 v12 z`),
    el('path', { d: `M${pjx + 30} ${pjy - 36} v-24`, stroke: LO, 'stroke-width': '1.6' }),
    rim(`M${pjx - 54} ${pjy - 92} q28 -13 55 0`, 0.6, 0.35),
  );

  // fence line west of the pad: gives the plain a scale
  for (let k = 0; k < 9; k++) {
    const x = 40 + k * 46;
    gSurface.append(el('path', { d: `M${x} ${GROUND} v-13`, stroke: '#0A1A20', 'stroke-width': '1.1', opacity: '0.9' }));
  }
  gSurface.append(el('path', { d: `M40 ${GROUND - 10} H${40 + 8 * 46}`, stroke: '#0A1A20', 'stroke-width': '0.7', opacity: '0.7' }));

  /* —— the section —— */
  const surface = toPath([[0, GROUND - 1], ...Array.from({ length: 41 }, (_, k) => {
    const x = k * 40;
    return [x, GROUND + Math.sin(x / 190) * 1.2];
  }), [1600, GROUND - 1]]);
  gSection.append(el('path', { d: surface, fill: 'none', stroke: '#CFE0DC', 'stroke-width': '1.1', opacity: '0.34', class: 'ground-rim' }));

  // warm ambient thrown by the reservoir into the surrounding rock, and cool sky light at the top
  gSection.append(el('ellipse', { cx: CREST_X, cy: 706, rx: 470, ry: 230, fill: 'url(#resAmbient)', style: 'mix-blend-mode:screen', class: 'res-ambient' }));

  const beds = el('g', { filter: 'url(#rough)', class: 'beds' });
  FORMATIONS.forEach((f, i) => {
    const top = boundaryPath(i, cfg);
    const bot = boundaryPath(i + 1, cfg);
    const d = bandPath(top, bot);
    const g = el('g', { class: 'band', 'data-band': i, style: `--i:${i}` });

    g.append(el('path', { d, fill: f.c }));
    g.append(el('path', { d, fill: 'url(#rockB)', opacity: String(f.grain * 0.55), style: 'mix-blend-mode:soft-light' }));

    const lam = Math.max(2, Math.round(f.thick / 14));
    for (let k = 1; k < lam; k++) {
      const t = k / lam;
      const pts = top.map(([x, y], j) => [x, y + (bot[j][1] - y) * t + 1.6 * Math.sin(x / (53 + k * 11) + k * 2.3 + i)]);
      g.append(el('path', {
        d: toPath(pts), fill: 'none',
        stroke: k % 4 === 0 ? '#DCEBE6' : '#02080C',
        'stroke-width': k % 4 === 0 ? '0.55' : '0.9',
        opacity: k % 4 === 0 ? '0.13' : '0.30',
      }));
    }
    g.append(el('path', { d, fill: 'url(#bandShade)' }));
    g.append(el('path', { d: toPath(top), fill: 'none', stroke: '#E7F2EE', 'stroke-width': '0.55', opacity: '0.14' }));
    // contact shadow under every bed boundary
    g.append(el('path', { d: toPath(bot), fill: 'none', stroke: '#010508', 'stroke-width': '3.4', opacity: '0.34', filter: 'url(#soft)' }));
    g.append(el('path', { d: toPath(bot), fill: 'none', stroke: '#02080C', 'stroke-width': '1', opacity: '0.5' }));
    beds.append(g);
  });
  /* one continuous photographic rock mass across every bed, then clast speckle */
  beds.append(el('rect', {
    x: -20, y: GROUND, width: 1640, height: 1000 - GROUND + 20, fill: 'url(#rockA)',
    opacity: '0.46', style: 'mix-blend-mode:overlay', class: 'rock-global',
  }));
  beds.append(el('rect', {
    x: -20, y: GROUND, width: 1640, height: 1000 - GROUND + 20, fill: 'url(#rockC)',
    opacity: '0.30', style: 'mix-blend-mode:overlay', class: 'rock-mid',
  }));
  beds.append(el('rect', {
    x: -20, y: GROUND, width: 1640, height: 1000 - GROUND + 20, fill: 'url(#rockD)',
    opacity: '0.16', style: 'mix-blend-mode:soft-light', class: 'rock-fine',
  }));
  beds.append(el('rect', {
    x: -20, y: GROUND, width: 1640, height: 1000 - GROUND + 20, fill: 'url(#speckle)',
    opacity: '0.6', style: 'mix-blend-mode:overlay', class: 'rock-speck',
  }));
  gSection.append(beds);

  /* marker beds: stratigraphy reads by its keys */
  const marker = (i, frac, color, w, op) => {
    const top = boundaryPath(i, cfg), bot = boundaryPath(i + 1, cfg);
    const pts = top.map(([x, y], j) => [x, y + (bot[j][1] - y) * frac]);
    return el('path', { d: toPath(pts), fill: 'none', stroke: color, 'stroke-width': w, opacity: op, class: 'marker' });
  };
  const gMark = el('g', { filter: 'url(#rough)' });
  gMark.append(
    marker(5, 0.42, '#C0B49B', 1.8, 0.5),
    marker(8, 0.28, '#8E5C3C', 1.5, 0.55),
    marker(9, 0.58, '#C0B49B', 1.2, 0.38),
    marker(11, 0.34, '#8E5C3C', 1.1, 0.4),
  );
  gSection.append(gMark);

  /* faults: slanted traces with a breccia shadow, dying out upward */
  FAULTS.forEach((f) => {
    const xTop = faultX(f, f.top), xBot = faultX(f, 1000);
    gSection.append(el('path', {
      d: `M${xTop} ${f.top} L${xBot} 1000`, stroke: '#010508', 'stroke-width': '2.6', opacity: '0.5', fill: 'none', class: 'fault',
    }));
    gSection.append(el('path', {
      d: `M${xTop + 1.4} ${f.top} L${xBot + 2} 1000`, stroke: '#CFE0DC', 'stroke-width': '0.6', opacity: '0.12', fill: 'none',
    }));
  });

  /* —— reservoir: anticline trap in the Arab-D —— */
  const ri = FORMATIONS.findIndex((f) => f.reservoir);
  const topR = boundaryPath(ri, cfg), botR = boundaryPath(ri + 1, cfg);
  const keep = topR.map(([x], k) => Math.exp(-Math.pow((x - CREST_X) / 420, 2)) > 0.30);
  const resPts = topR.filter((_, k) => keep[k]);
  const resTop = resPts.length ? toPath(resPts.map(([x, y]) => [x, y + 2.5])) : '';
  const resBotPts = resPts.map(([x], k) => {
    const idx = topR.findIndex(([tx]) => tx === x);
    return [x, botR[idx][1] - 3];
  });
  const resD = resPts.length ? `${resTop} ${toPath(resBotPts.reverse()).replace(/^M/, 'L')} Z` : '';

  gRes.append(el('ellipse', { cx: CREST_X, cy: 706, rx: 300, ry: 86, fill: 'url(#resGlow)', opacity: '0.55', class: 'res-glow', style: 'mix-blend-mode:screen' }));
  // shadow cast into the bed below, so the lens sits in the rock rather than on it
  gRes.append(el('path', { d: resD, fill: '#01060A', opacity: '0.5', transform: 'translate(6 9)', filter: 'url(#soft)' }));
  gRes.append(el('path', { d: resD, fill: 'url(#res)', opacity: '0.55', class: 'res-body' }));
  gRes.append(el('path', { d: resD, fill: 'url(#pore)', opacity: '0.5' }));
  const resClip = el('clipPath', { id: 'resClip' });
  resClip.append(el('path', { d: resD }));
  defs.append(resClip);
  const resLam = el('g', { 'clip-path': 'url(#resClip)' });
  for (let k = 1; k < 6; k++) {
    resLam.append(el('path', {
      d: `M${CREST_X - 400} ${698 + k * 6.4} q200 ${-4 - k} 400 0 q200 ${4 + k} 400 0`,
      fill: 'none', stroke: '#5C3410', 'stroke-width': '1.1', opacity: '0.22',
    }));
  }
  gRes.append(resLam);
  gRes.append(el('ellipse', { cx: CREST_X + 130, cy: 712, rx: 190, ry: 26, fill: '#FFD79B', opacity: '0.16', filter: 'url(#soft)', style: 'mix-blend-mode:screen', class: 'res-core' }));
  gRes.append(el('path', { d: resTop, fill: 'none', stroke: 'url(#resEdge)', 'stroke-width': '1.8', class: 'res-crest' }));
  gRes.append(el('path', { d: `M${CREST_X - 290} 727 H${CREST_X + 250}`, stroke: '#F0A03C', 'stroke-width': '0.6', 'stroke-dasharray': '4 5', opacity: '0.4' }));
  // the beds that bound the reservoir catch its light
  gRes.append(el('path', { d: resTop, fill: 'none', stroke: '#F0A03C', 'stroke-width': '3.2', opacity: '0.22', filter: 'url(#soft)', class: 'res-spill' }));
  gRes.append(el('path', { d: toPath(resBotPts.slice().reverse()), fill: 'none', stroke: '#C9812C', 'stroke-width': '3.6', opacity: '0.14', filter: 'url(#soft)' }));

  /* —— well: casing, lateral, perforations, pulse —— */
  const topSurf = GROUND - 1;
  // one continuous string: casing → heel → lateral. The casing must stop exactly at the
  // heel tangent (646) or the overshoot reads as a second pipe continuing down the hole.
  const HEEL = 646;

  const lateral = `M${px} ${HEEL - 8} C${px} 694 ${px - 26} 707 ${px - 104} 707 H${px - 246}`;
  // one continuous stroke from surface to toe: same weight through the heel, no join
  const wellPath = `M${px} 249 V${HEEL - 8} C${px} 694 ${px - 26} 707 ${px - 104} 707 H${px - 246}`;
  gBore.append(el('path', { d: wellPath, fill: 'none', stroke: '#040E13', 'stroke-width': '2.4', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: '1', class: 'well-dark' }));
  gBore.append(el('path', { d: wellPath, fill: 'none', stroke: '#A9BDBC', 'stroke-width': '0.5', opacity: '0.42', 'stroke-linecap': 'round', pathLength: '1', class: 'well-line' }));
  // four perforation stages, irregular like a real completion
  [[46, 5], [96, 4], [148, 6], [200, 4]].forEach(([dx, n]) => {
    for (let k = 0; k < n; k++) {
      const x = px - dx - k * 3.4;
      gBore.append(el('path', { d: `M${x} 708 v7`, stroke: '#F0A03C', 'stroke-width': '0.9', opacity: '0.32', class: 'perf' }));
    }
  });
  // heat follows the bend into the lateral — no stub hanging below the elbow
  gBore.append(el('path', { d: `M${px} ${HEEL - 8} C${px} 694 ${px - 26} 707 ${px - 104} 707`, fill: 'none', stroke: '#FFD79B', 'stroke-width': '1.3', opacity: '0.55', filter: 'url(#soft)', class: 'casing-hot' }));
  gBore.append(el('g', { class: 'pulse', opacity: '0' }, [
    el('circle', { cx: px, cy: 300, r: 2.6, fill: '#FFE0B4' }),
    el('circle', { cx: px, cy: 300, r: 7.5, fill: 'none', stroke: '#F0A03C', 'stroke-width': '0.9', opacity: '0.5' }),
    el('path', { d: `M${px} 297 v-30`, stroke: '#F0A03C', 'stroke-width': '1.2', opacity: '0.16' }),
  ]));

  /* —— annotation —— */
  const ftAt = (y) => Math.round(((y - GROUND) / (1000 - GROUND)) * 12000 / 100) * 100;
  const annotate = (i, label, depth, dy = 0) => {
    const y = boundaryY(CREST_X, i, cfg) + dy;
    const g = el('g', { class: 'annot' });
    g.append(el('path', { d: `M${px + 14} ${y + 1} H${px + 68}`, stroke: '#CFE0DC', 'stroke-width': '0.55', opacity: '0.3' }));
    const t1 = el('text', { x: px + 74, y: y + 4, class: 'lbl' });
    t1.append(txt(label));
    const t2 = el('text', { x: px + 74, y: y + 16.5, class: 'lbl dim' });
    t2.append(txt(`${ftAt(y).toLocaleString('en-US')} ft`));
    g.append(t1, t2);
    return g;
  };
  gLabels.append(
    annotate(9, 'HITH', 5510, 1),
    annotate(10, 'ARAB-D', 7050, 2),
    annotate(12, 'KHUFF', 8290, 1),
  );

  const gRuler = el('g', { class: 'ruler' });
  for (let y = 320, n = 0; y < 996; y += 26, n++) {
    const major = n % 5 === 0;
    gRuler.append(el('path', { d: `M${major ? 1540 : 1554} ${y} H1600`, stroke: '#8FA3A3', 'stroke-width': '0.6', opacity: major ? '0.34' : '0.14' }));
    if (major) {
      const t = el('text', { x: 1532, y: y + 3.4, class: 'ruler-n', 'text-anchor': 'end' });
      t.append(txt(ftAt(y).toLocaleString('en-US')));
      gRuler.append(t);
    }
  }
  gLabels.append(gRuler);

  /* atmosphere: depth falls into darkness, then the finish */
  gFx.append(el('rect', { x: 0, y: GROUND - 2, width: 1600, height: 200, fill: 'url(#keyLight)' }));
  const hazeBands = [[470, 0.05], [596, 0.045], [672, 0.04], [842, 0.05], [928, 0.035]];
  for (const [hy, op] of hazeBands) {
    gFx.append(el('ellipse', { cx: 800, cy: hy, rx: 900, ry: 26, fill: '#7FA6A8', opacity: String(op), filter: 'url(#soft)', class: 'haze-band' }));
  }
  gFx.append(el('rect', { x: 0, y: GROUND - 2, width: 1600, height: 1000 - GROUND, fill: 'url(#depthHaze)' }));
  gFx.append(el('rect', { x: 0, y: 0, width: 1600, height: 1000, fill: 'url(#vig)' }));
  gFx.append(el('rect', { x: 0, y: 0, width: 1600, height: 1000, filter: 'url(#grain)', opacity: '0.20', class: 'grain' }));
  // the quiet field the headline sits in
  gFx.append(el('rect', { x: 0, y: 0, width: 860, height: 1000, fill: 'url(#scrim)', class: 'hero-scrim' }));

  root.append(gSky, gRidges, gSurface, gSection, gRes, gBore, gLabels, gFx);
  return root;
}

/* ================================================================
   Descent section for the pinned chapter. Surface at y=0,
   12,000 ft at y=2600, bore at x=560 (1200 wide).
   ================================================================ */
export function buildSection({ w = 1200, h = 2600 } = {}) {
  const rand = mulberry(77123);
  const svg = el('svg', {
    viewBox: `0 0 ${w} ${h}`, class: 'section-svg', preserveAspectRatio: 'xMidYMin slice', role: 'img',
    'aria-label': 'A deep geological section from the surface to basement, with the well casing and a depth scale.',
  });
  const defs = el('defs');
  const shade = el('linearGradient', { id: 'secShade', x1: 0, y1: 0, x2: 0, y2: 1 });
  shade.append(
    el('stop', { offset: '0', 'stop-color': '#E6F1EC', 'stop-opacity': '0.10' }),
    el('stop', { offset: '0.3', 'stop-color': '#FFF', 'stop-opacity': '0' }),
    el('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '0.32' }),
  );
  const tint = el('filter', { id: 'secTint' });
  tint.append(el('feColorMatrix', { type: 'matrix', values: '0.40 0.32 0.11 0 0  0.38 0.34 0.11 0 0  0.32 0.32 0.17 0 0  0 0 0 1 0' }));
  const pat = el('pattern', { id: 'secRock', patternUnits: 'userSpaceOnUse', width: 520, height: 520 });
  pat.append(el('image', { href: 'assets/img/tex-cliff.webp', width: 520, height: 520, preserveAspectRatio: 'xMidYMid slice', filter: 'url(#secTint)', opacity: '0.9' }));
  const rough = el('filter', { id: 'secRough', x: '-3%', y: '-3%', width: '106%', height: '106%' });
  rough.append(
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.012 0.02', numOctaves: '3', seed: '5', result: 'n' }),
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '10', xChannelSelector: 'R', yChannelSelector: 'G' }),
  );
  defs.append(shade, tint, pat, rough);
  svg.append(defs);

  const BEDS = [
    { n: 'Alluvium', d: 0, c: '#2E3A36' },
    { n: 'Dammam', d: 810, c: '#4A3731' },
    { n: 'Umm er Radhuma', d: 1290, c: '#35443F' },
    { n: 'Aruma', d: 1650, c: '#293C41' },
    { n: 'Wasia', d: 2190, c: '#31423C' },
    { n: "Shu'aiba", d: 2570, c: '#263B3F' },
    { n: 'Biyadh', d: 2920, c: '#22363B' },
    { n: 'Sulaiy', d: 3660, c: '#2A3F42' },
    { n: 'Yamama', d: 4650, c: '#20323A' },
    { n: 'Hith', d: 5510, c: '#1B2C34' },
    { n: 'Arab-D', d: 7050, c: '#172831', res: true },
    { n: 'Jubaila', d: 7690, c: '#142229' },
    { n: 'Khuff', d: 8290, c: '#101B23' },
  ];
  const yOf = (ft) => (ft / 12000) * h;

  const gBeds = el('g', { class: 'sec-beds', filter: 'url(#secRough)' });
  BEDS.forEach((b, i) => {
    const y = yOf(b.d);
    const next = BEDS[i + 1];
    const hh = (next ? yOf(next.d) : h) - y;
    const g = el('g', { class: 'sec-band', style: `--i:${i}` });
    g.append(el('rect', { x: -20, y, width: w + 40, height: hh + 1.4, fill: b.c }));
    g.append(el('rect', { x: -20, y, width: w + 40, height: hh + 1.4, fill: 'url(#secRock)', opacity: '0.34', style: 'mix-blend-mode:overlay' }));
    const lam = Math.max(2, Math.round(hh / 55));
    for (let k = 1; k < lam; k++) {
      const ly = y + (hh * k) / lam + Math.sin(i * 2 + k) * 4;
      g.append(el('path', { d: `M-20 ${ly} H${w + 20}`, stroke: k % 3 === 0 ? '#DCEBE6' : '#02080C', 'stroke-width': k % 3 === 0 ? '0.7' : '1.1', opacity: k % 3 === 0 ? '0.12' : '0.3' }));
    }
    g.append(el('rect', { x: -20, y, width: w + 40, height: hh + 1.4, fill: 'url(#secShade)' }));
    g.append(el('path', { d: `M-20 ${y} H${w + 20}`, stroke: '#E7F2EE', 'stroke-width': '0.7', opacity: '0.16' }));
    gBeds.append(g);
  });

  const ry = yOf(7900), rh = yOf(8700) - yOf(7900);
  const gRes = el('g', { class: 'sec-res' });
  gRes.append(el('ellipse', { cx: w / 2, cy: ry + rh / 2, rx: w * 0.52, ry: rh * 1.7, fill: '#F0A03C', opacity: '0.10', style: 'mix-blend-mode:screen' }));
  gRes.append(el('rect', { x: 90, y: ry + 18, width: w - 180, height: rh - 26, rx: 46, fill: '#F0A03C', opacity: '0.16' }));
  gRes.append(el('path', { d: `M90 ${ry + 22} H${w - 90}`, stroke: '#FFD79B', 'stroke-width': '2', opacity: '0.5' }));
  gBeds.append(gRes);

  const bx = 560;
  const tdY = yOf(12800);
  gBeds.append(el('rect', { x: bx - 1.6, y: -30, width: 3.2, height: tdY + 30, fill: '#040E13' }));
  gBeds.append(el('rect', { x: bx - 1.6, y: -30, width: 0.6, height: tdY + 30, fill: '#A9BDBC', opacity: '0.5' }));
  gBeds.append(el('rect', { x: bx - 5, y: tdY - 9, width: 10, height: 9, fill: '#040E13' }));
  gBeds.append(el('rect', { x: bx, y: ry + rh - 12, width: 330, height: 2.6, fill: '#040E13' }));

  BEDS.forEach((b) => {
    const y = yOf(b.d);
    const g = el('g', { class: 'sec-lbl' });
    g.append(el('path', { d: `M${bx + 14} ${y} H${bx + 58}`, stroke: '#CFE0DC', 'stroke-width': '0.55', opacity: '0.28' }));
    const t = el('text', { x: bx + 64, y: y + 4, class: 'lbl' }); t.append(txt(b.n));
    const t2 = el('text', { x: bx + 64, y: y + 17, class: 'lbl dim' }); t2.append(txt(`${b.d.toLocaleString('en-US')} ft`));
    g.append(t, t2);
    gBeds.append(g);
  });

  // total depth: the bottom of the hole, where the descent ends
  const td = yOf(12800);
  gBeds.append(el('path', { d: `M-20 ${td} H${w + 20}`, stroke: '#F0A03C', 'stroke-width': '0.9', opacity: '0.5', 'stroke-dasharray': '7 6' }));
  gBeds.append(el('path', { d: `M${bx + 14} ${td} H${bx + 58}`, stroke: '#F0A03C', 'stroke-width': '0.7', opacity: '0.6' }));
  const tdl = el('text', { x: bx + 64, y: td + 4, class: 'lbl', fill: '#F0A03C' });
  tdl.append(txt('Total depth'));
  const tdl2 = el('text', { x: bx + 64, y: td + 17, class: 'lbl dim' });
  tdl2.append(txt('12,800 ft'));
  gBeds.append(tdl, tdl2);

  for (let ft = 0; ft <= 12000; ft += 500) {
    const y = yOf(ft), major = ft % 2000 === 0;
    gBeds.append(el('path', { d: `M${w - 54} ${y} H${w - 8}`, stroke: '#8FA3A3', 'stroke-width': '0.6', opacity: major ? '0.36' : '0.13' }));
    if (major) {
      const t = el('text', { x: w - 62, y: y + 4, class: 'ruler-n', 'text-anchor': 'end' });
      t.append(txt(ft.toLocaleString('en-US')));
      gBeds.append(t);
    }
  }
  for (let i = 0; i < 34; i++) {
    gBeds.append(el('circle', { cx: rand() * w, cy: rand() * h, r: 0.8 + rand() * 1.1, fill: '#CFE0DC', opacity: 0.08 + rand() * 0.2, class: 'mote' }));
  }
  svg.append(gBeds);
  return svg;
}
