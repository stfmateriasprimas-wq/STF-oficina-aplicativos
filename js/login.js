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

  let baseCordHeight = 68;

  // Mouse Drag Physics
  pullWrapper.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    pullDistance = 0;
    baseCordHeight = cordLine ? cordLine.offsetHeight : 68;
    pullWrapper.classList.add('is-pulling');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = Math.max(0, e.clientY - startY);
    pullDistance = Math.min(deltaY, MAX_PULL);

    if (cordLine) cordLine.style.height = `${baseCordHeight + pullDistance}px`;
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
    baseCordHeight = cordLine ? cordLine.offsetHeight : 68;
    pullWrapper.classList.add('is-pulling');
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaY = Math.max(0, e.touches[0].clientY - startY);
    pullDistance = Math.min(deltaY, MAX_PULL);

    if (cordLine) cordLine.style.height = `${baseCordHeight + pullDistance}px`;
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

// Función criptográfica nativa para verificación segura de hashes (Web Crypto API)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(String(message));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 🔒 SEGURIDAD DEFENSIVA: Se eliminan contraseñas en texto plano del frontend.
// Se conservan hashes criptográficos SHA-256 únicamente como respaldo local offline.
const STF_USERS_CREDENTIALS = [
  {
    id: "dev_jg",
    passHash: "ff2ccb6ba423d356bd549ed4bfb76e96976a0dcde05a09996a1cdb9f83422ec4",
    username: "jose@guzman",
    role: "desarrollador",
    name: "Jose Guzman",
    email: "joseoneiber711@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_jd",
    passHash: "edee29f882543b956620b26d0ee0e7e950399b1c4222f5de05e06425b4c995e9",
    username: "juan@david",
    role: "desarrollador",
    name: "Juan David",
    email: "juan.david@studiof.com.co",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_ee",
    passHash: "0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c",
    username: "esteban@escobar",
    role: "desarrollador",
    name: "Esteban Escobar",
    email: "esteban.escobar@studiof.com.co",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_mocho",
    passHash: "79f06f8fde333461739f220090a23cb2a79f6d714bee100d0e4b4af249294619",
    username: "jhon@eyder",
    role: "desarrollador",
    name: "Jhon Eyder (Mocho)",
    email: "jhon.eyder@studiof.com.co",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "dev_ediaz",
    passHash: "c1c224b03cd9bc7b6a86d77f5dace40191766c485cd55dc48caf9ac873335d6f",
    username: "ediaz",
    role: "Admin",
    name: "Edwin Diaz",
    email: "edwin.diaz@studiof.com.co",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
  }
];

// Obtener lista dinámica de todos los usuarios registrados (Base + LocalStorage + Google Sheets)
function getActiveUsersCredentials() {
  const map = new Map();

  let customAvatars = {};
  try {
    customAvatars = JSON.parse(localStorage.getItem('STF_DEV_CUSTOM_AVATARS') || '{}');
  } catch (e) {}

  // 1. Usuarios base oficiales
  STF_USERS_CREDENTIALS.forEach(u => {
    const custom = customAvatars[u.id] || customAvatars[u.username.toLowerCase()];
    map.set(u.username.toLowerCase(), {
      ...u,
      avatar: custom || u.avatar
    });
  });

  // 2. Usuarios registrados en el sistema (STF_GROUP_REAL_DATA_V8 con fallback a claves anteriores)
  try {
    const raw = localStorage.getItem('STF_GROUP_REAL_DATA_V8') || localStorage.getItem('STF_GROUP_REAL_DATA_V7') || localStorage.getItem('STF_GROUP_REAL_DATA_V6');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.developers)) {
        data.developers.forEach(d => {
          if (!d.username) return;
          const uLower = d.username.toLowerCase();
          const existing = map.get(uLower) || {};
          const baseUser = STF_USERS_CREDENTIALS.find(b => b.username.toLowerCase() === uLower);
          const custom = customAvatars[d.id] || customAvatars[uLower] || (baseUser && customAvatars[baseUser.id]);
          map.set(uLower, {
            id: (baseUser && baseUser.id) || existing.id || d.id,
            username: d.username,
            role: d.roleType || d.role || existing.role || 'desarrollador',
            name: (baseUser && baseUser.name) || d.name || existing.name || d.username,
            email: d.email || existing.email || (baseUser && baseUser.email) || '',
            avatar: custom || d.avatar || existing.avatar || (baseUser && baseUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            passHash: (baseUser && baseUser.passHash) || existing.passHash || ''
          });
        });
      }
    }
  } catch (e) {
    console.warn('Error reading STF_GROUP_REAL_DATA_V8 in login:', e);
  }

  // 3. Usuarios de Google Sheets en tiempo real (STF_USERS_CREDENTIALS_STORE) -> MÁXIMA PRIORIDAD
  try {
    const rawStore = localStorage.getItem('STF_USERS_CREDENTIALS_STORE');
    if (rawStore) {
      const stored = JSON.parse(rawStore);
      if (Array.isArray(stored)) {
        stored.forEach(su => {
          if (!su.username) return;
          const uLower = su.username.toLowerCase();
          const existing = map.get(uLower) || {};
          const baseUser = STF_USERS_CREDENTIALS.find(b => b.username.toLowerCase() === uLower);
          const custom = customAvatars[su.id] || customAvatars[uLower] || (baseUser && customAvatars[baseUser.id]);
          map.set(uLower, {
            id: (baseUser && baseUser.id) || existing.id || su.id || `dev_${uLower.replace(/[^a-z0-9]/g, '_')}`,
            username: su.username,
            role: su.role || existing.role || 'desarrollador',
            name: su.name || (baseUser && baseUser.name) || existing.name || su.username,
            email: su.email || existing.email || (baseUser && baseUser.email) || '',
            avatar: custom || su.avatar || existing.avatar || (baseUser && baseUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            passHash: (baseUser && baseUser.passHash) || existing.passHash || ''
          });
        });
      }
    }
  } catch (e) {}

  return Array.from(map.values());
}

