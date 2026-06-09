/* ============================================================
   script.js — raigon-mmxi
   All JavaScript for the site lives here.
   Sections: Data → Navigation → Home Gallery →
             Artwork Modal → Vault Symbols → Collection Overlay →
             Events → Form Validation → Bio Modal
============================================================ */


/* ============================================================
   ARTWORK DATA
   Array of all artworks in the Carvão Digital series.
   Each entry: image path, title, series name, year.
============================================================ */
const artworks = [
  { src: "assets/images/hero/digital-charcoal-00001.jpg", title: "Triforce",  series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00002.jpg", title: "Bloom",     series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00003.jpg", title: "Intersect", series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00004.jpg", title: "Serpent",   series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00005.jpg", title: "Dissolve",  series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00006.jpg", title: "Collapse",  series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00007.jpg", title: "Drift",     series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00008.jpg", title: "Coil",      series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00009.jpg", title: "Monolith",  series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00010.jpg", title: "Knot",      series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00011.jpg", title: "Vessel",    series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00012.jpg", title: "Scale",     series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00013.jpg", title: "Presence",  series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00014.jpg", title: "Threshold", series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00015.jpg", title: "Mass",      series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00016.jpg", title: "Void",      series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00017.jpg", title: "Loop",      series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00018.jpg", title: "Strike",    series: "carvão digital", year: "2023" },
  { src: "assets/images/hero/digital-charcoal-00019.jpg", title: "Torsion",   series: "carvão digital", year: "2023" },
];


/* ============================================================
   NAVIGATION
   Switches active page section and triggers data loads.
   Hash routing: URL updates on nav so back/forward work natively.
============================================================ */
const pills = document.querySelectorAll('.pill');
const pages = document.querySelectorAll('.page');

const VALID_PAGES = ['home', 'vault', 'arquive'];

function switchSection(page) {
  pages.forEach(p => p.classList.remove('active'));
  pills.forEach(p => p.classList.remove('active'));

  document.getElementById(page).classList.add('active');
  document.querySelector(`.pill[data-page="${page}"]`).classList.add('active');
  document.getElementById(page).scrollTop = 0;

  if (page === 'arquive') { loadEvents(); }
}

function navigateTo(page) {
  artworkModal.classList.remove('open');
  artworkModal.setAttribute('aria-hidden', 'true');
  modalWorks   = artworks;
  modalContext = 'home';
  document.querySelectorAll('.collection-overlay').forEach(o => o.remove());
  location.hash = page;
}

pills.forEach(pill => {
  pill.addEventListener('click', () => navigateTo(pill.dataset.page));
});

window.addEventListener('hashchange', () => {
  const page = location.hash.slice(1) || 'home';

  if (page.startsWith('home/modal/')) {
    const idx = parseInt(page.split('/')[2], 10);
    if (!isNaN(idx) && idx >= 0 && idx < artworks.length) { showModal(idx); }
    return;
  }

  if (page.startsWith('vault/collection/modal/')) {
    const idx = parseInt(page.split('/')[3], 10);
    if (!isNaN(idx) && idx >= 0 && idx < modalWorks.length) { showModal(idx); }
    return;
  }

  if (page === 'home' && artworkModal.classList.contains('open')) {
    artworkModal.classList.remove('open');
    artworkModal.setAttribute('aria-hidden', 'true');
    return;
  }

  if (page === 'vault/collection') {
    if (artworkModal.classList.contains('open')) {
      artworkModal.classList.remove('open');
      artworkModal.setAttribute('aria-hidden', 'true');
      modalWorks   = artworks;
      modalContext = 'home';
    }
    return;
  }

  if (page === 'vault') {
    const openOverlay = document.querySelector('.collection-overlay.open');
    if (openOverlay) {
      openOverlay.classList.remove('open');
      openOverlay.addEventListener('transitionend', () => openOverlay.remove(), { once: true });
      return;
    }
  }

  if (VALID_PAGES.includes(page)) { switchSection(page); }
});

const initialPage = location.hash.slice(1);
switchSection(VALID_PAGES.includes(initialPage) ? initialPage : 'home');

const globalLogo = document.querySelector('.global-logo');
globalLogo.addEventListener('click', () => navigateTo('home'));
globalLogo.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { navigateTo('home'); }
});


