/* jshint esversion: 11 */
/* ============================================================
   script.js — raigon-mmxi
   All JavaScript for the site lives here.
   Data lives in data/artworks.js and data/collections.js,
   loaded via <script> tags before this file.
   Sections: Navigation → Home Gallery →
             Artwork Modal → Vault Symbols → Collection Overlay →
             Events → Form Validation → Bio Modal
============================================================ */


/* ============================================================
   NAVIGATION
   Switches active page section and triggers data loads.
   Hash routing: URL updates on nav so back/forward work natively.
============================================================ */
const pills = document.querySelectorAll('.pill');
const pages = document.querySelectorAll('.page');

const VALID_PAGES = ['home', 'vault', 'arquive'];

/* On small screens, the nav bar shifts left to make room for the
   home gallery's play/pause button — or, when a collection overlay
   is open, for its scroll bar in the same spot. Every other page
   keeps the nav centered. */
function updateNavShift(page) {
  const collectionOpen = document.querySelector('.collection-overlay.open');
  document.body.classList.toggle('nav-shift', page === 'home' || !!collectionOpen);
}

function switchSection(page) {
  pages.forEach(p => p.classList.remove('active'));
  pills.forEach(p => p.classList.remove('active'));

  document.getElementById(page).classList.add('active');
  document.querySelector(`.pill[data-page="${page}"]`).classList.add('active');
  document.getElementById(page).scrollTop = 0;

  updateNavShift(page);

  if (page === 'arquive') { loadEvents(); }
}

function navigateTo(page) {
  artworkModal.classList.remove('open');
  artworkModal.setAttribute('aria-hidden', 'true');
  artworkModal.setAttribute('inert', '');
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
    artworkModal.setAttribute('inert', '');
    return;
  }

  if (page === 'vault/collection') {
    if (artworkModal.classList.contains('open')) {
      artworkModal.classList.remove('open');
      artworkModal.setAttribute('aria-hidden', 'true');
      artworkModal.setAttribute('inert', '');
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
      updateNavShift('vault');
      return;
    }
  }

  if (VALID_PAGES.includes(page)) { switchSection(page); }
});

const initialPage = location.hash.slice(1);
switchSection(VALID_PAGES.includes(initialPage) ? initialPage : 'home');

/* Shared play/pause icons — reused by the home gallery's timeline bar
   and the collection overlay's autoplay control. */
const ICON_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3" height="12" rx="1.5"/><rect x="10" y="2" width="3" height="12" rx="1.5"/></svg>';
const ICON_PLAY  = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';