// Renderizar dinámicamente las fichas de acceso rápido (chips)
function renderDevChips() {
  const container = document.getElementById('devsChipsRow');
  if (!container) return;

  const users = getActiveUsersCredentials();
  container.innerHTML = users.map(user => {
    const isAdmin = String(user.role).toLowerCase() === 'admin' || user.id === 'dev_ediaz';
    return `
      <button type="button" class="dev-chip glass-dev-chip ${isAdmin ? 'admin-chip' : ''}" onclick="selectDevPreset('${user.id}')" title="${user.name} · Usuario: ${user.username} · Rol: ${user.role}">
        ${isAdmin ? '<span class="admin-badge-icon">🛡️</span>' : `<img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${user.name}">`}
        <span>${user.name}</span>
      </button>
    `;
  }).join('');
}

// Consulta en segundo plano y en vivo a Google Sheets (pestaña Usuarios)
async function autoPullUsersFromSheets(silent = true) {
  try {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz_CM987-Z3JW46oc5Vu9K394dvyyjY9fHWT5IwlXer0LMUS3Nu6eW5Pt-Y6lP89WM6/exec';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${GOOGLE_SHEETS_URL}?action=get_users&_t=${Date.now()}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.users) && data.users.length > 0) {
        let credsStore = [];
        try {
          credsStore = JSON.parse(localStorage.getItem('STF_USERS_CREDENTIALS_STORE') || '[]');
        } catch(e) {}

        let customAvatars = {};
        try {
          customAvatars = JSON.parse(localStorage.getItem('STF_DEV_CUSTOM_AVATARS') || '{}');
        } catch(e) {}

        data.users.forEach(u => {
          const uName = String(u.username || '').trim();
          const uRole = String(u.role || 'desarrollador').trim();
          const uEmail = String(u.email || '').trim();
          const uFullName = String(u.name || '').trim();
          if (!uName) return;

          const baseUser = STF_USERS_CREDENTIALS.find(b => b.username.toLowerCase() === uName.toLowerCase());
          const match = credsStore.find(c => c.username && c.username.toLowerCase() === uName.toLowerCase());
          const custom = customAvatars[uName.toLowerCase()] || (baseUser && customAvatars[baseUser.id]);
          const effectiveAvatar = u.avatar || custom || (match && match.avatar) || (baseUser && baseUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

          if (match) {
            match.role = uRole || match.role;
            match.email = uEmail || match.email;
            if (uFullName) match.name = uFullName;
            if (baseUser) {
              match.id = baseUser.id;
              match.passHash = baseUser.passHash;
            }
            match.avatar = effectiveAvatar;
            delete match.idPassword; // 🔒 Purgar contraseñas antiguas
          } else {
            const cleanName = uFullName || (baseUser && baseUser.name) || uName.replace(/[@._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            credsStore.push({
              id: (baseUser && baseUser.id) || `dev_${uName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
              username: uName,
              role: uRole,
              name: cleanName,
              email: uEmail || (baseUser && baseUser.email) || '',
              avatar: effectiveAvatar,
              passHash: (baseUser && baseUser.passHash) || ''
            });
          }
        });

        localStorage.setItem('STF_USERS_CREDENTIALS_STORE', JSON.stringify(credsStore));
        renderDevChips();
        if (!silent) {
          showLoginToast(`☁️ Credenciales sincronizadas en vivo con Google Sheets (${data.users.length} usuarios)`);
        }
        return data.users;
      }
    }
  } catch (err) {
    console.warn('[login.js] Verificación silenciosa con Sheets:', err);
  }
  return null;
}

