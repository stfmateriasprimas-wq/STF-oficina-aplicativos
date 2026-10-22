/**
 * STF GROUP · HIGH-SPEED PERSPECTIVE LIGHT TUNNEL ANIMATION (LIGHTFALL ENGINE)
 * Inspired by Lightfall (Trade at the speed of light)
 * 
 * Features:
 * 1. Single continuous fluid light streams: rays fall vertically down the back wall,
 *    seamlessly bend 90° in a smooth rounded curve at the horizon crease,
 *    and rush forward along the floor in 3D perspective towards the camera.
 * 2. Extended boundary matching user demarcation:
 *    - Upper zone starts close to the lamp (46.5% width)
 *    - Lower zone sweeps down and left under the lamp base to ~20% width at bottom edge.
 *    - Smooth organic fade along the curved boundary.
 * 3. Color Tone Cycle (every 4 seconds):
 *    - 4s STF Luxury Gold & Amber -> 1.5s smooth transition -> 4s Crystalline Diamond White & Platinum -> repeat.
 * 4. 100% transparent horizon transition: NO boxes, NO shadows, ONLY the crisp laser line.
 * 5. Additive glow (globalCompositeOperation = 'lighter') with round caps.
 * 6. Soft breathing radial bloom at vanishing point with synchronized color shift.
 * 7. Smooth mouse parallax (10–15 px) responsive to cursor.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    // Increased ray count to fill extended coverage area
    rayCount: 140,

    // Progression speed along the 3D path (p: 0=ceiling, 1=horizon, 2=camera)
    speedMin: 0.007,
    speedMax: 0.021,

    // Stream length in path units
    lengthMin: 0.12,
    lengthMax: 0.32,

    // Stream line thickness (px) - sleek and razor fine
    widthMin: 1.0,
    widthMax: 2.2,

    // Horizon & Vanishing Point
    horizonYRatio: 0.67,         // ~67% of screen height
    vanishXRatio: 0.73,          // Centered on right half
    rightZoneStartRatio: 0.465,  // Starts right next to the lamp
    rightZoneEndRatio: 0.985,

    // Parallax limits (px)
    parallaxMaxX: 18,
    parallaxMaxY: 12,

    // Color Cycle Timings (ms)
    colorStateDuration: 4000,    // 4 seconds per color
    colorTransitionDuration: 1500 // 1.5 seconds smooth crossfade
  };

  // --- Dual Color Palettes (Gold vs Crystalline White) ---
  const PALETTES = {
    gold: {
      primary: [
        { r: 255, g: 197, b: 66 },   // STF Gold
        { r: 255, g: 215, b: 100 },  // Champagne Gold
        { r: 245, g: 180, b: 40 },   // Deep Warm Amber
        { r: 255, g: 240, b: 175 },  // Warm White-Gold
        { r: 255, g: 165, b: 30 }    // Glowing Amber
      ],
      accent: [
        { r: 255, g: 75, b: 15 },    // Electric Neon Orange
        { r: 255, g: 105, b: 20 },   // Fiery Flame
        { r: 255, g: 45, b: 0 }      // Crimson Ember
      ]
    },
    white: {
      primary: [
        { r: 255, g: 255, b: 255 },  // Pure Diamond White
        { r: 242, g: 246, b: 255 },  // Platinum Pearl
        { r: 228, g: 236, b: 252 },  // Silver Starlight
        { r: 248, g: 250, b: 255 },  // Crystalline White
        { r: 235, g: 242, b: 250 }   // Cool Pure White
      ],
      accent: [
        { r: 255, g: 255, b: 255 },  // Hyper-speed Diamond White
        { r: 185, g: 232, b: 255 },  // Ice Cyan Sheen
        { r: 210, g: 225, b: 255 }   // Cool Platinum
      ]
    }
  };

  // --- Runtime State ---
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let width = 0;
  let height = 0;
  let horizonY = 0;
  let vanishX = 0;
  let groundHeight = 0;
  let isRunning = false;
  let animFrameId = null;

  // Parallax smoothing
  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  // Active light streams
  let lightStreams = [];

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickPalettePair() {
    const isAccent = Math.random() < 0.12;
    const goldList = isAccent ? PALETTES.gold.accent : PALETTES.gold.primary;
    const whiteList = isAccent ? PALETTES.white.accent : PALETTES.white.primary;

    const gCol = goldList[Math.floor(Math.random() * goldList.length)];
    const wCol = whiteList[Math.floor(Math.random() * whiteList.length)];

    return {
      gold: { r: gCol.r, g: gCol.g, b: gCol.b },
      white: { r: wCol.r, g: wCol.g, b: wCol.b }
    };
  }

  // --- Automated 4-Second Color Cycle Function ---
  // Returns blendFactor: 0.0 (100% Gold) to 1.0 (100% White)
  function getPaletteBlendFactor(time) {
    const stateDur = CONFIG.colorStateDuration;
    const transDur = CONFIG.colorTransitionDuration;
    const cycleTotal = (stateDur + transDur) * 2; // 11000ms

    const t = time % cycleTotal;

    if (t < stateDur) {
      // 1. Pure Gold state (4 full seconds)
      return 0.0;
    } else if (t < stateDur + transDur) {
      // 2. Smooth crossfade: Gold -> White (1.5s)
      const u = (t - stateDur) / transDur;
      return u * u * (3 - 2 * u); // Smoothstep easing
    } else if (t < stateDur * 2 + transDur) {
      // 3. Pure White state (4 full seconds)
      return 1.0;
    } else {
      // 4. Smooth crossfade: White -> Gold (1.5s)
      const u = (t - (stateDur * 2 + transDur)) / transDur;
      return 1.0 - (u * u * (3 - 2 * u)); // Smoothstep easing
    }
  }

  // --- Extended Demarcation Boundary (User Red Line) ---
  // Upper zone: begins at 46.5% width
  // Lower zone: sweeps down and left under the lamp base down to ~20% width at bottom edge
  function getBoundaryFade(x, y) {
    let minX;
    if (y <= horizonY) {
      minX = width * 0.465;
    } else {
      const floorProgress = (y - horizonY) / Math.max(1, height - horizonY);
      minX = width * (0.465 - Math.pow(floorProgress, 1.12) * 0.27);
    }

    const fadeWidth = 40;
    if (x < minX - fadeWidth) return 0;
    if (x < minX) return (x - (minX - fadeWidth)) / fadeWidth;
    return 1.0;
  }

  // --- Class: Continuous Bending Light Stream ---
  class LightStream {
    constructor(initialSpawn = false) {
      this.reset(initialSpawn);
    }

    reset(initialSpawn = false) {
      const pair = pickPalettePair();
      this.goldColor = pair.gold;
      this.whiteColor = pair.white;

      this.baseWidth = randomRange(CONFIG.widthMin, CONFIG.widthMax);
      this.length = randomRange(CONFIG.lengthMin, CONFIG.lengthMax);

      // Speed correlates with length for motion-blur realism
      const lengthFactor = (this.length - CONFIG.lengthMin) / (CONFIG.lengthMax - CONFIG.lengthMin);
      this.baseSpeed = CONFIG.speedMin + lengthFactor * (CONFIG.speedMax - CONFIG.speedMin) + randomRange(-0.002, 0.003);

      this.opacity = randomRange(0.42, 0.95);

      // Lateral start position across extended right half
      const minX = width * CONFIG.rightZoneStartRatio;
      const maxX = width * CONFIG.rightZoneEndRatio;
      this.startX = minX + Math.random() * (maxX - minX);

      // Ground angle factor: allows perspective fan to sweep down-left under the lamp
      const refGroundH = Math.max(10, groundHeight);
      const rawAngle = (this.startX - vanishX) / (refGroundH * 0.30);
      this.angleFactor = Math.max(-2.35, rawAngle);

      // Progress p: 0.0 (top) -> 1.0 (horizon) -> 2.1 (bottom of screen)
      if (initialSpawn) {
        this.p = randomRange(0.0, 2.0);
      } else {
        this.p = -randomRange(0.05, 0.4);
      }
    }

    update() {
      // Perspective acceleration: stream moves at constant speed on the wall,
      // and accelerates rapidly as it rushes across the floor toward the camera!
      let currentSpeed = this.baseSpeed;
      if (this.p > 1.0) {
        const floorProgress = this.p - 1.0;
        currentSpeed = this.baseSpeed * (1.0 + floorProgress * 1.35);
      }

      this.p += currentSpeed;

      // Reset when tail passes completely beyond screen bottom
      if (this.p - this.length > 2.05) {
        this.reset(false);
      }
    }

    // Evaluate 2D screen coordinate and scale at any point along the 3D path
    getPointAt(pVal, effVX, effVY, parallaxX) {
      const cornerRadius = 0.055; // Radius of smooth floor bend

      if (pVal < 1.0 - cornerRadius) {
        // 1. Vertical wall descent
        const progressY = Math.max(0, pVal);
        return {
          x: this.startX + parallaxX * 0.45,
          y: progressY * horizonY,
          widthScale: 1.0,
          alphaScale: 1.0
        };
      } else if (pVal > 1.0 + cornerRadius) {
        // 2. Perspective ground run
        const t = pVal - 1.0; // 0 to 1.1
        const tPersp = t * (0.85 + t * 0.35);
        const y = effVY + groundHeight * tPersp;
        const x = effVX + this.angleFactor * groundHeight * tPersp;
        const proximity = Math.min(1.0, t);

        return {
          x: x,
          y: y,
          widthScale: 1.0 + proximity * 0.75, // Sleek, non-bulky scaling
          alphaScale: 0.7 + proximity * 0.3
        };
      } else {
        // 3. Smooth Bezier bend around the horizon crease
        const u = (pVal - (1.0 - cornerRadius)) / (cornerRadius * 2); // 0 to 1

        const p1 = 1.0 - cornerRadius;
        const x1 = this.startX + parallaxX * 0.45;
        const y1 = p1 * horizonY;

        const p2 = 1.0 + cornerRadius;
        const t2 = p2 - 1.0;
        const t2Persp = t2 * (0.85 + t2 * 0.35);
        const x2 = effVX + this.angleFactor * groundHeight * t2Persp;
        const y2 = effVY + groundHeight * t2Persp;

        const cpX = this.startX + parallaxX * 0.45;
        const cpY = effVY;

        // Quadratic Bezier interpolation:
        const inv = 1 - u;
        const bx = inv * inv * x1 + 2 * inv * u * cpX + u * u * x2;
        const by = inv * inv * y1 + 2 * inv * u * cpY + u * u * y2;

        return {
          x: bx,
          y: by,
          widthScale: 1.0 + u * 0.35,
          alphaScale: 1.0
        };
      }
    }

    draw(ctx, effVX, effVY, parallaxX, blendFactor) {
      const pHead = this.p;
      const pTail = this.p - this.length;

      // Don't draw if completely off-screen
      if (pHead < 0.01 || pTail > 2.05) return;

      // Sample points along the trail
      const numSamples = 8;
      const points = [];
      for (let i = 0; i <= numSamples; i++) {
        const sampleP = pTail + (pHead - pTail) * (i / numSamples);
        points.push(this.getPointAt(sampleP, effVX, effVY, parallaxX));
      }

      const headPt = points[points.length - 1];
      const tailPt = points[0];

      // Boundary fade according to user's red demarcated line
      const edgeFade = getBoundaryFade(headPt.x, headPt.y);
      if (edgeFade <= 0.01) return;

      const alpha = this.opacity * edgeFade;
      if (alpha <= 0.01) return;

      // Dynamic stroke width along the beam
      const currentWidth = this.baseWidth * headPt.widthScale;

      // Interpolate color between Gold and White in real-time
      const r = Math.round(this.goldColor.r + (this.whiteColor.r - this.goldColor.r) * blendFactor);
      const g = Math.round(this.goldColor.g + (this.whiteColor.g - this.goldColor.g) * blendFactor);
      const b = Math.round(this.goldColor.b + (this.whiteColor.b - this.goldColor.b) * blendFactor);

      const beamGrad = ctx.createLinearGradient(tailPt.x, tailPt.y, headPt.x, headPt.y);
      beamGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      beamGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.45 * headPt.alphaScale})`);
      beamGrad.addColorStop(0.80, `rgba(${r}, ${g}, ${b}, ${alpha * headPt.alphaScale})`);
      beamGrad.addColorStop(1, `rgba(255, 255, 255, ${alpha * headPt.alphaScale})`);

      // SOLO LA LÍNEA PRINCIPAL (Láser limpio, sin sombras marcadas ni recuadros)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = currentWidth;
      ctx.strokeStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }

  // --- Horizon Diffuse Radial Bloom with Synchronized Color Shift ---
  function drawHorizonBloom(ctx, vX, vY, time, blendFactor) {
    const pulse = 1.0 + 0.12 * Math.sin(time * 0.0022);
    const bloomRadius = Math.min(width, height) * 0.30 * pulse;

    // Interpolate bloom colors between Gold and White
    // Stop 0: Warm White-Gold -> Pure Brilliant White
    const r0 = Math.round(255 + (255 - 255) * blendFactor);
    const g0 = Math.round(245 + (255 - 245) * blendFactor);
    const b0 = Math.round(220 + (255 - 220) * blendFactor);

    // Stop 1: Radiant Gold -> Platinum White
    const r1 = Math.round(255 + (228 - 255) * blendFactor);
    const g1 = Math.round(205 + (238 - 205) * blendFactor);
    const b1 = Math.round(90 + (255 - 90) * blendFactor);

    // Stop 2: Deep Amber -> Cool Silver Ice
    const r2 = Math.round(255 + (180 - 255) * blendFactor);
    const g2 = Math.round(140 + (210 - 140) * blendFactor);
    const b2 = Math.round(30 + (252 - 30) * blendFactor);

    const grad = ctx.createRadialGradient(vX, vY, 0, vX, vY, bloomRadius);
    grad.addColorStop(0, `rgba(${r0}, ${g0}, ${b0}, ${0.38 * pulse})`);
    grad.addColorStop(0.15, `rgba(${r1}, ${g1}, ${b1}, ${0.20 * pulse})`);
    grad.addColorStop(0.40, `rgba(${r2}, ${g2}, ${b2}, ${0.07 * pulse})`);
    grad.addColorStop(0.72, `rgba(${r2}, ${g2}, ${b2}, ${0.015 * pulse})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(vX, vY, bloomRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Main Animation Frame ---
  function renderFrame(time) {
    if (!isRunning) return;

    // Automated 4-second Gold <-> White cycle blend
    const blendFactor = getPaletteBlendFactor(time);

    // Smooth Parallax Interpolation (Lerp)
    currentParallaxX += (targetParallaxX - currentParallaxX) * 0.055;
    currentParallaxY += (targetParallaxY - currentParallaxY) * 0.055;

    const effVanishX = vanishX + currentParallaxX;
    const effVanishY = horizonY + currentParallaxY;

    // Clear canvas - transparent background
    ctx.clearRect(0, 0, width, height);

    // Additive glow blending mode (Lightfall laser effect)
    ctx.globalCompositeOperation = 'lighter';

    // 1. Horizon Soft Radial Bloom with synchronized color transition
    drawHorizonBloom(ctx, effVanishX, effVanishY, time, blendFactor);

    // 2. Update and Draw All Continuous Light Streams
    for (let i = 0; i < lightStreams.length; i++) {
      const stream = lightStreams[i];
      stream.update();
      stream.draw(ctx, effVanishX, effVanishY, currentParallaxX, blendFactor);
    }

    animFrameId = requestAnimationFrame(renderFrame);
  }

  // --- Resize Handler ---
  function handleResize() {
    if (!canvas) return;

    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    horizonY = Math.floor(height * CONFIG.horizonYRatio);
    vanishX = Math.floor(width * CONFIG.vanishXRatio);
    groundHeight = height - horizonY;
  }

  // --- Mouse Move for Parallax ---
  function handleMouseMove(e) {
    const normX = (e.clientX / width) - 0.5;
    const normY = (e.clientY / height) - 0.5;

    targetParallaxX = normX * CONFIG.parallaxMaxX;
    targetParallaxY = normY * CONFIG.parallaxMaxY;
  }

  // --- Light Burst Ignition Effect (When Lamp Clicks ON) ---
  function triggerLightBurst() {
    for (let i = 0; i < lightStreams.length; i++) {
      if (Math.random() < 0.6) {
        lightStreams[i].p = randomRange(0.2, 1.4);
        lightStreams[i].baseSpeed *= 1.4;
      }
    }
  }

  // --- Public Control Interface ---
  function startLightTunnel() {
    if (isRunning) return;
    isRunning = true;

    if (canvas) {
      canvas.classList.add('is-active');
    }

    triggerLightBurst();
    animFrameId = requestAnimationFrame(renderFrame);
  }

  function stopLightTunnel() {
    if (!isRunning) return;

    if (canvas) {
      canvas.classList.remove('is-active');
    }

    setTimeout(() => {
      if (!document.body.classList.contains('lamp-on')) {
        isRunning = false;
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }
    }, 700);
  }

  // --- Initialization ---
  function init() {
    canvas = document.getElementById('lightTunnelCanvas');
    if (!canvas) {
      console.warn('lightTunnelCanvas element not found in DOM.');
      return;
    }

    ctx = canvas.getContext('2d', { alpha: true });
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize Continuous Light Streams
    lightStreams = [];
    for (let i = 0; i < CONFIG.rayCount; i++) {
      lightStreams.push(new LightStream(true));
    }

    // If lamp is already ON
    if (document.body.classList.contains('lamp-on') || window.isLampOn) {
      startLightTunnel();
    }
  }

  // Export to global window scope
  window.LightTunnelEngine = {
    init: init,
    start: startLightTunnel,
    stop: stopLightTunnel,
    triggerBurst: triggerLightBurst
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
