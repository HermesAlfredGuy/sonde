// Interface behaviour that is not scroll motion: nav state, mobile menu,
// pricing period, the demo form, and the FAQ height animation.

export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function initMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (!burger || !menu) return;

  const links = [...menu.querySelectorAll('a, button')];
  let open = false;
  let lastFocus = null;

  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => menu.classList.add('is-open'));
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    open = true;
    setTimeout(() => links[0]?.focus(), 80);
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.documentElement.style.overflow = '';
    open = false;
    setTimeout(() => { menu.hidden = true; }, 420);
    (lastFocus instanceof HTMLElement ? lastFocus : burger).focus();
  };

  let lastToggle = 0;
  const toggle = () => {
    // a touch device can deliver tap + click for one press; ignore the duplicate
    const now = performance.now();
    if (now - lastToggle < 280) return;
    lastToggle = now;
    if (open) closeMenu(); else openMenu();
  };
  burger.addEventListener('click', toggle);
  burger.addEventListener('touchend', (e) => { e.preventDefault(); toggle(); }, { passive: false });

  links.forEach((a) => a.addEventListener('click', () => { if (open) closeMenu(); }));

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab' || !links.length) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // closing on resize to desktop keeps state honest
  window.addEventListener('resize', () => { if (open && window.innerWidth > 900) closeMenu(); });
}

export function initPricing() {
  const toggle = document.querySelector('[data-toggle]');
  if (!toggle) return;
  const buttons = [...toggle.querySelectorAll('[data-period]')];
  const prices = [...document.querySelectorAll('.tier__v[data-m]')];

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      prices.forEach((el) => {
        const next = period === 'year' ? el.dataset.y : el.dataset.m;
        if (el.textContent.replace('$', '') === next) return;
        el.animate(
          [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
          { duration: 140, easing: 'cubic-bezier(0.32,0.72,0,1)', fill: 'forwards' }
        ).finished.then(() => {
          el.textContent = `$${next}`;
          el.animate(
            [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 240, easing: 'cubic-bezier(0.32,0.72,0,1)', fill: 'forwards' }
          );
        });
      });
    });
  });
}

export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const msg = form.querySelector('[data-form-msg]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = (input.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    input.setAttribute('aria-invalid', String(!ok));
    msg.classList.toggle('is-ok', ok);
    msg.classList.toggle('is-err', !ok);
    msg.textContent = ok
      ? 'Thanks. A field engineer will reply within one business day.'
      : 'That address does not look complete. Check it and try again.';
    if (ok) form.reset();
  });
}

// details/summary: animate the panel height so the plus never jumps.
export function initFaq() {
  document.querySelectorAll('.q').forEach((d) => {
    const body = d.querySelector('p');
    if (!body) return;
    d.addEventListener('toggle', () => {
      if (d.open) {
        body.animate(
          [{ height: 0, opacity: 0 }, { height: `${body.scrollHeight}px`, opacity: 1 }],
          { duration: 320, easing: 'cubic-bezier(0.32,0.72,0,1)' }
        );
      }
    });
  });
}