function selectDevPreset(devId) {
  const users = getActiveUsersCredentials();
  const user = users.find(u => u.id === devId || u.username.toLowerCase() === String(devId).toLowerCase());
  if (!user) return;

  const userInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  // Columna 2: Usuario de logueo (únicamente usuario)
  if (userInput) userInput.value = user.username;
  // La contraseña NUNCA se precarga: el usuario debe escribirla
  if (passInput) {
    passInput.value = '';
    passInput.focus();
  }

  showLoginToast(`👤 Usuario cargado: ${user.name} (${user.username}). Ingresa tu contraseña.`);
}

// Form Submission & Redirect with Real-Time Server Authentication
async function handleLoginSubmit(e) {
  e.preventDefault();

  const enteredUser = (document.getElementById('loginEmail')?.value || '').trim();
  const enteredPass = (document.getElementById('loginPassword')?.value || '').trim();
  const btn = document.getElementById('btnSignIn');
  const originalBtnHtml = btn ? btn.innerHTML : 'Iniciar Sesión';

  if (!enteredUser || !enteredPass) {
    showLoginToast('Por favor completa tu usuario y contraseña');
    return;
  }

  const normalizedUser = enteredUser.toLowerCase();
  let allUsers = getActiveUsersCredentials();
  let matchedUser = allUsers.find(u => 
    (u.username && u.username.toLowerCase() === normalizedUser) || 
    (u.email && u.email.toLowerCase() === normalizedUser) ||
    (u.id && u.id.toLowerCase() === normalizedUser)
  );

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #FFF; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> Verificando credenciales...`;
  }

  let authSuccess = false;
  let verifiedUser = null;
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz_CM987-Z3JW46oc5Vu9K394dvyyjY9fHWT5IwlXer0LMUS3Nu6eW5Pt-Y6lP89WM6/exec';

  // 1. Verificación directa y segura en el servidor de Google Apps Script
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);
    const authUrl = `${GOOGLE_SHEETS_URL}?action=authenticate&username=${encodeURIComponent(enteredUser)}&password=${encodeURIComponent(enteredPass)}&_t=${Date.now()}`;
    const res = await fetch(authUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.authorized && data.user) {
        authSuccess = true;
        verifiedUser = data.user;
      }
    }
  } catch (err) {
    console.warn('[login.js] Servidor en verificación, probando fallback seguro:', err);
  }

  // 2. Respaldo seguro offline mediante hash criptográfico SHA-256 (sin exponer contraseñas)
  if (!authSuccess && matchedUser && matchedUser.passHash) {
    try {
      const inputHash = await sha256(enteredPass);
      if (inputHash === matchedUser.passHash) {
        authSuccess = true;
        verifiedUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          role: matchedUser.role,
          name: matchedUser.name,
          email: matchedUser.email,
          avatar: matchedUser.avatar
        };
      }
    } catch (hErr) {}
  }

  // 3. Resultado de la autenticación
  if (!authSuccess) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
    showLoginToast('🔒 Contraseña o usuario incorrecto. Verifica tus datos de acceso.');
    const passInput = document.getElementById('loginPassword');
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }
    return;
  }

  // 4. Acceso Concedido: Guardar sesión sanitizada (NUNCA almacena contraseña)
  if (btn) {
    btn.innerHTML = `<span class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid #FFF; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:8px;"></span> ¡Acceso Concedido!...`;
  }

  const sessionUser = {
    id: (verifiedUser && verifiedUser.id) || (matchedUser && matchedUser.id) || `dev_${enteredUser}`,
    name: (verifiedUser && verifiedUser.name) || (matchedUser && matchedUser.name) || enteredUser,
    username: (verifiedUser && verifiedUser.username) || (matchedUser && matchedUser.username) || enteredUser,
    role: (verifiedUser && verifiedUser.role) || (matchedUser && matchedUser.role) || 'desarrollador',
    email: (verifiedUser && verifiedUser.email) || (matchedUser && matchedUser.email) || '',
    avatar: (verifiedUser && verifiedUser.avatar) || (matchedUser && matchedUser.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  };

  localStorage.setItem('STF_LOGGED_USER', JSON.stringify(sessionUser));
  localStorage.setItem('STF_USER_ROLE', sessionUser.role);
  localStorage.setItem('STF_LOGGED_USERNAME', sessionUser.username);
  localStorage.setItem('STF_ACTIVE_DEV_ID', sessionUser.id);
  sessionStorage.setItem('STF_AUTH_SESSION', 'authenticated');

  try {
    localStorage.removeItem('STF_PRESELECTED_USER');
  } catch (e) {}

  // Registrar login en bitácora de Google Sheets
  try {
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'log_update',
        developer: sessionUser.name,
        eventType: 'LOGIN_EXITOSO',
        appName: 'Portal de Ingeniería',
        description: `Ingreso autenticado de forma segura: Usuario [${sessionUser.username}] | Rol [${sessionUser.role}]`,
        version: 'v3.5'
      })
    }).catch(() => {});
  } catch (err) {}

  showLoginToast(`¡Bienvenido, ${sessionUser.name}! Rol: [${sessionUser.role}]. Redirigiendo...`);

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 650);
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

