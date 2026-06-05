/* ============================================================
   script.js — raigon-mmxi
   All JavaScript for the site lives here.
   Sections: Data → Navigation → Home Gallery →
             Artwork Modal → Vault Symbols → Topographic Canvas
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

  const pills = document.querySelectorAll('.pill');
const pages = document.querySelectorAll('.page');

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    const target = pill.dataset.page;

    pages.forEach(p => p.classList.remove('active'));
    pills.forEach(p => p.classList.remove('active'));

    document.getElementById(target).classList.add('active');
    pill.classList.add('active');

    document.getElementById(target).scrollTop = 0;

    if (target === 'vault') {
      initTopo();
    }
  });
});

const globalLogo = document.querySelector('.global-logo');
globalLogo.addEventListener('click', () => document.querySelector('.pill[data-page="home"]').click());
globalLogo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') document.querySelector('.pill[data-page="home"]').click(); });

  
/* ============================================================
   HOME GALLERY — PARALLAX BUILD
   Builds two infinite-scroll rows of artwork cards.
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
    const W       = window.innerWidth;
    const centerX = W / 2;

    rows.forEach((row, ri) => {
        const layer = document.createElement('div');
        layer.className = `layer layer-${ri + 1}`;
    
        [...row, ...row, ...row].forEach((art, i) => {
          const card = document.createElement('div');
          card.className = 'artwork-card';
    
          if (i < row.length) {
            card.style.animation = `fadeIn 0.8s ease ${(ri * 0.2 + i * 0.08).toFixed(2)}s both`;
          }
          card.style.opacity = '0.85';
    
          const img = document.createElement('img');
          img.src     = art.src;
          img.alt     = art.title;
          img.loading = 'lazy';
    
          card.appendChild(img);
          card.addEventListener('click', () => openArtwork(art));
          layer.appendChild(card);
        });
    
        scene.appendChild(layer);
        layers.push(layer);
      });
    
      const hint = document.createElement('div');
      hint.className   = 'scroll-hint';
      hint.textContent = '← arrasta para explorar →';
      scene.appendChild(hint);
    
      const scrollBar   = document.createElement('div');
      scrollBar.className = 'scroll-bar';
    
      const scrollThumb = document.createElement('div');
      scrollThumb.className = 'scroll-thumb';
    
      scrollBar.appendChild(scrollThumb);
      scene.appendChild(scrollBar);

      // Mouse and drag controls for parallax gallery interaction

      scene.addEventListener('mousemove', e => {
        mouseX = (e.clientX - W / 2) / (W / 2);
      });
      scene.addEventListener('mouseleave', () => { mouseX = 0; });
    
      let isDragging  = false;
      let dragStartX  = 0;
      let dragOffsets = [0, -285];
    
      scene.addEventListener('mousedown', e => {
        isDragging  = true;
        dragStartX  = e.clientX;
        dragOffsets = [...offsets];
      });
    
      window.addEventListener('mouseup', () => { isDragging = false; });
    
      window.addEventListener('mousemove', e => {
        if (!isDragging) { return; }
        const dx = e.clientX - dragStartX;
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


      function wrapOffset(val, layerEl) {
    const period = layerEl.scrollWidth / 3;
    if (val < -(period * 2)) { return val + period; }
    if (val > 0)              { return val - period; }
    return val;
  }

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
let currentIdx = -1;

const artworkModal     = document.getElementById('artwork-modal');
const modalImage       = document.getElementById('modal-image');
const modalSide        = document.getElementById('modal-side');
const modalSeriesEl    = document.getElementById('modal-series');
const modalTitleEl     = document.getElementById('modal-title');
const modalYearEl      = document.getElementById('modal-year');
const modalDescEl      = document.getElementById('modal-description');
const modalCounterEl   = document.getElementById('modal-counter');
const modalInquireName = document.getElementById('modal-inquire-name');
const modalInquireMsg  = document.getElementById('inquire-message-input');
const modalInquireForm = document.getElementById('modal-inquire-form');

function openArtwork(art) {
  showModal(artworks.findIndex(a => a.src === art.src));
}

function showModal(idx) {
  currentIdx = idx;
  const art  = artworks[idx];

  modalImage.src             = art.src;
  modalImage.alt             = art.title;
  modalSeriesEl.textContent  = art.series;
  modalTitleEl.textContent   = art.title;
  modalYearEl.textContent    = art.year;
  modalDescEl.textContent    = 'Carvão digital sobre superfície. Exploração da forma através da sobreposição e dissolução do traço.';
  modalCounterEl.textContent = `${idx + 1} / ${artworks.length}`;
  modalInquireName.textContent = art.title;
  modalInquireMsg.value = `Hello, I'm interested in "${art.title}" (${art.year}) from the ${art.series} series. Could you please provide more information about this work, including availability and pricing?`;

  modalSide.classList.remove('inquire-open');
  resetInquirePanel();
  artworkModal.classList.add('open');
  artworkModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  artworkModal.classList.remove('open');
  artworkModal.setAttribute('aria-hidden', 'true');
}

function onModalKey(e) {
  if (!artworkModal.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  showModal((currentIdx - 1 + artworks.length) % artworks.length);
  if (e.key === 'ArrowRight') showModal((currentIdx + 1) % artworks.length);
  if (e.key === 'Escape')     closeModal();
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-prev').addEventListener('click', () => showModal((currentIdx - 1 + artworks.length) % artworks.length));
document.getElementById('modal-next').addEventListener('click', () => showModal((currentIdx + 1) % artworks.length));
artworkModal.addEventListener('click', e => { if (e.target === artworkModal) closeModal(); });
document.getElementById('modal-inquire-link').addEventListener('click', () => modalSide.classList.add('inquire-open'));
document.getElementById('modal-inquire-back').addEventListener('click', () => {
  modalSide.classList.remove('inquire-open');
  resetInquirePanel();
});
/* submit handled by the FORM VALIDATION section below */
document.addEventListener('keydown', onModalKey);
  
