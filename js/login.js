/**
 * STF GROUP · Interactive Pull-String Lamp Login
 * Physics, Conical Light Toggling & Session Initialization
 */

let isLampOn = false;
let isDragging = false;
let startY = 0;
let pullDistance = 0;
const MAX_PULL = 32;

// Synthesized mechanical click sound via Web Audio API (tactile feedback)
function playLampClickSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Primary sharp contact click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);

    // Subtle metallic spring reverberation
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.07);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.015);
    osc2.stop(ctx.currentTime + 0.075);
  } catch (e) {
    // Audio context may require prior user interaction
  }
}

// Toggle lamp state
function toggleLampState() {
  isLampOn = !isLampOn;
  playLampClickSound();

  const body = document.body;
  const pullWrapper = document.getElementById('pullString');

  // Trigger bounce animation on the pull cord
  if (pullWrapper) {
    pullWrapper.classList.remove('is-pulling');
    pullWrapper.classList.add('spring-bounce');
    setTimeout(() => {
      pullWrapper.classList.remove('spring-bounce');
    }, 600);
  }

  if (isLampOn) {
    body.classList.add('lamp-on');
    if (window.LightTunnelEngine && typeof window.LightTunnelEngine.start === 'function') {
      window.LightTunnelEngine.start();
    }
  } else {
    body.classList.remove('lamp-on');
    if (window.LightTunnelEngine && typeof window.LightTunnelEngine.stop === 'function') {
      window.LightTunnelEngine.stop();
    }
  }
  window.isLampOn = isLampOn;
}