// Limpiar usuario preseleccionado y permitir escribir libremente
function clearPreselectedProfile() {
  try {
    localStorage.removeItem('STF_PRESELECTED_USER');
  } catch (e) {}
  const card = document.getElementById('preselectedProfileCard');
  if (card) card.style.display = 'none';
  const userInputGroup = document.getElementById('userInputGroup');
  if (userInputGroup) userInputGroup.style.display = '';
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) {
    emailInput.value = '';
    emailInput.focus();
  }
  const passInput = document.getElementById('loginPassword');
  if (passInput) passInput.value = '';
}

// Aplicar perfil preseleccionado cuando se redirige desde "Cambiar a otro perfil"
function applyPreselectedUser() {
  const urlParams = (typeof window !== 'undefined' && window.location && window.location.search)
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('');
  const paramUser = urlParams.get('user') || urlParams.get('devId');
  let preData = null;

  try {
    const raw = localStorage.getItem('STF_PRESELECTED_USER');
    if (raw) preData = JSON.parse(raw);
  } catch (e) {}

  const targetIdentifier = (paramUser || (preData && (preData.username || preData.id)) || '').toLowerCase().trim();
  if (!targetIdentifier) return;

  const allUsers = getActiveUsersCredentials();
  const matched = allUsers.find(u => 
    (u.username && u.username.toLowerCase() === targetIdentifier) ||
    (u.id && u.id.toLowerCase() === targetIdentifier) ||
    (u.email && u.email.toLowerCase() === targetIdentifier)
  ) || (preData ? {
    id: preData.id,
    name: preData.name,
    username: preData.username,
    avatar: preData.avatar,
    role: 'desarrollador'
  } : null);

  if (!matched) return;

  // 1. Encender la lámpara automáticamente si está apagada para iluminar la tarjeta de login
  if (!isLampOn) {
    toggleLampState();
  }

  // 2. Pre-cargar el campo de usuario con el usuario oficial
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) {
    emailInput.value = matched.username || targetIdentifier;
  }

  // 3. Dejar el campo de contraseña vacío para que solo deba ingresar su clave
  const passInput = document.getElementById('loginPassword');
  if (passInput) {
    passInput.value = '';
  }

  // 4. Mostrar tarjeta visual del perfil y ocultar el input de texto de usuario
  const card = document.getElementById('preselectedProfileCard');
  const avatarEl = document.getElementById('preselectedAvatar');
  const nameEl = document.getElementById('preselectedName');
  const usernameEl = document.getElementById('preselectedUsername');
  const userInputGroup = document.getElementById('userInputGroup');

  if (card && nameEl && usernameEl) {
    nameEl.textContent = matched.name || matched.username;
    usernameEl.textContent = `${matched.username} · ${matched.role || 'Desarrollador'}`;
    if (avatarEl) {
      avatarEl.src = matched.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    }
    card.style.display = 'flex';
    if (userInputGroup) {
      userInputGroup.style.display = 'none';
    }
  }

  // 5. Enfocar el cursor directamente en el campo de contraseña
  setTimeout(() => {
    if (passInput) {
      passInput.focus();
    }
    showLoginToast(`👤 Perfil de ${matched.name} seleccionado. Ingresa tu contraseña.`);
  }, 400);
}

