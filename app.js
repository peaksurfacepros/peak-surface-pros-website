(() => {
  const EMAIL = 'peaksurfacepros@gmail.com';
  const $ = (id) => document.getElementById(id);

  // Mobile menu
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  // Preselect from CTAs
  const form = document.getElementById('quote-form');
  const pkgSelect = document.getElementById('pkg');
  const check = (val) => { const el = form.querySelector(`input[name="service"][value="${val}"]`); if (el) el.checked = true; };
  const checkKey = (k) => { const el = form.querySelector(`input[data-key="${k}"]`); if (el) el.checked = true; };
  document.querySelectorAll('[data-pkg]').forEach((a) => a.addEventListener('click', () => {
    pkgSelect.value = a.dataset.pkg; checkKey(a.dataset.kind); syncInterior();
  }));

  // Package type tabs
  const tabs = [...document.querySelectorAll('.mode-tab')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      }
    });
  });
  document.querySelectorAll('[data-goto]').forEach((el) => el.addEventListener('click', (e) => {
    const tab = document.getElementById('tab-' + el.dataset.goto);
    selectTab(tab);
    if (el.tagName === 'BUTTON') document.getElementById('packages').scrollIntoView({ behavior: 'smooth' });
  }));

  // Interior refresh add-on only applies to event washes
  const interiorWrap = document.getElementById('interior-wrap');
  const syncInterior = () => {
    const isMobile = pkgSelect.value.startsWith('Mobile');
    interiorWrap.hidden = isMobile;
    if (isMobile) $('interior').checked = false;
  };
  pkgSelect.addEventListener('change', syncInterior);
  document.querySelectorAll('[data-service]').forEach((a) => a.addEventListener('click', () => {
    const el = form.querySelector(`input[data-key="${a.dataset.service}"]`); if (el) el.checked = true;
  }));

  // Validation + mailto
  const show = (field, bad) => { field.classList.toggle('invalid', bad); const e = field.querySelector('.err'); if (e) e.hidden = !bad; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const services = [...form.querySelectorAll('input[name="service"]:checked')].map((i) => i.value);
    const name = $("name").value.trim(), phone = $("phone").value.trim(), zip = $("zip").value.trim();
    const errSvc = document.getElementById('err-service');
    errSvc.hidden = services.length > 0;
    show($("name").closest('.field'), !name);
    show($("phone").closest('.field'), phone.replace(/\D/g, '').length < 10);
    show($("zip").closest('.field'), !/^\d{5}$/.test(zip));
    const firstBad = form.querySelector('.invalid input') || (!services.length && form.querySelector('.chips input'));
    if (firstBad) { firstBad.focus(); return; }

    const lines = [
      `Services: ${services.join(', ')}`,
      pkgSelect.value ? `Wash package: ${pkgSelect.value}` : '',
      $("interior").checked ? 'Add-on: Interior refresh (+$20)' : '',
      `Name: ${name}`, `Phone: ${phone}`,
      $("email").value.trim() ? `Email: ${$("email").value.trim()}` : '',
      `ZIP: ${zip}`,
      $("notes").value.trim() ? `\nDetails:\n${$("notes").value.trim()}` : ''
    ].filter(Boolean).join('\n');
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Quote request: ' + services.join(', '))}&body=${encodeURIComponent(lines)}`;
    document.getElementById('success').hidden = false;
    window.location.href = href;
  });
  form.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => {
    const f = i.closest('.field'); if (f && f.classList.contains('invalid')) show(f, false);
    if (i.name === 'service') document.getElementById('err-service').hidden = true;
  }));

  // Hide sticky CTA near the form
  const sticky = document.querySelector('.sticky-call');
  const quote = document.getElementById('quote');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-hidden', en.isIntersecting), { threshold: 0.05 }).observe(quote);
  }
  document.getElementById('yr').textContent = new Date().getFullYear();
})();