/* ============================================================
   VAULT — COLLECTION SYMBOLS
   Loads symbol images and handles collection button clicks.
   Uses async/await to fetch collection data from JSON.
   Shows user feedback instead of alert().
============================================================ */

window.addEventListener('load', () => {
  document.getElementById('img-pyramid').src = 'assets/images/piramede-raigon.png';
  document.getElementById('img-shell').src   = 'assets/images/Untitled_Artwork_29.png';
  document.getElementById('img-lake').src    = 'assets/images/montanha_raigon.png';
});

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

  // Header: title · count · close button
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

  // Grid: one card per work
  const grid = document.createElement('div');
  grid.className = 'collection-overlay-grid';

  collection.works.forEach(work => {
    const card = document.createElement('div');
    card.className = 'collection-card';

    const img = document.createElement('img');
    img.className = 'collection-card-img';
    img.src       = work.src;
    img.alt       = work.title;
    img.loading   = 'lazy';

    const label = document.createElement('div');
    label.className   = 'collection-card-title';
    label.textContent = work.title;

    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });

  overlay.appendChild(header);
  overlay.appendChild(grid);

  // Close handlers: button, backdrop click, Escape key
  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeOverlay();
  }

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', onKey);

  return overlay;
}

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

    // Double rAF ensures the browser paints before the open class triggers the transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('open'));
    });

  } catch (error) {
    showVaultFeedback('unable to load collection. please try again.', true);
    console.error('Collection fetch failed:', error);
  } finally {
    showVaultFeedback('');
  }
}

document.querySelectorAll('.sym-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    loadCollection(btn.dataset.collection);
  });
});

  /* ============================================================
   TOPOGRAPHIC CANVAS ANIMATION
   Draws animated sinusoidal noise curves on the Vault canvas.
   Reacts to mouse position — curves deform toward the cursor.
   Initialised lazily on first visit to the Vault section.
============================================================ */
let topoInit = false;
 
// Separate mouse tracking variables for the canvas
// (avoid conflict with gallery mouseX which is scoped inside the load event)
let topoMouseX = 0.5;
let topoMouseY = 0.5;
let topoTargetX = 0.5;
let topoTargetY = 0.5;
 