/* ============================================================
   HOME GALLERY — PARALLAX BUILD
   Builds three infinite-scroll rows of artwork cards.
   Handles drag, wheel, mouse-edge scroll, and auto-scroll.
   Applies a depth-of-field focus effect on each frame.
============================================================ */
window.addEventListener('load', () => {
  const scene = document.querySelector('.home-scene');

  scene.innerHTML = '';

  const rows = [
    artworks.slice(0, 10),
    artworks.slice(5, 15),
    artworks.slice(9, 19),
  ];

  const layers         = [];
  const offsets        = [0, -285, -140];
  const targetOffsets  = [0, -285, -140];
  const parallaxSpeeds = [0.08, 0.05, 0.03];

  let mouseX = 0;
  const W = window.innerWidth;

  rows.forEach((row, ri) => {
    const layer = document.createElement('div');
    layer.className = `layer layer-${ri + 1}`;

    [...row, ...row, ...row].forEach(art => {
      const card = document.createElement('div');
      card.className = 'artwork-card';

      const img = document.createElement('img');
      img.src     = art.src;
      img.alt     = art.title;
      img.loading = 'lazy';

      card.appendChild(img);
      card.addEventListener('click', () => { if (!dragMoved) { openArtwork(art); } });
      layer.appendChild(card);
    });

    scene.appendChild(layer);
    layers.push(layer);
  });

  const hint = document.createElement('div');
  hint.className   = 'scroll-hint';
  hint.textContent = '← drag to explore →';
  scene.appendChild(hint);

  const scrollBar   = document.createElement('div');
  scrollBar.className = 'scroll-bar';

  const scrollThumb = document.createElement('div');
  scrollThumb.className = 'scroll-thumb';

  scrollBar.appendChild(scrollThumb);
  scene.appendChild(scrollBar);

  /* Scroll-bar drag control — scrubbing the bar pushes the artworks left/right */
  let barDragging   = false;
  let barLastX      = 0;

  scrollBar.addEventListener('pointerdown', e => {
    barDragging = true;
    barLastX    = e.clientX;
    scrollBar.classList.add('scroll-bar--dragging');
    scrollBar.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });

  scrollBar.addEventListener('mousedown', e => {
    e.stopPropagation();
  });

  scrollBar.addEventListener('pointermove', e => {
    if (!barDragging) { return; }
    const dx = e.clientX - barLastX;
    barLastX = e.clientX;

    const period = layers[0].scrollWidth / 3;
    const scale  = period / 160;

    layers.forEach((_, i) => {
      targetOffsets[i] -= dx * scale * (1 - i * 0.15);
    });
  });

  function endBarDrag(e) {
    if (!barDragging) { return; }
    barDragging = false;
    scrollBar.classList.remove('scroll-bar--dragging');
    scrollBar.releasePointerCapture(e.pointerId);
  }

  scrollBar.addEventListener('pointerup', endBarDrag);
  scrollBar.addEventListener('pointercancel', endBarDrag);

  /* Mouse edge-scroll (desktop only) */
  scene.addEventListener('mousemove', e => {
    mouseX = (e.clientX - W / 2) / (W / 2);
  });
  scene.addEventListener('mouseleave', () => { mouseX = 0; });

  /* Drag-to-scroll — pointer events work for both mouse and touch */
  let isDragging  = false;
  let dragStartX  = 0;
  let dragOffsets = [0, -285];
  let dragMoved   = false;

  scene.addEventListener('pointerdown', e => {
    if (e.target.closest('.scroll-bar')) { return; }
    isDragging  = true;
    dragMoved   = false;
    dragStartX  = e.clientX;
    dragOffsets = [...offsets];
  });

  window.addEventListener('pointerup', () => { isDragging = false; });

  window.addEventListener('pointermove', e => {
    if (!isDragging) { return; }
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) < 8) { return; }
    dragMoved = true;
    layers.forEach((_, i) => {
      targetOffsets[i] = dragOffsets[i] + dx * (1 - i * 0.15);
    });
  });

  scene.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    layers.forEach((_, i) => {
      targetOffsets[i] -= delta * (1 - i * 0.15);
    });
  }, { passive: false });

  /* Wrap offset to keep infinite scroll seamless */
  function wrapOffset(val, layerEl) {
    const period = layerEl.scrollWidth / 3;
    if (val < -(period * 2)) { return val + period; }
    if (val > 0)              { return val - period; }
    return val;
  }

  /* Main animation loop — auto-scroll, edge-scroll, and parallax */
  function animate() {
    layers.forEach((_, i) => {
      targetOffsets[i] -= 0.4;
    });

    const deadZone = 0.2;
    const absX     = Math.abs(mouseX);

    if (absX > deadZone) {
      const dir       = mouseX > 0 ? -1 : 1;
      const intensity = (absX - deadZone) / (1 - deadZone);
      const speed     = intensity * intensity * 6;

      layers.forEach((_, i) => {
        targetOffsets[i] += dir * speed * (1 - i * 0.15);
      });
    }

    layers.forEach((layer, i) => {
      const prev = targetOffsets[i];
      targetOffsets[i] = wrapOffset(targetOffsets[i], layer);
      offsets[i] += targetOffsets[i] - prev;
      offsets[i] += (targetOffsets[i] - offsets[i]) * 0.08;

      const px = mouseX * 120 * parallaxSpeeds[i] * 10;
      layer.style.transform = `translateX(${offsets[i] + px}px)`;
    });

    if (layers[0] && layers[0].scrollWidth > 0) {
      const period = layers[0].scrollWidth / 3;
      const pos    = ((-offsets[0] % period) + period) % period;
      scrollThumb.style.left = ((pos / period) * 160).toFixed(1) + 'px';
    }

    requestAnimationFrame(animate);
  }

  animate();
});