const globalLogo = document.querySelector('.global-logo');
globalLogo.addEventListener('click', e => { e.preventDefault(); navigateTo('home'); });


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
  const allCards       = [];
  const offsets        = [0, -285, -140];
  const targetOffsets  = [0, -285, -140];
  const parallaxSpeeds = [0.08, 0.05, 0.03];

  let mouseX = 0;
  const W = window.innerWidth;

  /* Depth-of-field focus effect — cards fade, blur, shrink and drop
     behind as they move away from screen centre. Tunable: */
  const FOCUS_RADIUS     = 0.55; // influence radius, as a fraction of viewport width
  const FOCUS_BLUR       = W <= 768 ? 0.625 : 1.875; // max blur (px) at the edges — barely there on tablet/mobile
  const FOCUS_FADE       = 0.55; // max opacity reduction at the edges
  const FOCUS_SCALE      = 0.12; // max scale boost at the centre
  const LERP_FACTOR      = 0.08; // offset smoothing per frame
  const AUTOSCROLL_SPEED = 0.4;  // px of offset lost per frame when auto-scrolling

  rows.forEach((row, ri) => {
    const layer = document.createElement('div');
    layer.className = `layer layer-${ri + 1}`;

    [...row, ...row, ...row].forEach((art, ai) => {
      const card = document.createElement('div');
      card.className = 'artwork-card';

      const img = document.createElement('img');
      img.src = art.src;
      img.alt = art.title;

      /* The very first card is the Largest Contentful Paint candidate —
         load it eagerly and at high priority instead of lazily. */
      if (ri === 0 && ai === 0) {
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.loading = 'lazy';
      }

      card.appendChild(img);
      card.addEventListener('click', () => { if (!dragMoved) { openArtwork(art); } });
      layer.appendChild(card);
      allCards.push(card);
    });

    scene.appendChild(layer);
    layers.push(layer);
  });

  const hint = document.createElement('div');
  hint.className   = 'scroll-hint';
  hint.textContent = '← drag to explore →';
  scene.appendChild(hint);

  const scrollBar   = document.createElement('div');
  scrollBar.className = 'scroll-bar home-scroll-bar';

  const scrollThumb = document.createElement('div');
  scrollThumb.className = 'scroll-thumb';

  scrollBar.appendChild(scrollThumb);
  /* Appended to #home (not .home-scene) so it can sit near the nav bar
     without being clipped by the scene's overflow */
  scene.parentElement.appendChild(scrollBar);

  /* Distance the thumb can travel inside the bar — measured from the
     actual rendered sizes so it stays correct across breakpoints */
  const barTravel = scrollBar.offsetWidth - scrollThumb.offsetWidth;

  /* Play/pause toggle — stops the auto-scroll without affecting drag/parallax */
  let autoScrollPaused = false;

  const playPauseBtn = document.createElement('button');
  playPauseBtn.className   = 'scroll-playpause';
  playPauseBtn.type        = 'button';
  playPauseBtn.innerHTML   = ICON_PAUSE;
  playPauseBtn.setAttribute('aria-label', 'Pause auto-scroll');

  playPauseBtn.addEventListener('click', () => {
    autoScrollPaused = !autoScrollPaused;
    playPauseBtn.innerHTML = autoScrollPaused ? ICON_PLAY : ICON_PAUSE;
    playPauseBtn.setAttribute('aria-label', autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll');
  });

  scene.parentElement.appendChild(playPauseBtn);

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
    dragMoved = true;
  });

  scrollBar.addEventListener('pointermove', e => {
    if (!barDragging) { return; }
    const dx = e.clientX - barLastX;
    barLastX = e.clientX;

    const period = layers[0].scrollWidth / 3;
    const scale  = period / barTravel;

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
  let dragOffsets = [0, -285, -140];
  let dragMoved   = false;

  scene.addEventListener('pointerdown', e => {
    if (e.target.closest('.scroll-bar')) { return; }
    isDragging  = true;
    dragMoved   = false;
    dragStartX  = e.clientX;
    dragOffsets = [...offsets];
  });

  window.addEventListener('pointerup',     () => { isDragging = false; });
  window.addEventListener('pointercancel', () => { isDragging = false; dragMoved = false; });

  window.addEventListener('pointermove', e => {
    if (!isDragging) { return; }
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) < 18) { return; }
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
    if (!autoScrollPaused) {
      layers.forEach((_, i) => {
        targetOffsets[i] -= AUTOSCROLL_SPEED;
      });
    }

    const deadZone = 0.2;
    const absX     = Math.abs(mouseX);

    if (absX > deadZone) {
      const dir       = mouseX > 0 ? -1 : 1;
      const intensity = (absX - deadZone) / (1 - deadZone);
      const speed     = intensity * intensity * 1.2;

      layers.forEach((_, i) => {
        targetOffsets[i] += dir * speed * (1 - i * 0.15);
      });
    }

    layers.forEach((layer, i) => {
      const prev = targetOffsets[i];
      targetOffsets[i] = wrapOffset(targetOffsets[i], layer);
      offsets[i] += targetOffsets[i] - prev;
      offsets[i] += (targetOffsets[i] - offsets[i]) * LERP_FACTOR;

      const px = mouseX * 120 * parallaxSpeeds[i] * 10;
      layer.style.transform = `translateX(${offsets[i] + px}px)`;
    });

    /* Depth-of-field focus pass — blur, fade, shrink and drop behind
       each card based on its distance from screen centre. Reads are
       batched after all layer transforms are written, so this costs
       one layout reflow per frame rather than one per card. */
    const centerX = W / 2;
    const maxDist = W * FOCUS_RADIUS;

    allCards.forEach(card => {
      const r    = card.getBoundingClientRect();
      const cx   = r.left + r.width / 2;
      const dist = Math.abs(cx - centerX);
      const t    = Math.min(1, dist / maxDist);

      card.style.opacity   = (1 - t * FOCUS_FADE).toFixed(2);
      card.style.filter    = `blur(${(t * FOCUS_BLUR).toFixed(1)}px)`;
      card.style.transform = `scale(${(1 + (1 - t) * FOCUS_SCALE).toFixed(3)})`;
      card.style.zIndex    = Math.round((1 - t) * 10);
    });

    if (layers[0] && layers[0].scrollWidth > 0) {
      const period = layers[0].scrollWidth / 3;
      const pos    = ((-offsets[0] % period) + period) % period;
      scrollThumb.style.left = ((pos / period) * barTravel).toFixed(1) + 'px';
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
  modalDescEl.textContent      = art.description || '';
  modalCounterEl.textContent   = `${idx + 1} / ${modalWorks.length}`;
  modalCounterImg.textContent  = `‹ ${idx + 1} / ${modalWorks.length} ›`;
  modalInquireName.textContent = art.title;
  modalInquireMsg.value        = `Hello, I'm interested in "${art.title}"${art.year ? ` (${art.year})` : ''}${art.series ? ` from the ${art.series} series` : ''}. Could you please provide more information about this work, including availability and pricing?`;

  modalSide.classList.remove('inquire-open');
  resetInquirePanel();
  artworkModal.classList.add('open');
  artworkModal.setAttribute('aria-hidden', 'false');
  artworkModal.removeAttribute('inert');
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
  artworkModal.setAttribute('inert', '');
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
  feedback.style.color = isError ?
    'rgba(220, 100, 80, 0.7)' :
    'rgba(232, 228, 220, 0.4)';
}


/* ============================================================
   COLLECTION OVERLAY
   Builds and opens a full-screen grid when a collection is
   selected in the Vault. All DOM is created here at runtime;
   nothing is added to index.html for this feature.

   AI ASSISTANCE: This section (buildCollectionOverlay, loadCollection)
   was developed with the help of Claude Sonnet 4.6 (Anthropic).
   Commit: 1fef314 — "Add collection overlay grid to Vault section"
============================================================ */

/* Build the overlay DOM for one collection and return the root element.
   Uses the same depth-of-field + infinite scroll architecture as the home gallery. */
function buildCollectionOverlay(collection, collectionId) {
  const overlay = document.createElement('div');
  overlay.className = `collection-overlay collection-overlay--${collectionId}`;
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

  /* Grid: works tripled for seamless infinite scroll.
     Stagger class assigned per original index so the zig-zag pattern
     repeats consistently across all three copies. */
  const grid = document.createElement('div');
  grid.className = 'collection-overlay-grid';

  const allOverlayCards = [];
  const tripled = [...collection.works, ...collection.works, ...collection.works];

  tripled.forEach((work, workIdx) => {
    const origIdx = workIdx % collection.works.length;
    const card    = document.createElement('div');
    card.className = 'collection-overlay-card';
    if (workIdx % 2 === 1) { card.classList.add('collection-overlay-card--stagger'); }
    if (work.sold)          { card.classList.add('collection-overlay-card--sold'); }

    card.addEventListener('click', () => openCollectionWork(collection.works, origIdx));

    const img = document.createElement('img');
    img.className    = 'collection-overlay-card-img';
    img.alt          = work.title;
    img.loading      = 'eager';
    img.draggable    = false;

    function applyZoomIfSquare() {
      if (img.naturalWidth === img.naturalHeight) {
        img.classList.add('collection-overlay-card-img--zoom');
      }
    }
    img.addEventListener('load', applyZoomIfSquare);
    img.src = work.src;
    if (img.complete) { applyZoomIfSquare(); }

    if (work.sold) {
      const badge = document.createElement('div');
      badge.className   = 'collection-card-sold';
      badge.textContent = 'Sold';
      card.appendChild(badge);
    }

    card.appendChild(img);
    grid.appendChild(card);
    allOverlayCards.push(card);
  });

  overlay.appendChild(header);
  overlay.appendChild(grid);

  /* Position indicator */
  const overlayScrollBar = document.createElement('div');
  overlayScrollBar.className = 'scroll-bar collection-overlay-scrollbar';

  const overlayThumb = document.createElement('div');
  overlayThumb.className = 'scroll-thumb';

  overlayScrollBar.appendChild(overlayThumb);
  overlay.appendChild(overlayScrollBar);

  /* Play/pause control */
  let autoScrollPaused = false;

  const playPauseBtn = document.createElement('button');
  playPauseBtn.className = 'scroll-playpause';
  playPauseBtn.type      = 'button';
  playPauseBtn.innerHTML = ICON_PAUSE;
  playPauseBtn.setAttribute('aria-label', 'Pause auto-scroll');

  playPauseBtn.addEventListener('click', () => {
    autoScrollPaused = !autoScrollPaused;
    playPauseBtn.innerHTML = autoScrollPaused ? ICON_PLAY : ICON_PAUSE;
    playPauseBtn.setAttribute('aria-label', autoScrollPaused ? 'Resume auto-scroll' : 'Pause auto-scroll');
  });

  overlay.appendChild(playPauseBtn);

  /* ── Depth-of-field constants (mirror of home gallery) ── */
  const W_OVL        = window.innerWidth;
  const FOCUS_RADIUS = 0.55;
  const FOCUS_BLUR   = W_OVL <= 768 ? 0.5 : 1.4;
  const FOCUS_FADE   = 0.6;
  const FOCUS_SCALE  = 0.10;
  const OVL_LERP     = 0.06;
  const OVL_SPEED    = 0.5;

  /* Animation state */
  let ovlOffset      = 0;
  let ovlTarget      = 0;
  let ovlBarDragging = false;
  let ovlBarLastX    = 0;

  /* Period = width of one copy, measured from offsetLeft of first cards of each copy */
  function getOvlPeriod() {
    if (allOverlayCards.length < collection.works.length + 1) { return 0; }
    return allOverlayCards[collection.works.length].offsetLeft
         - allOverlayCards[0].offsetLeft;
  }

  function updateOverlayThumb() {
    const period = getOvlPeriod();
    if (period <= 0) { return; }
    const trackWidth = overlayScrollBar.clientWidth;
    const thumbW     = Math.max(trackWidth / 3, 30);
    const pos        = ((-ovlOffset % period) + period) % period;
    overlayThumb.style.width = thumbW.toFixed(1) + 'px';
    overlayThumb.style.left  = ((pos / period) * (trackWidth - thumbW)).toFixed(1) + 'px';
  }

  /* Main animation loop — infinite translateX scroll + depth-of-field pass */
  function animateOverlay() {
    if (!overlay.isConnected) { return; }

    const period = getOvlPeriod();

    if (!autoScrollPaused && !ovlBarDragging) {
      ovlTarget -= OVL_SPEED;
    }

    if (period > 0) {
      if (ovlTarget < -(period * 2)) { ovlOffset += period; ovlTarget += period; }
      if (ovlTarget > 0)             { ovlOffset -= period; ovlTarget -= period; }
    }

    ovlOffset += (ovlTarget - ovlOffset) * OVL_LERP;
    grid.style.transform = `translateX(${ovlOffset}px)`;

    /* Depth-of-field — blur, fade, and scale each card by distance from centre */
    const centerX = W_OVL / 2;
    const maxDist = W_OVL * FOCUS_RADIUS;
    allOverlayCards.forEach(card => {
      const r    = card.getBoundingClientRect();
      const cx   = r.left + r.width / 2;
      const dist = Math.abs(cx - centerX);
      const t    = Math.min(1, dist / maxDist);
      card.style.opacity   = (1 - t * FOCUS_FADE).toFixed(2);
      card.style.filter    = `blur(${(t * FOCUS_BLUR).toFixed(1)}px)`;
      card.style.transform = `scale(${(1 + (1 - t) * FOCUS_SCALE).toFixed(3)})`;
      card.style.zIndex    = Math.round((1 - t) * 10);
    });

    updateOverlayThumb();
    requestAnimationFrame(animateOverlay);
  }

  const firstCopyImgs = allOverlayCards
    .slice(0, collection.works.length)
    .map(card => card.querySelector('img'));

  Promise.all(
    firstCopyImgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => { img.addEventListener('load', res, { once: true }); })
    )
  ).then(() => requestAnimationFrame(animateOverlay));

  /* ── Bar drag ── */
  overlayScrollBar.addEventListener('pointerdown', e => {
    ovlBarDragging = true;
    ovlBarLastX    = e.clientX;
    overlayScrollBar.classList.add('scroll-bar--dragging');
    overlayScrollBar.setPointerCapture(e.pointerId);
  });

  overlayScrollBar.addEventListener('pointermove', e => {
    if (!ovlBarDragging) { return; }
    const dx     = e.clientX - ovlBarLastX;
    ovlBarLastX  = e.clientX;
    const period = getOvlPeriod();
    if (period > 0) { ovlTarget -= dx * (period / overlayScrollBar.clientWidth); }
  });

  function endOverlayBarDrag(e) {
    if (!ovlBarDragging) { return; }
    ovlBarDragging = false;
    overlayScrollBar.classList.remove('scroll-bar--dragging');
    overlayScrollBar.releasePointerCapture(e.pointerId);
  }

  overlayScrollBar.addEventListener('pointerup', endOverlayBarDrag);
  overlayScrollBar.addEventListener('pointercancel', endOverlayBarDrag);

  /* Mouse wheel scrolls the carousel horizontally */
  grid.addEventListener('wheel', e => {
    if (e.deltaY === 0) { return; }
    e.preventDefault();
    ovlTarget -= e.deltaY;
  }, { passive: false });

  /* Close handlers */
  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.removeEventListener('keydown', onKey);
    updateNavShift('vault');
    if (location.hash === '#vault/collection') { location.hash = 'vault'; }
  }

  function onKey(e) {
    if (e.key === 'Escape') { closeOverlay(); }
  }

  closeBtn.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', onKey);

  return overlay;
}

