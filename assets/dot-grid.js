/* ============================================================
   dot-grid.js — raigon-mmxi
   Interactive dot-grid background for the Vault section.
   - Dots repel from the cursor (lerp, smooth)
   - Click triggers a radial ripple wave
   - Activates / deactivates with the Vault page via MutationObserver
   - Canvas resizes via ResizeObserver
   No external libraries.
============================================================ */

(function () {

  const canvas = document.getElementById('dot-grid');
  const ctx    = canvas.getContext('2d');
  const vault  = document.getElementById('vault');

  /* ── Config ── */
  const SPACING    = 28;
  const DOT_R      = 1.5;
  const BASE_ALPHA = 0.18;
  const REPEL_R    = 90;
  const REPEL_MAX  = 24;
  const LERP       = 0.10;
  const BG         = '#060810';

  let dots    = [];
  let ripples = [];
  let mouse   = { x: -9999, y: -9999 };
  let rafId   = null;
  let isActive = false;

  /* ── Grid ── */

  function buildDots() {
    dots = [];
    const cols = Math.ceil(canvas.width  / SPACING) + 2;
    const rows = Math.ceil(canvas.height / SPACING) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          bx: c * SPACING,   // base position — never changes
          by: r * SPACING,
          dx: 0,             // current displacement — lerped each frame
          dy: 0,
        });
      }
    }
  }

  function resize() {
    canvas.width  = vault.clientWidth  || window.innerWidth;
    canvas.height = vault.clientHeight || window.innerHeight;
    buildDots();
  }

  /* ── Draw ── */

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vault background — dot-grid owns this since #vault is transparent
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `rgba(255,255,255,${BASE_ALPHA})`;

    for (const dot of dots) {

      // Target displacement from mouse repulsion
      const mx   = dot.bx - mouse.x;
      const my   = dot.by - mouse.y;
      const md   = Math.sqrt(mx * mx + my * my);
      let tdx = 0;
      let tdy = 0;

      if (md < REPEL_R && md > 0) {
        const strength = (1 - md / REPEL_R) * REPEL_MAX;
        tdx = (mx / md) * strength;
        tdy = (my / md) * strength;
      }

      // Ripple contributions — each active ripple pushes dots at its wave front
      for (const rip of ripples) {
        const rx   = dot.bx - rip.x;
        const ry   = dot.by - rip.y;
        const rd   = Math.sqrt(rx * rx + ry * ry);
        const band = 36;
        const diff = Math.abs(rd - rip.r);
        if (diff < band && rd > 0) {
          const wave = (1 - diff / band) * rip.strength * (1 - rip.age);
          tdx += (rx / rd) * wave;
          tdy += (ry / rd) * wave;
        }
      }

      // Lerp current displacement toward target — smooth, not instant
      dot.dx += (tdx - dot.dx) * LERP;
      dot.dy += (tdy - dot.dy) * LERP;

      ctx.beginPath();
      ctx.arc(dot.bx + dot.dx, dot.by + dot.dy, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    // Advance and expire ripples
    for (const rip of ripples) {
      rip.r   += 5;
      rip.age += 0.016;
    }
    ripples = ripples.filter(rip => rip.age < 1);
  }

  /* ── Loop ── */

  function loop() {
    if (!isActive) { rafId = null; return; }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId) { rafId = requestAnimationFrame(loop); }
  }

  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ── Vault active / inactive ── */

  new MutationObserver(() => {
    isActive = vault.classList.contains('active');
    if (isActive) { startLoop(); } else { stopLoop(); }
  }).observe(vault, { attributes: true, attributeFilter: ['class'] });

  /* ── Events — listened on vault (sits on top of the fixed canvas) ── */

  vault.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  vault.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  vault.addEventListener('click', e => {
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, strength: 20, age: 0 });
  });

  /* ── Resize ── */

  new ResizeObserver(resize).observe(document.body);

  /* ── Init ── */

  resize();

  if (vault.classList.contains('active')) {
    isActive = true;
    startLoop();
  }

})();