/* ============================================================
   ARTWORK MODAL
   Structure lives in index.html. This section only handles
   data population, open/close state, and keyboard navigation.
============================================================ */
let currentIdx   = -1;
let modalWorks   = artworks;
let modalContext = 'home';

const artworkModal     = document.getElementById('artwork-modal');
const modalImage       = document.getElementById('modal-image');
const modalSide        = document.getElementById('modal-side');
const modalSeriesEl    = document.getElementById('modal-series');
const modalTitleEl     = document.getElementById('modal-title');
const modalYearEl      = document.getElementById('modal-year');
const modalDescEl      = document.getElementById('modal-description');
const modalCounterEl   = document.getElementById('modal-counter');
const modalCounterImg  = document.getElementById('modal-counter-img');
const modalInquireName = document.getElementById('modal-inquire-name');
const modalInquireMsg  = document.getElementById('inquire-message-input');
const modalInquireForm = document.getElementById('modal-inquire-form');

/* Open the modal for the artwork that matches the given object */
function openArtwork(art) {
  showModal(artworks.findIndex(a => a.src === art.src));
}

/* Populate and reveal the modal for the artwork at index idx */
function showModal(idx) {
  currentIdx = idx;
  const art  = modalWorks[idx];

  modalImage.src               = art.src;
  modalImage.alt               = art.title;
  modalSeriesEl.textContent    = art.series  || '';
  modalTitleEl.textContent     = art.title;
  modalYearEl.textContent      = art.year    || '';
  modalDescEl.textContent      = 'Carvão digital sobre superfície. Exploração da forma através da sobreposição e dissolução do traço.';
  modalCounterEl.textContent   = `${idx + 1} / ${modalWorks.length}`;
  modalCounterImg.textContent  = `${idx + 1} / ${modalWorks.length}`;
  modalInquireName.textContent = art.title;
  modalInquireMsg.value        = `Hello, I'm interested in "${art.title}"${art.year ? ` (${art.year})` : ''}${art.series ? ` from the ${art.series} series` : ''}. Could you please provide more information about this work, including availability and pricing?`;

  modalSide.classList.remove('inquire-open');
  resetInquirePanel();
  artworkModal.classList.add('open');
  artworkModal.setAttribute('aria-hidden', 'false');
  const expectedHash = `${modalContext}/modal/${idx}`;
  if (location.hash !== `#${expectedHash}`) { location.hash = expectedHash; }
}

/* Open a work from a collection overlay — sets context and works array */
function openCollectionWork(works, idx) {
  modalWorks   = works;
  modalContext = 'vault/collection';
  showModal(idx);
}

/* Hide the artwork modal */
function closeModal() {
  artworkModal.classList.remove('open');
  artworkModal.setAttribute('aria-hidden', 'true');
  const returnHash = modalContext === 'vault/collection' ? 'vault/collection' : 'home';
  modalWorks   = artworks;
  modalContext = 'home';
  if (location.hash.includes('/modal')) { location.hash = returnHash; }
}

