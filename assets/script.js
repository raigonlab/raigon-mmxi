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
   Opens a full-screen overlay showing one artwork at a time.
   Supports prev/next navigation and keyboard control.
============================================================ */
let activeModal  = null;
let activeOnKey  = null;

function openArtwork(art) {
  showModal(artworks.findIndex(a => a.src === art.src));
}

function showModal(idx) {

    if (activeOnKey) {
      document.removeEventListener('keydown', activeOnKey);
      activeOnKey = null;
    }

    const prevModal = activeModal;
    if (prevModal) {
      prevModal.style.opacity = '0';
      setTimeout(() => prevModal.remove(), 300);
    }

    const art   = artworks[idx];
    const modal = document.createElement('div');
    modal.className = 'artwork-modal';
    activeModal = modal;
  
    const arrowL = document.createElement('button');
    arrowL.className   = 'modal-arrow';
    arrowL.innerHTML   = '&#8592;';
    arrowL.setAttribute('aria-label', 'Previous artwork');
    arrowL.addEventListener('click', e => {
      e.stopPropagation();
      showModal((idx - 1 + artworks.length) % artworks.length);
    });
  
    const img = document.createElement('img');
    img.src       = art.src;
    img.alt       = art.title;
    img.className = 'modal-image';
  
    const arrowR = document.createElement('button');
    arrowR.className   = 'modal-arrow';
    arrowR.innerHTML   = '&#8594;';
    arrowR.setAttribute('aria-label', 'Next artwork');
    arrowR.addEventListener('click', e => {
      e.stopPropagation();
      showModal((idx + 1) % artworks.length);
    });
  
    const info = document.createElement('div');
    info.className = 'modal-info';
    info.innerHTML = `
      <div class="modal-series">${art.series}</div>
      <div class="modal-title">${art.title}</div>
      <div class="modal-year">${art.year}</div>
      <div class="modal-divider"></div>
      <div class="modal-description">Carvão digital sobre superfície. Exploração da forma através da sobreposição e dissolução do traço.</div>
      <div class="modal-counter">${idx + 1} / ${artworks.length}</div>
    `;
  
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal(modal, onKey);
      }
    });
  
    function onKey(e) {
      if (e.key === 'ArrowLeft')  { showModal((idx - 1 + artworks.length) % artworks.length); }
      if (e.key === 'ArrowRight') { showModal((idx + 1) % artworks.length); }
      if (e.key === 'Escape')     { closeModal(modal, onKey); }
    }
    activeOnKey = onKey;
    document.addEventListener('keydown', onKey);

    modal.appendChild(arrowL);
    modal.appendChild(img);
    modal.appendChild(arrowR);
    modal.appendChild(info);
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.style.opacity = '1';
        img.style.transform = 'scale(1)';
      });
    });
  }
  
  function closeModal(modal, onKey) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      activeModal = null;
    }, 400);
    document.removeEventListener('keydown', onKey);
    activeOnKey = null;
  }
  
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

    showVaultFeedback(`${collection.title} — ${collection.count} works`);

  } catch (error) {
    showVaultFeedback('unable to load collection. please try again.', true);
    console.error('Collection fetch failed:', error);
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









  