function initTopo() {

  // Guard — run only once
  if (topoInit) { return; }
  topoInit = true;

  const canvas = document.getElementById('topo');
  const ctx    = canvas.getContext('2d');

  /* Resize canvas to match its CSS display size */
  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* Track mouse position inside the vault section */
  document.getElementById('vault').addEventListener('mousemove', e => {
    const rect  = canvas.getBoundingClientRect();
    topoTargetX = (e.clientX - rect.left) / rect.width;
    topoTargetY = (e.clientY - rect.top)  / rect.height;
  });

  let t = 0;

  /* Layered sine/cosine noise — produces organic wave patterns */
  function noise(x, y, time) {
    return (
      Math.sin(x * 2.1 + time * 0.4) * Math.cos(y * 1.8 - time * 0.3) +
      Math.sin(x * 3.7 - time * 0.2) * Math.cos(y * 2.9 + time * 0.5) +
      Math.sin((x + y) * 1.5 + time * 0.35) +
      Math.cos((x - y) * 2.3 - time * 0.25)
    ) / 4;
  }

  /* Draw one frame of the topographic animation */
  function draw() {

    topoMouseX += (topoTargetX - topoMouseX) * 0.04;
    topoMouseY += (topoTargetY - topoMouseY) * 0.04;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Radial gradient background — shifts toward the cursor
    const gradient = ctx.createRadialGradient(
      W * topoMouseX, H * topoMouseY, 0,
      W * 0.5,        H * 0.5,        W * 0.8
    );
    gradient.addColorStop(0, 'rgba(20, 30, 48, 1)');
    gradient.addColorStop(1, 'rgba(4, 6, 12, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Draw 38 horizontal noise curves
    for (let i = 0; i < 38; i++) {
      const baseY = (i / 38) * H;

      ctx.beginPath();

      for (let j = 0; j <= 80; j++) {
        const x  = (j / 80) * W;
        const nx = j / 80;
        const ny = i / 38;

        // Distance from this point to the cursor — used to amplify nearby curves
        const dx   = nx - topoMouseX;
        const dy   = ny - topoMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const n = noise(nx * 4, ny * 3, t) +
                  Math.max(0, 1 - dist * 2.2) * 0.35 * Math.sin(t * 2 + dist * 8);

        if (j === 0) {
          ctx.moveTo(x, baseY + n * H * 0.055);
        } else {
          ctx.lineTo(x, baseY + n * H * 0.055);
        }
      }

      // Line colour — brighter near the cursor, blue-shifted by mouse X position
      const distFromMouse = Math.abs((i / 38) - topoMouseY);
      const brightness    = Math.max(0.12, 0.55 - distFromMouse * 0.6);
      const blueShift     = 0.3 + topoMouseX * 0.4;

      ctx.strokeStyle = `rgba(
        ${Math.floor(160 + 80 * blueShift)},
        ${Math.floor(180 + 60 * blueShift)},
        255,
        ${brightness}
      )`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    t += 0.006;
    requestAnimationFrame(draw);
  }

  draw();
}

/* Auto-init if Vault is somehow already active on page load */
if (document.getElementById('vault').classList.contains('active')) {
  initTopo();
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
   - showSuccess()          — injects a confirmation message, resets the form
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

/* ── Arquive contact form ───────────────────────────────────────────── */
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
    { test: v => v.length > 0,           message: 'Email is required.' },
    { test: v => EMAIL_REGEX.test(v),     message: 'Please enter a valid email address.' },
  ];
  const phoneRules = [
    { test: v => v.length > 0, message: 'Phone number is required.' },
  ];
  const messageRules = [
    { test: v => v.length > 0, message: 'Message is required.' },
  ];

  // Clear errors as the user corrects each field
  attachLiveValidation(cfName,    nameRules);
  attachLiveValidation(cfEmail,   emailRules);
  attachLiveValidation(cfPhone,   phoneRules);
  attachLiveValidation(cfMessage, messageRules);

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validate all fields; collect results so every field is checked
    const isValid = [
      validateField(cfName,    nameRules),
      validateField(cfEmail,   emailRules),
      validateField(cfPhone,   phoneRules),
      validateField(cfMessage, messageRules),
    ].every(Boolean);

    if (isValid) {
      showContactSuccess(form);
    }
  });

  // Close overlay: × button, backdrop click, or Escape key
  const overlay  = document.getElementById('contact-success-overlay');
  const closeBtn = document.getElementById('contact-success-close');

  function closeContactSuccess() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  closeBtn.addEventListener('click', closeContactSuccess);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeContactSuccess(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeContactSuccess();
  });
})();

/* ── Artwork modal inquire form ─────────────────────────────────────── */
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
    { test: v => v.length > 0,           message: 'Email is required.' },
    { test: v => EMAIL_REGEX.test(v),     message: 'Please enter a valid email address.' },
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

    if (isValid) {
      showInquireSuccess(form);
    }
  });
})();

/* ============================================================
   BIO MODAL
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

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeBioModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeBioModal();
  });
})();









  