/* Keyboard navigation: arrows to browse, Escape to close */
function onModalKey(e) {
  if (!artworkModal.classList.contains('open')) { return; }
  if (e.key === 'ArrowLeft')  { showModal((currentIdx - 1 + modalWorks.length) % modalWorks.length); }
  if (e.key === 'ArrowRight') { showModal((currentIdx + 1) % modalWorks.length); }
  if (e.key === 'Escape')     { closeModal(); }
}

document.getElementById('modal-close').addEventListener('click', () => {
  if (modalSide.classList.contains('inquire-open')) {
    modalSide.classList.remove('inquire-open');
    resetInquirePanel();
  } else {
    closeModal();
  }
});
document.getElementById('modal-prev').addEventListener('click', () => showModal((currentIdx - 1 + modalWorks.length) % modalWorks.length));
document.getElementById('modal-next').addEventListener('click', () => showModal((currentIdx + 1) % modalWorks.length));
artworkModal.addEventListener('click', e => { if (e.target === artworkModal) { closeModal(); } });
document.getElementById('modal-inquire-link').addEventListener('click', () => modalSide.classList.add('inquire-open'));
document.getElementById('modal-inquire-back').addEventListener('click', () => {
  modalSide.classList.remove('inquire-open');
  resetInquirePanel();
});
document.addEventListener('keydown', onModalKey);

/* Swipe navigation on the modal image (mobile) */
let swipeStartX = 0;
artworkModal.addEventListener('pointerdown', e => { swipeStartX = e.clientX; });
artworkModal.addEventListener('pointerup', e => {
  if (e.target.closest('input, textarea, button, form')) { return; }
  const dx = e.clientX - swipeStartX;
  if (Math.abs(dx) < 50) { return; }
  if (dx < 0) { showModal((currentIdx + 1) % modalWorks.length); }
  else        { showModal((currentIdx - 1 + modalWorks.length) % modalWorks.length); }
});


/* ============================================================
   VAULT — COLLECTION SYMBOLS
   Shows user-facing feedback while collection data loads.
============================================================ */

/* Display a status message in the vault feedback region.
   Pass isError = true to render in the error colour. */
function showVaultFeedback(message, isError = false) {
  const feedback = document.getElementById('vault-feedback');
  if (!feedback) { return; }
  feedback.textContent = message;
  feedback.style.color = isError
    ? 'rgba(220, 100, 80, 0.7)'
    : 'rgba(232, 228, 220, 0.4)';
}


/* ============================================================
   COLLECTION OVERLAY
   Builds and opens a full-screen grid when a collection is
   selected in the Vault. All DOM is created here at runtime;
   nothing is added to index.html for this feature.
============================================================ */

/* Build the overlay DOM for one collection and return the root element. */
function buildCollectionOverlay(collection) {
  const overlay = document.createElement('div');
  overlay.className = 'collection-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', collection.title);

  /* Header: title · work count · close button */
  const header  = document.createElement('div');
  header.className = 'collection-overlay-header';

  const titleEl = document.createElement('span');
  titleEl.className   = 'collection-overlay-title';
  titleEl.textContent = collection.title;

  const countEl = document.createElement('span');
  countEl.className   = 'collection-overlay-count';
  countEl.textContent = `${collection.works.length} works`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'collection-overlay-close';
  closeBtn.setAttribute('aria-label', 'Close collection');
  closeBtn.textContent = '×';

  header.appendChild(titleEl);
  header.appendChild(countEl);
  header.appendChild(closeBtn);

  /* Grid: one card per work */
  const grid = document.createElement('div');
  grid.className = 'collection-overlay-grid';

  collection.works.forEach((work, workIdx) => {
    const card = document.createElement('div');
    card.className = 'collection-card';

    /* Mark sold works with a CSS class for styling */
    if (work.sold) { card.classList.add('collection-card--sold'); }

    card.addEventListener('click', () => openCollectionWork(collection.works, workIdx));

    const img = document.createElement('img');
    img.className = 'collection-card-img';
    img.src       = work.src;
    img.alt       = work.title;
    img.loading   = 'lazy';

    /* Sold badge — only rendered when the work.sold flag is true */
    if (work.sold) {
      const badge = document.createElement('div');
      badge.className   = 'collection-card-sold';
      badge.textContent = 'Sold';
      card.appendChild(badge);
    }

    card.appendChild(img);
    grid.appendChild(card);
  });

  overlay.appendChild(header);
  overlay.appendChild(grid);

  /* Close handlers: button, backdrop click, Escape key */
  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.removeEventListener('keydown', onKey);
    if (location.hash === '#vault/collection') { location.hash = 'vault'; }
  }

  function onKey(e) {
    if (e.key === 'Escape') { closeOverlay(); }
  }

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) { closeOverlay(); } });
  document.addEventListener('keydown', onKey);

  return overlay;
}

