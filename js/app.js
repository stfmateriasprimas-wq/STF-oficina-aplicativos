/**
 * STF GROUP · Dashboard Controller & Business Logic
 * Gestiona el cálculo ponderado de fases, rendimiento de desarrolladores
 * y la experiencia visual idéntica a la maqueta de referencia.
 */

let appState = getStoredData();

// Sesión autenticada y anclaje de Columna 2 (Usuario) y Columna 3 (Rol)
const savedLoggedUserJson = localStorage.getItem('STF_LOGGED_USER');
let loggedUser = null;
if (savedLoggedUserJson) {
  try { loggedUser = JSON.parse(savedLoggedUserJson); } catch(e) {}
}

let activeSelectedDevId = (loggedUser && loggedUser.id) || localStorage.getItem('STF_ACTIVE_DEV_ID') || (appState.developers[0] && appState.developers[0].id) || 'dev_jg';
let currentEditingSysId = null;

// Chart Instances
let overviewChartInstance = null;
let velocityChartInstance = null;

// Helpers
function calculateAppProgress(app) {
  if (!app.phases || app.phases.length === 0) return 0;
  const completedWeight = app.phases.reduce((sum, phase) => {
    return phase.completed ? sum + (Number(phase.weight) || 0) : sum;
  }, 0);
  return Math.min(100, Math.round(completedWeight));
}

function calculateGlobalProgress() {
  if (appState.applications.length === 0) return 0;
  const total = appState.applications.reduce((acc, app) => acc + calculateAppProgress(app), 0);
  return (total / appState.applications.length).toFixed(1);
}

function getDeveloperById(devId) {
  return appState.developers.find(d => d.id === devId) || appState.developers[0];
}

function getApplicationById(appId) {
  return appState.applications.find(a => a.id === appId) || null;
}

function getDominantPhase() {
  // Encuentra la fase activa más común entre los aplicativos en desarrollo
  const phaseCount = {};
  appState.applications.forEach(app => {
    const activePhase = app.phases.find(p => !p.completed) || app.phases[app.phases.length - 1];
    phaseCount[activePhase.name] = (phaseCount[activePhase.name] || 0) + 1;
  });
  let maxPhase = "Frontend e Integración";
  let maxCount = 0;
  for (const [phase, count] of Object.entries(phaseCount)) {
    if (count > maxCount) {
      maxCount = count;
      maxPhase = phase;
    }
  }
  return maxPhase;
}

// ==========================================================================
// RENDERERS
// ==========================================================================

// 1. Render The Stacked Cards (Dynamic by Selected Developer)
let activeDeckApps = [];

// Paletas oficiales y armónicas para cada sistema de STF GROUP
const DECK_SYSTEM_PALETTES = {
  app_torre: {
    bg: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", // Royal Violet
    shadow: "0 12px 26px -4px rgba(124, 58, 237, 0.45)"
  },
  app_colchas: {
    bg: "linear-gradient(135deg, #FFA947 0%, #FF8D1D 100%)", // Sunset Orange
    shadow: "0 12px 26px -4px rgba(255, 141, 29, 0.45)"
  },
  app_laboratorio: {
    bg: "linear-gradient(135deg, #6B88FF 0%, #4D6DFF 100%)", // Electric Blue
    shadow: "0 12px 26px -4px rgba(77, 109, 255, 0.48)"
  },
  app_calidad: {
    bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)", // Emerald Green
    shadow: "0 12px 26px -4px rgba(16, 185, 129, 0.45)"
  },
  app_tintoreria: {
    bg: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)", // Cyan Ocean
    shadow: "0 12px 26px -4px rgba(2, 132, 199, 0.45)"
  },
  app_geo: {
    bg: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)", // Ruby Red
    shadow: "0 12px 26px -4px rgba(225, 29, 72, 0.45)"
  }
};

