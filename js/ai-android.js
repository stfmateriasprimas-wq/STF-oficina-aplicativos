/**
 * STF GROUP · Procedural 3D Neural AI Android Engine
 * Real-time generative canvas: wireframe constellation, synaptic action potentials,
 * starburst flares, and undulating fiber-optic neural cables.
 * Matches user reference: Glowing cyan/purple 3D head with flowing data streams.
 */

(function(window) {
  'use strict';

  class AIAndroidEngine {
    constructor(canvasId, containerId) {
      this.canvas = document.getElementById(canvasId);
      this.container = document.getElementById(containerId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // 3D Engine State
      this.fov = 750;
      this.scale = 1.35;
      this.centerOffsetX = 0;
      this.centerOffsetY = 0;

      // Rotations & Interpolation
      this.targetRotX = 0;
      this.targetRotY = 0;
      this.targetRotZ = 0;
      this.curRotX = 0;
      this.curRotY = 0;
      this.curRotZ = 0;

      // Mouse tracking & Idle animation
      this.lastMouseTime = Date.now();
      this.isRunning = false;
      this.animFrameId = null;
      this.startTime = Date.now();

      // Neural burst intensity (increases when user types)
      this.burstIntensity = 1.0;

      // Geometry & Graph data
      this.nodes = [];
      this.edges = [];
      this.pulses = [];
      this.dustParticles = [];
      this.cables = [];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.generateHeadGeometry();
      this.generateFiberCables();
      this.generateDustParticles();
      this.setupMouseTracking();
      this.setupFormInteractions();
    }

    resize() {
      if (!this.canvas || !this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(this.dpr, this.dpr);

      // Center the head slightly left of center of this container
      // so face is visible and cables flow across behind the login card
      this.centerOffsetX = this.width * 0.42;
      this.centerOffsetY = this.height * 0.50;

      // Adjust scale based on viewport height
      this.scale = Math.min(this.width / 520, this.height / 640) * 1.25;
    }

    /**
     * Generate 3D anatomical profile and cranial volume points
     * Matches the profile of the human AI android facing left
     */
    generateHeadGeometry() {
      this.nodes = [];

      // 1. ANATOMICAL CONTOUR POINTS (Facing Left: negative X is front, positive X is back)
      // [x, y, z, colorType, isMajorStar]
      const contourRaw = [
        // Top of skull (Cranium crown)
        [25, -175, 0, 'cyan', true],
        [-10, -170, 0, 'cyan', false],
        [-45, -155, 0, 'cyan', true],
        [-80, -135, 0, 'cyan', false],
        
        // Forehead
        [-110, -105, 0, 'cyan', true],
        [-128, -75, 0, 'cyan', false],
        [-138, -45, 0, 'cyan', true], // Brow ridge
        [-142, -25, 0, 'cyan', true],
        
        // Eye socket indentation & bridge
        [-132, -12, 0, 'cyan', false],
        [-140, -2, 0, 'cyan', false],
        
        // Nose
        [-152, 10, 0, 'cyan', false],
        [-168, 22, 0, 'cyan', true], // Nose tip
        [-148, 30, 0, 'cyan', false], // Under nose
        
        // Lips & Mouth
        [-144, 40, 0, 'cyan', false], // Upper lip
        [-152, 46, 0, 'cyan', true],
        [-136, 52, 0, 'cyan', false], // Mouth cleft
        [-146, 60, 0, 'cyan', false], // Lower lip
        [-132, 68, 0, 'cyan', false],
        
        // Chin
        [-142, 80, 0, 'cyan', true], // Chin tip
        [-124, 98, 0, 'cyan', false],
        [-98, 115, 0, 'cyan', false],
        
        // Throat & Neck front
        [-75, 138, 0, 'cyan', true],
        [-65, 172, 0, 'cyan', false],
        [-58, 210, 0, 'cyan', true],
        [-52, 248, 0, 'cyan', false],

        // Back of head (Occipital / Parietal)
        [65, -165, 0, 'purple', true],
        [105, -140, 0, 'purple', true],
        [135, -105, 0, 'purple', false],
        [152, -65, 0, 'purple', true],
        [158, -20, 0, 'purple', true],
        [150, 25, 0, 'blue', true],
        [132, 70, 0, 'blue', false],
        [100, 110, 0, 'blue', true],

        // Back of neck & spine
        [72, 145, 0, 'blue', false],
        [62, 185, 0, 'blue', true],
        [58, 230, 0, 'blue', false],
        [55, 265, 0, 'blue', true]
      ];

      // Add lateral depth contour layers (Z symmetry)
      contourRaw.forEach(([x, y, z, c, star]) => {
        this.addNode(x, y, 0, c, star, 1.0);
        // Slightly inset 3D lateral depth points
        if (Math.abs(y) < 160) {
          this.addNode(x + 12, y, 22, c, false, 0.7);
          this.addNode(x + 12, y, -22, c, false, 0.7);
          this.addNode(x + 22, y, 42, c, star && Math.random() > 0.5, 0.5);
          this.addNode(x + 22, y, -42, c, star && Math.random() > 0.5, 0.5);
        }
      });

      // 2. INTERNAL CEREBRAL CORTEX & BRAIN SYNAPSES (Vibrant Violet / Magenta Core)
      const brainNodesRaw = [
        // Frontal Lobe (Cyan to Purple)
        [-80, -90, 'cyan', true],
        [-60, -120, 'cyan', false],
        [-40, -100, 'purple', true],
        [-90, -60, 'cyan', false],
        [-65, -65, 'purple', true],
        [-45, -45, 'purple', false],
        [-85, -20, 'cyan', true],
        [-55, -15, 'purple', true],

        // Central Cortex & Thalamus Core (Bright Magenta / Purple Star cluster)
        [-15, -125, 'purple', true],
        [15, -115, 'magenta', true],
        [-10, -85, 'magenta', true],
        [20, -80, 'magenta', true],
        [-20, -50, 'purple', false],
        [10, -45, 'magenta', true],
        [40, -50, 'purple', true],
        [-10, -15, 'purple', true],
        [20, -15, 'magenta', true],
        [0, 15, 'purple', false],
        [30, 15, 'blue', true],

        // Parietal & Occipital Cortex (Cable junction, high-energy purple/blue)
        [55, -120, 'purple', true],
        [85, -95, 'purple', true],
        [65, -75, 'magenta', true],
        [105, -65, 'purple', true],
        [75, -40, 'purple', false],
        [115, -30, 'magenta', true],
        [90, -10, 'blue', true],
        [125, 0, 'blue', true],
        [70, 20, 'blue', false],
        [100, 35, 'blue', true],
        [50, 50, 'blue', false],
        [80, 70, 'blue', true],

        // Facial internal structures: Eye orbit, Cheekbone, Jaw
        [-115, -15, 'cyan', true], // Eye pupil star
        [-95, 10, 'cyan', false],
        [-110, 25, 'cyan', true],
        [-75, 30, 'cyan', false],
        [-90, 60, 'cyan', false],
        [-60, 75, 'cyan', true],
        [-35, 95, 'blue', false],
        [10, 85, 'blue', false],
        [-20, 130, 'blue', true],
        [15, 140, 'blue', false]
      ];

      brainNodesRaw.forEach(([x, y, c, star]) => {
        // Create 3D volume layers inside the head
        const zDepths = [0, 28, -28, 55, -55];
        zDepths.forEach((z, idx) => {
          const depthScale = 1 - Math.abs(z) / 120;
          const isCore = idx === 0;
          this.addNode(
            x * depthScale + (Math.random() - 0.5) * 8,
            y * depthScale + (Math.random() - 0.5) * 8,
            z + (Math.random() - 0.5) * 6,
            c,
            isCore ? star : (star && Math.random() > 0.6),
            depthScale
          );
        });
      });

      // 3. BUILD SYNAPTIC PLEXUS GRAPH (Connect nearby nodes with glowing lines)
      this.edges = [];
      const maxDist = 48; // Connection threshold
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const n1 = this.nodes[i];
          const n2 = this.nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist) {
            this.edges.push({
              n1: i,
              n2: j,
              dist: dist,
              maxDist: maxDist,
              color: n1.color === 'magenta' || n2.color === 'magenta' ? 'magenta' :
                     n1.color === 'purple' || n2.color === 'purple' ? 'purple' : 'cyan'
            });
          }
        }
      }

      // Initialize synaptic action potential sparks traveling on edges
      this.pulses = [];
      for (let p = 0; p < 24; p++) {
        this.spawnPulse();
      }
    }

    addNode(x, y, z, colorType, isStar, alphaBase) {
      this.nodes.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        x: x,
        y: y,
        z: z,
        color: colorType,
        isStar: isStar,
        alphaBase: alphaBase || 0.8,
        pulseOffset: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 2.0,
        size: isStar ? 2.8 + Math.random() * 1.6 : 1.2 + Math.random() * 1.0,
        starRadius: 8 + Math.random() * 14
      });
    }

    spawnPulse() {
      if (this.edges.length === 0) return;
      const edgeIdx = Math.floor(Math.random() * this.edges.length);
      this.pulses.push({
        edgeIdx: edgeIdx,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.018,
        color: Math.random() > 0.4 ? '#50E3C2' : '#E879F9',
        size: 2.2 + Math.random() * 1.8
      });
    }

    /**
     * Generate undulating fiber-optic neural cables streaming from the back of the head
     */
    generateFiberCables() {
      this.cables = [];
      const cableCount = 20;

      // Roots located on the occipital and parietal back curve
      for (let i = 0; i < cableCount; i++) {
        const t = i / (cableCount - 1);
        // Start Y spans from -120 to +40 (back of head)
        const startY = -115 + t * 155 + (Math.random() - 0.5) * 12;
        // Start X follows contour curve
        const startX = 75 + Math.cos((startY + 40) / 100) * 80;
        const startZ = (Math.random() - 0.5) * 70;

        // Total horizontal length reaching across the right side
        const length = 420 + Math.random() * 280;

        this.cables.push({
          startX: startX,
          startY: startY,
          startZ: startZ,
          length: length,
          speed: 0.0016 + Math.random() * 0.0014,
          freq: 0.008 + Math.random() * 0.006,
          amp1: 18 + Math.random() * 24,
          amp2: 32 + Math.random() * 36,
          phase: i * 0.45 + Math.random(),
          width: 1.0 + Math.random() * 1.4,
          colorType: i % 3 === 0 ? 'magenta' : i % 2 === 0 ? 'purple' : 'cyan',
          // Data packet traveling along cable
          packets: [
            { pos: Math.random(), speed: 0.004 + Math.random() * 0.008, size: 2.5 + Math.random() * 1.5 },
            { pos: Math.random(), speed: 0.003 + Math.random() * 0.006, size: 2.0 + Math.random() * 1.0 }
          ]
        });
      }
    }

    /**
     * Shimmering ambient particle dust cloud around head profile
     */
    generateDustParticles() {
      this.dustParticles = [];
      const count = 180;
      for (let i = 0; i < count; i++) {
        // Concentrate near head contour
        const angle = Math.random() * Math.PI * 2;
        const rad = 80 + Math.random() * 120;
        this.dustParticles.push({
          x: Math.cos(angle) * rad - 30,
          y: Math.sin(angle) * rad + 10,
          z: (Math.random() - 0.5) * 120,
          size: 0.6 + Math.random() * 1.4,
          twinkleSpeed: 1 + Math.random() * 3,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: Math.random() > 0.6 ? '#50E3C2' : '#818CF8'
        });
      }
    }

    setupMouseTracking() {
      window.addEventListener('mousemove', (e) => {
        if (!window.isLampOn) return;
        this.lastMouseTime = Date.now();

        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;

        // 3D head yaw and pitch tracking
        this.targetRotY = normX * 0.32; // Yaw left/right
        this.targetRotX = -normY * 0.22; // Pitch up/down
        this.targetRotZ = normX * 0.06;
      });
    }

    setupFormInteractions() {
      const inputs = document.querySelectorAll('.glass-form-input');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (!window.isLampOn) return;
          this.lastMouseTime = Date.now() + 6000;
          this.targetRotY = 0.24; // Turn towards login card
          this.targetRotX = 0.16; // Tilt down towards inputs
          this.triggerNeuralBurst(1.8);
        });
        input.addEventListener('input', () => {
          this.triggerNeuralBurst(2.4);
        });
      });

      const btn = document.getElementById('btnSignIn');
      if (btn) {
        btn.addEventListener('mouseenter', () => {
          if (!window.isLampOn) return;
          this.lastMouseTime = Date.now() + 4000;
          this.targetRotY = 0.28;
          this.targetRotX = 0.20;
          this.triggerNeuralBurst(2.0);
        });
      }
    }

    triggerNeuralBurst(multiplier = 2.0) {
      this.burstIntensity = Math.min(3.5, this.burstIntensity + multiplier);
      // Spawn extra speed on action potentials
      this.pulses.forEach(p => {
        p.speed = Math.min(0.04, p.speed * 1.4);
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
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
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

      // Decay burst intensity smoothly
      this.burstIntensity += (1.0 - this.burstIntensity) * 0.03;

      // Autonomous breathing & looking when mouse is idle
      if (now - this.lastMouseTime > 2000) {
        const idleCycle = time * 0.45;
        this.targetRotY = Math.sin(idleCycle) * 0.18 + Math.sin(time * 0.15) * 0.08;
        this.targetRotX = Math.cos(idleCycle * 0.7) * 0.12;
        this.targetRotZ = Math.sin(time * 0.2) * 0.04;
      }

      // Smooth 3D rotation interpolation
      this.curRotX += (this.targetRotX - this.curRotX) * 0.065;
      this.curRotY += (this.targetRotY - this.curRotY) * 0.065;
      this.curRotZ += (this.targetRotZ - this.curRotZ) * 0.065;

      // Rotate and project all nodes
      const cosX = Math.cos(this.curRotX);
      const sinX = Math.sin(this.curRotX);
      const cosY = Math.cos(this.curRotY);
      const sinY = Math.sin(this.curRotY);
      const cosZ = Math.cos(this.curRotZ);
      const sinZ = Math.sin(this.curRotZ);

      // Subtle breathing scale pulse
      const breath = 1 + Math.sin(time * 1.2) * 0.012;
      const currentScale = this.scale * breath;

      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];

        // Micro-organic organic drift per node
        const driftX = Math.sin(time * node.pulseSpeed + node.pulseOffset) * 1.5;
        const driftY = Math.cos(time * node.pulseSpeed * 0.8 + node.pulseOffset) * 1.5;

        let x = (node.baseX + driftX) * currentScale;
        let y = (node.baseY + driftY) * currentScale;
        let z = node.baseZ * currentScale;

        // Y-axis rotation (Yaw)
        let x1 = x * cosY + z * sinY;
        let z1 = -x * sinY + z * cosY;

        // X-axis rotation (Pitch)
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        // Z-axis rotation (Roll)
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        // Perspective Projection
        const pScale = this.fov / (this.fov + z2);
        node.projX = this.centerOffsetX + x3 * pScale;
        node.projY = this.centerOffsetY + y3 * pScale;
        node.projScale = pScale;
        node.depthZ = z2;
      }

      // Update action potential pulses along edges
      for (let i = 0; i < this.pulses.length; i++) {
        const pulse = this.pulses[i];
        pulse.progress += pulse.speed * this.burstIntensity;
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          pulse.edgeIdx = Math.floor(Math.random() * this.edges.length);
        }
      }

      // Update cable data packets
      this.cables.forEach(c => {
        c.packets.forEach(p => {
          p.pos += p.speed * this.burstIntensity;
          if (p.pos >= 1.0) p.pos = 0;
        });
      });
    }

    render() {
      const ctx = this.ctx;
      const time = (Date.now() - this.startTime) * 0.001;
      ctx.clearRect(0, 0, this.width, this.height);

      // Additive blending for electric glowing sci-fi hologram look
      ctx.globalCompositeOperation = 'lighter';

      // 1. RENDER UNDULATING FIBER-OPTIC CABLES STREAMING TO THE RIGHT
      this.renderFiberCables(time);

      // 2. RENDER PLEXUS SYNAPTIC CONNECTION LINES
      this.renderEdges();

      // 3. RENDER ACTION POTENTIAL ENERGY SPARKS
      this.renderPulses();

      // 4. RENDER SHIMMERING CONTOUR PARTICLE DUST
      this.renderDust(time);

      // 5. RENDER SYNAPTIC NODES & STAR FLARES
      this.renderNodes(time);

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    }

    renderFiberCables(time) {
      const ctx = this.ctx;
      const cosY = Math.cos(this.curRotY);
      const sinY = Math.sin(this.curRotY);

      this.cables.forEach((cable, idx) => {
        // Project start point from 3D head rotation
        const sx = cable.startX * this.scale;
        const sy = cable.startY * this.scale;
        const sz = cable.startZ * this.scale;

        const rotSx = sx * cosY + sz * sinY;
        const pScale = this.fov / (this.fov + (-sx * sinY + sz * cosY));
        const rootX = this.centerOffsetX + rotSx * pScale;
        const rootY = this.centerOffsetY + sy * pScale;

        // Wave equations for fluid organic undulation
        const wave1 = Math.sin(time * 2.2 + cable.phase) * cable.amp1;
        const wave2 = Math.cos(time * 1.8 + cable.phase * 1.3) * cable.amp2;
        const wave3 = Math.sin(time * 1.4 + cable.phase * 0.8) * (cable.amp2 * 1.2);

        // Spline control points
        const cp1x = rootX + cable.length * 0.28;
        const cp1y = rootY + wave1;
        const cp2x = rootX + cable.length * 0.65;
        const cp2y = rootY + wave2 + (idx - 10) * 8;
        const endX = rootX + cable.length;
        const endY = rootY + wave3 + (idx - 10) * 16;

        // Cable gradient: Cyan/Purple at root fading to electric blue
        const grad = ctx.createLinearGradient(rootX, rootY, endX, endY);
        if (cable.colorType === 'magenta') {
          grad.addColorStop(0, 'rgba(232, 121, 249, 0.75)');
          grad.addColorStop(0.35, 'rgba(192, 132, 252, 0.45)');
          grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
        } else if (cable.colorType === 'purple') {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.70)');
          grad.addColorStop(0.40, 'rgba(99, 102, 241, 0.40)');
          grad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
        } else {
          grad.addColorStop(0, 'rgba(80, 227, 194, 0.85)');
          grad.addColorStop(0.45, 'rgba(0, 180, 255, 0.45)');
          grad.addColorStop(1, 'rgba(30, 64, 175, 0.0)');
        }

        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = cable.width * (0.8 + this.burstIntensity * 0.2);
        ctx.stroke();

        // Render traveling data packets along this cable
        cable.packets.forEach(p => {
          // Bezier curve evaluation at t = p.pos
          const t = p.pos;
          const u = 1 - t;
          const px = u * u * u * rootX + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * endX;
          const py = u * u * u * rootY + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * endY;
          const alpha = Math.sin(t * Math.PI) * (0.6 + this.burstIntensity * 0.3);

          if (alpha > 0.05) {
            ctx.fillStyle = cable.colorType === 'magenta' ? `rgba(244, 114, 182, ${alpha})` : `rgba(80, 227, 194, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow aura on packet
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    }

    renderEdges() {
      const ctx = this.ctx;
      for (let i = 0; i < this.edges.length; i++) {
        const edge = this.edges[i];
        const n1 = this.nodes[edge.n1];
        const n2 = this.nodes[edge.n2];

        // Depth fog / alpha
        const avgDepth = (n1.depthZ + n2.depthZ) * 0.5;
        const depthAlpha = Math.max(0.08, 0.65 + avgDepth / 220);
        const distRatio = 1 - edge.dist / edge.maxDist;
        const alpha = distRatio * depthAlpha * 0.42 * this.burstIntensity;

        if (alpha > 0.02) {
          ctx.beginPath();
          ctx.moveTo(n1.projX, n1.projY);
          ctx.lineTo(n2.projX, n2.projY);

          if (edge.color === 'magenta') {
            ctx.strokeStyle = `rgba(232, 121, 249, ${alpha})`;
          } else if (edge.color === 'purple') {
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          } else {
            ctx.strokeStyle = `rgba(80, 227, 194, ${alpha})`;
          }

          ctx.lineWidth = 0.85 * n1.projScale;
          ctx.stroke();
        }
      }
    }

    renderPulses() {
      const ctx = this.ctx;
      for (let i = 0; i < this.pulses.length; i++) {
        const pulse = this.pulses[i];
        const edge = this.edges[pulse.edgeIdx];
        if (!edge) continue;

        const n1 = this.nodes[edge.n1];
        const n2 = this.nodes[edge.n2];

        const px = n1.projX + (n2.projX - n1.projX) * pulse.progress;
        const py = n1.projY + (n2.projY - n1.projY) * pulse.progress;
        const alpha = Math.sin(pulse.progress * Math.PI) * 0.95;

        // Bright spark
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(px, py, pulse.size * n1.projScale, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pulse.size * 0.4 * n1.projScale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    renderDust(time) {
      const ctx = this.ctx;
      const cosY = Math.cos(this.curRotY);
      const sinY = Math.sin(this.curRotY);

      this.dustParticles.forEach(p => {
        const rotX = p.x * cosY + p.z * sinY;
        const pScale = this.fov / (this.fov + (-p.x * sinY + p.z * cosY));
        const px = this.centerOffsetX + rotX * pScale * this.scale;
        const py = this.centerOffsetY + p.y * pScale * this.scale;

        const alpha = (0.3 + Math.sin(time * p.twinkleSpeed + p.twinkleOffset) * 0.25) * 0.65;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.beginPath();
        ctx.arc(px, py, p.size * pScale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    }

    renderNodes(time) {
      const ctx = this.ctx;

      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const pulse = Math.sin(time * node.pulseSpeed + node.pulseOffset);
        const depthAlpha = Math.max(0.12, 0.75 + node.depthZ / 200);

        // Determine base colors
        let r, g, b;
        if (node.color === 'magenta') {
          r = 232; g = 121; b = 249;
        } else if (node.color === 'purple') {
          r = 168; g = 85; b = 247;
        } else if (node.color === 'blue') {
          r = 59; g = 130; b = 246;
        } else {
          r = 80; g = 227; b = 194;
        }

        // 1. MAJOR SYNAPTIC STAR FLARE (Diamond spikes & multi-layer radial glow)
        if (node.isStar) {
          const starAlpha = (0.7 + pulse * 0.28) * depthAlpha * Math.min(1.0, this.burstIntensity);
          const rad = node.starRadius * node.projScale * (0.85 + pulse * 0.15) * (0.9 + this.burstIntensity * 0.2);

          // Soft radial glow aura
          const grad = ctx.createRadialGradient(node.projX, node.projY, 0, node.projX, node.projY, rad);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${starAlpha * 0.85})`);
          grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${starAlpha * 0.40})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, rad, 0, Math.PI * 2);
          ctx.fill();

          // 4-Point Diamond Flare Spikes
          const spikeLen = rad * 1.6;
          const spikeWidth = 1.8 * node.projScale;
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * 0.9})`;

          // Horizontal spike
          ctx.beginPath();
          ctx.moveTo(node.projX - spikeLen, node.projY);
          ctx.lineTo(node.projX, node.projY - spikeWidth);
          ctx.lineTo(node.projX + spikeLen, node.projY);
          ctx.lineTo(node.projX, node.projY + spikeWidth);
          ctx.closePath();
          ctx.fill();

          // Vertical spike
          ctx.beginPath();
          ctx.moveTo(node.projX, node.projY - spikeLen);
          ctx.lineTo(node.projX + spikeWidth, node.projY);
          ctx.lineTo(node.projX, node.projY + spikeLen);
          ctx.lineTo(node.projX - spikeWidth, node.projY);
          ctx.closePath();
          ctx.fill();

          // Diamond central core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, node.size * node.projScale * 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard node point
          const alpha = (0.45 + pulse * 0.2) * depthAlpha;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, node.size * node.projScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Export to window
  window.AIAndroidEngine = AIAndroidEngine;

})(window);