/* Fetch collection data from JSON, build overlay, and open it.
   Shows "loading..." while the request is in flight.
   On success: clears feedback and opens the overlay.
   On error: shows an error message that stays visible for the user to read. */
async function loadCollection(collectionName) {
  showVaultFeedback('loading...');

  try {
    const response = await fetch('data/collections.json');

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data       = await response.json();
    const collection = data[collectionName];

    if (!collection) {
      throw new Error(`Collection "${collectionName}" not found`);
    }

    const overlay = buildCollectionOverlay(collection);
    document.body.appendChild(overlay);

    /* Double rAF ensures the browser paints before the open class triggers the transition */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        location.hash = 'vault/collection';
      });
    });

    /* Clear the "loading..." message only after a successful open */
    showVaultFeedback('');

  } catch (error) {
    /* Error message stays visible — no finally block clears it */
    showVaultFeedback('unable to load collection. please try again.', true);
    console.error('Collection fetch failed:', error);
  }
}

/* Wire each collection button to its fetch call */
document.querySelectorAll('.collection-card').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.collection === 'e-motion') {
      openAccessGate();
      return;
    }
    loadCollection(btn.dataset.collection);
  });
});

/* ============================================================
   E-MOTION ACCESS GATE
============================================================ */
const ACCESS_CODE          = 'MMXXVI';
const accessGate           = document.getElementById('access-gate');
const accessGateInput      = document.getElementById('access-gate-input');
const accessGateSubmit     = document.getElementById('access-gate-submit');
const accessGateClose      = document.getElementById('access-gate-close');
const accessGateError      = document.getElementById('access-gate-error');
const accessGateInputState = document.getElementById('access-gate-input-state');
const accessGateSuccess    = document.getElementById('access-gate-success');
const accessGateEnter      = document.getElementById('access-gate-enter');

function openAccessGate() {
  accessGate.classList.add('open');
  accessGate.setAttribute('aria-hidden', 'false');
  accessGateInputState.classList.remove('hidden');
  accessGateSuccess.classList.add('hidden');
  accessGateSuccess.setAttribute('aria-hidden', 'true');
  accessGateInput.value = '';
  accessGateError.textContent = '';
  setTimeout(() => accessGateInput.focus(), 50);
}

function closeAccessGate() {
  accessGate.classList.remove('open');
  accessGate.setAttribute('aria-hidden', 'true');
}

function submitAccessCode() {
  const code = accessGateInput.value.trim().toUpperCase();
  if (!code) {
    accessGateError.textContent = 'please enter your access code';
    return;
  }
  if (code !== ACCESS_CODE) {
    accessGateError.textContent = 'access denied — invalid code';
    accessGateInput.select();
    return;
  }
  accessGateInputState.classList.add('hidden');
  accessGateSuccess.classList.remove('hidden');
  accessGateSuccess.setAttribute('aria-hidden', 'false');
}

accessGateSubmit.addEventListener('click', submitAccessCode);

accessGateInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { submitAccessCode(); return; }
  if (accessGateError.textContent) { accessGateError.textContent = ''; }
});

accessGateClose.addEventListener('click', closeAccessGate);

accessGate.addEventListener('click', e => {
  if (e.target === accessGate) { closeAccessGate(); }
});

accessGateEnter.addEventListener('click', () => {
  closeAccessGate();
  loadCollection('e-motion');
});


/* ============================================================
   ARQUIVE — EVENTS
   Fetches upcoming events from data/events.json and renders
   them dynamically into the events column.
   Called automatically the first time Arquive becomes active.
============================================================ */

/* Format a YYYYMMDD pair into a human-readable label.
   Same-month range → "10–13 Sep 2026". Single day → "10 Jul 2026". */