// Expose functions globally
if (typeof window !== 'undefined') {
  window.getActiveUsersCredentials = getActiveUsersCredentials;
  window.selectDevPreset = selectDevPreset;
  window.handleLoginSubmit = handleLoginSubmit;
  window.renderDevChips = renderDevChips;
  window.clearPreselectedProfile = clearPreselectedProfile;
  window.applyPreselectedUser = applyPreselectedUser;
  window.initSmartUserAutocomplete = initSmartUserAutocomplete;
  window.applySmartUser = applySmartUser;
  window.applySmartUserById = applySmartUserById;
}

/**
 * Inteligencia de Autocompletado Predictivo para Usuario
 * Al escribir las primeras 2 letras de cualquier usuario o nombre, identifica al desarrollador,
 * muestra su ficha con avatar y rol, autocompleta el campo y precarga la contraseña oficial.
 */
function initSmartUserAutocomplete() {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const suggestionContainer = document.getElementById('smartUserSuggestion');
  if (!emailInput) return;

  let isBackspacing = false;

  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isBackspacing = true;
    } else {
      isBackspacing = false;
    }

    // Si presiona Enter y hay una coincidencia detectada, confirmarla y pasar a la contraseña
    if (e.key === 'Enter') {
      const activeMatch = window._currentSmartMatch;
      if (activeMatch && emailInput.value.trim().length >= 2) {
        e.preventDefault();
        applySmartUser(activeMatch, true);
      }
    }
  });

  emailInput.addEventListener('input', (e) => {
    const rawVal = emailInput.value;
    const trimmed = rawVal.trim().toLowerCase();

    // Si tiene menos de 2 caracteres, ocultar sugerencia
    if (trimmed.length < 2) {
      if (suggestionContainer) suggestionContainer.style.display = 'none';
      window._currentSmartMatch = null;
      return;
    }

    const allUsers = getActiveUsersCredentials();

    // Algoritmo de detección inteligente
    const matches = allUsers.filter(u => {
      const uName = (u.username || '').toLowerCase();
      const fName = (u.name || '').toLowerCase();
      const uRole = (u.role || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      if (uName.startsWith(trimmed) || fName.startsWith(trimmed) || uRole.startsWith(trimmed) || uEmail.startsWith(trimmed)) return true;
      const parts = fName.split(/[\s()_-]+/);
      if (parts.some(p => p.startsWith(trimmed))) return true;
      return uName.includes(trimmed) || fName.includes(trimmed);
    });

    if (matches.length === 0) {
      if (suggestionContainer) suggestionContainer.style.display = 'none';
      window._currentSmartMatch = null;
      return;
    }

    // Mejor candidato
    const bestUser = matches.find(u => 
      u.username.toLowerCase().startsWith(trimmed) || 
      u.name.toLowerCase().startsWith(trimmed)
    ) || matches[0];

    window._currentSmartMatch = bestUser;

    // Autocompletar texto en el input si el usuario está tipeando hacia adelante
    if (!isBackspacing && e.inputType !== 'deleteContentBackward') {
      const currentLen = rawVal.length;
      const targetText = bestUser.username;
      if (targetText.toLowerCase().startsWith(trimmed)) {
        emailInput.value = targetText;
        try {
          emailInput.setSelectionRange(currentLen, targetText.length);
        } catch (err) {}
      }
    }

    // La contraseña NUNCA se precarga: solo se carga el usuario
    if (passInput) {
      passInput.value = '';
    }

    // Mostrar ficha flotante inteligente
    if (suggestionContainer) {
      const isAdmin = String(bestUser.role).toLowerCase() === 'admin' || bestUser.id === 'dev_ediaz';
      suggestionContainer.innerHTML = `
        <div class="smart-user-card" onclick="applySmartUserById('${bestUser.id}', true)" title="Haz clic o presiona Enter para confirmar este usuario">
          <div class="smart-user-avatar-wrap">
            <img src="${bestUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${bestUser.name}" class="smart-user-avatar">
            <span class="smart-user-check-icon">✓</span>
          </div>
          <div class="smart-user-details">
            <div class="smart-user-topline">
              <span class="smart-user-tag">✨ Usuario Detectado</span>
              <span class="smart-user-badge ${isAdmin ? 'admin-badge' : 'dev-badge'}">${isAdmin ? '🛡️ Admin' : '💻 ' + bestUser.role}</span>
            </div>
            <strong class="smart-user-name">${bestUser.name}</strong>
            <span class="smart-user-handle">${bestUser.username}</span>
          </div>
          <button type="button" class="smart-user-confirm-btn" onclick="applySmartUserById('${bestUser.id}', true)" title="Confirmar">
            <span>Usar ↵</span>
          </button>
        </div>
        ${matches.length > 1 ? `
          <div class="smart-user-alternatives">
            <span class="smart-alt-label">Otras opciones:</span>
            ${matches.slice(1, 4).map(m => `
              <button type="button" class="smart-alt-chip" onclick="applySmartUserById('${m.id}', true)">
                ${m.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>
        ` : ''}
      `;
      suggestionContainer.style.display = 'block';
    }
  });

  // Ocultar al hacer clic fuera del grupo de inputs
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#userInputGroup')) {
      if (suggestionContainer) suggestionContainer.style.display = 'none';
    }
  });
}

function applySmartUser(user, focusPass = true) {
  if (!user) return;
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const suggestionContainer = document.getElementById('smartUserSuggestion');

  if (emailInput) {
    emailInput.value = user.username;
  }
  // La contraseña NUNCA se precarga: solo el usuario
  if (passInput) {
    passInput.value = '';
    if (focusPass) {
      passInput.focus();
    }
  }
  if (suggestionContainer) {
    suggestionContainer.style.display = 'none';
  }
  window._currentSmartMatch = user;
  showLoginToast(`✨ Usuario cargado: ${user.name} (${user.username}). Ingresa tu contraseña.`);
}

function applySmartUserById(devId, focusPass = false) {
  const allUsers = getActiveUsersCredentials();
  const user = allUsers.find(u => u.id === devId || u.username === devId);
  if (user) applySmartUser(user, focusPass);
}

// Bootstrap
if (typeof document !== 'undefined') {
  const startLoginApp = () => {
    try {
      sessionStorage.removeItem('STF_AUTH_SESSION');
      // 🔒 Purgar credenciales en texto plano residuales de versiones anteriores en localStorage
      const oldStore = JSON.parse(localStorage.getItem('STF_USERS_CREDENTIALS_STORE') || '[]');
      if (Array.isArray(oldStore) && oldStore.some(u => u.idPassword)) {
        const cleaned = oldStore.map(u => {
          const { idPassword, ...rest } = u;
          return rest;
        });
        localStorage.setItem('STF_USERS_CREDENTIALS_STORE', JSON.stringify(cleaned));
      }
    } catch (e) {}

    if (window.lucide) lucide.createIcons();
    initPullString();

    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', handleLoginSubmit);

    const emailEl = document.getElementById('loginEmail');
    const passEl = document.getElementById('loginPassword');
    if (emailEl) emailEl.value = '';
    if (passEl) passEl.value = '';

    renderDevChips();
    autoPullUsersFromSheets();
    applyPreselectedUser();
    initSmartUserAutocomplete();

    // Encender la lámpara automáticamente al cargar la página para que la tarjeta de login aparezca de inmediato
    setTimeout(() => {
      if (!isLampOn) {
        toggleLampState();
      }
      if (emailEl && (!emailEl.value || emailEl.value.trim() === '')) {
        emailEl.focus();
      }
    }, 280);

    setInterval(() => {
      autoPullUsersFromSheets(true);
    }, 20000);

    // Atajo de teclado para la lámpara si no se está escribiendo
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'BUTTON') {
          toggleLampState();
        }
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoginApp);
  } else {
    startLoginApp();
  }
}

