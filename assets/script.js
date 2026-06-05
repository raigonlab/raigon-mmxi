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
      artworks.slice(9, 19),
    ];
  
    const layers        = [];
    const offsets       = [0, -285];
    const targetOffsets = [0, -285];
    const parallaxSpeeds = [0.08, 0.05];
  
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
      targetOffsets[i] -= 0.2 * (1 - i * 0.5);
    });

    const deadZone = 0.2;
    const absX     = Math.abs(mouseX);

    if (absX > deadZone) {
      const dir       = mouseX > 0 ? -1 : 1;
      const intensity = (absX - deadZone) / (1 - deadZone);
      const speed     = intensity * intensity * 12;

      layers.forEach((_, i) => {
        targetOffsets[i] += dir * speed * (1 - i * 0.15);
      });
    }

    layers.forEach((layer, i) => {
      targetOffsets[i] = wrapOffset(targetOffsets[i], layer);
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
// Parallax animation loop with infinite scroll 

function wrapOffset(val, layerEl) {
    const period = layerEl.scrollWidth / 3;
    if (val < -(period * 2)) { return val + period; }
    if (val > 0)              { return val - period; }
    return val;
  }

  function animate() {

    layers.forEach((_, i) => {
      targetOffsets[i] -= 0.3 * (1 - i * 0.15);
    });

    const deadZone = 0.2;
    const absX     = Math.abs(mouseX);

    if (absX > deadZone) {
      const dir       = mouseX > 0 ? -1 : 1;
      const intensity = (absX - deadZone) / (1 - deadZone);
      const speed     = intensity * intensity * 12;

      layers.forEach((_, i) => {
        targetOffsets[i] += dir * speed * (1 - i * 0.15);
      });
    }

    layers.forEach((layer, i) => {
      targetOffsets[i] = wrapOffset(targetOffsets[i], layer);
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

  // Apply parallax movement, transforms, and depth-of-field focus effect to gallery layers and cards

  layers.forEach((layer, i) => {
    targetOffsets[i] = wrapOffset(targetOffsets[i], layer);
    offsets[i] += (targetOffsets[i] - offsets[i]) * 0.08;

    const px = mouseX * 120 * parallaxSpeeds[i] * 10;
    layer.style.transform = `translateX(${offsets[i] + px}px)`;

    layer.querySelectorAll('.artwork-card').forEach(card => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width / 2;
      const dist  = Math.abs(cx - centerX);
      const maxDist = W * 0.55;
      const t     = Math.min(1, dist / maxDist);

      card.style.opacity   = (1 - t * 0.55).toFixed(2);
      card.style.filter    = `blur(${(t * 2.5).toFixed(1)}px)`;
      card.style.transform = `scale(${(1 + (1 - t) * 0.12).toFixed(3)})`;
      card.style.zIndex    = Math.round((1 - t) * 10);
    });
  });

  // Open artwork modal with navigation and info panel

let activeModal = null;

function openArtwork(art) {
  showModal(artworks.findIndex(a => a.src === art.src));
}

function showModal(idx) {

  if (activeModal) {
    activeModal.style.opacity = '0';
    setTimeout(() => { if (activeModal) { activeModal.remove(); } }, 300);
  }

  const art   = artworks[idx];
  const modal = document.createElement('div');
  modal.className = 'artwork-modal';
  activeModal = modal;

  const arrowL = document.createElement('button');
  arrowL.className   = 'modal-arrow';
  arrowL.innerHTML   = '&#8592;';
  arrowL.setAttribute('aria-label', 'Previous artwork');

  const img = document.createElement('img');
  img.src       = art.src;
  img.alt       = art.title;
  img.className = 'modal-image';

  const arrowR = document.createElement('button');
  arrowR.className   = 'modal-arrow';
  arrowR.innerHTML   = '&#8594;';
  arrowR.setAttribute('aria-label', 'Next artwork');

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

  modal.appendChild(arrowL);
  modal.appendChild(img);
  modal.appendChild(arrowR);
  modal.appendChild(info);
  document.body.appendChild(modal);

  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    img.style.transform = 'scale(1)';
  });
}


// Artwork modal navigation and controls


function showModal(idx) {

    if (activeModal) {
      activeModal.style.opacity = '0';
      setTimeout(() => { if (activeModal) { activeModal.remove(); } }, 300);
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
    document.addEventListener('keydown', onKey);
  
    modal.appendChild(arrowL);
    modal.appendChild(img);
    modal.appendChild(arrowR);
    modal.appendChild(info);
    document.body.appendChild(modal);
  
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      img.style.transform = 'scale(1)';
    });
  }
  
  function closeModal(modal, onKey) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      activeModal = null;
    }, 400);
    document.removeEventListener('keydown', onKey);
  }
  
  // vault section 

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
      const rect   = canvas.getBoundingClientRect();
      topoTargetX  = (e.clientX - rect.left) / rect.width;
      topoTargetY  = (e.clientY - rect.top)  / rect.height;
    });
   
    let t = 0; // time counter for animation
 
    /* Layered sine/cosine noise — produces organic wave patterns */
    function noise(x, y, time) {
      return (
        Math.sin(x * 2.1 + time * 0.4) * Math.cos(y * 1.8 - time * 0.3) +
        Math.sin(x * 3.7 - time * 0.2) * Math.cos(y * 2.9 + time * 0.5) +
        Math.sin((x + y) * 1.5 + time * 0.35) +
        Math.cos((x - y) * 2.3 - time * 0.25)
      ) / 4;
    }
 








  