// Setup string mouse and touch drag interactions
function initPullString() {
  const pullWrapper = document.getElementById('pullString');
  const cordLine = document.getElementById('pullCordLine');
  const handle = document.getElementById('pullHandle');
  if (!pullWrapper) return;

  // Single click trigger
  pullWrapper.addEventListener('click', (e) => {
    if (pullDistance < 5) {
      toggleLampState();
    }
  });

  // Mouse Drag Physics
  pullWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    pullDistance = 0;
    pullWrapper.classList.add('is-pulling');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = Math.max(0, e.clientY - startY);
    pullDistance = Math.min(deltaY, MAX_PULL);

    if (cordLine) cordLine.style.height = `${68 + pullDistance}px`;
    if (handle) handle.style.transform = `translateY(${pullDistance}px) scale(1.08)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    
    if (pullDistance >= 12) {
      toggleLampState();
    }

    if (cordLine) cordLine.style.height = '';
    if (handle) handle.style.transform = '';
    pullWrapper.classList.remove('is-pulling');
  });

  // Touch Drag Support for Mobile
  pullWrapper.addEventListener('touchstart', (e) => {
    isDragging = true;
    startY = e.touches[0].clientY;
    pullDistance = 0;
    pullWrapper.classList.add('is-pulling');
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaY = Math.max(0, e.touches[0].clientY - startY);
    pullDistance = Math.min(deltaY, MAX_PULL);

    if (cordLine) cordLine.style.height = `${68 + pullDistance}px`;
    if (handle) handle.style.transform = `translateY(${pullDistance}px) scale(1.08)`;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    if (pullDistance >= 12) {
      toggleLampState();
    }
    if (cordLine) cordLine.style.height = '';
    if (handle) handle.style.transform = '';
    pullWrapper.classList.remove('is-pulling');
  });
}

// Toggle password visibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';

  const icon = btn.querySelector('i') || btn.querySelector('svg');
  if (icon) {
    icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
    if (window.lucide) lucide.createIcons();
  }
}

// Base de Datos Oficial de Usuarios y Credenciales Autorizadas (Sincronizada con Google Sheets Hoja 'Usuarios')
// Columna 1: ID (Contraseña de logueo)
// Columna 2: Usuario_Logueo (Nombres de ingreso)
// Columna 3: Rol (desarrollador | Admin)
// Columna 4: Correo
const STF_USERS_CREDENTIALS = [
  {
    id: "dev_jg",
    idPassword: "1073524622",
    username: "jose@guzman",
    role: "desarrollador",
    name: "Jose Guzman",
    email: "joseoneiber711@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_jd",
    idPassword: "1107047649",
    username: "juan@david",
    role: "desarrollador",
    name: "Juan David",
    email: "",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_ee",
    idPassword: "1111",
    username: "esteban@escobar",
    role: "desarrollador",
    name: "Esteban Escobar",
    email: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_mocho",
    idPassword: "1010159672",
    username: "jhon@eyder",
    role: "desarrollador",
    name: "Jhon Eyder",
    email: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_ediaz",
    idPassword: "Admin",
    username: "ediaz",
    role: "Admin",
    name: "Edwin Diaz",
    email: "edwin.diaz@studiof.com.co",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
  }
];

const DEVELOPERS_PRESETS = STF_USERS_CREDENTIALS;

function selectDevPreset(devId) {
  const user = STF_USERS_CREDENTIALS.find(u => u.id === devId);
  if (!user) return;

  const userInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  // Columna 2: Usuario de logueo
  if (userInput) userInput.value = user.username;
  // Columna 1: ID / Contraseña
  if (passInput) passInput.value = user.idPassword;

  showLoginToast(`Credenciales cargadas: ${user.name} (${user.username}) · Rol: ${user.role}`);
}

// Form Submission & Redirect with Columna 2 & Columna 3 Anchoring
function handleLoginSubmit(e) {
  e.preventDefault();

  const enteredUser = (document.getElementById('loginEmail')?.value || '').trim();
  const enteredPass = (document.getElementById('loginPassword')?.value || '').trim();
  const btn = document.getElementById('btnSignIn');

  if (!enteredUser || !enteredPass) {
    showLoginToast('Por favor completa todos los campos');
    return;
  }

  // 1. Validar Usuario (Columna 2 de Google Sheets o Correo en Columna 4)
  const normalizedUser = enteredUser.toLowerCase();
  const matchedUser = STF_USERS_CREDENTIALS.find(u => 
    u.username.toLowerCase() === normalizedUser || 
    (u.email && u.email.toLowerCase() === normalizedUser) ||
    u.id.toLowerCase() === normalizedUser
  );

  if (!matchedUser) {
    showLoginToast('⚠️ Usuario no encontrado. Verifica el usuario ingresado (Columna 2)');
    return;
  }

  // 2. Validar ID / Contraseña (Columna 1 de Google Sheets)
  if (String(matchedUser.idPassword).trim() !== enteredPass) {
    showLoginToast('🔒 Contraseña / ID incorrecto para ' + matchedUser.name + ' (Columna 1)');
    return;
  }

  // Visual button loading state
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #FFF; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Verificando Acceso...`;
  }

  // 3. ANCLAR COLUMNA 2 (Usuario_Logueo) Y COLUMNA 3 (Rol) AL SISTEMA
  const sessionUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    username: matchedUser.username, // Columna 2
    role: matchedUser.role,         // Columna 3
    email: matchedUser.email,       // Columna 4
    idPassword: matchedUser.idPassword, // Columna 1
    avatar: matchedUser.avatar
  };

  localStorage.setItem('STF_LOGGED_USER', JSON.stringify(sessionUser));
  localStorage.setItem('STF_USER_ROLE', matchedUser.role);            // Columna 3 anclada
  localStorage.setItem('STF_LOGGED_USERNAME', matchedUser.username);  // Columna 2 anclada
  localStorage.setItem('STF_ACTIVE_DEV_ID', matchedUser.id);
  sessionStorage.setItem('STF_AUTH_SESSION', 'authenticated');

  // Registrar login en la bitácora de Google Sheets en tiempo real
  try {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz_CM987-Z3JW46oc5Vu9K394dvyyjY9fHWT5IwlXer0LMUS3Nu6eW5Pt-Y6lP89WM6/exec';
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'log_update',
        developer: matchedUser.name,
        eventType: 'LOGIN_EXITOSO',
        appName: 'Portal de Ingeniería',
        description: `Ingreso autenticado: Usuario [${matchedUser.username}] | Rol [${matchedUser.role}]`,
        version: 'v2.6'
      })
    }).catch(() => {});
  } catch (err) {
    console.warn("Could not log to Sheets bitacora:", err);
  }

  showLoginToast(`¡Bienvenido, ${matchedUser.name}! Rol: [${matchedUser.role}]. Redirigiendo...`);

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 750);
}