const DEFAULT_DECK_GRADIENTS = [
  { bg: "linear-gradient(135deg, #6B88FF 0%, #4D6DFF 100%)", shadow: "0 12px 26px -4px rgba(77, 109, 255, 0.48)" },
  { bg: "linear-gradient(135deg, #FFA947 0%, #FF8D1D 100%)", shadow: "0 12px 26px -4px rgba(255, 141, 29, 0.45)" },
  { bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)", shadow: "0 12px 26px -4px rgba(16, 185, 129, 0.45)" },
  { bg: "linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)", shadow: "0 12px 26px -4px rgba(2, 132, 199, 0.45)" },
  { bg: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)", shadow: "0 12px 26px -4px rgba(225, 29, 72, 0.45)" },
  { bg: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", shadow: "0 12px 26px -4px rgba(124, 58, 237, 0.45)" }
];

function getAppDeckPalette(app, idx) {
  if (app && DECK_SYSTEM_PALETTES[app.id]) return DECK_SYSTEM_PALETTES[app.id];
  return DEFAULT_DECK_GRADIENTS[idx % DEFAULT_DECK_GRADIENTS.length];
}

function renderStackedDeck(devId = activeSelectedDevId) {
  const deckContainer = document.getElementById('stackedDeck');
  if (!deckContainer) return;

  const currentDev = getDeveloperById(devId);
  const isDevAdmin = (currentDev && currentDev.role === 'Admin') || devId === 'dev_ediaz' || devId === 'all' || (loggedUser && loggedUser.role === 'Admin' && (!devId || devId === 'dev_ediaz' || devId === 'all'));

  let devApps = [];
  if (isDevAdmin) {
    // Para el ADMIN o Vista Global: Mostrar TODOS los 6 aplicativos de STF GROUP
    devApps = [...appState.applications];
  } else if (devId) {
    devApps = appState.applications.filter(a => a.devId === devId || (a.devIds && a.devIds.includes(devId)));
  } else {
    devApps = [...appState.applications];
  }

  if (devApps.length === 0) {
    devApps = [...appState.applications];
  }

  activeDeckApps = devApps;
  renderDeckFromList(activeDeckApps);
}

function cycleStackedDeckByAppId(appId) {
  const idx = activeDeckApps.findIndex(a => a.id === appId);
  if (idx !== -1) {
    const moved = activeDeckApps.splice(idx, 1)[0];
    activeDeckApps.unshift(moved);
    renderDeckFromList(activeDeckApps);
  }
}

function cycleStackedDeckNext(e) {
  if (e) e.stopPropagation();
  if (activeDeckApps.length <= 1) return;
  const first = activeDeckApps.shift();
  activeDeckApps.push(first);
  renderDeckFromList(activeDeckApps);
}

function cycleStackedDeckPrev(e) {
  if (e) e.stopPropagation();
  if (activeDeckApps.length <= 1) return;
  const last = activeDeckApps.pop();
  activeDeckApps.unshift(last);
  renderDeckFromList(activeDeckApps);
}

function renderDeckFromList(appsList) {
  const deckContainer = document.getElementById('stackedDeck');
  if (!deckContainer || !appsList || appsList.length === 0) return;

  const total = appsList.length;
  const app0 = appsList[0];
  const dev0 = getDeveloperById(app0.devId);
  const prog0 = calculateAppProgress(app0);

  // Background apps are appsList[1] to appsList[total - 1]
  const bgApps = appsList.slice(1);
  const bgCount = bgApps.length;

  // Staggering step so all tabs remain visible and aligned
  let step = 36;
  if (bgCount >= 5) step = 25;
  else if (bgCount === 4) step = 28;
  else if (bgCount === 3) step = 32;
  else if (bgCount === 2) step = 36;

  const activeTop = bgCount * step;
  const containerHeight = activeTop + 185;
  deckContainer.style.height = `${containerHeight}px`;

  let html = '';

  // Render background tabs from back (last) to front (first) so they stack with proper z-index
  for (let i = bgCount - 1; i >= 0; i--) {
    const bgApp = bgApps[i];
    const bgProg = calculateAppProgress(bgApp);
    const topPos = i * step;
    const zIdx = i + 1;
    const pal = getAppDeckPalette(bgApp, i);

    html += `
      <div class="deck-tab deck-tab-dynamic"
           style="top: ${topPos}px; z-index: ${zIdx}; background: ${pal.bg}; box-shadow: ${pal.shadow};"
           onclick="cycleStackedDeckByAppId('${bgApp.id}')"
           title="Clic para traer al frente: ${bgApp.name} (${bgProg}%)">
        <div class="deck-tab-header">
          <span class="deck-tab-name">${bgApp.name}</span>
          <span class="deck-tab-metric">${bgProg}%</span>
        </div>
      </div>
    `;
  }

  // Active Front Card
  const activePal = getAppDeckPalette(app0, 0);
  const activeZ = bgCount + 10;

  html += `
    <div class="deck-tab deck-tab-active" style="top: ${activeTop}px; z-index: ${activeZ};" data-app-id="${app0.id}">
      <div class="deck-tab-header" style="background: ${activePal.bg};">
        <span class="deck-tab-name">${app0.name}</span>
        <span class="deck-tab-metric">${prog0}%</span>
      </div>
      <div class="deck-card-body">
        <div class="deck-notch-wrapper">
          <div class="deck-badge-pill">
            <span>${app0.isGroupProject ? '👥 Proyecto Grupal' : 'Prioridad ' + app0.priority}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${total > 1 ? `
              <div class="deck-cycle-controls" style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; padding: 3px 8px; border-radius: 20px; border: 1px solid #E2E8F0;">
                <button type="button" class="deck-mini-arrow" onclick="cycleStackedDeckPrev(event)" title="Proyecto anterior" style="border:none; background:transparent; cursor:pointer; color:#64748B; padding:0 3px; font-size:13px; font-weight:700; line-height:1;">◀</button>
                <span style="font-size: 11px; font-weight: 750; color: #334155; letter-spacing: 0.2px;">${total} Proyectos</span>
                <button type="button" class="deck-mini-arrow" onclick="cycleStackedDeckNext(event)" title="Siguiente proyecto" style="border:none; background:transparent; cursor:pointer; color:#64748B; padding:0 3px; font-size:13px; font-weight:700; line-height:1;">▶</button>
              </div>
            ` : ''}
            <button class="deck-add-btn" onclick="openSystemDetailModal('${app0.id}')" title="Auditar fases del aplicativo">
              <i data-lucide="edit-3"></i>
            </button>
          </div>
        </div>
        
        <div class="deck-main-stat">
          <span class="deck-stat-label">Avance Real Ponderado <span class="trend-up">+14.5% mes</span></span>
          <div class="deck-stat-number">${prog0}%</div>
        </div>

        <div class="deck-footer-info">
          <div class="dev-lead-pill">
            <img src="${dev0.avatar}" alt="${dev0.name}">
            <span>${dev0.name}</span>
          </div>
          <span class="delivery-date-pill">Límite: ${formatShortDate(app0.deadline)}</span>
        </div>
      </div>
    </div>
  `;

  deckContainer.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

// 2. Render Vertical Capsule Progress Bar
function renderCapsuleProgressBar() {
  const track = document.getElementById('capsuleProgressTrack');
  const statDisplay = document.getElementById('capsuleStatDisplay');
  const dominantPhaseEl = document.getElementById('dominantPhaseStat');
  const modulesDeliveredEl = document.getElementById('modulesDeliveredStat');
  const globalAvgBadge = document.getElementById('globalAvgBadge');
  const periodLabelEl = document.getElementById('capsulePeriodLabel');
  const complianceEl = document.getElementById('complianceStat');

  if (!track) return;

  // Retrieve quarterly settings or defaults
  const goal = appState.quarterlyGoal || {
    periodName: "Q4 (Octubre - Diciembre)",
    targetPercentage: 70,
    statusCompliance: "En Tiempo (+4d)",
    deadline: "2026-12-31"
  };

  if (periodLabelEl) {
    periodLabelEl.textContent = `Periodo: ${goal.periodName}`;
  }

  if (complianceEl) {
    complianceEl.textContent = goal.statusCompliance;
    if (goal.statusCompliance.includes('-')) {
      complianceEl.className = 'pair-value text-danger';
    } else if (goal.statusCompliance.includes('Riesgo')) {
      complianceEl.className = 'pair-value text-amber';
    } else {
      complianceEl.className = 'pair-value text-green';
    }
  }

  const globalProg = parseFloat(calculateGlobalProgress());
  if (statDisplay) statDisplay.textContent = `${globalProg}% Completado`;
  if (globalAvgBadge) globalAvgBadge.textContent = `${globalProg}%`;
  if (dominantPhaseEl) dominantPhaseEl.textContent = getDominantPhase();

  // Contar módulos totales y completados
  let totalModules = 0;
  let completedModules = 0;
  appState.applications.forEach(app => {
    totalModules += app.phases.length;
    completedModules += app.phases.filter(p => p.completed).length;
  });
  if (modulesDeliveredEl) modulesDeliveredEl.textContent = `${completedModules} de ${totalModules}`;

  // Render 36 dashes
  const totalDashes = 36;
  const activeDashesCount = Math.round((globalProg / 100) * totalDashes);
  const targetPct = goal.targetPercentage || 70;
  const targetDashIndex = Math.min(totalDashes - 1, Math.max(0, Math.round((targetPct / 100) * totalDashes)));

  let html = '';
  for (let i = 0; i < totalDashes; i++) {
    let classes = 'capsule-dash';
    if (i < activeDashesCount) {
      classes += ' active';
    }
    // Milestone dash reflecting target goal
    if (i === targetDashIndex) {
      classes += ' milestone-dash';
    }
    html += `<div class="${classes}" title="Segmento ${i + 1} de ${totalDashes} · ${Math.round((i / totalDashes) * 100)}%"></div>`;
  }
  track.innerHTML = html;
}

// Quarterly Goal Modal Handlers
function openQuarterlyGoalModal() {
  const modal = document.getElementById('modalQuarterlyGoal');
  if (!modal) return;

  const goal = appState.quarterlyGoal || {
    periodName: "Q4 (Octubre - Diciembre)",
    targetPercentage: 70,
    statusCompliance: "En Tiempo (+4d)",
    deadline: "2026-12-31"
  };

  const globalProg = calculateGlobalProgress();
  let totalModules = 0;
  let completedModules = 0;
  appState.applications.forEach(app => {
    totalModules += app.phases.length;
    completedModules += app.phases.filter(p => p.completed).length;
  });

  const curProgEl = document.getElementById('modalQCurrentProgress');
  const modCountEl = document.getElementById('modalQModulesCount');
  const domPhaseEl = document.getElementById('modalQDominantPhase');
  if (curProgEl) curProgEl.textContent = `${globalProg}%`;
  if (modCountEl) modCountEl.textContent = `${completedModules} de ${totalModules}`;
  if (domPhaseEl) domPhaseEl.textContent = getDominantPhase();

  // Populate Inputs
  const periodSel = document.getElementById('inputQuarterPeriod');
  const customInput = document.getElementById('inputCustomPeriod');
  const targetInput = document.getElementById('inputTargetPercentage');
  const compInput = document.getElementById('inputComplianceStatus');
  const deadInput = document.getElementById('inputQuarterDeadline');

  if (periodSel) {
    let optionFound = false;
    for (let opt of periodSel.options) {
      if (opt.value === goal.periodName) {
        periodSel.value = goal.periodName;
        optionFound = true;
        break;
      }
    }
    if (!optionFound) {
      periodSel.value = 'custom';
      if (customInput) {
        customInput.value = goal.periodName;
        customInput.style.display = 'block';
      }
    } else {
      if (customInput) customInput.style.display = 'none';
    }
  }

  if (targetInput) targetInput.value = goal.targetPercentage || 70;
  if (compInput) compInput.value = goal.statusCompliance || "En Tiempo (+4d)";
  if (deadInput) deadInput.value = goal.deadline || "2026-12-31";

  // Populate Quick Apps Audit List
  const appsListEl = document.getElementById('modalQuarterlyAppsList');
  if (appsListEl) {
    appsListEl.innerHTML = appState.applications.map(app => {
      const prog = calculateAppProgress(app);
      const completedCount = app.phases.filter(p => p.completed).length;
      const totalPhases = app.phases.length;
      return `
        <div class="quick-app-audit-row">
          <div class="quick-app-audit-info">
            <span class="status-pill ${prog === 100 ? 'status-done' : (app.status === 'risk' ? 'status-risk' : 'status-ontime')}" style="padding: 2px 8px; font-size: 10.5px;">${prog}%</span>
            <div>
              <strong class="quick-app-audit-name">${app.name}</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${completedCount} de ${totalPhases} fases completadas</div>
            </div>
          </div>
          <div class="quick-app-audit-bar-wrap">
            <div class="quick-app-audit-bar">
              <div class="quick-app-audit-fill" style="width: ${prog}%"></div>
            </div>
            <button class="pill-btn secondary-btn" style="padding: 4px 10px; font-size: 11.5px; border-radius: 8px; display: flex; align-items: center; gap: 4px;" onclick="closeQuarterlyGoalModal(); openSystemDetailModal('${app.id}');" title="Auditar fases de ${app.name}">
              <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i>
              <span>Auditar Fases</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) lucide.createIcons();
  modal.classList.add('show');
}

function closeQuarterlyGoalModal() {
  const modal = document.getElementById('modalQuarterlyGoal');
  if (modal) modal.classList.remove('show');
}

function toggleCustomPeriodInput(val) {
  const customInput = document.getElementById('inputCustomPeriod');
  if (customInput) {
    customInput.style.display = val === 'custom' ? 'block' : 'none';
    if (val === 'custom') customInput.focus();
  }
}

function saveQuarterlyGoal() {
  const periodSel = document.getElementById('inputQuarterPeriod');
  const customInput = document.getElementById('inputCustomPeriod');
  const targetInput = document.getElementById('inputTargetPercentage');
  const compInput = document.getElementById('inputComplianceStatus');
  const deadInput = document.getElementById('inputQuarterDeadline');

  let periodName = periodSel ? periodSel.value : "Q4 (Octubre - Diciembre)";
  if (periodName === 'custom' && customInput) {
    periodName = customInput.value.trim() || 'Periodo Personalizado';
  }

  const targetPct = targetInput ? (parseInt(targetInput.value) || 70) : 70;
  const statusCompliance = compInput ? compInput.value : "En Tiempo (+4d)";
  const deadline = deadInput ? deadInput.value : "2026-12-31";

  appState.quarterlyGoal = {
    periodName,
    targetPercentage: targetPct,
    statusCompliance,
    deadline
  };

  saveData(appState);
  renderCapsuleProgressBar();

  // Sincronizar en Google Sheets
  if (window.SheetsSync) {
    window.SheetsSync.logSystemUpdate({
      eventType: 'OBJETIVO_TRIMESTRAL',
      appName: 'Portafolio General',
      description: `Meta trimestral actualizada: ${periodName} (${targetPct}%, ${statusCompliance})`,
      developer: 'Super Admin'
    });
  }

  // Sync with target metric in overview chart header if present
  const chartTargetMetric = document.getElementById('chartTargetMetric');
  if (chartTargetMetric) {
    chartTargetMetric.textContent = `${targetPct}.0%`;
  }

  closeQuarterlyGoalModal();
  showToast('Objetivo trimestral actualizado exitosamente');
}

// 3. Render Devs Interactive Team Cards Grid
function renderDevelopersSection() {
  const gridEl = document.getElementById('teamCardsGrid') || document.getElementById('devsAvatarList');
  if (!gridEl) return;

  gridEl.innerHTML = appState.developers.map(dev => {
    const isSelected = dev.id === activeSelectedDevId;
    const isDevAdmin = dev.role === 'Admin' || dev.id === 'dev_ediaz';
    const assigned = isDevAdmin 
      ? appState.applications 
      : appState.applications.filter(a => a.devId === dev.id || (a.devIds && a.devIds.includes(dev.id)));
    const assignedCount = assigned.length;
    
    // Average progress across their assigned projects
    const avgProgress = assignedCount > 0 
      ? Math.round(assigned.reduce((acc, a) => acc + calculateAppProgress(a), 0) / assignedCount)
      : 0;

    // Bar color based on progress
    let barColor = 'var(--primary-blue-gradient)';
    if (avgProgress === 100) barColor = 'var(--accent-green-gradient)';
    else if (avgProgress < 50) barColor = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';

    return `
      <div class="dev-card-interactive ${isSelected ? 'active' : ''}" onclick="selectDeveloper('${dev.id}')" title="Clic para seleccionar y auditar a ${dev.name}">
        <div class="dci-top">
          <div class="dci-avatar-wrap">
            <img src="${dev.avatar}" alt="${dev.name}" class="dci-avatar">
            <span class="dci-online-dot" title="En línea / Planta STF"></span>
          </div>
          <span class="dci-score-pill">
            <i data-lucide="zap"></i>
            <span>${dev.onTimeDelivery}% Efic.</span>
          </span>
        </div>

        <div class="dci-info">
          <strong class="dci-name">${dev.name}</strong>
          <span class="dci-role">${isDevAdmin ? '🛡️ Director TI / Admin' : dev.role}</span>
        </div>

        <div class="dci-workload">
          <div class="dci-workload-meta">
            <span class="dci-meta-label">Capacidad Asignada</span>
            <span class="dci-meta-val">${assignedCount} Sistema${assignedCount !== 1 ? 's' : ''}${isDevAdmin ? ' (Global)' : ''}</span>
          </div>
          <div class="dci-progress-track">
            <div class="dci-progress-fill" style="width: ${avgProgress}%; background: ${barColor};"></div>
          </div>
          <div class="dci-bottom-status">
            <span class="dci-avg-text">Avance prom: <strong>${avgProgress}%</strong></span>
            ${isSelected ? '<span class="dci-active-badge">● Activo</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateQuickDevStrip();
  if (window.lucide) lucide.createIcons();
}

function selectDeveloper(devId) {
  activeSelectedDevId = devId;

  // 1. Update header profile selector
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerName = document.getElementById('headerUserName');
  const headerRoleBadge = document.getElementById('headerUserRoleBadge');
  const dropdown = document.getElementById('headerDevDropdown');
  if (dropdown) dropdown.classList.remove('show');

  if (devId === 'all') {
    if (headerName) headerName.textContent = 'Vista Global';
    if (headerAvatar) headerAvatar.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop';
    if (headerRoleBadge) headerRoleBadge.innerHTML = '🌐 Portafolio General';
  } else {
    const dev = getDeveloperById(devId);
    if (headerName) headerName.textContent = dev.name;
    if (headerAvatar) headerAvatar.src = dev.avatar;
    if (headerRoleBadge) {
      if (dev.role === 'Admin') {
        headerRoleBadge.innerHTML = '<span style="color:#F5C542; font-weight:700;">🛡️ Admin</span>';
      } else {
        headerRoleBadge.innerHTML = '<span style="color:#38BDF8; font-weight:600;">👨‍💻 Desarrollador</span>';
      }
    }
  }

  // 2. Re-render developer cards grid (updates active card)
  renderDevelopersSection();

  // 3. Update Stacked Cards ("Las Etiquetas" in top left box) with THIS developer's projects!
  renderStackedDeck(devId);

  // 4. Update the Quick Dev Strip and project tags
  updateQuickDevStrip();

  // 5. Update systems table
  renderSystemsTable();

  // 6. Update Overview Spline Chart according to active developer & current period
  updateOverviewChart();
}

function updateQuickDevStrip() {
  const dev = getDeveloperById(activeSelectedDevId);
  const nameEl = document.getElementById('activeDevName');
  const roleEl = document.getElementById('activeDevRole');
  const scoreEl = document.getElementById('activeDevScore');
  const tagsContainer = document.getElementById('selectedDevProjectsTags');

  // Find all projects assigned to this developer (or all if Admin)
  const isDevAdmin = (dev && dev.role === 'Admin') || activeSelectedDevId === 'dev_ediaz' || activeSelectedDevId === 'all';
  const assigned = isDevAdmin
    ? appState.applications
    : appState.applications.filter(a => a.devId === dev.id || (a.devIds && a.devIds.includes(dev.id)));

  if (nameEl) nameEl.textContent = dev.name;
  if (roleEl) {
    if (isDevAdmin) {
      roleEl.textContent = `🛡️ Director TI / Admin · Supervisión Total (${assigned.length} Sistemas)`;
    } else {
      roleEl.textContent = `${dev.role} · ${assigned.length} Sistema${assigned.length !== 1 ? 's' : ''}`;
    }
  }
  if (scoreEl) scoreEl.textContent = `⭐ ${dev.onTimeDelivery}% Eficiencia`;

  // Render clean project tag pills
  if (tagsContainer) {
    if (assigned.length === 0) {
      tagsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 12px; font-weight: 500; padding: 4px 6px;">Sin sistemas individuales asignados.</span>';
    } else {
      tagsContainer.innerHTML = assigned.map(app => {
        const prog = calculateAppProgress(app);
        const isGroup = app.isGroupProject ? '<span class="tag-group-badge">Grupal</span>' : '';
        return `
          <div class="dev-project-tag-pill" onclick="openSystemDetailModal('${app.id}')" title="Clic para auditar fases de ${app.name}">
            <span class="tag-mini-dot" style="background-color: ${app.iconColor || 'var(--primary-blue)'};"></span>
            <span>${app.name}</span>
            ${isGroup}
            <span class="tag-prog-badge">${prog}%</span>
          </div>
        `;
      }).join('');
    }
  }

  // Bind buttons
  const btnDetail = document.getElementById('btnOpenDevDetail');
  if (btnDetail) {
    btnDetail.onclick = () => {
      if (typeof switchView === 'function') {
        switchView('developers');
      } else {
        showToast(`Ficha de ${dev.name}: ${assigned.length} sistemas activos.`);
      }
    };
  }

  const btnAddDev = document.getElementById('btnAddDeveloper');
  if (btnAddDev) {
    btnAddDev.onclick = () => {
      showToast('Formulario de registro de programador STF habilitado.');
    };
  }

  if (window.lucide) lucide.createIcons();
}

// 4. Render Systems Table
function renderSystemsTable(filterQuery = '') {
  const tbody = document.getElementById('systemsTableBody');
  if (!tbody) return;

  let filtered = appState.applications;
  if (filterQuery.trim()) {
    const q = filterQuery.toLowerCase();
    filtered = filtered.filter(app => {
      const dev = getDeveloperById(app.devId);
      return app.name.toLowerCase().includes(q) ||
             app.code.toLowerCase().includes(q) ||
             dev.name.toLowerCase().includes(q) ||
             app.category.toLowerCase().includes(q);
    });
  }

  tbody.innerHTML = filtered.map(app => {
    const dev = getDeveloperById(app.devId);
    const progress = calculateAppProgress(app);
    
    // Status text & class
    let statusClass = 'status-ontime';
    let statusText = 'En Tiempo';
    if (progress === 100) {
      statusClass = 'status-done';
      statusText = 'Desplegado';
    } else if (app.status === 'risk') {
      statusClass = 'status-risk';
      statusText = 'En Riesgo';
    } else if (app.status === 'delayed') {
      statusClass = 'status-delayed';
      statusText = 'Retrasado';
    }

    // Active phase
    const currentPhase = app.phases.find(p => !p.completed) || { name: 'Completado' };

    return `
      <tr>
        <td>
          <div class="system-title-cell">
            <div class="system-icon-box" style="background: ${app.iconColor}">
              ${app.iconInitial}
            </div>
            <div class="sys-info">
              <strong>${app.name}</strong>
              <span>${app.code} · ${app.category}</span>
            </div>
          </div>
        </td>
        <td>
          ${app.isGroupProject ? `
            <div class="dev-cell">
              <span class="status-pill status-ontime" style="font-size: 11.5px; font-weight: 700;">👥 Equipo Grupal (4 Devs)</span>
            </div>
          ` : `
            <div class="dev-cell">
              <img src="${dev.avatar}" alt="${dev.name}">
              <span>${dev.name}</span>
            </div>
          `}
        </td>
        <td>
          <span style="font-weight: 600; color: #4F5668;">${currentPhase.name}</span>
        </td>
        <td class="progress-cell">
          <div class="progress-header-text">
            <span>Avance</span>
            <span>${progress}%</span>
          </div>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width: ${progress}%"></div>
          </div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${statusText}</span>
        </td>
        <td class="text-right">
          <button class="action-row-btn" onclick="openSystemDetailModal('${app.id}')">
            Auditar Fases
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// CHARTS CONTROLLER (Overview Splines & Velocity Bars)
// ==========================================================================

let currentOverviewPeriod = '30';

function getOverviewChartData(period = currentOverviewPeriod, devId = activeSelectedDevId) {
  const isAll = !devId || devId === 'all';
  const dev = isAll ? null : getDeveloperById(devId);
  const assigned = dev ? appState.applications.filter(a => a.devId === dev.id || (a.devIds && a.devIds.includes(dev.id))) : [];
  const devAvgProgress = assigned.length > 0 
    ? Math.round(assigned.reduce((acc, a) => acc + calculateAppProgress(a), 0) / assigned.length)
    : 76;

  if (period === '30') {
    // Últimos 30 días: curva diaria/semanal de los últimos 30 días de sprint
    const labels = ['20 Sep', '26 Sep', '02 Oct', '08 Oct', '14 Oct', '19 Oct'];
    let realData, targetData, currentMetric, targetMetric;

    if (!isAll && dev) {
      currentMetric = `${devAvgProgress}%`;
      targetMetric = '70.0%';
      const startP = Math.max(25, devAvgProgress - 14);
      realData = [
        startP,
        Math.round(startP + 2.8),
        Math.round(startP + 5.5),
        Math.round(startP + 8.2),
        Math.round(startP + 11.4),
        devAvgProgress
      ];
      targetData = [61.0, 62.8, 64.6, 66.4, 68.2, 70.0];
    } else {
      currentMetric = '76.4%';
      targetMetric = '70.0%';
      realData = [64.0, 66.8, 69.5, 71.8, 74.2, 76.4];
      targetData = [61.5, 63.2, 64.9, 66.6, 68.3, 70.0];
    }

    return {
      period,
      periodTitle: 'Últimos 30 días',
      labels,
      realLabel: isAll ? 'Avance Real STF' : `Avance Real (${dev.name})`,
      targetLabel: isAll ? 'Meta Proyectada' : `Meta Proyectada (${dev.name})`,
      realData,
      targetData,
      currentMetric,
      targetMetric
    };
  } else if (period === '90') {
    // Último trimestre: 6 checkpoints quincenales cubriendo Agosto, Septiembre y Octubre
    const labels = ['01 Ago', '16 Ago', '01 Sep', '16 Sep', '01 Oct', '19 Oct'];
    let realData, targetData, currentMetric, targetMetric;

    if (!isAll && dev) {
      currentMetric = `${devAvgProgress}%`;
      targetMetric = '70.0%';
      const startP = Math.max(15, devAvgProgress - 35);
      realData = [
        startP,
        Math.round(startP + 7),
        Math.round(startP + 15),
        Math.round(startP + 22),
        Math.round(startP + 29),
        devAvgProgress
      ];
      targetData = [38.0, 44.4, 50.8, 57.2, 63.6, 70.0];
    } else {
      currentMetric = '76.4%';
      targetMetric = '70.0%';
      realData = [42.0, 48.5, 56.0, 63.5, 70.2, 76.4];
      targetData = [38.0, 44.4, 50.8, 57.2, 63.6, 70.0];
    }

    return {
      period,
      periodTitle: 'Último trimestre',
      labels,
      realLabel: isAll ? 'Avance Real STF' : `Avance Real (${dev.name})`,
      targetLabel: isAll ? 'Meta Proyectada' : `Meta Proyectada (${dev.name})`,
      realData,
      targetData,
      currentMetric,
      targetMetric
    };
  } else {
    // Año en curso: 12 meses (Enero a Diciembre de 2026)
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    let realData, targetData, currentMetric, targetMetric;

    if (!isAll && dev) {
      currentMetric = `${devAvgProgress}%`;
      targetMetric = '80.0%';
      realData = [15, 25, 38, 44, 56, 60, 68, 72, 75, devAvgProgress, 88, 96];
      targetData = [12, 20, 28, 36, 44, 52, 60, 68, 74, 80, 86, 92];
    } else {
      currentMetric = '76.4%';
      targetMetric = '80.0%';
      realData = [20, 32, 45, 50, 68, 62, 74, 76.4, 78, 84, 89, 96];
      targetData = [15, 25, 38, 48, 55, 60, 65, 70, 75, 80, 85, 90];
    }

    return {
      period,
      periodTitle: 'Año en curso',
      labels,
      realLabel: isAll ? 'Avance Real STF' : `Avance Real (${dev.name})`,
      targetLabel: isAll ? 'Meta Proyectada' : `Meta Proyectada (${dev.name})`,
      realData,
      targetData,
      currentMetric,
      targetMetric
    };
  }
}

function updateOverviewChart(period = currentOverviewPeriod) {
  currentOverviewPeriod = period;
  const ctx = document.getElementById('overviewSplineChart');
  if (!ctx) return;

  const chartData = getOverviewChartData(currentOverviewPeriod, activeSelectedDevId);

  // Sync select element if needed
  const select = document.getElementById('overviewTimeRange');
  if (select && select.value !== currentOverviewPeriod) {
    select.value = currentOverviewPeriod;
  }

  // Animate metrics change in header
  const elCurrent = document.getElementById('chartCurrentMetric');
  const elTarget = document.getElementById('chartTargetMetric');
  if (elCurrent) {
    elCurrent.textContent = chartData.currentMetric;
    elCurrent.style.transform = 'scale(1.15)';
    setTimeout(() => { if (elCurrent) elCurrent.style.transform = 'scale(1)'; }, 220);
  }
  if (elTarget) {
    elTarget.textContent = chartData.targetMetric;
    elTarget.style.transform = 'scale(1.15)';
    setTimeout(() => { if (elTarget) elTarget.style.transform = 'scale(1)'; }, 220);
  }

  // If chart exists, smoothly animate to the new data
  if (overviewChartInstance) {
    overviewChartInstance.data.labels = chartData.labels;
    overviewChartInstance.data.datasets[0].label = chartData.realLabel;
    overviewChartInstance.data.datasets[0].data = chartData.realData;
    overviewChartInstance.data.datasets[1].label = chartData.targetLabel;
    overviewChartInstance.data.datasets[1].data = chartData.targetData;
    overviewChartInstance.update();
    return;
  }

  // First time creation
  overviewChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: chartData.realLabel,
          data: chartData.realData,
          borderColor: '#4E65FF',
          backgroundColor: 'rgba(78, 101, 255, 0.05)',
          fill: true,
          borderWidth: 3.5,
          tension: 0.42,
          pointBackgroundColor: '#4E65FF',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        },
        {
          label: chartData.targetLabel,
          data: chartData.targetData,
          borderColor: '#FFA043',
          backgroundColor: 'transparent',
          borderWidth: 3,
          borderDash: [6, 6],
          tension: 0.42,
          pointBackgroundColor: '#FFA043',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 6.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#FFFFFF',
          titleColor: '#1E232E',
          bodyColor: '#4F5668',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          cornerRadius: 14,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#8E96A6', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(226, 232, 240, 0.6)',
            borderDash: [5, 5]
          },
          ticks: {
            stepSize: 25,
            callback: value => value + '%',
            color: '#8E96A6',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        }
      }
    }
  });
}

function initOverviewChart() {
  const select = document.getElementById('overviewTimeRange');
  if (select) {
    select.value = currentOverviewPeriod;
    select.onchange = (e) => {
      currentOverviewPeriod = e.target.value;
      updateOverviewChart(currentOverviewPeriod);
    };
  }

  updateOverviewChart(currentOverviewPeriod);
}

let currentVelocityPeriod = 'weeks';

function initVelocityBarChart() {
  const filterSelect = document.getElementById('velocityFilter');
  if (filterSelect) {
    filterSelect.onchange = (e) => {
      currentVelocityPeriod = e.target.value;
      updateVelocitySection(currentVelocityPeriod);
    };
  }

  updateVelocitySection(currentVelocityPeriod);
}

function updateVelocitySection(period = 'weeks') {
  const canvas = document.getElementById('velocityBarChart');
  if (!canvas) return;

  if (velocityChartInstance) {
    velocityChartInstance.destroy();
  }

  const ctx2d = canvas.getContext('2d');

  // 1. Data configuration for Weeks vs Months
  const isWeeks = period === 'weeks';

  const labels = isWeeks 
    ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']
    : ['Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'];

  const values = isWeeks 
    ? [5, 7, 6, 9, 8, 12, 7, 8]
    : [22, 28, 25, 34, 30, 38];

  const actualHours = isWeeks
    ? [38, 44, 40, 48, 45, 56, 42, 45]
    : [165, 195, 180, 245, 210, 255];

  const targetBenchmark = isWeeks ? 8 : 25;
  const targetValues = values.map(() => targetBenchmark);
  const peakIdx = isWeeks ? 5 : 5; // Sem 6 or Octubre
  const maxY = isWeeks ? 16 : 46;

  // Scale hours to fit nicely as a trend spline curve
  const maxHours = Math.max(...actualHours);
  const hoursSplineData = actualHours.map(h => (h / maxHours) * (maxY * 0.78));

  // 2. Update KPI Metric Cards & Legend
  const legendLabel = document.getElementById('velocityLegendLabel');
  if (legendLabel) {
    legendLabel.innerHTML = isWeeks 
      ? `Meta Benchmark: <strong>8 Mods / Sem</strong>`
      : `Meta Benchmark: <strong>25 Mods / Mes</strong>`;
  }

  const tasksVal = document.getElementById('vStatTasks');
  const tasksTrend = document.getElementById('vStatTasksTrend');
  const tasksSub = document.getElementById('vStatTasksSub');
  if (tasksVal) tasksVal.textContent = isWeeks ? '42 Tareas' : '177 Módulos';
  if (tasksTrend) tasksTrend.textContent = isWeeks ? '+18.4%' : '+24.2%';
  if (tasksSub) tasksSub.textContent = isWeeks ? 'acumuladas en 8 sprints' : 'entregados en últimos 6 meses';

  const recordVal = document.getElementById('vStatRecord');
  const recordLabel = document.getElementById('vStatRecordLabel');
  const recordBadgeText = document.getElementById('vStatRecordBadgeText');
  const recordSub = document.getElementById('vStatRecordSub');
  if (recordVal) recordVal.textContent = isWeeks ? 'Sem 6 · 12 Mods' : 'Octubre · 38 Mods';
  if (recordLabel) recordLabel.textContent = isWeeks ? 'Sprint Récord (Pico Máximo)' : 'Mes Récord (Pico Anual)';
  if (recordBadgeText) recordBadgeText.textContent = isWeeks ? 'Pico Histórico' : 'Pico Anual';
  if (recordSub) recordSub.textContent = isWeeks ? '150% de la meta (+4 mods de superávit)' : '152% de la meta (+13 mods sobre meta)';

  const hoursVal = document.getElementById('vStatHours');
  const hoursAvg = document.getElementById('vStatHoursAvg');
  const hoursSub = document.getElementById('vStatHoursSub');
  if (hoursVal) hoursVal.textContent = isWeeks ? '358 hrs' : '1,250 hrs';
  if (hoursAvg) hoursAvg.textContent = isWeeks ? '7.5 hrs / entrega' : '7.1 hrs / entrega';
  if (hoursSub) hoursSub.textContent = isWeeks ? '98.5% en tiempo sin bloqueos críticos' : '99.1% en tiempo sin incidencias en planta';

  // 3. Dynamic Gradients for Bars
  const normGrad = ctx2d.createLinearGradient(0, 240, 0, 40);
  normGrad.addColorStop(0, '#E0EAFF');
  normGrad.addColorStop(1, '#C7DCFE');

  const overGrad = ctx2d.createLinearGradient(0, 240, 0, 40);
  overGrad.addColorStop(0, '#D5DEFF');
  overGrad.addColorStop(1, '#A5B4FC');

  const peakGrad = ctx2d.createLinearGradient(0, 240, 0, 20);
  peakGrad.addColorStop(0, '#4E65FF');
  peakGrad.addColorStop(1, '#7C8FFF');

  const backgroundColors = values.map((val, idx) => {
    if (idx === peakIdx) return peakGrad;
    if (val >= targetBenchmark) return overGrad;
    return normGrad;
  });

  const hoverColors = values.map((val, idx) => {
    if (idx === peakIdx) return '#3B4EF0';
    if (val >= targetBenchmark) return '#818CF8';
    return '#93C5FD';
  });

  // Background capsule track data (fills the vertical space with subtle pill underlays)
  const backgroundCapsules = values.map(() => maxY);

  // 4. Custom Chart.js Plugin to draw clean numbers on top of bars and a floating pill on the peak
  const velocityBarLabelsPlugin = {
    id: 'velocityBarLabels',
    afterDatasetsDraw(chart) {
      const { ctx: c } = chart;
      const barMeta = chart.getDatasetMeta(1); // Main bar dataset is index 1
      if (!barMeta || !barMeta.data) return;

      c.save();
      barMeta.data.forEach((bar, idx) => {
        const val = values[idx];
        const isPeak = idx === peakIdx;

        if (isPeak) {
          // Draw elegant floating pill above record bar: ⭐ Récord: 12 Mods
          const text = `⭐ Récord: ${val} Mods`;
          c.font = '800 11px "Plus Jakarta Sans", sans-serif';
          const textW = c.measureText(text).width;
          const padX = 10;
          const badgeH = 22;
          const badgeX = bar.x - (textW / 2) - padX;
          const badgeY = bar.y - 30;

          // Badge pill shadow & background
          c.shadowColor = 'rgba(78, 101, 255, 0.35)';
          c.shadowBlur = 8;
          c.shadowOffsetY = 3;
          c.fillStyle = '#4E65FF';
          c.beginPath();
          if (typeof c.roundRect === 'function') {
            c.roundRect(badgeX, badgeY, textW + (padX * 2), badgeH, 11);
          } else {
            c.rect(badgeX, badgeY, textW + (padX * 2), badgeH);
          }
          c.fill();
          c.shadowColor = 'transparent';

          // Badge text
          c.fillStyle = '#FFFFFF';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(text, bar.x, badgeY + (badgeH / 2));
        } else {
          // Clean value number above bar
          c.font = '700 11.5px "Plus Jakarta Sans", sans-serif';
          c.fillStyle = val >= targetBenchmark ? '#1E293B' : '#64748B';
          c.textAlign = 'center';
          c.textBaseline = 'bottom';
          c.fillText(`${val}`, bar.x, bar.y - 6);
        }
      });
      c.restore();
    }
  };

  // 5. Build Chart Instance
  velocityChartInstance = new Chart(canvas, {
    plugins: [velocityBarLabelsPlugin],
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Capacidad de Fondo',
          data: backgroundCapsules,
          backgroundColor: 'rgba(241, 245, 250, 0.65)',
          hoverBackgroundColor: 'rgba(241, 245, 250, 0.65)',
          borderRadius: 14,
          borderSkipped: false,
          maxBarThickness: 46,
          barPercentage: 0.62,
          order: 4
        },
        {
          type: 'bar',
          label: 'Módulos Entregados',
          data: values,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverColors,
          borderRadius: 14,
          borderSkipped: false,
          maxBarThickness: 46,
          barPercentage: 0.62,
          order: 2
        },
        {
          type: 'line',
          label: 'Curva de Horas de Desarrollo',
          data: hoursSplineData,
          borderColor: 'rgba(99, 102, 241, 0.75)',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          order: 3
        },
        {
          type: 'line',
          label: isWeeks ? 'Meta Benchmark (8 Mods)' : 'Meta Benchmark (25 Mods)',
          data: targetValues,
          borderColor: '#EA580C',
          borderWidth: 2,
          borderDash: [6, 6],
          pointBackgroundColor: '#EA580C',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0,
          fill: false,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 36, // Room for floating record pill
          right: 12,
          bottom: 4,
          left: 4
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E232E',
          titleColor: '#FFFFFF',
          bodyColor: '#E2E8F0',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          filter: (item) => item.datasetIndex !== 0, // Hide background track from tooltip
          callbacks: {
            title: (items) => isWeeks ? `Sprint Oficial · ${items[0].label}` : `Mes Oficial · ${items[0].label}`,
            label: (ctx) => {
              if (ctx.datasetIndex === 1) {
                const diff = ctx.raw - targetBenchmark;
                let status = diff > 0 ? ` (+${diff} sobre meta)` : (diff === 0 ? ' (Meta exacta)' : ` (${diff} bajo meta)`);
                return `📦 Módulos Entregados: ${ctx.raw} mods${status}`;
              }
              if (ctx.datasetIndex === 2) {
                const actualH = actualHours[ctx.dataIndex];
                return `⏱️ Inversión Real: ${actualH} horas`;
              }
              if (ctx.datasetIndex === 3) {
                return `🎯 Meta Benchmark: ${ctx.raw} mods`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
            padding: 8
          }
        },
        y: {
          display: true,
          min: 0,
          max: maxY,
          ticks: {
            stepSize: isWeeks ? 4 : 10,
            color: '#8E96A6',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
            callback: value => value === 0 ? '0' : value + ' mods'
          },
          grid: {
            color: 'rgba(237, 241, 247, 0.75)',
            borderDash: [4, 4]
          }
        }
      }
    }
  });

  // 6. Render the interactive Sprint Digest Ribbon below chart
  renderVelocitySprintDigest(period, labels, values, actualHours, targetBenchmark, peakIdx);
}

function renderVelocitySprintDigest(period, labels, values, hours, benchmark, peakIdx) {
  const container = document.getElementById('velocitySprintDigest');
  if (!container) return;

  const isWeeks = period === 'weeks';
  container.style.gridTemplateColumns = isWeeks ? 'repeat(8, 1fr)' : 'repeat(6, 1fr)';

  container.innerHTML = labels.map((label, idx) => {
    const val = values[idx];
    const hr = hours[idx];
    const isPeak = idx === peakIdx;

    let badgeClass = 'under';
    let badgeText = `${Math.round((val / benchmark) * 100)}%`;

    if (isPeak) {
      badgeClass = 'peak-badge';
      badgeText = '⭐ Récord';
    } else if (val > benchmark) {
      badgeClass = 'over';
      badgeText = `+${val - benchmark} Superávit`;
    } else if (val === benchmark) {
      badgeClass = 'exact';
      badgeText = '✓ Meta';
    }

    return `
      <div class="v-digest-chip ${isPeak ? 'peak' : ''}" onclick="highlightSprintBar(${idx})" title="Clic para resaltar ${label}: ${val} mods y ${hr} hrs">
        <span class="vdc-title">${label}</span>
        <strong class="vdc-val">${val} mods</strong>
        <span class="vdc-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');
}

function highlightSprintBar(index) {
  if (!velocityChartInstance) return;

  // Highlight the chip visually
  const chips = document.querySelectorAll('.v-digest-chip');
  chips.forEach((c, idx) => {
    if (idx === index) {
      c.classList.add('active-highlight');
    } else {
      c.classList.remove('active-highlight');
    }
  });

  // Trigger Chart.js active element tooltip
  velocityChartInstance.setActiveElements([
    { datasetIndex: 1, index: index }
  ]);
  velocityChartInstance.tooltip.setActiveElements([
    { datasetIndex: 1, index: index }
  ], { x: 0, y: 0 });
  velocityChartInstance.update();
}

// ==========================================================================
// MODAL HANDLERS (Audit Phases & Real-Time Calculation)
// ==========================================================================

function openSystemDetailModal(appId) {
  const app = appState.applications.find(a => a.id === appId);
  if (!app) return;

  currentEditingSysId = appId;
  const dev = getDeveloperById(app.devId);
  const progress = calculateAppProgress(app);

  document.getElementById('modalSysCode').textContent = app.code;
  document.getElementById('modalSysTitle').textContent = app.name;
  document.getElementById('modalSysDesc').textContent = app.description || 'Sin descripción adicional.';
  if (app.isGroupProject) {
    document.getElementById('modalSysDevName').textContent = 'Jose Guzman, Juan David, Mocho, Esteban Escobar (Equipo Grupal)';
    document.getElementById('modalSysDevImg').src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop';
  } else {
    document.getElementById('modalSysDevName').textContent = dev.name;
    document.getElementById('modalSysDevImg').src = dev.avatar;
  }
  document.getElementById('modalSysDeadline').textContent = formatDate(app.deadline);
  
  // Health
  const healthEl = document.getElementById('modalSysHealth');
  healthEl.className = 'status-pill ' + (app.status === 'risk' ? 'status-risk' : (progress === 100 ? 'status-done' : 'status-ontime'));
  healthEl.textContent = app.status === 'risk' ? 'En Riesgo' : (progress === 100 ? 'Completado' : 'En Tiempo');

  // Big progress
  updateModalProgressDisplay(progress);

  // Render 6 Phases with real weight
  const phasesListEl = document.getElementById('modalPhasesList');
  phasesListEl.innerHTML = app.phases.map((phase, idx) => {
    return `
      <div class="phase-card-item">
        <div class="phase-header-line">
          <label class="phase-check-label">
            <input type="checkbox" class="phase-check-input" data-phase-idx="${idx}" ${phase.completed ? 'checked' : ''} onchange="onPhaseCheckboxToggle()">
            <div class="custom-checkbox">
              <i data-lucide="check" style="width: 14px; height: 14px;"></i>
            </div>
            <span class="phase-name">${phase.name}</span>
          </label>
          <span class="phase-weight-badge">Peso: ${phase.weight}%</span>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();

  document.getElementById('modalSystemDetail').classList.add('show');
}

function onPhaseCheckboxToggle() {
  const checkboxes = document.querySelectorAll('.phase-check-input');
  const app = appState.applications.find(a => a.id === currentEditingSysId);
  if (!app) return;

  let currentWeight = 0;
  checkboxes.forEach(cb => {
    const idx = parseInt(cb.dataset.phaseIdx);
    if (cb.checked) {
      currentWeight += app.phases[idx].weight;
    }
  });

  updateModalProgressDisplay(currentWeight);
}

function updateModalProgressDisplay(progressVal) {
  const pText = document.getElementById('modalSysProgress');
  const pFill = document.getElementById('modalSysProgressFill');
  if (pText) pText.textContent = `${progressVal}%`;
  if (pFill) pFill.style.width = `${progressVal}%`;
}

function saveSystemChanges() {
  const app = appState.applications.find(a => a.id === currentEditingSysId);
  if (!app) return;

  const checkboxes = document.querySelectorAll('.phase-check-input');
  checkboxes.forEach(cb => {
    const idx = parseInt(cb.dataset.phaseIdx);
    app.phases[idx].completed = cb.checked;
  });

  saveData(appState);
  closeSystemDetailModal();

  // Sincronizar avance de fase en Google Sheets
  if (window.SheetsSync) {
    const currentWeight = calculateAppProgress(app);
    const activePhase = app.phases.find(p => !p.completed) || app.phases[app.phases.length - 1];
    const dev = getDeveloperById(app.devId);
    const completedPhases = app.phases.filter(p => p.completed).map(p => p.name).join(', ');

    window.SheetsSync.logPhaseUpdate({
      appName: app.name,
      phaseId: activePhase ? activePhase.id : 'N/A',
      phaseName: activePhase ? activePhase.name : 'Todas Completadas',
      progress: currentWeight,
      completed: currentWeight === 100,
      developer: dev ? dev.name : 'Equipo STF',
      notes: `Fases completas: ${completedPhases || 'Ninguna'}`
    });
  }

  // Re-render everything
  renderStackedDeck();
  renderCapsuleProgressBar();
  renderSystemsTable();
  initOverviewChart();

  showToast(`¡Avance de "${app.name}" actualizado exitosamente!`);
}

function closeSystemDetailModal() {
  document.getElementById('modalSystemDetail').classList.remove('show');
  currentEditingSysId = null;
}

// ==========================================================================
// DEVELOPER SCORECARD MODAL
// ==========================================================================

function openDevScorecardModal(devId) {
  const dev = getDeveloperById(devId);
  if (!dev) return;

  document.getElementById('devModalName').textContent = dev.name;
  document.getElementById('devModalRole').textContent = `${dev.role} · STF GROUP`;
  document.getElementById('devModalImg').src = dev.avatar;

  document.getElementById('devKpiOnTime').textContent = `${dev.onTimeDelivery}%`;
  document.getElementById('devKpiQuality').textContent = `${dev.codeQuality}%`;
  document.getElementById('devKpiApps').textContent = `${dev.activeProjects.length} Apps`;
  document.getElementById('devKpiScore').textContent = dev.score;

  // Assigned apps
  const appsContainer = document.getElementById('devAssignedAppsList');
  const assigned = appState.applications.filter(a => a.devId === dev.id || (a.devIds && a.devIds.includes(dev.id)));

  if (assigned.length === 0) {
    appsContainer.innerHTML = '<p style="color: #8E96A6; font-size: 13px;">No tiene sistemas asignados actualmente.</p>';
  } else {
    appsContainer.innerHTML = assigned.map(app => {
      const prog = calculateAppProgress(app);
      return `
        <div class="dev-app-entry">
          <div>
            <strong>${app.name}</strong>
            <span>${app.code} · ${app.priority} Prioridad</span>
          </div>
          <div style="text-align: right;">
            <strong style="color: #4E65FF;">${prog}%</strong>
            <span style="display: block;">Límite: ${formatShortDate(app.deadline)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('modalDevScorecard').classList.add('show');
}

function closeDevScorecardModal() {
  document.getElementById('modalDevScorecard').classList.remove('show');
}

// ==========================================================================
// NEW PROJECT CREATION
// ==========================================================================

function openNewProjectModal() {
  const devSelect = document.getElementById('newSysDev');
  devSelect.innerHTML = appState.developers.map(d => `<option value="${d.id}">${d.name} (${d.role})</option>`).join('');
  
  // Set default deadline (1 month from now)
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  document.getElementById('newSysDeadline').value = d.toISOString().split('T')[0];

  document.getElementById('modalNewProject').classList.add('show');
}

function closeNewProjectModal() {
  document.getElementById('modalNewProject').classList.remove('show');
  document.getElementById('newProjectForm').reset();
}

function handleCreateNewProject(e) {
  e.preventDefault();

  const name = document.getElementById('newSysName').value.trim();
  const category = document.getElementById('newSysCategory').value;
  const devId = document.getElementById('newSysDev').value;
  const deadline = document.getElementById('newSysDeadline').value;
  const priority = document.getElementById('newSysPriority').value;
  const desc = document.getElementById('newSysDesc').value.trim();

  if (!name) return;

  const nextCodeNum = appState.applications.length + 1;
  const code = `STF-APP-0${nextCodeNum}`;
  const iconInitial = name.substring(0, 3).toUpperCase();

  // Create clean 6 phases clone
  const newPhases = JSON.parse(JSON.stringify(STF_DATA.standardPhases)).map(p => ({
    ...p,
    completed: p.id === 'phase_req' // start with requirements done
  }));

  const newApp = {
    id: `app_${Date.now()}`,
    code: code,
    name: name,
    category: category,
    description: desc,
    devId: devId,
    deadline: deadline,
    priority: priority,
    status: 'ontime',
    iconColor: '#4E65FF',
    iconInitial: iconInitial,
    phases: newPhases
  };

  appState.applications.unshift(newApp);

  // Link app to dev
  const dev = getDeveloperById(devId);
  if (!dev.activeProjects.includes(newApp.id)) {
    dev.activeProjects.push(newApp.id);
  }

  saveData(appState);
  closeNewProjectModal();

  // Sincronizar nuevo aplicativo en Google Sheets
  if (window.SheetsSync) {
    window.SheetsSync.logSystemUpdate({
      eventType: 'NUEVO_APLICATIVO',
      appName: name,
      description: `Aplicativo creado con código ${code}, asignado a ${dev ? dev.name : 'Equipo STF'}. Prioridad: ${priority}.`,
      developer: dev ? dev.name : 'Super Admin'
    });
  }

  // Refresh view
  renderStackedDeck();
  renderCapsuleProgressBar();
  renderSystemsTable();
  renderDevelopersSection();
  initOverviewChart();

  showToast(`¡Sistema "${name}" registrado exitosamente en STF GROUP!`);
}

// ==========================================================================
// TOAST NOTIFICATIONS & EXPORT
// ==========================================================================

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================================================
// MÓDULO OFICIAL DE REPORTE EJECUTIVO, MARCA DE AGUA Y FIRMA DIGITAL
// ==========================================================================

let reportSignaturePadInitialized = false;
let isDrawingSignature = false;
let hasDrawnSignature = false;
let currentReportSignatureDataUrl = null;

function exportExecutiveReport() {
  openExecutiveReportModal();
}

function openExecutiveReportModal() {
  const modal = document.getElementById('modalExecutiveReport');
  if (!modal) return;

  // Inicializar fechas por defecto (Últimos 30 días)
  const dateFrom = document.getElementById('repDateFrom');
  const dateTo = document.getElementById('repDateTo');
  if (dateFrom && dateTo && (!dateFrom.value || !dateTo.value)) {
    const today = getSystemReferenceDate();
    const past = new Date(today);
    past.setDate(past.getDate() - 30);
    dateTo.value = today.toISOString().split('T')[0];
    dateFrom.value = past.toISOString().split('T')[0];
  }

  // Pre-seleccionar desarrollador activo si el usuario ya filtró en el dashboard
  const devSelect = document.getElementById('repFilterDev');
  if (devSelect && activeSelectedDevId && activeSelectedDevId !== 'all') {
    devSelect.value = activeSelectedDevId;
  }

  // Inicializar canvas de firma
  initReportSignaturePad();

  // Cargar firma fija guardada en localStorage si existe
  loadSavedReportSignature();

  // Abrir modal
  modal.classList.add('show');

  // Actualizar vista previa en vivo
  updateExecutiveReportPreview();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function closeExecutiveReportModal() {
  const modal = document.getElementById('modalExecutiveReport');
  if (modal) {
    modal.classList.remove('show');
  }
}

function setReportPeriodPreset(preset) {
  // Actualizar estado activo de los chips
  document.querySelectorAll('.report-period-chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-period') === preset);
  });

  const dateFrom = document.getElementById('repDateFrom');
  const dateTo = document.getElementById('repDateTo');
  if (!dateFrom || !dateTo) return;

  const today = getSystemReferenceDate();
  const y = today.getFullYear();
  const m = today.getMonth();

  if (preset === '30d') {
    const past = new Date(today);
    past.setDate(past.getDate() - 30);
    dateFrom.value = past.toISOString().split('T')[0];
    dateTo.value = today.toISOString().split('T')[0];
  } else if (preset === 'month') {
    const startMonth = new Date(y, m, 1);
    const endMonth = new Date(y, m + 1, 0);
    dateFrom.value = startMonth.toISOString().split('T')[0];
    dateTo.value = endMonth.toISOString().split('T')[0];
  } else if (preset === 'q4') {
    dateFrom.value = `${y}-10-01`;
    dateTo.value = `${y}-12-31`;
  } else if (preset === 'all') {
    dateFrom.value = `${y}-01-01`;
    dateTo.value = `${y}-12-31`;
  }

  updateExecutiveReportPreview();
}

function onReportFilterChanged() {
  updateExecutiveReportPreview();
}

// --------------------------------------------------------------------------
// Lógica del Canvas de Firma Digital y Persistencia
// --------------------------------------------------------------------------

function initReportSignaturePad() {
  const canvas = document.getElementById('repSignatureCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  if (!reportSignaturePadInitialized) {
    reportSignaturePadInitialized = true;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function startDraw(e) {
      e.preventDefault();
      isDrawingSignature = true;
      hasDrawnSignature = true;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function draw(e) {
      if (!isDrawingSignature) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    function endDraw(e) {
      if (!isDrawingSignature) return;
      isDrawingSignature = false;
      currentReportSignatureDataUrl = canvas.toDataURL('image/png');
      updateSignatureStatusBadge(true);
      syncSignatureToDocument();
    }

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointercancel', endDraw);
  }
}

function loadSavedReportSignature() {
  const canvas = document.getElementById('repSignatureCanvas');
  if (!canvas) return;

  const saved = localStorage.getItem('STF_SAVED_SIGNATURE');
  if (saved) {
    currentReportSignatureDataUrl = saved;
    hasDrawnSignature = true;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      syncSignatureToDocument();
      updateSignatureStatusBadge(true, true);
    };
    img.src = saved;
  } else {
    updateSignatureStatusBadge(false);
  }
}

function updateSignatureStatusBadge(hasSig, isPermanent = false) {
  const badge = document.getElementById('repSigStatusBadge');
  if (!badge) return;

  if (hasSig) {
    badge.className = 'sig-status-badge badge-saved';
    badge.textContent = isPermanent ? '✓ Firma Guardada (Fija)' : '✓ Firma Capturada';
  } else {
    badge.className = 'sig-status-badge badge-empty';
    badge.textContent = 'Sin firma';
  }
}

function clearReportSignature() {
  const canvas = document.getElementById('repSignatureCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  hasDrawnSignature = false;
  currentReportSignatureDataUrl = null;
  localStorage.removeItem('STF_SAVED_SIGNATURE');
  updateSignatureStatusBadge(false);
  syncSignatureToDocument();
  showToast('Firma borrada del lienzo.');
}

function saveFixedReportSignature() {
  const canvas = document.getElementById('repSignatureCanvas');
  if (!canvas || !hasDrawnSignature) {
    showToast('Por favor dibuja tu firma antes de guardarla.');
    return;
  }
  const dataUrl = canvas.toDataURL('image/png');
  currentReportSignatureDataUrl = dataUrl;
  localStorage.setItem('STF_SAVED_SIGNATURE', dataUrl);
  updateSignatureStatusBadge(true, true);
  syncSignatureToDocument();
  showToast('Firma del jefe guardada de forma fija. Se incluirá en todos los reportes.');
}

function handleSignatureFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    const canvas = document.getElementById('repSignatureCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentReportSignatureDataUrl = canvas.toDataURL('image/png');
        hasDrawnSignature = true;
        localStorage.setItem('STF_SAVED_SIGNATURE', currentReportSignatureDataUrl);
        updateSignatureStatusBadge(true, true);
        syncSignatureToDocument();
        showToast('Firma importada y guardada fijamente.');
      };
      img.src = dataUrl;
    }
  };
  reader.readAsDataURL(file);
}

function syncSignatureToDocument() {
  const imgElem = document.getElementById('repDocSignatureImg');
  const emptyElem = document.getElementById('repDocSignatureEmpty');
  if (imgElem) {
    if (currentReportSignatureDataUrl) {
      imgElem.src = currentReportSignatureDataUrl;
      imgElem.style.display = 'block';
      if (emptyElem) emptyElem.style.display = 'none';
    } else {
      imgElem.style.display = 'none';
      if (emptyElem) emptyElem.style.display = 'block';
    }
  }
}

// --------------------------------------------------------------------------
// Generador y Controlador de Vista Previa del Reporte Ejecutivo Oficial (Hoja Única A4)
// --------------------------------------------------------------------------

function updateExecutiveReportPreview() {
  const container = document.getElementById('reportDocContent');
  if (!container) return;

  const devId = document.getElementById('repFilterDev')?.value || 'all';
  const appId = document.getElementById('repFilterApp')?.value || 'all';
  const dateFrom = document.getElementById('repDateFrom')?.value || '2026-09-20';
  const dateTo = document.getElementById('repDateTo')?.value || '2026-10-23';
  const taskScope = document.getElementById('repFilterTaskScope')?.value || 'all';
  const signerName = document.getElementById('repSignerName')?.value || 'Ing. Edwin Díaz';
  const signerRole = document.getElementById('repSignerRole')?.value || 'Director de TI & Proyectos Tecnológicos · STF GROUP S.A.';

  const selectedDevObj = devId === 'all' ? null : getDeveloperById(devId);
  const isAdminDev = selectedDevObj && (selectedDevObj.role === 'Admin' || selectedDevObj.id === 'dev_ediaz');

  // 1. Filtrar aplicativos según alcance
  let filteredApps = appState.applications.slice();
  if (appId !== 'all') {
    filteredApps = filteredApps.filter(a => a.id === appId);
  }
  if (devId !== 'all') {
    if (isAdminDev) {
      // Como Director de TI y Administrador, supervisa todo el portafolio corporativo
      filteredApps = appState.applications.slice();
    } else {
      filteredApps = filteredApps.filter(a => 
        a.devId === devId || 
        (a.devIds && a.devIds.includes(devId)) ||
        (selectedDevObj?.activeProjects && selectedDevObj.activeProjects.includes(a.id))
      );
    }
  }

  // 2. Filtrar desarrolladores según alcance
  let filteredDevs = appState.developers.slice();
  if (devId !== 'all') {
    filteredDevs = filteredDevs.filter(d => d.id === devId);
  }

  // 3. Filtrar tareas / integraciones reales
  let filteredTasks = (appState.integrations || []).slice();
  if (devId !== 'all') {
    if (isAdminDev) {
      filteredTasks = (appState.integrations || []).slice();
    } else {
      filteredTasks = filteredTasks.filter(t => t.devId === devId);
    }
  }
  if (appId !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.appId === appId);
  }
  if (taskScope === 'evaluated') {
    filteredTasks = filteredTasks.filter(t => t.status === 'evaluated');
  } else if (taskScope === 'in_progress') {
    filteredTasks = filteredTasks.filter(t => t.status === 'in_progress');
  }
  // Filtro de rango de fechas
  if (dateFrom && dateTo) {
    filteredTasks = filteredTasks.filter(t => {
      const tDeadline = t.deadline || '2026-12-31';
      const tStart = t.startDate || '2026-01-01';
      return (tDeadline >= dateFrom && tDeadline <= dateTo) || (tStart >= dateFrom && tStart <= dateTo);
    });
  }

  // 4. Cálculo Matemático de Métricas Auditables Reales
  // A. Avance Ponderado de Aplicativos
  let avgAppProgress = 0;
  if (filteredApps.length > 0) {
    const totalProg = filteredApps.reduce((acc, a) => acc + calculateAppProgress(a), 0);
    avgAppProgress = Math.round(totalProg / filteredApps.length);
  } else {
    avgAppProgress = calculateGlobalProgress();
  }

  // B. Efectividad y Cumplimiento de Plazos (SLA)
  let slaScore = 95;
  if (filteredDevs.length > 0) {
    const sumSLA = filteredDevs.reduce((acc, d) => acc + (d.onTimeDelivery || 94), 0);
    slaScore = Math.round(sumSLA / filteredDevs.length);
  }
  const evaluatedTasks = filteredTasks.filter(t => t.status === 'evaluated');
  if (evaluatedTasks.length > 0) {
    const onTimeCount = evaluatedTasks.filter(t => t.evaluation && t.evaluation.onTime).length;
    const taskSLA = Math.round((onTimeCount / evaluatedTasks.length) * 100);
    slaScore = Math.round((slaScore * 0.4) + (taskSLA * 0.6));
  }

  // C. Calidad de Código & Auditoría Técnica
  let qaScore = 94;
  if (filteredDevs.length > 0) {
    const sumQA = filteredDevs.reduce((acc, d) => acc + (d.codeQuality || 93), 0);
    qaScore = Math.round(sumQA / filteredDevs.length);
  }
  if (evaluatedTasks.length > 0) {
    const sumEval = evaluatedTasks.reduce((acc, t) => acc + (t.evaluation?.qualityScore || 95), 0);
    const avgEval = Math.round(sumEval / evaluatedTasks.length);
    qaScore = Math.round((qaScore * 0.4) + (avgEval * 0.6));
  }

  // D. Conteo de tareas auditadas vs en ejecución
  const completedTasksCount = filteredTasks.filter(t => t.status === 'evaluated').length;
  const inProgressTasksCount = filteredTasks.filter(t => t.status === 'in_progress').length;

  // Formato de Textos de Alcance y Metadatos
  let devScopeText = 'Portafolio General (Equipo de Desarrollo)';
  if (selectedDevObj) {
    devScopeText = isAdminDev 
      ? `${selectedDevObj.name} (Director de TI · Supervisión Global)`
      : `${selectedDevObj.name} (${selectedDevObj.role})`;
  }

  const selectedAppObj = appId === 'all' ? null : getApplicationById(appId);
  let appScopeText = `Portafolio Completo (${filteredApps.length} Sistemas Activos)`;
  if (selectedAppObj) {
    appScopeText = `[${selectedAppObj.code}] ${selectedAppObj.name}`;
  }

  const dateFormattedFrom = formatDate(dateFrom);
  const dateFormattedTo = formatDate(dateTo);
  const now = getSystemReferenceDate();
  const todayFormatted = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const folioCode = `STF-REP-2026-${String(Math.abs(hashString(devId + appId + dateFrom + dateTo)) % 9000 + 1000)}`;
  const certHash = `SHA-256 [STF-CERT-${String(Math.abs(hashString(signerName + folioCode)) % 900000 + 100000)}-2026]`;

  // Construcción del HTML Ejecutivo Limpio (Diseño Corporativo Hoja Única)
  let html = `
    <!-- Cabecera Institucional Limpia (Sin cajas negras, sin códigos QR ni badges de seguridad) -->
    <div class="rep-clean-header">
      <div class="rep-clean-brand">
        <h1 class="rep-brand-company-title">STF GROUP S.A.</h1>
        <div class="rep-brand-direction">DIRECCIÓN CORPORATIVA DE TECNOLOGÍA & TRANSFORMACIÓN DIGITAL</div>
        <div class="rep-brand-division">División de Ingeniería de Software · Control Operativo de Plantas & Auditoría TI</div>
      </div>
      <div class="rep-clean-meta">
        <div class="rep-meta-row"><strong>Folio Oficial:</strong> <span class="rep-meta-folio">${folioCode}</span></div>
        <div class="rep-meta-row"><strong>Fecha de Emisión:</strong> <span>${todayFormatted}</span></div>
        <div class="rep-meta-row"><strong>Marco Normativo:</strong> <span>Ley 527 de 1999 (Firmas Digitales)</span></div>
      </div>
    </div>

    <!-- Título Principal del Dictamen -->
    <div class="rep-clean-title-block">
      <span class="rep-title-tag">INFORME TÉCNICO OFICIAL DE RENDIMIENTO · CONTROL DE PROYECTOS</span>
      <h2 class="rep-clean-main-title">DICTAMEN EJECUTIVO DE DESEMPEÑO, AVANCE & EFECTIVIDAD</h2>
      <p class="rep-clean-subtitle">Evaluación auditable en tiempo real sobre el estado del desarrollo de software, cumplimiento de SLA de entrega y robustez operativa.</p>
    </div>

    <!-- Franja de Parámetros de la Auditoría (Espaciado óptimo sin cortes de texto) -->
    <div class="rep-params-strip">
      <div class="rep-param-col">
        <span class="rep-param-tag">PERÍODO AUDITADO</span>
        <span class="rep-param-data">${dateFormattedFrom} – ${dateFormattedTo}</span>
      </div>
      <div class="rep-param-col">
        <span class="rep-param-tag">RESPONSABLE AUDITADO</span>
        <span class="rep-param-data" title="${devScopeText}">${devScopeText}</span>
      </div>
      <div class="rep-param-col">
        <span class="rep-param-tag">ALCANCE / SISTEMAS</span>
        <span class="rep-param-data" title="${appScopeText}">${appScopeText}</span>
      </div>
      <div class="rep-param-col">
        <span class="rep-param-tag">CLASIFICACIÓN</span>
        <span class="rep-param-data">Uso Oficial · Auditoría TI</span>
      </div>
    </div>

    <!-- 4 Tarjetas de Métricas Medibles de Desempeño y Efectividad -->
    <div class="rep-kpis-grid">
      <div class="rep-kpi-card card-sla">
        <div class="rep-kpi-val">${slaScore}%</div>
        <div class="rep-kpi-lbl">Efectividad Operativa (SLA)</div>
        <span class="rep-kpi-sub">Cumplimiento estricto de plazos</span>
      </div>
      <div class="rep-kpi-card card-prog">
        <div class="rep-kpi-val">${avgAppProgress}%</div>
        <div class="rep-kpi-lbl">Desempeño & Avance Ponderado</div>
        <span class="rep-kpi-sub">${filteredApps.length} aplicativo(s) corporativo(s)</span>
      </div>
      <div class="rep-kpi-card card-qa">
        <div class="rep-kpi-val">${qaScore}%</div>
        <div class="rep-kpi-lbl">Calidad Técnica & Código</div>
        <span class="rep-kpi-sub">Estabilidad, UX y Pruebas QA</span>
      </div>
      <div class="rep-kpi-card card-tasks">
        <div class="rep-kpi-val">${filteredTasks.length} Tareas</div>
        <div class="rep-kpi-lbl">Módulos Supervisados</div>
        <span class="rep-kpi-sub">${completedTasksCount} auditadas / ${inProgressTasksCount} en ejecución</span>
      </div>
    </div>
  `;

  // Ficha de Desempeño Individual (cuando se filtra por un usuario específico)
  if (selectedDevObj) {
    html += `
      <div class="rep-section-header">
        <span>Ficha de Desempeño & Capacidad Técnica</span>
      </div>
      <div class="rep-dev-spotlight-card">
        <img src="${selectedDevObj.avatar}" alt="${selectedDevObj.name}" class="rep-dev-avatar">
        <div class="rep-dev-details">
          <div class="rep-dev-name">${selectedDevObj.name}</div>
          <div class="rep-dev-submeta">${isAdminDev ? 'Director Corporativo de TI & Proyectos de Software' : selectedDevObj.role} · ${selectedDevObj.email}</div>
          <div class="rep-dev-extra">
            ${isAdminDev ? 'Supervisión integral de las 6 líneas de software de STF GROUP.' : `${filteredApps.length} Sistema(s) corporativo(s) a su cargo.`}
          </div>
        </div>
        <div class="rep-dev-kpis-mini">
          <div class="rep-dev-mini-stat">
            <span class="rep-dev-stat-val" style="color: #2563EB;">${selectedDevObj.score}</span>
            <span class="rep-dev-stat-lbl">Score General</span>
          </div>
          <div class="rep-dev-mini-stat">
            <span class="rep-dev-stat-val" style="color: #059669;">${selectedDevObj.onTimeDelivery}%</span>
            <span class="rep-dev-stat-lbl">SLA Entregas</span>
          </div>
          <div class="rep-dev-mini-stat">
            <span class="rep-dev-stat-val" style="color: #7C3AED;">${selectedDevObj.codeQuality}%</span>
            <span class="rep-dev-stat-lbl">Calidad Código</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // Si dev = all: Tabla comparativa del equipo de ingenieros
    html += `
      <div class="rep-section-header">
        <span>Rendimiento del Equipo de Desarrollo de Software</span>
      </div>
      <table class="rep-formal-table">
        <thead>
          <tr>
            <th style="width: 25%;">Ingeniero / Desarrollador</th>
            <th style="width: 20%;">Rol Corporativo</th>
            <th style="width: 20%;">Proyectos Asignados</th>
            <th style="width: 12%;">SLA Plazos</th>
            <th style="width: 12%;">Calidad Código</th>
            <th style="width: 11%;">Score Auditado</th>
          </tr>
        </thead>
        <tbody>
          ${filteredDevs.map(dev => `
            <tr>
              <td><strong>${dev.name}</strong></td>
              <td>${dev.role}</td>
              <td>${dev.activeProjects ? dev.activeProjects.length : 1} sistemas</td>
              <td><span class="rep-badge-ontime">${dev.onTimeDelivery}%</span></td>
              <td><span class="rep-badge-eval">${dev.codeQuality}%</span></td>
              <td><strong>${dev.score}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Tabla de Aplicativos en el Alcance (limitada a 3 si dev = all para garantizar hoja única)
  const maxAppsToRender = selectedDevObj ? filteredApps : filteredApps.slice(0, 3);
  html += `
    <div class="rep-section-header">
      <span>Estado & Avance de los Aplicativos Corporativos (${filteredApps.length} Sistemas)</span>
    </div>
    <table class="rep-formal-table">
      <thead>
        <tr>
          <th style="width: 15%;">Código</th>
          <th style="width: 25%;">Nombre del Sistema</th>
          <th style="width: 22%;">Responsable</th>
          <th style="width: 16%;">Avance Real</th>
          <th style="width: 12%;">Fecha Límite</th>
          <th style="width: 10%;">Estado SLA</th>
        </tr>
      </thead>
      <tbody>
        ${maxAppsToRender.map(app => {
          const dev = getDeveloperById(app.devId);
          const prog = calculateAppProgress(app);
          const isOntime = app.status === 'ontime';
          return `
            <tr>
              <td><strong>${app.code}</strong></td>
              <td>${app.name}</td>
              <td>${dev ? dev.name : 'Equipo Grupal'}</td>
              <td>
                <span class="rep-progress-bar-mini">
                  <span class="rep-progress-bar-fill" style="width: ${prog}%;"></span>
                </span>
                <strong>${prog}%</strong>
              </td>
              <td>${formatShortDate(app.deadline)}</td>
              <td>
                <span class="${isOntime ? 'rep-badge-ontime' : 'rep-badge-risk'}">
                  ${isOntime ? '✓ A Tiempo' : '⚠ En Riesgo'}
                </span>
              </td>
            </tr>
          `;
        }).join('')}
        ${!selectedDevObj && filteredApps.length > 3 ? `
          <tr>
            <td colspan="6" style="text-align: center; color: #64748B; font-size: 8px; font-style: italic; padding: 4px;">
              ... y ${filteredApps.length - 3} sistemas corporativos adicionales en monitoreo activo.
            </td>
          </tr>
        ` : ''}
      </tbody>
    </table>
  `;

  // Tabla Detallada de Tareas e Integraciones (limitada a 3 para garantizar hoja única perfecta)
  if (filteredTasks.length > 0) {
    const maxTasksToRender = filteredTasks.slice(0, 3);
    html += `
      <div class="rep-section-header">
        <span>Integraciones Críticas, Tareas & Auditorías Técnicas (${filteredTasks.length} Módulos)</span>
      </div>
      <table class="rep-formal-table">
        <thead>
          <tr>
            <th style="width: 32%;">Tarea / Módulo</th>
            <th style="width: 18%;">Aplicativo</th>
            <th style="width: 18%;">Responsable</th>
            <th style="width: 14%;">Fecha Límite</th>
            <th style="width: 8%;">Peso</th>
            <th style="width: 10%;">Estado & Dictamen</th>
          </tr>
        </thead>
        <tbody>
          ${maxTasksToRender.map(task => {
            const dev = getDeveloperById(task.devId);
            const app = getApplicationById(task.appId);
            const isEval = task.status === 'evaluated';
            return `
              <tr>
                <td><strong>${task.name}</strong></td>
                <td>${app ? app.name : task.appId}</td>
                <td>${dev ? dev.name : 'N/A'}</td>
                <td>${formatShortDate(task.deadline)}</td>
                <td>${task.weight}%</td>
                <td>
                  ${isEval 
                    ? `<span class="rep-badge-ontime">✓ Auditada (${task.evaluation ? task.evaluation.qualityScore + '%' : 'Aprobada'})</span>` 
                    : `<span class="rep-badge-eval">En Progreso</span>`}
                </td>
              </tr>
            `;
          }).join('')}
          ${filteredTasks.length > 3 ? `
            <tr>
              <td colspan="6" style="text-align: center; color: #64748B; font-size: 8px; font-style: italic; padding: 4px;">
                ... y ${filteredTasks.length - 3} tareas adicionales registradas en el libro de auditoría de STF GROUP.
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    `;
  }

  // Dictamen Técnico Oficial de la Dirección de TI
  let dictumText = '';
  if (slaScore >= 93 && avgAppProgress >= 65) {
    dictumText = `El departamento de Ingeniería y Transformación Digital de STF GROUP presenta un desempeño óptimo con un índice de efectividad del ${slaScore}% y un avance ponderado del ${avgAppProgress}%. Los sistemas auditados cumplen rigurosamente con los estándares de estabilidad técnica, trazabilidad en planta y diseño responsive, garantizando la continuidad operativa y la entrega oportuna para el cierre del ciclo de desarrollo.`;
  } else {
    dictumText = `Se evidencia un avance general del ${avgAppProgress}% con un cumplimiento de plazos del ${slaScore}%. Se instruye priorizar el cierre de las fases críticas de pruebas QA y estabilización en los módulos pendientes para asegurar el cumplimiento del cronograma oficial de STF GROUP.`;
  }

  html += `
    <!-- Caja Ejecutiva del Dictamen de Dirección -->
    <div class="rep-conclusions-box">
      <div class="rep-conclusions-title">Dictamen Oficial de la Dirección de TI:</div>
      <p class="rep-conclusions-text">${dictumText}</p>
    </div>

    <!-- Bloque Oficial de Firma Digital (Ajustado y Alineado a la Hoja Única) -->
    <div class="rep-signature-block">
      <div class="rep-signature-card">
        <div class="rep-signature-image-box">
          <img id="repDocSignatureImg" src="${currentReportSignatureDataUrl || ''}" alt="Firma Digital" class="rep-signature-img" style="${currentReportSignatureDataUrl ? 'display:block;' : 'display:none;'}">
          <div id="repDocSignatureEmpty" style="${currentReportSignatureDataUrl ? 'display:none;' : 'display:flex;'}" class="rep-sig-placeholder">
            <span>[Firma Digital Acreditada por la Dirección]</span>
          </div>
        </div>
        <div class="rep-signature-line"></div>
        <div class="rep-signer-name">${signerName}</div>
        <div class="rep-signer-role">${signerRole}</div>
        <div class="rep-signature-cert-hash">${certHash}</div>
      </div>
    </div>

    <!-- Pie de Página Legal y Código de Verificación -->
    <div class="rep-doc-footer-legal">
      <span>STF GROUP S.A. · Documento oficial auténtico con plena validez probatoria conforme a la Ley 527 de 1999 (República de Colombia).</span>
      <span>Página 1 de 1 · Código: ${folioCode}</span>
    </div>
  `;

  container.innerHTML = html;

  // Sincronizar firma si ya estaba dibujada o guardada
  syncSignatureToDocument();
}

// Función hash simple para números de folios y certificados consistentes
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function downloadExecutiveReportDoc() {
  const element = document.getElementById('executiveReportDocumentPaper');
  if (!element) {
    showToast('Error: No se encontró el documento para exportar.');
    return;
  }

  const devId = document.getElementById('repFilterDev')?.value || 'all';
  const cleanDev = devId === 'all' ? 'Portafolio_Global' : (getDeveloperById(devId)?.name.replace(/\s+/g, '_') || 'Desarrollador');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Reporte_Ejecutivo_STF_GROUP_${cleanDev}_${dateStr}.pdf`;

  if (typeof html2pdf === 'undefined') {
    showToast('Iniciando diálogo para guardar como PDF...');
    window.print();
    return;
  }

  showToast('Generando documento PDF oficial con marca de agua y firma...');

  // Configuración de márgenes en 0 para respetar exactamente el padding interno de la hoja A4 y garantizar 1 sola página
  const opt = {
    margin: [0, 0, 0, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    showToast('Reporte ejecutivo PDF descargado exitosamente.');
  }).catch(err => {
    console.error('Error al generar PDF con html2pdf:', err);
    showToast('Abriendo cuadro de diálogo de impresión como PDF...');
    window.print();
  });
}

function printExecutiveReportDoc() {
  window.print();
}


// Utility formatting
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ==========================================================================
// SUPER ADMIN INTEGRATIONS & AUTOMATED LIVE MEASUREMENT CONTROLLER
// ==========================================================================

let activeIntFilter = 'all';
let currentEvaluatingIntId = null;

function getSystemReferenceDate() {
  const now = new Date();
  // Sincronía con la fecha base del sistema si el cliente está en otro año
  if (now.getFullYear() < 2026) {
    return new Date('2026-10-19T12:00:00');
  }
  return now;
}

function calculateIntegrationTimeProgress(integration) {
  const refDate = getSystemReferenceDate();
  const start = new Date(integration.startDate + 'T00:00:00').getTime();
  const end = new Date(integration.deadline + 'T23:59:59').getTime();
  const now = refDate.getTime();

  const totalMs = Math.max(1, end - start);
  const elapsedMs = Math.max(0, now - start);
  const remainingMs = end - now;

  const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.round(elapsedMs / (1000 * 60 * 60 * 24))));
  const daysRemaining = Math.round(remainingMs / (1000 * 60 * 60 * 24));

  const timeBurnRate = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  const expectedProgress = timeBurnRate;

  if (integration.status === 'evaluated') {
    return {
      status: 'evaluated',
      statusText: 'Auditada & Aprobada',
      friendlyStatusText: 'Auditada',
      badgeClass: 'evaluated',
      totalDays,
      elapsedDays,
      daysRemaining: 0,
      timeBurnRate: 100,
      expectedProgress: 100,
      isOverdue: false,
      countdownText: 'Completada y Sumada al Sistema'
    };
  }

  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    return {
      status: 'risk',
      statusText: `Retraso (+${daysOverdue} d)`,
      friendlyStatusText: `Desfase (+${daysOverdue} d)`,
      badgeClass: 'risk',
      totalDays,
      elapsedDays: totalDays + daysOverdue,
      daysRemaining,
      timeBurnRate: 100,
      expectedProgress: 100,
      isOverdue: true,
      countdownText: `⚠️ Vencida hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`
    };
  }

  if (timeBurnRate >= 75) {
    return {
      status: 'risk',
      statusText: 'En Riesgo (>75% Tiempo)',
      friendlyStatusText: 'Por entregar',
      badgeClass: 'risk',
      totalDays,
      elapsedDays,
      daysRemaining,
      timeBurnRate,
      expectedProgress,
      isOverdue: false,
      countdownText: `Quedan ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} para entrega`
    };
  }

  return {
    status: 'ontime',
    statusText: 'En Tiempo (Ritmo Óptimo)',
    friendlyStatusText: 'Ritmo óptimo',
    badgeClass: 'ontime',
    totalDays,
    elapsedDays,
    daysRemaining,
    timeBurnRate,
    expectedProgress,
    isOverdue: false,
    countdownText: `Quedan ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''} para entrega`
  };
}

function renderIntegrationsList(filter = activeIntFilter) {
  const container = document.getElementById('integrationsCardsList');
  if (!container) return;

  activeIntFilter = filter;
  const integrations = appState.integrations || [];

  // Update counter badges
  const cAll = integrations.length;
  const cActive = integrations.filter(i => i.status === 'in_progress').length;
  const cRisk = integrations.filter(i => {
    if (i.status === 'evaluated') return false;
    const diag = calculateIntegrationTimeProgress(i);
    return diag.isOverdue || diag.timeBurnRate >= 75;
  }).length;
  const cDone = integrations.filter(i => i.status === 'evaluated').length;

  const elAll = document.getElementById('countIntAll');
  const elActive = document.getElementById('countIntActive');
  const elRisk = document.getElementById('countIntRisk');
  const elDone = document.getElementById('countIntDone');

  if (elAll) elAll.textContent = cAll;
  if (elActive) elActive.textContent = cActive;
  if (elRisk) elRisk.textContent = cRisk;
  if (elDone) elDone.textContent = cDone;

  // Filter items
  let filtered = integrations;
  if (filter === 'in_progress') {
    filtered = integrations.filter(i => i.status === 'in_progress');
  } else if (filter === 'risk') {
    filtered = integrations.filter(i => {
      if (i.status === 'evaluated') return false;
      const diag = calculateIntegrationTimeProgress(i);
      return diag.isOverdue || diag.timeBurnRate >= 75;
    });
  } else if (filter === 'evaluated') {
    filtered = integrations.filter(i => i.status === 'evaluated');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 42px 24px; text-align: center; color: var(--text-muted); background: #F8FAFC; border-radius: 20px; border: 1.5px dashed #CBD5E1;">
        <i data-lucide="inbox" style="width: 42px; height: 42px; margin-bottom: 10px; color: #94A3B8;"></i>
        <p style="font-weight: 750; font-size: 15px; color: #1E293B; margin-bottom: 4px;">No hay integraciones en esta categoría.</p>
        <span style="font-size: 13px; color: #64748B;">Usa el botón "+ Asignar Integración" para asignar nuevas tareas operativas al equipo.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(item => {
    const app = appState.applications.find(a => a.id === item.appId) || { name: 'Sistema General', iconColor: '#4E65FF' };
    const dev = getDeveloperById(item.devId);
    const diag = calculateIntegrationTimeProgress(item);

    const isEvaluated = item.status === 'evaluated';
    const appColor = app.iconColor || '#4E65FF';

    // Countdown Badge on Timeline
    let countdownBadgeHtml = '';
    if (isEvaluated) {
      countdownBadgeHtml = `
        <span class="friendly-deadline-pill evaluated">
          <i data-lucide="check-check" style="width: 12px; height: 12px;"></i>
          <span>Completada</span>
        </span>
      `;
    } else if (diag.isOverdue) {
      const overdueDays = Math.abs(diag.daysRemaining);
      countdownBadgeHtml = `
        <span class="friendly-deadline-pill overdue">
          <i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i>
          <span>Vencida hace ${overdueDays} d</span>
        </span>
      `;
    } else if (diag.badgeClass === 'risk') {
      countdownBadgeHtml = `
        <span class="friendly-deadline-pill risk">
          <i data-lucide="hourglass" style="width: 12px; height: 12px;"></i>
          <span>Quedan ${diag.daysRemaining} días</span>
        </span>
      `;
    } else {
      countdownBadgeHtml = `
        <span class="friendly-deadline-pill ontime">
          <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
          <span>Quedan ${diag.daysRemaining} días</span>
        </span>
      `;
    }

    // Action button or evaluated pill
    let actionHtml = '';
    if (isEvaluated) {
      actionHtml = `
        <div class="evaluated-friendly-card-action" onclick="openEvaluateIntegrationModal('${item.id}')" title="Clic para revisar dictamen técnico y notas del Jefe TI">
          <div class="eval-action-badge">
            <i data-lucide="check" style="width: 13px; height: 13px;"></i>
          </div>
          <div class="eval-action-details">
            <span class="eval-action-title">+${item.evaluation?.pointsAdded || item.weight}% Sumado (${item.evaluation?.qualityScore || 95}%)</span>
            <span class="eval-action-sub">Auditada & Aprobada · Ver Dictamen</span>
          </div>
          <i data-lucide="chevron-right" class="eval-action-arrow"></i>
        </div>
      `;
    } else {
      actionHtml = `
        <button class="btn-friendly-eval" onclick="openEvaluateIntegrationModal('${item.id}')" title="Calificar calidad técnica y aplicar a estadísticas">
          <i data-lucide="award" style="width: 15px; height: 15px;"></i>
          <span>Calificar Efectividad</span>
        </button>
      `;
    }

    return `
      <div class="integration-item-card" style="--int-accent: ${appColor};">
        <div class="int-card-accent-strip"></div>
        <div class="int-card-content">
          <!-- Top Row: App Badge & Status Pill -->
          <div class="int-card-header">
            <div class="int-app-badge" style="background-color: ${appColor}12; color: ${appColor}; border: 1px solid ${appColor}2E;">
              <span class="int-app-dot" style="background-color: ${appColor};"></span>
              <span class="int-app-name">${app.name}</span>
            </div>
            <div class="int-status-badge ${diag.badgeClass}">
              <span class="int-pulse-dot"></span>
              <span>${diag.friendlyStatusText || diag.statusText}</span>
            </div>
          </div>

          <!-- Card Body: Title & Description -->
          <div class="int-card-body">
            <h3 class="int-card-title">${item.name}</h3>
            <p class="int-card-desc" title="${item.description || ''}">${item.description || 'Integración técnica operativa en planta de confección.'}</p>
          </div>

          <!-- Developer Assigned Row -->
          <div class="int-dev-row">
            <div class="int-dev-avatar-wrapper">
              <img src="${dev.avatar}" class="int-dev-avatar" alt="${dev.name}">
              <span class="int-dev-status-indicator"></span>
            </div>
            <div class="int-dev-info-text">
              <span class="int-dev-name">${dev.name}</span>
              <span class="int-dev-role">${dev.role}</span>
            </div>
            <div class="int-weight-badge" title="Ponderación que aporta al módulo">
              <i data-lucide="sparkles" style="width: 11px; height: 11px;"></i>
              <span>Peso ${item.weight}%</span>
            </div>
          </div>

          <!-- Friendly Time & Delivery Tracker Capsule -->
          <div class="int-time-meter">
            <div class="int-time-header">
              <div class="int-time-dates">
                <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
                <span>${formatShortDate(item.startDate)} → ${formatShortDate(item.deadline)}</span>
              </div>
              ${countdownBadgeHtml}
            </div>

            <div class="int-progress-dual-bar">
              <div class="int-bar-track">
                <div class="int-bar-fill ${diag.badgeClass}" style="width: ${diag.timeBurnRate}%;">
                  <span class="int-bar-shimmer"></span>
                </div>
              </div>
              <div class="int-bar-labels">
                <span class="int-label-spent">
                  <i data-lucide="clock" style="width: 11px; height: 11px; margin-right: 3px;"></i>
                  Día ${diag.elapsedDays} de ${diag.totalDays} (${diag.timeBurnRate}%)
                </span>
                <span class="int-label-expected">
                  Avance esperado: <strong>${diag.expectedProgress}%</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="int-card-footer">
            ${actionHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// MODAL: Asignar Integración (Super Admin)
// --------------------------------------------------------------------------

function openAssignIntegrationModal() {
  const appSelect = document.getElementById('assignIntApp');
  const devSelect = document.getElementById('assignIntDev');

  if (appSelect) {
    appSelect.innerHTML = appState.applications.map(app => `
      <option value="${app.id}">${app.name} (${app.code})</option>
    `).join('');
  }

  if (devSelect) {
    devSelect.innerHTML = appState.developers.map(dev => `
      <option value="${dev.id}">${dev.name} (${dev.role})</option>
    `).join('');
  }

  // Set default dates
  const todayStr = '2026-10-19';
  const startInput = document.getElementById('assignIntStartDate');
  const deadInput = document.getElementById('assignIntDeadline');
  const weightInput = document.getElementById('assignIntWeight');
  const weightVal = document.getElementById('assignIntWeightVal');

  if (startInput) startInput.value = todayStr;
  if (deadInput) {
    const d = new Date(todayStr + 'T00:00:00');
    d.setDate(d.getDate() + 10);
    deadInput.value = d.toISOString().split('T')[0];
  }
  if (weightInput) weightInput.value = 15;
  if (weightVal) weightVal.textContent = '15%';

  updateAssignPreviewCard();
  document.getElementById('modalAssignIntegration')?.classList.add('show');
}

function closeAssignIntegrationModal() {
  document.getElementById('modalAssignIntegration')?.classList.remove('show');
  document.getElementById('assignIntegrationForm')?.reset();
}

function updateAssignPreviewCard() {
  const start = document.getElementById('assignIntStartDate')?.value;
  const dead = document.getElementById('assignIntDeadline')?.value;
  const weight = document.getElementById('assignIntWeight')?.value || 15;

  const daysEl = document.getElementById('previewDaysAssigned');
  const maxPtsEl = document.getElementById('previewMaxPoints');

  if (daysEl && start && dead) {
    const d1 = new Date(start).getTime();
    const d2 = new Date(dead).getTime();
    const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    daysEl.textContent = `${diff} días asignados`;
  }

  if (maxPtsEl) {
    maxPtsEl.textContent = `+${weight}.0% al aplicativo`;
  }
}

function handleAssignIntegrationSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('assignIntName')?.value.trim();
  const appId = document.getElementById('assignIntApp')?.value;
  const devId = document.getElementById('assignIntDev')?.value;
  const startDate = document.getElementById('assignIntStartDate')?.value;
  const deadline = document.getElementById('assignIntDeadline')?.value;
  const weight = parseInt(document.getElementById('assignIntWeight')?.value) || 15;
  const desc = document.getElementById('assignIntDesc')?.value.trim();

  if (!name || !appId || !devId || !startDate || !deadline) {
    alert("Por favor completa los campos requeridos.");
    return;
  }

  const newIntegration = {
    id: `int_${Date.now()}`,
    name: name,
    appId: appId,
    devId: devId,
    startDate: startDate,
    deadline: deadline,
    weight: weight,
    status: 'in_progress',
    description: desc,
    evaluation: null
  };

  if (!appState.integrations) appState.integrations = [];
  appState.integrations.unshift(newIntegration);

  saveData(appState);
  closeAssignIntegrationModal();
  renderIntegrationsList();

  const app = appState.applications.find(a => a.id === appId);
  const dev = getDeveloperById(devId);
  showToast(`¡Integración asignada a ${dev.name} para ${app?.name}! Reloj en vivo activado.`);

  // Sincronizar asignación de tarea en Google Sheets (Hoja: Tareas_Integraciones y Bitácora)
  if (window.SheetsSync) {
    window.SheetsSync.logTaskAssignment({
      taskId: newIntegration.id,
      taskName: name,
      appName: app ? app.name : 'Sistema',
      developer: dev ? dev.name : 'Desarrollador',
      weight: weight,
      deadline: deadline,
      status: 'En Progreso'
    });
  }
}

// --------------------------------------------------------------------------
// MODAL: Auditoría & Calificación de Calidad (Super Admin)
// --------------------------------------------------------------------------

function openEvaluateIntegrationModal(intId) {
  const item = (appState.integrations || []).find(i => i.id === intId);
  if (!item) return;

  currentEvaluatingIntId = intId;
  const app = appState.applications.find(a => a.id === item.appId) || { name: 'Sistema', iconColor: '#4E65FF' };
  const dev = getDeveloperById(item.devId);
  const diag = calculateIntegrationTimeProgress(item);

  // Headers
  const taskNameEl = document.getElementById('evalTaskName');
  const devAvatarEl = document.getElementById('evalDevAvatar');
  const devNameEl = document.getElementById('evalDevName');
  const appNameEl = document.getElementById('evalAppName');
  const verdictEl = document.getElementById('evalTimeVerdict');
  const notesEl = document.getElementById('evalNotes');

  if (taskNameEl) taskNameEl.textContent = item.name;
  if (devAvatarEl) devAvatarEl.src = dev.avatar;
  if (devNameEl) devNameEl.textContent = dev.name;
  if (appNameEl) {
    appNameEl.textContent = app.name;
    appNameEl.style.color = app.iconColor || 'var(--primary-blue)';
    appNameEl.style.backgroundColor = `${app.iconColor || '#4E65FF'}18`;
  }

  // Time verdict
  if (verdictEl) {
    if (diag.isOverdue) {
      verdictEl.className = 'eval-time-verdict risk';
      verdictEl.innerHTML = `<i data-lucide="alert-triangle"></i> Entregada con ${Math.abs(diag.daysRemaining)} día(s) de desfase`;
    } else {
      verdictEl.className = 'eval-time-verdict ontime';
      verdictEl.innerHTML = `<i data-lucide="check-circle"></i> Cumplimiento en tiempo (${diag.daysRemaining} días de holgura)`;
    }
  }

  // Sliders initial values
  const sStab = document.getElementById('sliderStability');
  const sUsab = document.getElementById('sliderUsability');
  const sQA = document.getElementById('sliderQA');

  if (item.evaluation) {
    if (sStab) sStab.value = item.evaluation.stabilityScore || 95;
    if (sUsab) sUsab.value = item.evaluation.usabilityScore || 92;
    if (sQA) sQA.value = item.evaluation.qaScore || 96;
    if (notesEl) notesEl.value = item.evaluation.notes || '';
  } else {
    if (sStab) sStab.value = 95;
    if (sUsab) sUsab.value = 92;
    if (sQA) sQA.value = 96;
    if (notesEl) notesEl.value = 'Implementación en planta validada con los operarios. Operatividad estable.';
  }

  updateEvaluationMath();
  document.getElementById('modalEvaluateIntegration')?.classList.add('show');
  lucide.createIcons();
}

function closeEvaluateIntegrationModal() {
  document.getElementById('modalEvaluateIntegration')?.classList.remove('show');
  currentEvaluatingIntId = null;
}

function updateEvaluationMath() {
  const item = (appState.integrations || []).find(i => i.id === currentEvaluatingIntId);
  const weight = item ? item.weight : 15;

  const vStab = parseInt(document.getElementById('sliderStability')?.value) || 0;
  const vUsab = parseInt(document.getElementById('sliderUsability')?.value) || 0;
  const vQA = parseInt(document.getElementById('sliderQA')?.value) || 0;

  // Update slider badge labels
  const lblStab = document.getElementById('valScoreStability');
  const lblUsab = document.getElementById('valScoreUsability');
  const lblQA = document.getElementById('valScoreQA');

  if (lblStab) lblStab.textContent = `${vStab}%`;
  if (lblUsab) lblUsab.textContent = `${vUsab}%`;
  if (lblQA) lblQA.textContent = `${vQA}%`;

  // Mathematical Calculation
  const overallQuality = ((vStab + vUsab + vQA) / 3).toFixed(1);
  const addedPoints = ((weight * (overallQuality / 100))).toFixed(1);
  const devImpact = (((overallQuality - 90) / 10)).toFixed(1);

  const elOverall = document.getElementById('evalOverallQuality');
  const elAdded = document.getElementById('evalAddedPoints');
  const elFormula = document.getElementById('evalFormulaExplain');
  const elDevImpact = document.getElementById('evalDevScoreImpact');

  if (elOverall) elOverall.textContent = `${overallQuality}%`;
  if (elAdded) elAdded.textContent = `+${addedPoints}%`;
  if (elFormula) elFormula.textContent = `(Ponderación ${weight}% × ${overallQuality}% Calidad)`;
  if (elDevImpact) elDevImpact.textContent = `${devImpact > 0 ? '+' : ''}${devImpact}%`;
}

function handleConfirmEvaluation() {
  const item = (appState.integrations || []).find(i => i.id === currentEvaluatingIntId);
  if (!item) return;

  const vStab = parseInt(document.getElementById('sliderStability')?.value) || 95;
  const vUsab = parseInt(document.getElementById('sliderUsability')?.value) || 92;
  const vQA = parseInt(document.getElementById('sliderQA')?.value) || 96;
  const notes = document.getElementById('evalNotes')?.value.trim() || '';

  const overallQuality = parseFloat(((vStab + vUsab + vQA) / 3).toFixed(1));
  const pointsAdded = parseFloat(((item.weight * (overallQuality / 100))).toFixed(1));
  const diag = calculateIntegrationTimeProgress(item);

  // 1. Guardar evaluación oficial
  item.status = 'evaluated';
  item.evaluation = {
    evalDate: '2026-10-19',
    onTime: !diag.isOverdue,
    daysDifference: diag.daysRemaining,
    stabilityScore: vStab,
    usabilityScore: vUsab,
    qaScore: vQA,
    qualityScore: overallQuality,
    pointsAdded: pointsAdded,
    evaluator: 'Super Admin (Jefe de Desarrollo)',
    notes: notes
  };

  // 2. Sumar avance matemático al Aplicativo
  const targetApp = appState.applications.find(a => a.id === item.appId);
  if (targetApp) {
    // Avanzar la primera fase incompleta
    const nextPhase = targetApp.phases.find(p => !p.completed);
    if (nextPhase) {
      nextPhase.completed = true;
    }
  }

  // 3. Recalcular efectividad del desarrollador
  const dev = getDeveloperById(item.devId);
  if (dev) {
    dev.sprintsCompleted = (dev.sprintsCompleted || 10) + 1;
    if (!diag.isOverdue) {
      dev.onTimeDelivery = Math.min(100, Math.round((dev.onTimeDelivery * 0.9) + 10));
    } else {
      dev.onTimeDelivery = Math.max(70, Math.round((dev.onTimeDelivery * 0.9) + 5));
    }
    dev.codeQuality = Math.min(100, Math.round((dev.codeQuality * 0.7) + (overallQuality * 0.3)));
    const numericScore = (((dev.onTimeDelivery + dev.codeQuality) / 2) / 10).toFixed(1);
    dev.score = `${numericScore} / 10`;
  }

  // 4. Persistir
  saveData(appState);
  closeEvaluateIntegrationModal();

  // Sincronizar auditoría y evaluación en Google Sheets
  if (window.SheetsSync) {
    const dev = getDeveloperById(item.devId);
    window.SheetsSync.logAuditEvaluation({
      appName: targetApp ? targetApp.name : 'Aplicativo',
      developer: dev ? dev.name : 'Desarrollador',
      score: overallQuality,
      daysDifference: diag.daysRemaining,
      pointsAdded: pointsAdded,
      evaluator: 'Super Admin (Jefe TI)',
      notes: notes || `Estabilidad: ${vStab}%, Usabilidad: ${vUsab}%, QA: ${vQA}%`
    });
  }

  // 5. Re-renderizar tablero completo de forma reactiva
  renderIntegrationsList();
  renderStackedDeck(activeSelectedDevId); // Actualiza "las etiquetas" inmediatamente
  renderSystemsTable();
  renderDevelopersSection();
  renderCapsuleProgressBar();
  updateQuickDevStrip();

  showToast(`¡Auditoría oficializada! +${pointsAdded}% sumado a ${targetApp?.name} y efectividad recalculada.`);
}

// ==========================================================================
// EVENT LISTENERS & BOOTSTRAP
// ==========================================================================

function initApp() {
  // Lucide icons
  lucide.createIcons();

  // Set initial header user info and dropdown avatars
  const firstDev = getDeveloperById(activeSelectedDevId);
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerName = document.getElementById('headerUserName');
  const headerRoleBadge = document.getElementById('headerUserRoleBadge');

  if (headerAvatar && firstDev) headerAvatar.src = firstDev.avatar;
  if (headerName && firstDev) headerName.textContent = firstDev.name;
  if (headerRoleBadge && firstDev) {
    if (firstDev.role === 'Admin') {
      headerRoleBadge.innerHTML = '<span style="color:#F5C542; font-weight:700;">🛡️ Admin</span>';
    } else {
      headerRoleBadge.innerHTML = '<span style="color:#38BDF8; font-weight:600;">👨‍💻 Desarrollador</span>';
    }
  }

  appState.developers.forEach(dev => {
    const dropImg = document.getElementById(`dropImg_${dev.id}`);
    if (dropImg) dropImg.src = dev.avatar;
  });

  // Header developer dropdown toggle
  const btnHeaderUser = document.getElementById('btnHeaderUserSelect');
  const headerDropdown = document.getElementById('headerDevDropdown');
  if (btnHeaderUser && headerDropdown) {
    btnHeaderUser.addEventListener('click', (e) => {
      e.stopPropagation();
      headerDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!headerDropdown.contains(e.target) && !btnHeaderUser.contains(e.target)) {
        headerDropdown.classList.remove('show');
      }
    });
  }

  // Initial renders
  renderStackedDeck();
  renderCapsuleProgressBar();
  renderDevelopersSection();
  renderSystemsTable();
  initOverviewChart();
  initVelocityBarChart();
  renderIntegrationsList(); // Render Super Admin Integrations Controller

  // Global search input
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSystemsTable(e.target.value);
    });
  }

  // Header action buttons
  document.getElementById('btnNewProject')?.addEventListener('click', openNewProjectModal);
  document.getElementById('btnExportReport')?.addEventListener('click', exportExecutiveReport);
  document.getElementById('btnAssignTask')?.addEventListener('click', openAssignIntegrationModal);
  document.getElementById('btnOpenNewIntegrationModal')?.addEventListener('click', openAssignIntegrationModal);

  // Super Admin Integrations Filter Pills
  document.querySelectorAll('#intFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#intFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.intFilter;
      renderIntegrationsList(filter);
    });
  });

  // Assignment Modal Events
  document.getElementById('btnCloseAssignModal')?.addEventListener('click', closeAssignIntegrationModal);
  document.getElementById('btnCancelAssignModal')?.addEventListener('click', closeAssignIntegrationModal);
  document.getElementById('assignIntegrationForm')?.addEventListener('submit', handleAssignIntegrationSubmit);

  const sliderWeight = document.getElementById('assignIntWeight');
  if (sliderWeight) {
    sliderWeight.addEventListener('input', (e) => {
      const v = e.target.value;
      const b = document.getElementById('assignIntWeightVal');
      if (b) b.textContent = `${v}%`;
      updateAssignPreviewCard();
    });
  }

  document.getElementById('assignIntStartDate')?.addEventListener('change', updateAssignPreviewCard);
  document.getElementById('assignIntDeadline')?.addEventListener('change', updateAssignPreviewCard);

  // Evaluation Modal Events
  document.getElementById('btnCloseEvalModal')?.addEventListener('click', closeEvaluateIntegrationModal);
  document.getElementById('btnCancelEvalModal')?.addEventListener('click', closeEvaluateIntegrationModal);
  document.getElementById('btnConfirmEvaluation')?.addEventListener('click', handleConfirmEvaluation);

  ['sliderStability', 'sliderUsability', 'sliderQA'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateEvaluationMath);
  });

  // Modal close buttons
  document.getElementById('btnCloseSystemModal')?.addEventListener('click', closeSystemDetailModal);
  document.getElementById('btnCancelSysModal')?.addEventListener('click', closeSystemDetailModal);
  document.getElementById('btnSaveSysChanges')?.addEventListener('click', saveSystemChanges);

  document.getElementById('btnCloseDevModal')?.addEventListener('click', closeDevScorecardModal);
  document.getElementById('btnCloseDevScorecardBtn')?.addEventListener('click', closeDevScorecardModal);
  document.getElementById('btnOpenDevDetail')?.addEventListener('click', () => {
    openDevScorecardModal(activeSelectedDevId);
  });
  document.getElementById('btnSeeAllDevs')?.addEventListener('click', () => {
    openDevScorecardModal(activeSelectedDevId);
  });

  document.getElementById('btnAddDeveloper')?.addEventListener('click', () => {
    showToast('Registro de nuevo programador disponible en la vista de configuración.');
  });

  document.getElementById('btnScrollDevsRight')?.addEventListener('click', () => {
    const list = document.getElementById('devsAvatarList');
    if (list) list.scrollBy({ left: 120, behavior: 'smooth' });
  });

  document.getElementById('btnCloseNewProjModal')?.addEventListener('click', closeNewProjectModal);
  document.getElementById('btnCancelNewProj')?.addEventListener('click', closeNewProjectModal);
  document.getElementById('newProjectForm')?.addEventListener('submit', handleCreateNewProject);

  document.getElementById('modalQuarterlyGoal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalQuarterlyGoal') closeQuarterlyGoalModal();
  });

  document.getElementById('btnRefreshTable')?.addEventListener('click', () => {
    renderSystemsTable();
    showToast('Listado de aplicativos actualizado.');
  });

  // Keyboard shortcut ⌘K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  });

  // Sidebar navigation view switcher
  document.querySelectorAll('.sidebar-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      if (targetView) switchView(targetView);
    });
  });

  // Projects View Brand Filters
  document.querySelectorAll('#brandFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#brandFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      renderProjectsView(filter);
    });
  });

  // Switch between Projects Grid & Kanban
  document.getElementById('btnViewGrid')?.addEventListener('click', () => {
    document.getElementById('btnViewGrid').classList.add('active');
    document.getElementById('btnViewKanban').classList.remove('active');
    document.getElementById('projectsCardsGrid').style.display = 'grid';
    document.getElementById('projectsKanbanBoard').style.display = 'none';
  });

  document.getElementById('btnViewKanban')?.addEventListener('click', () => {
    document.getElementById('btnViewKanban').classList.add('active');
    document.getElementById('btnViewGrid').classList.remove('active');
    document.getElementById('projectsCardsGrid').style.display = 'none';
    document.getElementById('projectsKanbanBoard').style.display = 'grid';
    renderKanbanBoard();
  });

  // Settings Actions
  document.getElementById('btnDownloadBackup')?.addEventListener('click', downloadFullBackupJSON);
  document.getElementById('btnResetFactoryData')?.addEventListener('click', resetFactoryData);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ==========================================================================