/* Look up collection data, build overlay, and open it.
   On error: shows a message that stays visible for the user to read. */
function loadCollection(collectionName) {
  const collection = COLLECTIONS_DATA[collectionName];

  if (!collection) {
    showVaultFeedback('unable to load collection. please try again.', true);
    console.error(`Collection "${collectionName}" not found`);
    return;
  }

  const overlay = buildCollectionOverlay(collection, collectionName);
  document.body.appendChild(overlay);

  /* Double rAF ensures the browser paints before the open class triggers the transition */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      updateNavShift('vault');
      location.hash = 'vault/collection';
    });
  });

  showVaultFeedback('');
}

/* Wire each collection button to its fetch call */
document.querySelectorAll('.collection-card').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.dataset.collection) { return; }
    if (btn.dataset.collection === 'accord') {
      openAccessGate();
      return;
    }
    loadCollection(btn.dataset.collection);
  });
});

/* AI ASSISTANCE: The copy feedback below (showCopyFeedback)
   was developed with the help of Claude Sonnet 4.6 (Anthropic). */
/* Lights up a copy button with the accent colour for 2s, then resets it. */
function showCopyFeedback(btn) {
  btn.textContent = 'copied';
  btn.classList.add('copy-active');
  setTimeout(() => {
    btn.textContent = 'copy';
    btn.classList.remove('copy-active');
  }, 2000);
}

