import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';

import { initSmoothScroll } from './motion/core.js';
import { initReveals, refreshOnFonts } from './motion/reveal.js';
import { initMarquees, initMagnetic, initCursor, initCounters } from './motion/interactions.js';
import { playIntro } from './motion/intro.js';
import { initConsole } from './motion/console.js';
import { initNav, initMenu, initPricing, initForm, initFaq } from './ui.js';

initSmoothScroll();
initReveals();
initMarquees();
initMagnetic();
initCursor();
initCounters();
initNav();
initMenu();
initPricing();
initForm();
initFaq();
initConsole();
refreshOnFonts();

// Start the intro once display fonts are ready so split lines are measured correctly.
(document.fonts?.ready ?? Promise.resolve()).then(playIntro);