// MULTI-VIEW NAVIGATION CONTROLLER (SPA)
// ==========================================================================

let activeBrandFilter = 'all';
let brandsChartInstance = null;
let qaBugsChartInstance = null;

function switchView(viewName) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav .nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Switch visible section
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const targetPanel = document.getElementById(`view-${viewName}`);
  if (targetPanel) {
    targetPanel.classList.add('show', 'active');
  }

  // Trigger view-specific renderers
  if (viewName === 'projects') {
    renderProjectsView(activeBrandFilter);
  } else if (viewName === 'developers') {
    renderDevelopersFullView();
  } else if (viewName === 'analytics') {
    renderAnalyticsView();
  } else if (viewName === 'settings') {
    renderSettingsView();
  } else if (viewName === 'dashboard') {
    renderStackedDeck();
    renderCapsuleProgressBar();
    renderSystemsTable();
    initOverviewChart();
    initVelocityBarChart();
  }

  lucide.createIcons();
}

// ==========================================================================
// VIEW 2: PROJECTS & KANBAN RENDERERS
// ==========================================================================

function renderProjectsView(brand = 'all') {
  activeBrandFilter = brand;
  const gridContainer = document.getElementById('projectsCardsGrid');
  if (!gridContainer) return;

  let apps = appState.applications;
  if (brand !== 'all') {
    apps = apps.filter(a => a.category.toLowerCase().includes(brand.toLowerCase()));
  }

  gridContainer.innerHTML = apps.map(app => {
    const dev = getDeveloperById(app.devId);
    const progress = calculateAppProgress(app);
    const activePhase = app.phases.find(p => !p.completed) || { name: 'Desplegado en Producción' };

    return `
      <div class="project-card">
        <div>
          <div class="project-card-header">
            <span class="project-brand-badge">${app.category}</span>
            <span class="status-pill ${app.status === 'risk' ? 'status-risk' : (progress === 100 ? 'status-done' : 'status-ontime')}">
              ${app.status === 'risk' ? 'En Riesgo' : (progress === 100 ? 'Finalizado' : 'En Tiempo')}
            </span>
          </div>

          <h3 class="project-card-title">${app.name}</h3>
          <p class="project-card-desc">${app.description || 'Sin descripción.'}</p>

          <div class="project-card-phases">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
              <span>Fase: <strong style="color: #4E65FF;">${activePhase.name}</strong></span>
              <span>${progress}%</span>
            </div>
            
            <div class="phases-micro-list" title="6 Fases del Ciclo de Software">
              ${app.phases.map(p => `<div class="phase-micro-dot ${p.completed ? 'done' : ''}"></div>`).join('')}
            </div>
          </div>
        </div>

        <div class="project-card-footer">
          ${app.isGroupProject ? `
            <div class="dev-lead-pill" style="cursor: pointer;" onclick="openSystemDetailModal('${app.id}')">
              <span class="status-pill status-ontime" style="font-size: 11px;">👥 Equipo Grupal (4 Devs)</span>
            </div>
          ` : `
            <div class="dev-lead-pill" style="cursor: pointer;" onclick="openDevScorecardModal('${dev.id}')" title="Ver rendimiento de ${dev.name}">
              <img src="${dev.avatar}" alt="${dev.name}">
              <span>${dev.name}</span>
            </div>
          `}
          <button class="action-row-btn" onclick="openSystemDetailModal('${app.id}')">
            Auditar Fases
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderKanbanBoard();
  lucide.createIcons();
}

function renderKanbanBoard() {
  const kanban = document.getElementById('projectsKanbanBoard');
  if (!kanban) return;

  // 4 Kanban Columns
  const columns = [
    { title: "1. Requisitos & Diseño", checkIdx: 1 },
    { title: "2. Desarrollo Backend / Core", checkIdx: 2 },
    { title: "3. Frontend & Pruebas QA", checkIdx: 4 },
    { title: "4. Desplegado / Producción", checkIdx: 5 }
  ];

  kanban.innerHTML = columns.map(col => {
    // Clasificar aplicativo en su columna según la última fase completada
    const appsInCol = appState.applications.filter(app => {
      const completedCount = app.phases.filter(p => p.completed).length;
      if (col.checkIdx === 1) return completedCount <= 2;
      if (col.checkIdx === 2) return completedCount === 3;
      if (col.checkIdx === 4) return completedCount === 4 || completedCount === 5;
      if (col.checkIdx === 5) return completedCount === 6;
      return false;
    });

    return `
      <div class="kanban-column">
        <div class="kanban-col-header">
          <span class="kanban-col-title">${col.title}</span>
          <span class="kanban-count-badge">${appsInCol.length}</span>
        </div>

        <div class="kanban-items-list">
          ${appsInCol.length === 0 ? '<p style="color: #A0ABC0; font-size: 12px; text-align: center; margin-top: 20px;">Sin aplicativos en esta etapa</p>' : ''}
          ${appsInCol.map(app => {
            const dev = getDeveloperById(app.devId);
            const prog = calculateAppProgress(app);
            return `
              <div class="kanban-item-card" onclick="openSystemDetailModal('${app.id}')">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 700; color: #8E96A6;">${app.code}</span>
                  <span style="font-size: 11px; font-weight: 800; color: #4E65FF;">${prog}%</span>
                </div>
                <strong style="font-size: 13.5px; display: block; margin-bottom: 8px; color: #1E232E;">${app.name}</strong>
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F1F4F9; padding-top: 8px;">
                  <span style="font-size: 11.5px; color: #64748B;">${dev.name}</span>
                  <span style="font-size: 11px; color: #94A3B8;">${formatShortDate(app.deadline)}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// VIEW 3: DEVELOPERS FULL CENTER
// ==========================================================================

function renderDevelopersFullView() {
  const container = document.getElementById('devsFullGrid');
  if (!container) return;

  container.innerHTML = appState.developers.map(dev => {
    const assignedApps = appState.applications.filter(a => a.devId === dev.id || (a.devIds && a.devIds.includes(dev.id)));
    
    return `
      <div class="dev-full-card">
        <div>
          <div class="dev-header-profile">
            <img src="${dev.avatar}" alt="${dev.name}" class="dev-card-avatar">
            <div>
              <strong style="font-size: 16px; color: #1E232E; display: block;">${dev.name}</strong>
              <span style="font-size: 12.5px; color: #8E96A6;">${dev.role}</span>
              <div class="dev-score-pill" style="margin-top: 6px;">
                <i data-lucide="award" style="width: 12px; height: 12px;"></i>
                <span>Score: ${dev.score}</span>
              </div>
            </div>
          </div>

          <div class="dev-kpi-bars">
            <div>
              <div class="kpi-row-line">
                <span>Cumplimiento a Tiempo</span>
                <span style="color: #4E65FF;">${dev.onTimeDelivery}%</span>
              </div>
              <div class="mini-bar-track">
                <div class="mini-bar-fill" style="width: ${dev.onTimeDelivery}%;"></div>
              </div>
            </div>

            <div>
              <div class="kpi-row-line">
                <span>Calidad Técnica (Bug-free)</span>
                <span style="color: #10B981;">${dev.codeQuality}%</span>
              </div>
              <div class="mini-bar-track">
                <div class="mini-bar-fill" style="width: ${dev.codeQuality}%; background: linear-gradient(135deg, #22C55E, #10B981);"></div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <span style="font-size: 12px; font-weight: 700; color: #8E96A6; text-transform: uppercase;">Sistemas a su Cargo (${assignedApps.length}):</span>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
              ${assignedApps.map(a => `
                <div style="display: flex; justify-content: space-between; font-size: 12.5px; background: #F8FAFD; padding: 6px 10px; border-radius: 8px;">
                  <span style="color: #1E232E; font-weight: 600;">${a.name}</span>
                  <span style="color: #4E65FF; font-weight: 700;">${calculateAppProgress(a)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <button class="pill-btn secondary-btn" style="width: 100%; justify-content: center;" onclick="openDevScorecardModal('${dev.id}')">
          <i data-lucide="file-text"></i>
          <span>Ver Historial de Rendimiento</span>
        </button>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// ==========================================================================
// VIEW 4: ANALYTICS CHARTS (Brands & QA)
// ==========================================================================

function renderAnalyticsView() {
  const brandsCtx = document.getElementById('brandsProgressChart');
  const qaCtx = document.getElementById('qaBugsChart');

  if (brandsChartInstance) brandsChartInstance.destroy();
  if (qaBugsChartInstance) qaBugsChartInstance.destroy();

  // 1. Brands Progress Doughnut
  if (brandsCtx) {
    const categories = ['Desarrollo Grupal', 'Manufactura & Producción', 'Control Textil', 'Logística & Talleres', 'Aseguramiento de Calidad', 'Planta Textil'];
    const brandAverages = categories.map(cat => {
      const match = appState.applications.filter(a => a.category.toLowerCase().includes(cat.toLowerCase().split(' ')[0]));
      if (match.length === 0) return 70;
      const total = match.reduce((sum, a) => sum + calculateAppProgress(a), 0);
      return Math.round(total / match.length);
    });

    brandsChartInstance = new Chart(brandsCtx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: brandAverages,
          backgroundColor: ['#4E65FF', '#FFA043', '#D88BF8', '#10B981', '#3B82F6', '#8B5CF6'],
          borderWidth: 4,
          borderColor: '#FFFFFF',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              color: '#4F5668'
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}% Avance Promedio`
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 2. QA Defects Grouped Bar Chart
  if (qaCtx) {
    const appNames = appState.applications.map(a => a.name.length > 14 ? a.name.substring(0, 14) + '...' : a.name);
    const bugsReported = [18, 14, 10, 16, 12, 11];
    const bugsResolved = [15, 13, 10, 12, 11, 9];

    qaBugsChartInstance = new Chart(qaCtx, {
      type: 'bar',
      data: {
        labels: appNames,
        datasets: [
          {
            label: 'Incidencias Detectadas QA',
            data: bugsReported,
            backgroundColor: '#FFA043',
            borderRadius: 8,
            barThickness: 16
          },
          {
            label: 'Incidencias Subsanadas',
            data: bugsResolved,
            backgroundColor: '#4E65FF',
            borderRadius: 8,
            barThickness: 16
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#EDF1F7' } }
        }
      }
    });
  }
}

// ==========================================================================
// VIEW 5: SETTINGS & BACKUP
// ==========================================================================

function renderSettingsView() {
  const container = document.getElementById('settingsPhasesList');
  if (!container) return;

  container.innerHTML = STF_DATA.standardPhases.map(p => {
    return `
      <div class="phase-setting-item">
        <div>
          <span class="phase-setting-name">${p.name}</span>
          <p style="font-size: 12px; color: #8E96A6; margin-top: 2px;">${p.description}</p>
        </div>
        <span class="phase-setting-weight">${p.weight}% Ponderación</span>
      </div>
    `;
  }).join('');
}

function downloadFullBackupJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `STF_GROUP_SISTEMAS_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
  showToast("Respaldo JSON descargado correctamente.");
}

function resetFactoryData() {
  if (confirm("¿Estás seguro de restablecer los datos de demostración de STF GROUP? Se sobreescribirán los cambios locales.")) {
    localStorage.removeItem('STF_GROUP_DASHBOARD_DATA');
    appState = getStoredData();
    switchView('dashboard');
    showToast("Datos restaurados a valores de demostración.");
  }
}

// Expose all interactive functions globally on window
window.openNewProjectModal = openNewProjectModal;
window.closeNewProjectModal = closeNewProjectModal;
window.openAssignIntegrationModal = openAssignIntegrationModal;
window.closeAssignIntegrationModal = closeAssignIntegrationModal;
window.openEvaluateIntegrationModal = openEvaluateIntegrationModal;
window.closeEvaluateIntegrationModal = closeEvaluateIntegrationModal;
window.openSystemDetailModal = openSystemDetailModal;
window.closeSystemDetailModal = closeSystemDetailModal;
window.openDevScorecardModal = openDevScorecardModal;
window.closeDevScorecardModal = closeDevScorecardModal;
window.openQuarterlyGoalModal = openQuarterlyGoalModal;
window.closeQuarterlyGoalModal = closeQuarterlyGoalModal;
window.saveQuarterlyGoal = saveQuarterlyGoal;
window.saveSystemChanges = saveSystemChanges;
window.cycleStackedDeckByAppId = cycleStackedDeckByAppId;
window.cycleStackedDeckNext = cycleStackedDeckNext;
window.cycleStackedDeckPrev = cycleStackedDeckPrev;
window.selectDeveloper = selectDeveloper;
window.selectDeveloperFromCard = selectDeveloper;
window.handleCreateNewProject = handleCreateNewProject;
window.handleAssignIntegrationSubmit = handleAssignIntegrationSubmit;
window.handleConfirmEvaluation = handleConfirmEvaluation;
window.exportExecutiveReport = exportExecutiveReport;
window.switchView = switchView;
window.showToast = showToast;
window.renderStackedDeck = renderStackedDeck;
window.getDeveloperById = getDeveloperById;


