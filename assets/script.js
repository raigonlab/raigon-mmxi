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
    const parallaxSpeeds = [0.08, 0.03];
  
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

   /* --- Build each layer --- 
   rows.forEach((row, ri) => {
    const layer = document.createElement('div');
    layer.className = `layer layer-${ri + 1}`;
    
 // Triple the row so infinite wrapping works without visible gaps
 [...row, ...row, ...row].forEach((art, i) => {
    const card = document.createElement('div');
    card.className = 'artwork-card';*/