// Quick Google SSO Demo Login
function quickDemoLogin() {
  const btn = document.getElementById('btnGoogleSSO');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Autenticando con Google Workspace...</span>`;
  }

  const adminDemo = {
    id: 'dev_ediaz',
    name: 'Edwin Diaz',
    username: 'ediaz',
    role: 'Admin',
    email: 'edwin.diaz@studiof.com.co',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  };
  localStorage.setItem('STF_LOGGED_USER', JSON.stringify(adminDemo));
  localStorage.setItem('STF_USER_ROLE', adminDemo.role);
  localStorage.setItem('STF_LOGGED_USERNAME', adminDemo.username);
  localStorage.setItem('STF_ACTIVE_DEV_ID', adminDemo.id);
  sessionStorage.setItem('STF_AUTH_SESSION', 'authenticated');

  showLoginToast('Autenticación corporativa exitosa. Redirigiendo...');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 850);
}

function handleForgotPassword(e) {
  e.preventDefault();
  showLoginToast('Enlace de recuperación enviado a tu correo corporativo STF');
}

function showLoginToast(message) {
  const toast = document.getElementById('loginToast');
  const text = document.getElementById('loginToastMsg');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}



/* ==========================================================================
   FULLSCREEN BLURRED LIVE DEVELOPER CODE TYPING ENGINE (Screen-wide typing)
   ========================================================================== */
const LIVE_CODING_SCRIPTS = [
  {
    lang: "TYPESCRIPT",
    tokens: [
      { t: "// STF GROUP S.A. · GLOBAL ARCHITECTURE & INFRASTRUCTURE PIPELINE\n", c: "tok-comment" },
      { t: "// System: Engineering & Software Audit Hub [Production Node: STF-CALI-01]\n\n", c: "tok-comment" },
      { t: "import", c: "tok-keyword" }, { t: " { ", c: "tok-plain" },
      { t: "SecurityGateway", c: "tok-type" }, { t: ", ", c: "tok-plain" },
      { t: "DevAuthSession", c: "tok-type" }, { t: ", ", c: "tok-plain" },
      { t: "CryptographicVault", c: "tok-type" }, { t: " } ", c: "tok-plain" },
      { t: "from", c: "tok-keyword" }, { t: " '@stf/core-security';\n", c: "tok-string" },
      { t: "import", c: "tok-keyword" }, { t: " { ", c: "tok-plain" },
      { t: "MicroservicesCluster", c: "tok-type" }, { t: ", ", c: "tok-plain" },
      { t: "TelemetryPipeline", c: "tok-type" }, { t: " } ", c: "tok-plain" },
      { t: "from", c: "tok-keyword" }, { t: " '@stf/distributed-mesh';\n", c: "tok-string" },
      { t: "import", c: "tok-keyword" }, { t: " { ", c: "tok-plain" },
      { t: "StudioF_Services", c: "tok-type" }, { t: ", ", c: "tok-plain" },
      { t: "Ela_Platform", c: "tok-type" }, { t: ", ", c: "tok-plain" },
      { t: "StudioF_Man_Catalog", c: "tok-type" }, { t: " } ", c: "tok-plain" },
      { t: "from", c: "tok-keyword" }, { t: " '@stf/brand-connect';\n\n", c: "tok-string" },

      { t: "const", c: "tok-keyword" }, { t: " clusterNode = ", c: "tok-plain" },
      { t: "await", c: "tok-keyword" }, { t: " MicroservicesCluster.", c: "tok-plain" },
      { t: "initialize", c: "tok-func" }, { t: "({\n", c: "tok-plain" },
      { t: "  clusterId: ", c: "tok-plain" }, { t: "'STF-PRODUCTION-CLUSTER-LATAM'", c: "tok-string" }, { t: ",\n", c: "tok-plain" },
      { t: "  activeNodes: [", c: "tok-plain" }, { t: "'CALI_HQ_PRIMARY'", c: "tok-string" }, { t: ", ", c: "tok-plain" }, { t: "'BOGOTA_DATA_CENTER'", c: "tok-string" }, { t: "],\n", c: "tok-plain" },
      { t: "  encryption: ", c: "tok-plain" }, { t: "'AES-256-GCM-AUTHENTICATED'", c: "tok-string" }, { t: ",\n", c: "tok-plain" },
      { t: "  telemetryStream: ", c: "tok-plain" }, { t: "true", c: "tok-keyword" }, { t: ",\n", c: "tok-plain" },
      { t: "  heartbeatIntervalMs: ", c: "tok-plain" }, { t: "1200", c: "tok-number" }, { t: "\n});\n\n", c: "tok-plain" },

      { t: "export async function", c: "tok-keyword" }, { t: " ", c: "tok-plain" },
      { t: "authorizeEngineerSession", c: "tok-func" }, { t: "(", c: "tok-plain" },
      { t: "session: DevAuthSession", c: "tok-type" }, { t: "): ", c: "tok-plain" },
      { t: "Promise<AuthGrant>", c: "tok-type" }, { t: " {\n", c: "tok-plain" },
      { t: "  const", c: "tok-keyword" }, { t: " telemetry = ", c: "tok-plain" },
      { t: "await", c: "tok-keyword" }, { t: " TelemetryPipeline.", c: "tok-plain" },
      { t: "captureRealtimeMetrics", c: "tok-func" }, { t: "();\n", c: "tok-plain" },
      { t: "  const", c: "tok-keyword" }, { t: " verification = ", c: "tok-plain" },
      { t: "await", c: "tok-keyword" }, { t: " SecurityGateway.", c: "tok-plain" },
      { t: "validateBearerSignature", c: "tok-func" }, { t: "(session.bearerToken);\n\n", c: "tok-plain" },

      { t: "  if", c: "tok-keyword" }, { t: " (!verification.isCertified) {\n", c: "tok-plain" },
      { t: "    throw new", c: "tok-keyword" }, { t: " ", c: "tok-plain" },
      { t: "SecurityAccessViolation", c: "tok-type" }, { t: "(", c: "tok-plain" }, { t: "'ERR_UNAUTHORIZED_AUDIT_ACCESS'", c: "tok-string" }, { t: ");\n  }\n\n", c: "tok-plain" },

      { t: "  // Parallel sync of multi-brand production endpoints\n", c: "tok-comment" },
      { t: "  const", c: "tok-keyword" }, { t: " [studioF, ela, man] = ", c: "tok-plain" },
      { t: "await", c: "tok-keyword" }, { t: " Promise.", c: "tok-plain" },
      { t: "all", c: "tok-func" }, { t: "([\n", c: "tok-plain" },
      { t: "    StudioF_Services.", c: "tok-plain" }, { t: "verifyCatalogSync", c: "tok-func" }, { t: "(),\n", c: "tok-plain" },
      { t: "    Ela_Platform.", c: "tok-plain" }, { t: "checkNodeClusterHealth", c: "tok-func" }, { t: "(),\n", c: "tok-plain" },
      { t: "    StudioF_Man_Catalog.", c: "tok-plain" }, { t: "inspectInventoryEndpoints", c: "tok-func" }, { t: "()\n  ]);\n\n", c: "tok-plain" },

      { t: "  return", c: "tok-keyword" }, { t: " {\n", c: "tok-plain" },
      { t: "    statusCode: ", c: "tok-plain" }, { t: "200", c: "tok-number" }, { t: ",\n", c: "tok-plain" },
      { t: "    engineer: session.developerId,\n", c: "tok-plain" },
      { t: "    clusterLatency: ", c: "tok-plain" }, { t: "'3.8ms'", c: "tok-string" }, { t: ",\n", c: "tok-plain" },
      { t: "    platformsCertified: ", c: "tok-plain" }, { t: "true", c: "tok-keyword" }, { t: ",\n", c: "tok-plain" },
      { t: "    accessGrantedAt: ", c: "tok-plain" }, { t: "new", c: "tok-keyword" }, { t: " ", c: "tok-plain" }, { t: "Date", c: "tok-type" }, { t: "().", c: "tok-plain" }, { t: "toISOString", c: "tok-func" }, { t: "()\n  };\n}", c: "tok-plain" }
    ]
  },
  {
    lang: "POSTGRESQL",
    tokens: [
      { t: "-- ==========================================================================\n", c: "tok-comment" },
      { t: "-- STF GROUP // Production Systems QA & Compliance Data Pipeline\n", c: "tok-comment" },
      { t: "-- ==========================================================================\n\n", c: "tok-comment" },
      { t: "SELECT", c: "tok-keyword" }, { t: "\n  d.deployment_id,\n  d.developer_name,\n  d.module_service,\n  d.test_coverage_pct,\n  d.security_audit_status,\n  d.deployed_at,\n  COUNT(t.task_id) AS verified_tasks\n", c: "tok-plain" },
      { t: "FROM", c: "tok-keyword" }, { t: " stf_engineering.production_deployments d\n", c: "tok-type" },
      { t: "INNER JOIN", c: "tok-keyword" }, { t: " stf_engineering.audit_tasks t ", c: "tok-plain" },
      { t: "ON", c: "tok-keyword" }, { t: " d.deployment_id = t.deployment_id\n", c: "tok-plain" },
      { t: "WHERE", c: "tok-keyword" }, { t: " d.deployment_environment = ", c: "tok-plain" }, { t: "'PRODUCTION_LIVE'\n", c: "tok-string" },
      { t: "  AND", c: "tok-keyword" }, { t: " d.security_audit_status = ", c: "tok-plain" }, { t: "'CERTIFIED_SECURE'\n", c: "tok-string" },
      { t: "GROUP BY", c: "tok-keyword" }, { t: " d.deployment_id, d.developer_name, d.module_service, d.test_coverage_pct, d.security_audit_status, d.deployed_at\n", c: "tok-plain" },
      { t: "HAVING", c: "tok-keyword" }, { t: " d.test_coverage_pct >= ", c: "tok-plain" }, { t: "92.5\n", c: "tok-number" },
      { t: "ORDER BY", c: "tok-keyword" }, { t: " d.deployed_at ", c: "tok-plain" },
      { t: "DESC", c: "tok-keyword" }, { t: "\n", c: "tok-plain" },
      { t: "LIMIT", c: "tok-keyword" }, { t: " ", c: "tok-plain" }, { t: "12", c: "tok-number" }, { t: ";\n", c: "tok-plain" }
    ]
  }
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



let resumeCoding = null;
let pauseCoding = null;

function initLiveDeveloperCoder() {
  const codeEl = document.getElementById('fullscreenLiveCode');
  const container = document.getElementById('fullscreenCodeBackdrop');
  if (!codeEl) return;

  let scriptIdx = 0;
  let tokenIdx = 0;
  let charInToken = 0;
  let isBackspacing = false;
  let codingTimer = null;

  function renderCurrentState() {
    const script = LIVE_CODING_SCRIPTS[scriptIdx];

    let html = '';
    for (let i = 0; i < tokenIdx; i++) {
      const tok = script.tokens[i];
      html += `<span class="${tok.c}">${escapeHtml(tok.t)}</span>`;
    }

    if (tokenIdx < script.tokens.length) {
      const curTok = script.tokens[tokenIdx];
      const typedSlice = curTok.t.slice(0, charInToken);
      html += `<span class="${curTok.c}">${escapeHtml(typedSlice)}</span>`;
    }

    codeEl.innerHTML = html;

    // Smooth auto-scroll to keep current typing in view
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  function tick() {
    if (!isLampOn) return;

    const script = LIVE_CODING_SCRIPTS[scriptIdx];

    if (!isBackspacing) {
      if (tokenIdx < script.tokens.length) {
        const curTok = script.tokens[tokenIdx];
        charInToken++;

        if (charInToken > curTok.t.length) {
          tokenIdx++;
          charInToken = 0;
        }

        renderCurrentState();

        let delay = 18 + Math.random() * 20;
        if (curTok.t[charInToken - 1] === '\n') delay = 110;
        else if (curTok.t[charInToken - 1] === ' ') delay = 12;

        codingTimer = setTimeout(tick, delay);
      } else {
        // Pause 6 seconds when full script is written
        codingTimer = setTimeout(() => {
          isBackspacing = true;
          tick();
        }, 6000);
      }
    } else {
      if (charInToken > 0) {
        charInToken -= Math.min(charInToken, 6);
      } else if (tokenIdx > 0) {
        tokenIdx--;
        charInToken = script.tokens[tokenIdx].t.length;
      } else {
        isBackspacing = false;
        scriptIdx = (scriptIdx + 1) % LIVE_CODING_SCRIPTS.length;
        tokenIdx = 0;
        charInToken = 0;
        codingTimer = setTimeout(tick, 700);
        return;
      }

      renderCurrentState();
      codingTimer = setTimeout(tick, 10);
    }
  }

  resumeCoding = function() {
    if (codingTimer) clearTimeout(codingTimer);
    tick();
  };

  pauseCoding = function() {
    if (codingTimer) {
      clearTimeout(codingTimer);
      codingTimer = null;
    }
  };

  // Only start typing if lamp is already on; otherwise wait until user pulls the cord!
  if (isLampOn) {
    tick();
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  initPullString();

  const form = document.getElementById('loginForm');
  if (form) form.addEventListener('submit', handleLoginSubmit);

  // Keyboard shortcut to toggle lamp
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement.tagName !== 'INPUT') {
        toggleLampState();
      }
    }
  });
});