function formatEventDate(dateStart, dateEnd) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const sy = parseInt(dateStart.slice(0, 4), 10);
  const sm = parseInt(dateStart.slice(4, 6), 10) - 1;
  const sd = parseInt(dateStart.slice(6, 8), 10);

  if (!dateEnd || dateEnd === dateStart) {
    return `${sd} ${months[sm]} ${sy}`;
  }

  const ey = parseInt(dateEnd.slice(0, 4), 10);
  const em = parseInt(dateEnd.slice(4, 6), 10) - 1;
  const ed = parseInt(dateEnd.slice(6, 8), 10);

  if (sm === em && sy === ey) {
    return `${sd}–${ed} ${months[sm]} ${sy}`;
  }
  return `${sd} ${months[sm]} – ${ed} ${months[em]} ${ey}`;
}

/* Build a Google Calendar URL for one event object. */
function buildCalendarUrl(event) {
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     event.title,
    dates:    `${event.dateStart}T${event.timeStart}/${event.dateEnd}T${event.timeEnd}`,
    location: `${event.venue}, ${event.city}`,
    details:  event.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* Clone a <template> by id and return the root element. */
function cloneTpl(id) {
  return document.getElementById(id).content.cloneNode(true).firstElementChild;
}

/* Fill and return one event block by cloning the HTML template. */
function buildEventBlock(event) {
  const block = cloneTpl('event-block-tpl');

  block.querySelector('.event-type-badge').textContent = event.type;
  block.querySelector('.event-title').textContent      = event.title;
  block.querySelector('.event-meta').textContent       = `${event.venue} · ${event.city}`;
  block.querySelector('.event-date').textContent       = formatEventDate(event.dateStart, event.dateEnd);
  block.querySelector('.event-cal-btn').href           = buildCalendarUrl(event);

  return block;
}

/* Guard — events are loaded once per session */
let eventsLoaded = false;

/* Fetch events, render each block, and handle loading/error states. */
async function loadEvents() {
  if (eventsLoaded) { return; }

  const list = document.getElementById('events-list');
  if (!list)  { return; }

  /* Show loading indicator while the request is in flight */
  list.innerHTML = '';
  list.appendChild(cloneTpl('events-loading-tpl'));

  try {
    const response = await fetch('data/events.json');

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      throw new Error('No events in response');
    }

    list.innerHTML = '';
    data.events.forEach(event => list.appendChild(buildEventBlock(event)));
    eventsLoaded = true;

  } catch (error) {
    list.innerHTML = '';
    list.appendChild(cloneTpl('events-error-tpl'));
    console.error('Events fetch failed:', error);

  } finally {
    /* Remove any residual loading indicator left after an error */
    const residual = list.querySelector('.events-loading');
    if (residual) { residual.remove(); }
  }
}


/* ============================================================
   FORM VALIDATION
   Covers two forms:
     1. Arquive contact form  (#cf-name, #cf-email, #cf-phone, #cf-message)
     2. Modal inquire form    (#inquire-name-input, #inquire-email-input,
                               #inquire-message-input)

   Design:
   - validateField()        — runs rules against one field, renders/clears error
   - attachLiveValidation() — wires input events so errors clear as user types
   - showContactSuccess()   — opens confirmation overlay and resets the form
   - showInquireSuccess()   — transitions the inquire panel to its success state
   No alert(), no console.log(), no external libraries.
============================================================ */

/* Simplified RFC 5322 email pattern — catches the vast majority of typos */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Inject an error <span> directly after the field.
   Re-uses the same node if one already exists (avoids duplicates). */
function showFieldError(field, message) {
  let error = field.parentElement.querySelector('.field-error');
  if (!error) {
    error = document.createElement('span');
    error.className = 'field-error';
    field.after(error);
  }
  error.textContent = message;
  field.classList.add('field-invalid');
}

/* Remove the error node and invalid style from a field. */
function clearFieldError(field) {
  const error = field.parentElement.querySelector('.field-error');
  if (error) { error.remove(); }
  field.classList.remove('field-invalid');
}

/* Run an ordered array of rule objects against one field.
   Each rule: { test: value => boolean, message: string }
   Stops at the first failing rule and shows its message.
   Returns true only when all rules pass. */
function validateField(field, rules) {
  const value = field.value.trim();
  for (const rule of rules) {
    if (!rule.test(value)) {
      showFieldError(field, rule.message);
      return false;
    }
  }
  clearFieldError(field);
  return true;
}

/* Wire an input listener so errors disappear as the user corrects the field.
   Only re-validates while the field is in an invalid state to avoid
   showing errors before the user has had a chance to type. */
function attachLiveValidation(field, rules) {
  field.addEventListener('input', () => {
    if (field.classList.contains('field-invalid')) {
      validateField(field, rules);
    }
  });
}