/* Coming soon — copy collection + date to clipboard */
const soonCopyBtn = document.querySelector('.collection-card-soon-copy');
if (soonCopyBtn) {
  soonCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('Raigon Vault — New collection · January 2027').then(() => {
      showCopyFeedback(soonCopyBtn);
    }).catch(() => {});
  });
}

/* Scroll bar — same draggable indicator style as the home gallery,
   scrubbing it scrolls the horizontal collection row directly */
const vaultSymbols   = document.querySelector('.vault-symbols');
const vaultScrollBar = document.getElementById('vault-scroll-bar');
const vaultThumb     = vaultScrollBar?.querySelector('.scroll-thumb');

if (vaultSymbols && vaultScrollBar && vaultThumb) {
  const updateVaultThumb = () => {
    const trackWidth = vaultScrollBar.clientWidth;
    const maxScroll  = vaultSymbols.scrollWidth - vaultSymbols.clientWidth;
    const ratio      = Math.min(1, vaultSymbols.clientWidth / vaultSymbols.scrollWidth);
    const thumbW     = Math.max(trackWidth * ratio, 30);
    const progress   = maxScroll > 0 ? vaultSymbols.scrollLeft / maxScroll : 0;

    vaultThumb.style.width = thumbW.toFixed(1) + 'px';
    vaultThumb.style.left  = (progress * (trackWidth - thumbW)).toFixed(1) + 'px';
  };

  vaultSymbols.addEventListener('scroll', () => requestAnimationFrame(updateVaultThumb));
  window.addEventListener('resize', updateVaultThumb);
  updateVaultThumb();

  /* Drag the bar to scrub the collection row left/right */
  let vaultBarDragging = false;
  let vaultBarLastX    = 0;

  vaultScrollBar.addEventListener('pointerdown', e => {
    vaultBarDragging = true;
    vaultBarLastX    = e.clientX;
    vaultScrollBar.classList.add('scroll-bar--dragging');
    vaultScrollBar.setPointerCapture(e.pointerId);
    /* Scroll-snap fights small drag increments, snapping the row
       straight back to its current position. Suspend it for the
       drag and let it re-settle once the pointer is released. */
    vaultSymbols.style.scrollSnapType = 'none';
  });

  vaultScrollBar.addEventListener('pointermove', e => {
    if (!vaultBarDragging) { return; }
    const dx = e.clientX - vaultBarLastX;
    vaultBarLastX = e.clientX;

    const maxScroll = vaultSymbols.scrollWidth - vaultSymbols.clientWidth;
    vaultSymbols.scrollLeft += dx * (maxScroll / vaultScrollBar.clientWidth);
  });

  const endVaultBarDrag = (e) => {
    if (!vaultBarDragging) { return; }
    vaultBarDragging = false;
    vaultScrollBar.classList.remove('scroll-bar--dragging');
    vaultScrollBar.releasePointerCapture(e.pointerId);
    vaultSymbols.style.scrollSnapType = '';
  };

  vaultScrollBar.addEventListener('pointerup', endVaultBarDrag);
  vaultScrollBar.addEventListener('pointercancel', endVaultBarDrag);
}

