/**
 * STF GROUP · 3D Floating Cyber Brain & Real-Time Code Streams Engine
 * Generates dynamic code and binary lines flowing inward and outward from the brain,
 * 360-degree interactive rotation, neural shockwave transitions, and synaptic audio.
 */

(function(window) {
  'use strict';

  const CODE_SNIPPETS = [
    '01010010', '11001010', '00110101', '10101100', '01110011', '11100010',
    'const neural = await STF.brain.sync();',
    'import { CognitiveMesh } from "@stf/ai";',
    'sys.synapticCore.activate(0x7F4A9B);',
    'node.feedTelemetry(stream.pipe(gcm));',
    '0x8E59B9A2', 'TLS_v1.3_AES_256', '200_OK',
    'while(alive) { computeThought(); }',
    'matrix.transpose(synapse.weights);',
    '01100001', '10010110', '11110000', '00001111'
  ];

  class CyberBrainPortal {
    constructor() {
      this.canvas = document.getElementById('brainCodeStreamsCanvas');
      this.container = document.getElementById('cyberBrainStage');
      this.brainCore = document.getElementById('brainSpinningCore');
      this.brain3DWrapper = document.getElementById('brain3DWrapper');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Inward and Outward code stream paths
      this.inwardStreams = [];
      this.outwardStreams = [];
      this.floatingDust = [];

      this.startTime = Date.now();
      this.isRunning = false;
      this.animFrameId = null;

      // 3D rotation state
      this.rotY = 0;
      this.rotX = 0;
      this.targetMouseX = 0;
      this.targetMouseY = 0;
      this.curMouseX = 0;
      this.curMouseY = 0;

      // Pulse and shockwave
      this.shockwaves = [];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.generateStreams();
      this.generateDust();
      this.setupInteractions();
    }

    resize() {
      if (!this.canvas) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(this.dpr, this.dpr);
      this.centerX = this.width * 0.5;
      this.centerY = this.height * 0.5;
    }

    generateStreams() {
      this.inwardStreams = [];
      this.outwardStreams = [];

      const cx = this.width * 0.5;
      const cy = this.height * 0.5;

      // 1. INWARD STREAMS (Alimentando el cerebro: lines of code flowing into the brain)
      const inwardCount = 18;
      for (let i = 0; i < inwardCount; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const startX = side === -1 ? -50 : this.width + 50;
        const startY = cy + (Math.random() - 0.5) * (this.height * 0.85);

        // Control points curving into the brain core
        const cp1x = cx + side * (320 + Math.random() * 180);
        const cp1y = startY + (Math.random() - 0.5) * 160;
        const cp2x = cx + side * (120 + Math.random() * 80);
        const cp2y = cy + (Math.random() - 0.5) * 70;

        // Target inside brain
        const targetX = cx + (Math.random() - 0.5) * 50;
        const targetY = cy + (Math.random() - 0.5) * 40;

        const textSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];

        this.inwardStreams.push({
          startX, startY, cp1x, cp1y, cp2x, cp2y, targetX, targetY,
          progress: Math.random(),
          speed: 0.0035 + Math.random() * 0.0055,
          color: Math.random() > 0.4 ? 'cyan' : 'blue',
          text: textSnippet,
          chars: textSnippet.split(''),
          charOffset: Math.random() * 100,
          opacity: 0.5 + Math.random() * 0.45
        });
      }

      // 2. OUTWARD STREAMS (Emanando del cerebro: data lines radiating outward)
      const outwardCount = 18;
      for (let i = 0; i < outwardCount; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const startX = cx + side * (20 + Math.random() * 40);
        const startY = cy + (Math.random() - 0.5) * 60;

        const endX = side === 1 ? this.width + 80 : -80;
        const endY = cy + (Math.random() - 0.5) * (this.height * 0.85);

        const cp1x = cx + side * (160 + Math.random() * 120);
        const cp1y = startY + (Math.random() - 0.5) * 90;
        const cp2x = cx + side * (360 + Math.random() * 200);
        const cp2y = endY + (Math.random() - 0.5) * 120;

        const textSnippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];

        this.outwardStreams.push({
          startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          color: Math.random() > 0.5 ? 'cyan' : 'magenta',
          text: textSnippet,
          charOffset: Math.random() * 100,
          opacity: 0.5 + Math.random() * 0.45
        });
      }
    }

    generateDust() {
      this.floatingDust = [];
      const count = 90;
      for (let i = 0; i < count; i++) {
        this.floatingDust.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 0.8 + Math.random() * 1.6,
          color: Math.random() > 0.5 ? '#50E3C2' : '#38BDF8',
          alpha: 0.2 + Math.random() * 0.6
        });
      }
    }

    setupInteractions() {
      // Mouse Parallax & 3D Tilt
      window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;
        this.targetMouseX = normX;
        this.targetMouseY = normY;
      });

      // Click on Brain Container to Activate System
      if (this.container) {
        this.container.addEventListener('click', (e) => {
          this.triggerShockwave(e.clientX, e.clientY);
          this.playNeuralActivationSound();
          setTimeout(() => {
            if (typeof window.activateLoginFromBrain === 'function') {
              window.activateLoginFromBrain();
            }
          }, 450);
        });
      }
    }

    playNeuralActivationSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        // 1. Futuristic neural rising sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        // Lowpass filter for smooth sci-fi feel
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(3500, ctx.currentTime + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);

        // 2. Deep sub-bass impact
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, ctx.currentTime);
        sub.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.4);
        subGain.gain.setValueAtTime(0.5, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start();
        sub.stop(ctx.currentTime + 0.5);
      } catch (err) {
        // Audio policy
      }
    }

    triggerShockwave(x, y) {
      this.shockwaves.push({
        x: x || this.centerX,
        y: y || this.centerY,
        radius: 10,
        maxRadius: Math.max(this.width, this.height) * 0.9,
        alpha: 1.0,
        speed: 38
      });
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.loop();
    }

    stop() {
      this.isRunning = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }

    loop() {
      if (!this.isRunning) return;
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(() => this.loop());
    }

    update() {
      const now = Date.now();
      const time = (now - this.startTime) * 0.001;

      // Smooth mouse interpolation
      this.curMouseX += (this.targetMouseX - this.curMouseX) * 0.08;
      this.curMouseY += (this.targetMouseY - this.curMouseY) * 0.08;

      // 360-degree Continuous Rotation on Y-Axis
      this.rotY = (this.rotY + 0.45) % 360;
      this.rotX = -this.curMouseY * 14;

      // Apply 3D transform to brain wrapper
      if (this.brain3DWrapper) {
        const floatY = Math.sin(time * 1.5) * 12;
        const breathScale = 1.0 + Math.sin(time * 2.2) * 0.018;

        this.brain3DWrapper.style.transform = `
          perspective(1200px) 
          rotateX(${this.rotX.toFixed(2)}deg) 
          rotateY(${(this.rotY + this.curMouseX * 18).toFixed(2)}deg) 
          translateY(${floatY.toFixed(2)}px) 
          scale(${breathScale.toFixed(3)})
        `;
      }

      // Update inward streams
      this.inwardStreams.forEach(stream => {
        stream.progress += stream.speed;
        if (stream.progress >= 1.0) {
          stream.progress = 0;
          stream.charOffset += 5;
        }
      });

      // Update outward streams
      this.outwardStreams.forEach(stream => {
        stream.progress += stream.speed;
        if (stream.progress >= 1.0) {
          stream.progress = 0;
          stream.charOffset += 5;
        }
      });

      // Update dust
      this.floatingDust.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
      });

      // Update shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha = 1 - sw.radius / sw.maxRadius;
        if (sw.alpha <= 0) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    render() {
      const ctx = this.ctx;
      const time = (Date.now() - this.startTime) * 0.001;

      ctx.clearRect(0, 0, this.width, this.height);
      ctx.globalCompositeOperation = 'lighter';

      // 1. RENDER FLOATING CODE STREAMS (INWARD - FEEDING THE BRAIN)
      this.renderStreamSet(this.inwardStreams, true);

      // 2. RENDER FLOATING CODE STREAMS (OUTWARD - EMANATING FROM BRAIN)
      this.renderStreamSet(this.outwardStreams, false);

      // 3. RENDER AMBIENT CYBER PARTICLES
      ctx.fillStyle = '#50E3C2';
      this.floatingDust.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. RENDER SHOCKWAVES ON CLICK
      this.shockwaves.forEach(sw => {
        ctx.strokeStyle = `rgba(80, 227, 194, ${sw.alpha})`;
        ctx.lineWidth = 4 * sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${sw.alpha * 0.6})`;
        ctx.lineWidth = 2 * sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.95, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    }

    renderStreamSet(streams, isInward) {
      const ctx = this.ctx;
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';

      streams.forEach(stream => {
        const sx = isInward ? stream.startX : stream.startX;
        const sy = isInward ? stream.startY : stream.startY;
        const c1x = stream.cp1x;
        const c1y = stream.cp1y;
        const c2x = stream.cp2x;
        const c2y = stream.cp2y;
        const ex = isInward ? stream.targetX : stream.endX;
        const ey = isInward ? stream.targetY : stream.endY;

        // Draw luminous guide curve
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        if (stream.color === 'cyan') {
          grad.addColorStop(0, 'rgba(80, 227, 194, 0.05)');
          grad.addColorStop(0.5, 'rgba(80, 227, 194, 0.45)');
          grad.addColorStop(1, 'rgba(80, 227, 194, 0.85)');
        } else if (stream.color === 'magenta') {
          grad.addColorStop(0, 'rgba(232, 121, 249, 0.05)');
          grad.addColorStop(0.5, 'rgba(192, 132, 252, 0.45)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.85)');
        } else {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.05)');
          grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.45)');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0.85)');
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Render code text traveling along the bezier spline
        const charSpacing = 0.022;
        const textToDraw = stream.text;

        for (let j = 0; j < textToDraw.length; j++) {
          const charT = (stream.progress + j * charSpacing) % 1.0;
          const u = 1 - charT;

          // Bezier point calculation
          const px = u * u * u * sx + 3 * u * u * charT * c1x + 3 * u * charT * charT * c2x + charT * charT * charT * ex;
          const py = u * u * u * sy + 3 * u * u * charT * c1y + 3 * u * charT * charT * c2y + charT * charT * charT * ey;

          // Alpha fade in/out near ends
          let alpha = Math.sin(charT * Math.PI) * stream.opacity;
          if (isInward && charT > 0.85) alpha *= (1 - (charT - 0.85) / 0.15); // Absorption fade

          if (alpha > 0.05) {
            ctx.fillStyle = stream.color === 'cyan' ? `rgba(167, 243, 208, ${alpha})` : `rgba(244, 114, 182, ${alpha})`;
            ctx.shadowColor = stream.color === 'cyan' ? '#50E3C2' : '#C084FC';
            ctx.shadowBlur = 8;
            ctx.fillText(textToDraw[j], px, py);
          }
        }
        ctx.shadowBlur = 0;
      });
    }
  }

  // Export
  window.CyberBrainPortal = CyberBrainPortal;

})(window);