/* Show the centered overlay for the Arquive contact form.
   The user decides when to close it — no auto-dismiss. */
function showContactSuccess(form) {
  const overlay = document.getElementById('contact-success-overlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  form.reset();
}

/* Transition the inquire panel into its success state.
   The form content is hidden via CSS; the back button restores it. */
function showInquireSuccess(form) {
  const panel = document.querySelector('.modal-inquire-panel');
  panel.classList.add('inquiry-sent');
  document.getElementById('modal-inquire-success').setAttribute('aria-hidden', 'false');
  form.reset();
}

/* Reset the inquire panel back to its default form state.
   Called when the user navigates back or opens a new artwork. */
function resetInquirePanel() {
  const panel = document.querySelector('.modal-inquire-panel');
  panel.classList.remove('inquiry-sent');
  document.getElementById('modal-inquire-success').setAttribute('aria-hidden', 'true');
}

/* ── Arquive contact form ─────────────────────────────────────────── */
(function () {
  const form = document.querySelector('.contact-form');
  if (!form) { return; }

  const cfName    = document.getElementById('cf-name');
  const cfEmail   = document.getElementById('cf-email');
  const cfPhone   = document.getElementById('cf-phone');
  const cfMessage = document.getElementById('cf-message');

  const nameRules = [
    { test: v => v.length > 0, message: 'Name is required.' },
  ];
  const emailRules = [
    { test: v => v.length > 0,       message: 'Email is required.' },
    { test: v => EMAIL_REGEX.test(v), message: 'Please enter a valid email address.' },
  ];
  const phoneRules = [
    { test: v => v.length > 0, message: 'Phone number is required.' },
  ];
  const messageRules = [
    { test: v => v.length > 0, message: 'Message is required.' },
  ];

  /* Clear errors as the user corrects each field */
  attachLiveValidation(cfName,    nameRules);
  attachLiveValidation(cfEmail,   emailRules);
  attachLiveValidation(cfPhone,   phoneRules);
  attachLiveValidation(cfMessage, messageRules);

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Validate all fields — collect results so every field is checked at once */
    const isValid = [
      validateField(cfName,    nameRules),
      validateField(cfEmail,   emailRules),
      validateField(cfPhone,   phoneRules),
      validateField(cfMessage, messageRules),
    ].every(Boolean);

    if (isValid) { showContactSuccess(form); }
  });

  /* Close overlay: × button, backdrop click, or Escape key */
  const overlay  = document.getElementById('contact-success-overlay');
  const closeBtn = document.getElementById('contact-success-close');

  function closeContactSuccess() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  closeBtn.addEventListener('click', closeContactSuccess);
  overlay.addEventListener('click', e => { if (e.target === overlay) { closeContactSuccess(); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeContactSuccess(); }
  });
})();

/* ── Artwork modal inquire form ───────────────────────────────────── */
(function () {
  const form = document.getElementById('modal-inquire-form');
  if (!form) { return; }

  const inquireName  = document.getElementById('inquire-name-input');
  const inquireEmail = document.getElementById('inquire-email-input');
  const inquireMsg   = document.getElementById('inquire-message-input');

  const nameRules = [
    { test: v => v.length > 0, message: 'Name is required.' },
  ];
  const emailRules = [
    { test: v => v.length > 0,       message: 'Email is required.' },
    { test: v => EMAIL_REGEX.test(v), message: 'Please enter a valid email address.' },
  ];
  const messageRules = [
    { test: v => v.length > 0, message: 'Message is required.' },
  ];

  attachLiveValidation(inquireName,  nameRules);
  attachLiveValidation(inquireEmail, emailRules);
  attachLiveValidation(inquireMsg,   messageRules);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const isValid = [
      validateField(inquireName,  nameRules),
      validateField(inquireEmail, emailRules),
      validateField(inquireMsg,   messageRules),
    ].every(Boolean);

    if (isValid) { showInquireSuccess(form); }
  });
})();


/* ============================================================
   BIO MODAL
   Opens and closes the full bio overlay from the Arquive column.
============================================================ */
(function () {
  const overlay  = document.getElementById('bio-modal-overlay');
  const openBtn  = document.getElementById('bio-open-btn');
  const closeBtn = document.getElementById('bio-modal-close');

  function openBioModal() {
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBioModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openBioModal);
  closeBtn.addEventListener('click', closeBioModal);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { closeBioModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) { closeBioModal(); }
  });
})();