/* ============================================================
   ACCORD ACCESS GATE
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
  accessGate.removeAttribute('inert');
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
  accessGate.setAttribute('inert', '');
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
  loadCollection('accord');
});


/* ============================================================
   ARQUIVE — EVENTS
   Fetches upcoming events from data/events.json and renders
   the next one into the events column, keeping it compact.
   Called automatically the first time Arquive becomes active.

   AI ASSISTANCE: This section (formatEventDate, buildCalendarUrl,
   buildAllDayCalendarUrl, buildEventBlock, loadEvents) was developed
   with the help of Claude Sonnet 4.6 (Anthropic).
   Commit: 75c4905 — "Add dynamic events column to Arquive section"
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

/* Clone a <template> by id and return the root element. */
function cloneTpl(id) {
  return document.getElementById(id).content.cloneNode(true).firstElementChild;
}

/* Fill and return one event block by cloning the HTML template. */
function buildEventBlock(event) {
  const block = cloneTpl('event-block-tpl');

  block.querySelector('.event-title').textContent = event.title;
  block.querySelector('.event-meta').textContent   = `${formatEventDate(event.dateStart, event.dateEnd)} · ${event.city}`;

  const copyBtn  = block.querySelector('.event-copy-btn');
  const copyText = `${event.title}\n${formatEventDate(event.dateStart, event.dateEnd)} · ${event.venue}, ${event.city}`;
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(copyText).then(() => {
      showCopyFeedback(copyBtn);
    }).catch(() => {});
  });

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
    data.events.forEach(evt => list.appendChild(buildEventBlock(evt)));
    eventsLoaded = true;

  } catch {
    list.innerHTML = '';
    list.appendChild(cloneTpl('events-error-tpl'));

  } finally {
    /* Remove any residual loading indicator left after an error */
    const residual = list.querySelector('.events-loading');
    if (residual) { residual.remove(); }
  }
}


/* ============================================================
   FORM VALIDATION
   Covers two forms:
     1. Arquive contact form  (#cf-name, #cf-email, #cf-message)
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
  overlay.removeAttribute('inert');
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
  const cfMessage = document.getElementById('cf-message');

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

  /* Clear errors as the user corrects each field */
  attachLiveValidation(cfName,    nameRules);
  attachLiveValidation(cfEmail,   emailRules);
  attachLiveValidation(cfMessage, messageRules);

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Validate all fields — collect results so every field is checked at once */
    const isValid = [
      validateField(cfName,    nameRules),
      validateField(cfEmail,   emailRules),
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
    overlay.setAttribute('inert', '');
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
   BIO CARD EXPAND
   Expands the bio card in place (same width, taller height) to
   reveal the rest of the text, photo moving to the top.
============================================================ */
(function () {
  const card      = document.getElementById('bio-card');
  const toggleBtn = document.getElementById('bio-open-btn');
  const closeBtn  = document.getElementById('bio-card-close');

  let closedHeight = 0;

  function setHeight(px) {
    card.style.height = px + 'px';
  }

  function expandBio() {
    closedHeight = card.getBoundingClientRect().height;
    setHeight(closedHeight);
    card.classList.add('expanded');
    toggleBtn.textContent = 'Less';
    toggleBtn.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      setHeight(card.scrollHeight);
    });
  }

  function collapseBio() {
    setHeight(card.getBoundingClientRect().height);
    card.classList.remove('expanded');
    toggleBtn.textContent = 'More';
    toggleBtn.setAttribute('aria-expanded', 'false');

    requestAnimationFrame(() => {
      setHeight(closedHeight);
    });
  }

  card.addEventListener('transitionend', e => {
    if (e.propertyName !== 'height') return;
    card.style.height = card.classList.contains('expanded') ? 'auto' : '';
  });

  toggleBtn.addEventListener('click', () => {
    if (card.classList.contains('expanded')) {
      collapseBio();
    } else {
      expandBio();
    }
  });

  closeBtn.addEventListener('click', collapseBio);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && card.classList.contains('expanded')) { collapseBio(); }
  });
})();