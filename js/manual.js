/**
 * ============================================================================
 * STF GROUP · MANUAL DE OPERACIONES Y CENTRO DE AYUDA POR ROLES (VISTA NATIVA)
 * ============================================================================
 * Manual oficial embebido de forma nativa en la plataforma (view-manual),
 * adaptado dinámicamente al rol de sesión (Administrador vs. Desarrollador),
 * con datos reales de sistemas y equipo en vivo, capturas auténticas de pantalla,
 * paso a paso detallado por interfaz y botón para exportar el PDF oficial.
 */

let manualActiveTab = 'dashboard';
let manualSimulatedRole = null; // null: usa rol real; 'admin' | 'desarrollador'
let manualSimulatedDevUsername = null; // null: usa desarrollador logueado

/**
 * Función principal para renderizar la vista nativa del manual
 */
function renderManualNativeView() {
  const container = document.getElementById('manualNativeContainer');
  if (!container) return;

  // 1. Obtener usuario de sesión real
  let realSession = (typeof getLoggedSessionUser === 'function') ? getLoggedSessionUser() : null;
  if (!realSession) {
    try {
      realSession = JSON.parse(localStorage.getItem('STF_LOGGED_USER') || '{}');
    } catch (e) {
      realSession = { name: 'Edwin Diaz', username: 'ediaz', role: 'admin' };
    }
  }

  const isRealAdmin = (typeof isCurrentSessionAdmin === 'function')
    ? isCurrentSessionAdmin()
    : (realSession.username === 'ediaz' || realSession.role === 'admin');

  // Determinar rol efectivo a visualizar
  const activeRole = manualSimulatedRole || (isRealAdmin ? 'admin' : 'desarrollador');
  const isAdminView = (activeRole === 'admin');

  // Obtener lista completa de sistemas reales
  const allSystems = (window.systemsData && Array.isArray(window.systemsData)) ? window.systemsData :
    (window.apps && Array.isArray(window.apps)) ? window.apps : [];

  // Obtener desarrolladores reales registrados
  const devList = [
    { username: 'jguzman', name: 'Jose Guzman', appsCount: 3, role: 'desarrollador' },
    { username: 'jdavid', name: 'Juan David', appsCount: 1, role: 'desarrollador' },
    { username: 'eescobar', name: 'Esteban Escobar', appsCount: 1, role: 'desarrollador' },
    { username: 'jeyder', name: 'Jhon Eyder (Mocho)', appsCount: 1, role: 'desarrollador' },
    { username: 'ediaz', name: 'Edwin Diaz', appsCount: 1, role: 'admin' }
  ];

  // Si está en modo desarrollador simulado o real, obtener los datos del desarrollador activo
  let activeDev = null;
  if (!isAdminView) {
    if (manualSimulatedDevUsername) {
      activeDev = devList.find(d => d.username === manualSimulatedDevUsername) || devList[0];
    } else if (!isRealAdmin) {
      activeDev = devList.find(d => d.username === realSession.username) || {
        username: realSession.username || 'desarrollador',
        name: realSession.name || 'Desarrollador STF',
        appsCount: 1,
        role: 'desarrollador'
      };
    } else {
      activeDev = devList[0]; // Por defecto Jose Guzman para preview del admin
    }
  }

  // Filtrar aplicativos a cargo según el desarrollador activo
  const devNameForFilter = isAdminView ? (realSession.name || 'Edwin Diaz') : activeDev.name;
  const myAssignedApps = allSystems.filter(a => {
    const lead = String(a.lead || a.Lider_Responsable || a.leader || '').toLowerCase();
    const query = String(devNameForFilter).toLowerCase();
    return lead.includes(query) || lead.includes(query.split(' ')[0]);
  });

  const assignedNames = myAssignedApps.map(a => a.name || a.Nombre_Aplicativo || a.title).join(', ') || 'Sistemas asignados según cronograma';

  // 2. Construir la barra superior de control (Header del manual)
  let topBarHtml = `
    <div class="manual-top-bar">
      <div class="manual-top-left">
        <div class="manual-role-badge ${isAdminView ? 'role-admin' : 'role-dev'}">
          <i data-lucide="${isAdminView ? 'shield-check' : 'code-2'}"></i>
          <span>${isAdminView ? '👑 MODO ADMINISTRADOR (Jefe TI)' : `💻 MODO DESARROLLADOR (${activeDev ? activeDev.name : 'Ingeniero'})`}</span>
        </div>
        <div class="manual-session-meta">
          <span class="manual-user-chip">
            <i data-lucide="user"></i>
            <strong>${isAdminView ? realSession.name || 'Edwin Diaz' : activeDev.name}</strong> (${isAdminView ? (realSession.username || 'ediaz') : activeDev.username})
          </span>
          <span class="manual-apps-chip">
            <i data-lucide="layers"></i>
            ${isAdminView ? `Supervisión de ${allSystems.length} Aplicativos Activos` : `${myAssignedApps.length} Aplicativos Asignados: <em>${assignedNames}</em>`}
          </span>
          <span class="manual-sync-chip live-pulse" title="Sincronización en vivo con Google Sheets">
            <span class="pulse-dot"></span>
            Sheets Conectado
          </span>
        </div>
      </div>

      <div class="manual-top-actions">
  `;

  // Acciones exclusivas del Super Admin: alternar vista previa de roles y selector de desarrollador
  if (isRealAdmin) {
    topBarHtml += `
      <div class="manual-admin-role-switcher">
        <button type="button" class="btn-manual-toggle-role ${isAdminView ? '' : 'is-preview'}" onclick="toggleManualRoleView()" title="Alternar entre ver las instrucciones como Administrador o como Desarrollador">
          <i data-lucide="${isAdminView ? 'eye' : 'arrow-left'}"></i>
          <span>${isAdminView ? '👁️ Ver como Desarrollador' : '👑 Volver a Vista Admin'}</span>
        </button>
    `;

    if (!isAdminView) {
      topBarHtml += `
        <select class="manual-dev-selector" onchange="setManualSimulatedDev(this.value)" title="Seleccionar qué desarrollador simular">
          ${devList.map(d => `
            <option value="${d.username}" ${activeDev.username === d.username ? 'selected' : ''}>
              Simular: ${d.name} (${d.appsCount} app${d.appsCount > 1 ? 's' : ''})
            </option>
          `).join('')}
        </select>
      `;
    }

    topBarHtml += `</div>`;
  }

  // Botón directo para Exportar y Descargar el Documento PDF Oficial
  topBarHtml += `
        <a href="assets/manual/Manual_Oficial_STF_Aplicativos.pdf" download="Manual_Oficial_STF_Aplicativos.pdf" class="btn-manual-download-pdf" title="Descargar la documentación oficial completa en archivo PDF">
          <i data-lucide="download"></i>
          <span>Exportar Manual PDF Oficial</span>
        </a>
        <button type="button" class="btn-manual-print" onclick="window.print()" title="Imprimir o guardar como PDF en el navegador">
          <i data-lucide="printer"></i>
          <span>Imprimir</span>
        </button>
      </div>
    </div>
  `;

  // 3. Barra de Navegación por Apartados (Pestañas nativas con nombres oficiales del sistema)
  const tabs = [
    { key: 'dashboard', label: '1. Inicio', icon: 'home' },
    { key: 'projects', label: '2. Aplicativos', icon: 'layers' },
    { key: 'tasks', label: '3. Tareas', icon: 'check-square' },
    { key: 'calendar', label: '4. Calendario', icon: 'calendar' },
    { key: 'developers', label: '5. Equipo', icon: 'users' },
    { key: 'analytics', label: '6. Métricas', icon: 'bar-chart-2' },
    { key: 'support', label: '7. Soporte Técnico', icon: 'headphones' },
    { key: 'sheets', label: '8. Google Sheets', icon: 'database' },
    { key: 'intro', label: '9. Credenciales', icon: 'key-round' }
  ];

  let navTabsHtml = `
    <div class="manual-nav-tabs">
      ${tabs.map(t => `
        <button type="button" class="manual-tab-pill ${manualActiveTab === t.key ? 'active' : ''}" onclick="switchManualTab('${t.key}')">
          <i data-lucide="${t.icon}"></i>
          <span>${t.label}</span>
        </button>
      `).join('')}
    </div>
  `;

  // 4. Contenido dinámico del apartado activo
  let contentHtml = '';
  switch (manualActiveTab) {
    case 'dashboard':
      contentHtml = renderManualSectionDashboard(isAdminView, allSystems, myAssignedApps, devNameForFilter);
      break;
    case 'projects':
      contentHtml = renderManualSectionProjects(isAdminView, allSystems, myAssignedApps, devNameForFilter);
      break;
    case 'tasks':
      contentHtml = renderManualSectionTasks(isAdminView, allSystems, myAssignedApps, devNameForFilter);
      break;
    case 'calendar':
      contentHtml = renderManualSectionCalendar(isAdminView, devNameForFilter);
      break;
    case 'developers':
      contentHtml = renderManualSectionDevelopers(isAdminView, devList);
      break;
    case 'analytics':
      contentHtml = renderManualSectionAnalytics(isAdminView, allSystems, myAssignedApps, devNameForFilter);
      break;
    case 'support':
      contentHtml = renderManualSectionSupport(isAdminView, devNameForFilter, myAssignedApps);
      break;
    case 'sheets':
      contentHtml = renderManualSectionSheets(isAdminView);
      break;
    case 'intro':
      contentHtml = renderManualSectionIntro(isAdminView, realSession, devNameForFilter, myAssignedApps, allSystems.length);
      break;
    default:
      contentHtml = renderManualSectionDashboard(isAdminView, allSystems, myAssignedApps, devNameForFilter);
  }

  // 5. Inyectar en el contenedor principal
  container.innerHTML = `
    ${topBarHtml}
    ${navTabsHtml}
    <div class="manual-content-body">
      ${contentHtml}
    </div>
  `;

  // Re-crear iconos de Lucide
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try { window.lucide.createIcons(); } catch (e) { }
  }
}

/**
 * Conmuta entre pestañas del manual nativo
 */
function switchManualTab(tabKey) {
  manualActiveTab = tabKey;
  renderManualNativeView();
  // Scroll suave al inicio del manual
  const topEl = document.querySelector('.manual-top-bar');
  if (topEl) {
    topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Permite al Super Admin alternar la vista entre Admin y Desarrollador
 */
function toggleManualRoleView() {
  if (manualSimulatedRole === 'desarrollador') {
    manualSimulatedRole = 'admin';
  } else {
    manualSimulatedRole = 'desarrollador';
  }
  renderManualNativeView();
}

/**
 * Permite al Super Admin seleccionar qué desarrollador simular
 */
function setManualSimulatedDev(username) {
  manualSimulatedDevUsername = username;
  manualSimulatedRole = 'desarrollador';
  renderManualNativeView();
}

// ============================================================================
// APARTADO 1: DASHBOARD PRINCIPAL & CURVA DE AVANCE S
// ============================================================================
function renderManualSectionDashboard(isAdmin, allSystems, myApps, userName) {
  const total = allSystems.length || 7;
  const myTotal = myApps.length || 3;

  if (!isAdmin) {
    // VISTA EXCLUSIVA DEL DESARROLLADOR CON CAPTURAS REALES ADJUNTADAS
    return `
      <div class="manual-view-section">
        <div class="manual-header-banner">
          <div class="mhb-title-row">
            <div class="mhb-icon-badge"><i data-lucide="layout-dashboard"></i></div>
            <div>
              <h2>Panel de Ingeniería · Centro de Comando del Desarrollador</h2>
              <p class="mhb-subtitle">
                Guía completa con datos y pantallas auténticas para <strong>${userName}</strong>: control de aplicativos asignados, curva de avance vs estimado, métricas ágiles de sprints y auditoría de fases.
              </p>
            </div>
          </div>
        </div>

        <!-- CAPTURA 1: PANEL SUPERIOR (Kpis, Baraja, Curva S, Ficha Técnica) -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/dashboard_dev_top.png" alt="Panel Superior del Desarrollador" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 1.1 · Vista Superior del Panel de Ingeniería</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 1.1:</strong> Barra de KPIs personales (3 Mis Aplicativos, 0 En Riesgo, 69.3% Promedio General), Baraja interactiva de sistemas, Curva S vs Meta proyectada y tarjetas de carga operativa.
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/dashboard_dev_top.png', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: PANEL SUPERIOR -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Interpretación del Panel Superior</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">01</div>
              <div class="step-body">
                <h4>KPIs Personales del Ingeniero</h4>
                <p>En el extremo superior derecho ves tus indicadores consolidados en tiempo real:</p>
                <ul>
                  <li><strong>Mis Aplicativos:</strong> Conteo de sistemas donde eres líder responsable (${myTotal} asignados).</li>
                  <li><strong>En Riesgo:</strong> Alerta inmediata si alguno de tus sistemas presenta retraso respecto a su fecha límite.</li>
                  <li><strong>Promedio General:</strong> Tu avance ponderado consolidado sumando todas tus fases completadas.</li>
                  <li><strong>Sheets Conectado:</strong> Confirma que tus cambios e hitos provienen de la hoja de cálculo de Google Sheets.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">02</div>
              <div class="step-body">
                <h4>Baraja de Aplicativos a Cargo (Stacked Deck)</h4>
                <p>En el costado izquierdo se despliegan tus sistemas asignados (ej. <em>GEO UBICACION TALLERES [10%], OFICINA - APLICATIVOS [100%], COLCHAS [98%]</em>):</p>
                <ul>
                  <li>Haz clic en cada pestaña para conmutar el sistema activo en pantalla.</li>
                  <li>El botón del <strong>ojo azul</strong> te permite abrir de inmediato el desglose de fases.</li>
                  <li>Muestra el nivel de prioridad (*Alta / Media / Baja*) y la fecha límite oficial pactada con Jefatura TI.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">03</div>
              <div class="step-body">
                <h4>Curva de Avance vs. Estimado</h4>
                <p>Gráfica matemática que compara tu rendimiento frente a la meta proyectada:</p>
                <ul>
                  <li><strong>Línea Continua Púrpura/Naranja:</strong> Tu progreso real acumulado basado en fases aprobadas.</li>
                  <li><strong>Línea Punteada:</strong> La meta estimada que el proyecto debería alcanzar para la fecha actual.</li>
                  <li>Puedes filtrar el rango temporal (*Últimos 30 días, Trimestre, Año*) en la esquina superior derecha.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">04</div>
              <div class="step-body">
                <h4>Avance Trimestral & Cumplimiento</h4>
                <p>Muestra tu meta del periodo (ej. <em>Q4 Octubre - Diciembre</em>), la barra cápsula de completitud, los módulos entregados (ej. <em>12 de 18</em>), tu fase dominante y tu estado de cumplimiento (<em>En Tiempo +4d</em>).</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CAPTURA 2: VELOCIDAD DE SPRINTS Y TABLA DE SISTEMAS -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/dashboard_dev_bottom.png" alt="Velocidad de Sprints y Tabla de Aplicativos" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 1.2 · Velocidad de Sprints y Tabla de Sistemas</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 1.2:</strong> Rendimiento ágil en Sprints (67 Módulos, Mes récord Octubre con 17 mods, 468 hrs invertidas, 95% en tiempo) y tabla detallada de aplicativos asignados.
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/dashboard_dev_bottom.png', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: VELOCIDAD Y TABLA -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="activity"></i> Paso a Paso: Métricas Ágiles y Tabla de Sistemas</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">05</div>
              <div class="step-body">
                <h4>Velocidad de Entrega (Sprints)</h4>
                <p>Métricas históricas de productividad personal calculadas en los últimos 6 meses:</p>
                <ul>
                  <li><strong>Módulos Entregados:</strong> Conteo total de entregables técnicos completados y aprobados.</li>
                  <li><strong>Mes Récord (Pico Personal):</strong> Tu mejor mes de entrega (ej. <em>Octubre con 17 Módulos, 170% de la meta</em>).</li>
                  <li><strong>Tiempo Total Invertido:</strong> Horas netas de desarrollo industrial (7.0 hrs promedio por entrega con 95% de estabilidad en planta sin incidencias).</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">06</div>
              <div class="step-body">
                <h4>Tabla "Mis Aplicativos Asignados"</h4>
                <p>Desglose fila por fila con el estado operativo de cada software a tu cargo:</p>
                <ul>
                  <li><strong>Aplicativo / Sistema:</strong> Nombre y código STF (ej. <em>GEO UBICACION TALLERES · STF-GEO-04</em>).</li>
                  <li><strong>Fase Actual:</strong> Etapa en desarrollo (ej. <em>2. Arquitectura & Mapas Satelitales</em>).</li>
                  <li><strong>Avance %:</strong> Barra de progreso proporcional a las fases validadas.</li>
                  <li><strong>Estado:</strong> Etiqueta de salud (<em>En Tiempo</em> o <em>Desplegado</em>).</li>
                  <li><strong>Acción "Ver Fases":</strong> Botón que abre el modal de auditoría y certificación.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- CAPTURA 3: MODAL DE FASES PONDERADAS (COLCHAS) -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/dashboard_modal_fases.jpg" alt="Modal de Fases y Ponderación Oficial" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 1.3 · Modal de Detalle de Fases y Ponderación Oficial</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 1.3:</strong> Ficha técnica del aplicativo con enlace directo <code>Abrir Sistema Web ↗</code>, fecha límite oficial y desglose matemático de las 6 fases (Ponderación Total 100%).
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/dashboard_modal_fases.jpg', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: MODAL DE FASES -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="check-circle-2"></i> Paso a Paso: Cómo Auditar las Fases de un Aplicativo</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">07</div>
              <div class="step-body">
                <h4>Botón "Abrir Sistema Web ↗"</h4>
                <p>Al hacer clic en este botón verde situado en la esquina superior del modal, se abrirá en una pestaña nueva la aplicación en vivo desplegada en planta para que puedas probarla directamente.</p>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">08</div>
              <div class="step-body">
                <h4>Cálculo Ponderado de las 6 Fases (Suma 100%)</h4>
                <p>El porcentaje no es inventado; se calcula sumando el peso de cada fase completada:</p>
                <ul>
                  <li><strong>1. Levantamiento & Requisitos:</strong> Peso 10% (Completada).</li>
                  <li><strong>2. Arquitectura & Diseño UI/UX:</strong> Peso 15% (Completada).</li>
                  <li><strong>3. Desarrollo Backend & Lógica Core:</strong> Peso 30% (Completada).</li>
                  <li><strong>4. Frontend & Conexión Planta:</strong> Peso 25% (Completada).</li>
                  <li><strong>5. Pruebas QA con Operarios:</strong> Peso 18% (Completada).</li>
                  <li><strong>6. Salida en Vivo & Certificación Final:</strong> Peso 2% (Pendiente).</li>
                </ul>
                <p style="margin-top:6px; font-weight:700; color:#059669;">Total Acumulado Real: 98% (5 de 6 Fases aprobadas)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CALLOUT DE PERMISOS DEV -->
        <div class="manual-callout callout-dev">
          <div class="callout-icon"><i data-lucide="shield-alert"></i></div>
          <div class="callout-content">
            <h4>Modo Visual (Solo Lectura) para Desarrolladores</h4>
            <p>
              Como se indica en el banner superior del modal: <em>"Visualización del ciclo de desarrollo. Los avances y fases son auditados y aprobados exclusivamente por la Dirección TI."</em> Si completas un entregable, debes reportarlo al Jefe TI para que asigne el dictamen QA correspondiente y el porcentaje se refleje en Google Sheets.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // VISTA DEL SUPER ADMINISTRADOR (JEFE TI)
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="layout-dashboard"></i></div>
          <div>
            <h2>Panel de Control Principal (Dashboard Ejecutivo) · STF GROUP</h2>
            <p class="mhb-subtitle">
              Supervisión en tiempo real del portafolio completo (${total} aplicativos), curva acumulada S, auditoría de sprints y asignación de ingenieros.
            </p>
          </div>
        </div>
      </div>

      <!-- Screenshot Real Admin -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/dashboard.png" alt="Dashboard Principal Ejecutivo STF GROUP" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 1.1 · Dashboard Ejecutivo de Administración</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 1.1:</strong> Vista consolidada del Super Admin con botones <code>+ Nuevo Aplicativo</code>, <code>+ Asignar Tarea</code>, tarjetas de los 5 desarrolladores y métricas globales.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/dashboard.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- Explicación Paso a Paso Admin -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Guía Paso a Paso para el Administrador</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Crear un Nuevo Aplicativo</h4>
              <p>Haz clic en el botón azul superior <code>+ Nuevo Aplicativo</code>. Diligencia el nombre del sistema, marca textil, líder asignado y fecha límite de entrega para darlo de alta en Google Sheets.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Asignar Tareas con Ponderación</h4>
              <p>Haz clic en <code>+ Asignar Tarea</code>. Selecciona el aplicativo y el desarrollador. El sistema calcula los días vs deadline y envía notificación formal al correo del programador.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Filtrado Instantáneo por Desarrollador</h4>
              <p>Haz clic sobre cualquiera de las 5 tarjetas de desarrolladores (<em>Jose Guzman, Juan David, Esteban Escobar, Mocho, Edwin Diaz</em>). Todo el dashboard se adaptará para mostrar exclusivamente los sistemas y la curva del ingeniero seleccionado.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Auditoría de Curva S y Desvíos</h4>
              <p>Monitorea la línea continua de avance real frente a la línea proyectada naranja. Si la línea de avance cae por debajo, toma acciones de reprogramación en el Calendario de Entregas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- BANNER DE PREVIEW DEV PARA EL ADMIN -->
      <div class="manual-callout callout-admin">
        <div class="callout-icon"><i data-lucide="eye"></i></div>
        <div class="callout-content">
          <h4>¿Quieres ver exactamente cómo ve esta pantalla tu equipo de desarrollo?</h4>
          <p>
            Puedes pulsar el botón superior <strong>"👁️ Ver como Desarrollador"</strong> en este manual. Verás las capturas reales del panel de Jose Guzman, la velocidad de sprints y el modal de auditoría de fases en modo solo lectura.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 2: PORTAFOLIO DE SISTEMAS INDUSTRIALES & FASES
// ============================================================================
function renderManualSectionProjects(isAdmin, allSystems, myApps, userName) {
  if (!isAdmin) {
    // VISTA DEL DESARROLLADOR: MIS APLICATIVOS ASIGNADOS
    return `
      <div class="manual-view-section">
        <div class="manual-header-banner">
          <div class="mhb-title-row">
            <div class="mhb-icon-badge"><i data-lucide="layers"></i></div>
            <div>
              <h2>Mis Aplicativos Asignados · Portafolio y Macro-Etapas</h2>
              <p class="mhb-subtitle">
                Supervisión visual para <strong>${userName}</strong>: control de sistemas a cargo en la cadena textil, estado por macro-etapas (*En Construcción, Puesta en Planta, En Producción*) y líneas de tiempo de fases.
              </p>
            </div>
          </div>
        </div>

        <!-- FIGURA 2.1: ACORDEÓN CERRADO & KPIS SUPERIORES -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/aplicativos_acordeon_cerrado.jpg" alt="Mis Aplicativos Asignados - Vista Acordeón Plegado" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 2.1 · KPIs de Cobertura y Acordeón Inicial Plegado</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 2.1:</strong> Las 4 tarjetas de métricas industriales (Cobertura, Despliegue, Efectividad y Foco Crítico), filtros por área textil y los 3 macro-bloques colapsados por defecto para máxima ergonomía visual.
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/aplicativos_acordeon_cerrado.jpg', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: FIGURA 2.1 -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Estructura y Navegación del Portafolio</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">01</div>
              <div class="step-body">
                <h4>Las 4 Tarjetas de Salud Industrial</h4>
                <p>En la parte superior se resumen tus indicadores de planta:</p>
                <ul>
                  <li><strong>Cobertura de Planta:</strong> Conteo de sistemas a cargo (ej. <em>3 Mis Sistemas · 100% Cadena Textil & Confección</em>).</li>
                  <li><strong>Despliegue Productivo:</strong> Sistemas que ya operan en vivo en planta (ej. <em>1 en Producción · SLA 99.8%</em>).</li>
                  <li><strong>Efectividad de Entregas:</strong> Porcentaje de cumplimiento de plazos (ej. <em>100.0% En Tiempo · 5 de 6 dentro del cronograma</em>).</li>
                  <li><strong>Foco Crítico de Atención:</strong> Alertas tempranas de módulos que requieren sincronización (ej. <em>0 En Riesgo</em>).</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">02</div>
              <div class="step-body">
                <h4>Filtros por Categoría y Buscador en Vivo</h4>
                <p>Puedes filtrar tus sistemas según el área de planta textil:</p>
                <ul>
                  <li>Pestañas: <code>Todos (3)</code>, <code>Grupal (0)</code>, <code>Manufactura (1)</code>, <code>Textil (0)</code>, <code>Talleres (1)</code>, <code>Calidad (0)</code>.</li>
                  <li>Buscador reactivo con tecla rápida <code>⌘K</code> para localizar cualquier sistema por nombre o código STF.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">03</div>
              <div class="step-body">
                <h4>¿Por qué inician cerrados los bloques?</h4>
                <p>Por norma de diseño de STF GROUP, cada vez que ingresas al módulo de aplicativos, los 3 bloques (<em>1. En Construcción, 2. Puesta en Planta, 3. En Producción</em>) <strong>inician siempre plegados</strong>. Esto permite una vista panorámica limpia sin scroll innecesario. Haz clic en <strong>"Desplegar sistemas ▾"</strong> en el bloque que desees consultar.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- FIGURA 2.2: ETAPA 1 Y 2 ABIERTAS -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/aplicativos_etapas_abiertas.jpg" alt="Etapas En Construcción y Puesta en Planta desplegadas" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 2.2 · Despliegue de En Construcción y Puesta en Planta</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 2.2:</strong> Detalle de GEO UBICACION TALLERES (Fase 2 de 6, 10% Avance) y OFICINA - APLICATIVOS (Fase 6 de 6, 100% Avance) con sus líneas de tiempo interactivas y botones de acción rápida.
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/aplicativos_etapas_abiertas.jpg', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: FIGURA 2.2 -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="git-pull-request"></i> Paso a Paso: Líneas de Tiempo de Fases y Acciones</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">04</div>
              <div class="step-body">
                <h4>Lectura de la Línea de Tiempo de Fases</h4>
                <p>Cada tarjeta cuenta con una barra de progreso de 6 hitos con iconos dinámicos:</p>
                <ul>
                  <li><strong>Círculo Verde con Check:</strong> Fase completada y aprobada por auditoría QA.</li>
                  <li><strong>Círculo Azul Numerado:</strong> Fase actual en desarrollo activo.</li>
                  <li><strong>Círculo Gris:</strong> Fases futuras pendientes de iniciar.</li>
                  <li>Por ejemplo: <em>GEO UBICACION TALLERES</em> se encuentra en <code>Fase 2 de 6 · Arquitectura & Mapas Satelitales (10% Avance)</code>.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">05</div>
              <div class="step-body">
                <h4>Alertas de Retraso y Semáforo de Fechas</h4>
                <p>El sistema calcula los días hábiles restantes (excluyendo domingos y festivos colombianos):</p>
                <ul>
                  <li><strong>Badge Rojo (Retraso Crítico):</strong> Indica que la fecha límite se venció y el aplicativo requiere atención urgente.</li>
                  <li><strong>Badge Gris/Azul (Fecha Límite):</strong> Indica el plazo pactado y los días hábiles disponibles (ej. <em>30 de dic · 26d hábiles</em>).</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">06</div>
              <div class="step-body">
                <h4>Botones de Acción en cada Tarjeta</h4>
                <p>En el extremo derecho de cada aplicativo dispones de 3 acciones:</p>
                <ul>
                  <li><strong>↗ Web:</strong> Abre el aplicativo en vivo en el navegador para pruebas directas en planta.</li>
                  <li><strong>👁️ Ver Fases:</strong> Abre el modal de auditoría de fases con los porcentajes matemáticos (10%, 15%, 30%, 25%, 18%, 2%).</li>
                  <li><strong>Badge de Estado:</strong> Muestra la etapa actual (<em>Puesta en Planta</em>, <em>En Prueba</em>, <em>En Producción</em>).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- FIGURA 2.3: ETAPA 3 EN PRODUCCIÓN -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/aplicativos_en_produccion.png" alt="Etapa En Producción desplegada (COLCHAS)" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 2.3 · Despliegue de Etapa 3: En Producción Continua</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 2.3:</strong> Sistema COLCHAS (STF-COL-02 · Manufactura & Producción) en fase 6 de 6 con 98% de avance consolidado y estado oficial "En Producción".
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/aplicativos_en_produccion.png', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: FIGURA 2.3 -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="check-check"></i> Paso a Paso: Salida en Vivo y Certificación Final</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">07</div>
              <div class="step-body">
                <h4>Requisitos para Salida en Vivo (Producción)</h4>
                <p>Para que un aplicativo pase a <strong>3. EN PRODUCCIÓN</strong>, debe haber superado exitosamente la <em>Fase 5: Pruebas QA con Operarios de Planta</em>. Una vez en este bloque, el sistema opera de forma continua y recibe tickets de soporte desde la mesa de ayuda.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="manual-callout callout-dev">
          <div class="callout-icon"><i data-lucide="info"></i></div>
          <div class="callout-content">
            <h4>Ponderación Auditable y Trazabilidad</h4>
            <p>
              El avance promedio general (ej. <strong>69%</strong>) es el promedio ponderado exacto de todos tus aplicativos asignados en Google Sheets. Si necesitas cambiar la fecha límite o reportar una fase terminada, comunícalo al Jefe TI para que asigne el dictamen formal.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // VISTA DEL ADMINISTRADOR (PORTAFOLIO GENERAL)
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="folder-git-2"></i></div>
          <div>
            <h2>Portafolio de Sistemas Industriales · Supervisión del Administrador</h2>
            <p class="mhb-subtitle">
              Gestión centralizada del portafolio completo (${allSystems.length || 7} sistemas), marcas corporativas (*Studio F, ELA, Top Mark*), asignación de ingenieros y ciclo de vida de 6 fases.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/proyectos.png" alt="Portafolio de Sistemas STF GROUP" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Figura 2.1 · Portafolio General y Pipeline de Marcas</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 2.1:</strong> Vista general del portafolio agrupado por marcas corporativas y desglose de las 6 fases de desarrollo.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/proyectos.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="git-branch"></i> Las 6 Fases Oficiales de Ingeniería STF GROUP</h3>
        <p>Todo aplicativo pasa por un ciclo de vida riguroso dividido en 6 etapas ponderadas matemáticamente:</p>

        <div class="phases-breakdown-table">
          <div class="phase-row"><span class="phase-badge phase-1">Fase 1 (10%)</span><strong>Levantamiento de Requerimientos:</strong> Definición de alcance con jefes de planta y operarios.</div>
          <div class="phase-row"><span class="phase-badge phase-2">Fase 2 (15%)</span><strong>Arquitectura & Wireframes:</strong> Diseño de prototipos UX/UI y esquemas de base de datos.</div>
          <div class="phase-row"><span class="phase-badge phase-3">Fase 3 (25%)</span><strong>Desarrollo Frontend:</strong> Interfaces interactivas HTML5/CSS3/JS responsivas para móviles y tablets.</div>
          <div class="phase-row"><span class="phase-badge phase-4">Fase 4 (30%)</span><strong>Desarrollo Backend & Integraciones:</strong> Lógica Google Apps Script, endpoints JSONP y Sheets.</div>
          <div class="phase-row"><span class="phase-badge phase-5">Fase 5 (10%)</span><strong>Pruebas QA & Auditoría:</strong> Validación de bugs, pruebas de carga y verificación con el Jefe TI.</div>
          <div class="phase-row"><span class="phase-badge phase-6">Fase 6 (10%)</span><strong>Puesta en Marcha (Producción):</strong> Despliegue en planta industrial y capacitación al personal.</div>
        </div>
      </div>

      <div class="manual-callout callout-admin">
        <div class="callout-icon"><i data-lucide="eye"></i></div>
        <div class="callout-content">
          <h4>Inspeccionar la Vista de tus Desarrolladores</h4>
          <p>
            Usa el botón superior <strong>"👁️ Ver como Desarrollador"</strong> para comprobar cómo Jose Guzman, Juan David o Esteban visualizan el acordeón de macro-etapas, las líneas de tiempo y las alertas de retraso crítico.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 3: CONTROL DE TAREAS EN VIVO & DICTAMEN QA
// ============================================================================
function renderManualSectionTasks(isAdmin, allSystems, myApps, userName) {
  if (!isAdmin) {
    // VISTA DEL DESARROLLADOR: MIS TAREAS & ENTREGABLES ASIGNADOS
    return `
      <div class="manual-view-section">
        <div class="manual-header-banner">
          <div class="mhb-title-row">
            <div class="mhb-icon-badge"><i data-lucide="check-square"></i></div>
            <div>
              <h2>Mis Tareas & Entregables Asignados · ${userName}</h2>
              <p class="mhb-subtitle">
                Seguimiento de tareas asignadas por el Jefe TI, plazos de entrega, cálculo de días transcurridos y dictamen formal de efectividad técnica.
              </p>
            </div>
          </div>
        </div>

        <!-- FIGURA 3.1: BANDEJA PERSONAL DEL DESARROLLADOR -->
        <div class="manual-screenshot-card">
          <div class="msc-frame">
            <img src="assets/manual/tareas_dev.jpg" alt="Bandeja de Tareas del Desarrollador" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
            <div class="msc-badge-overlay">📸 Figura 3.1 · Bandeja de Entregas del Desarrollador</div>
          </div>
          <div class="msc-footer">
            <div class="msc-caption">
              <strong>Figura 3.1:</strong> Bandeja de Tareas de ${userName} con filtros de estado (*Todas, En Desarrollo, En Riesgo, Auditadas*), convenciones del semáforo y tarjeta de estado al día (*Sin tareas pendientes*).
            </div>
            <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/tareas_dev.jpg', '_blank')">
              <i data-lucide="maximize-2"></i> Ver Imagen Completa
            </button>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: BANDEJA DEV -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Gestión y Convenciones de Tareas</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">01</div>
              <div class="step-body">
                <h4>Recepción y Notificación</h4>
                <p>Cada vez que la Dirección TI te asigna una tarea técnica o módulo de software, el sistema envía una alerta inmediata a tu correo electrónico corporativo con la descripción, el aplicativo y la fecha límite acordada.</p>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">02</div>
              <div class="step-body">
                <h4>El Semáforo de Cumplimiento STF</h4>
                <p>Las tareas se clasifican visualmente mediante 3 estados de color:</p>
                <ul>
                  <li><strong>● Amarillo (Asignada / En Proceso):</strong> Tarea en desarrollo dentro del plazo regular.</li>
                  <li><strong>● Verde (Auditada / Cumplida):</strong> Tarea validada con dictamen aprobatorio del Jefe TI.</li>
                  <li><strong>● Rojo (En Riesgo / Vencida):</strong> Fecha límite sobrepasada que requiere reporte inmediato.</li>
                </ul>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">03</div>
              <div class="step-body">
                <h4>Pestañas de Filtrado Rápido</h4>
                <p>Puedes alternar entre:</p>
                <ul>
                  <li><code>Todas las Tareas</code>: Historial consolidado.</li>
                  <li><code>En Desarrollo</code>: Módulos que estás programando actualmente.</li>
                  <li><code>En Riesgo / Vencidas</code>: Entregables con urgencia de atención.</li>
                  <li><code>Auditadas & Calificadas</code>: Tareas finalizadas con dictamen QA.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- EXPLICACIÓN PASO A PASO: DICTAMEN QA -->
        <div class="manual-guide-block">
          <h3 class="manual-block-title"><i data-lucide="sliders"></i> Flujo de Estados y Calificación de Calidad</h3>
          <div class="manual-steps-grid">
            <div class="manual-step-card">
              <div class="step-number">04</div>
              <div class="step-body">
                <h4>Transición a "Pruebas QA"</h4>
                <p>Cuando finalices la programación de un módulo, debes cambiar el estado de la tarea a <strong>Pruebas QA</strong>. Esto notifica al Administrador para que realice la auditoría técnica.</p>
              </div>
            </div>

            <div class="manual-step-card">
              <div class="step-number">05</div>
              <div class="step-body">
                <h4>La Escala de Calificación QA del Jefe TI</h4>
                <p>El Super Admin evalúa tu entrega otorgando uno de los 4 dictámenes oficiales:</p>
                <ul>
                  <li><strong>Sobresaliente (100 pts):</strong> Código sin fallas, entregado a tiempo y con alta estabilidad.</li>
                  <li><strong>Aprobado (85 pts):</strong> Conforme a especificaciones de planta.</li>
                  <li><strong>Con Observaciones (70 pts):</strong> Aprobado pero requiere ajustes menores.</li>
                  <li><strong>No Conforme:</strong> Rechazado formalmente para corrección y refactorización.</li>
                </ul>
                <p style="margin-top:6px; font-size:12px; color:#4F46E5;">* Esta nota alimenta directamente tu 40% de efectividad en el Directorio TI.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="manual-callout callout-dev">
          <div class="callout-icon"><i data-lucide="clock"></i></div>
          <div class="callout-content">
            <h4>Cálculo Automático de Días Transcurridos</h4>
            <p>
              El sistema calcula de manera continua los días transcurridos desde que se asignó la tarea hasta la fecha actual. Si entregas con anticipación, el sistema registra bonificación por cumplimiento en tus métricas personales.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // VISTA DEL SUPER ADMINISTRADOR
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="check-square"></i></div>
          <div>
            <h2>Integraciones Operativas, Control de Tareas & Dictamen QA · Administrador</h2>
            <p class="mhb-subtitle">
              Supervisión de entregables, asignación con ponderación porcentual, cálculo de días transcurridos vs deadline y dictámenes formales de calidad.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/tareas_dev.jpg" alt="Bandeja de Tareas y Auditoría QA" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Figura 3.1 · Bandeja de Tareas y Auditoría QA</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 3.1:</strong> Bandeja de Tareas del Desarrollador con filtros de estado (*Todas, En Desarrollo, En Riesgo, Auditadas*) y convenciones del semáforo.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/tareas_dev.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 3.1:</strong> Supervisión global de tareas, semáforo de vencimiento, ponderación de fases y dictámenes de calidad asignados por la Jefatura TI.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/tareas.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Guía Paso a Paso para el Administrador</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Cómo Asignar una Nueva Tarea</h4>
              <p>Haz clic en el botón <code>+ Asignar Tarea</code> en el encabezado superior. Selecciona el aplicativo, el desarrollador responsable, el peso porcentual (%) y la fecha límite oficial.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Emitir Dictamen de Calidad QA</h4>
              <p>Cuando un programador pasa una tarea a <em>Pruebas QA</em>, audita el módulo en planta y selecciona la calificación formal (<em>Sobresaliente 100, Aprobado 85, Con Observaciones 70 o No Conforme</em>). El resultado se sincroniza en vivo con la hoja <code>CONTROL_TAREAS</code> de Google Sheets.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-callout callout-admin">
        <div class="callout-icon"><i data-lucide="eye"></i></div>
        <div class="callout-content">
          <h4>Inspeccionar la Bandeja del Desarrollador</h4>
          <p>
            Usa el botón <strong>"👁️ Ver como Desarrollador"</strong> para verificar cómo ve Jose Guzman su bandeja cuando no tiene tareas pendientes o cuando tiene tareas activas asignadas.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 4: CRONOGRAMA FUTURISTA & CALENDARIO STF
// ============================================================================
function renderManualSectionCalendar(isAdmin, userName) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="calendar"></i></div>
          <div>
            <h2>Cronograma Futurista & Calendario de Entregas (v3.5)</h2>
            <p class="mhb-subtitle">
              Sincronizado con la jornada laboral oficial de STF GROUP: Lunes a Sábado de 6:00 a.m. a 1:00 p.m. (7h/día), festivos colombianos y reprogramación interactiva.
            </p>
          </div>
        </div>
      </div>

      <!-- FIGURA 4.1: VISTA MENSUAL PREDETERMINADA -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/calendario_vista_mes.png" alt="Calendario de Entregas STF - Vista Mes" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 4.1 · Vista Mensual (Predeterminada al Ingresar)</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 4.1:</strong> Vista mensual con festivos de ley en Colombia (diagonales rojas: 2 y 16 de noviembre), día actual en vivo (caja amarilla: 27 de nov), domingos de descanso oficial y panel lateral con todo el equipo.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/calendario_vista_mes.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: VISTA MES -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Convenciones y Navegación del Calendario</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Carga Automática Predeterminada</h4>
              <p>Al abrir el calendario, el sistema inicia automáticamente en visual de <strong>MES</strong> y mostrando a <strong>Todo el Equipo</strong>, ofreciendo una panorámica de compromisos sin pasos previos ni filtros obligatorios.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Convenciones de Color Oficiales STF</h4>
              <p>Los días se identifican con un estricto código cromático:</p>
              <ul>
                <li><strong>Diagonales Rojas (Festivos):</strong> Días festivos de ley en Colombia (ej. <em>2 y 16 de Noviembre</em>). El sistema no computa horas laborales en estos días.</li>
                <li><strong>Caja Amarilla:</strong> Indicador visual del <strong>Día Actual en Vivo (Hoy)</strong>.</li>
                <li><strong>Gris Claro (Descanso):</strong> Domingos de descanso obligatorio.</li>
                <li><strong>Verde / Etiquetas de Color:</strong> Entregables de software con hora límite y porcentaje.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Filtrar por Sistema o por Desarrollador</h4>
              <p>En el panel izquierdo puedes hacer clic sobre cualquier proyecto (<em>Torre de Control, Laboratorio, Calidad...</em>) o sobre tu nombre (<em>${userName}</em>) para aislar únicamente tus entregas pactadas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FIGURA 4.2: VISTA SEMANAL CON TURNO INDUSTRIAL -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/calendario_vista_semana.jpg" alt="Calendario STF - Vista Semana" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 4.2 · Vista Semanal y Jornada STF (6am - 1pm)</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 4.2:</strong> Visualización semanal con columnas de Lunes a Sábado de 6:00 a.m. a 1:00 p.m., marca visual de fin de jornada laboral a la 1:00 PM y domingo bloqueado como descanso.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/calendario_vista_semana.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: VISTA SEMANA Y DÍA -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="clock"></i> Horario Laboral STF y Reprogramación</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Jornada Laboral STF Oficial</h4>
              <p>El calendario no utiliza horarios genéricos de oficina (8am-5pm), sino el turno industrial oficial de STF GROUP:</p>
              <ul>
                <li><strong>Lunes a Sábado:</strong> 6:00 a.m. a 1:00 p.m. (7 horas hábiles por día).</li>
                <li><strong>Límite Diario:</strong> Marca amarilla a la <code>01:00 PM (Fin STF)</code>.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">05</div>
            <div class="step-body">
              <h4>${isAdmin ? 'Reprogramación por Arrastre (Drag & Drop)' : 'Consultar Vista Diaria'}</h4>
              <p>${isAdmin ? 'Como Super Administrador, puedes arrastrar cualquier tarjeta de entrega a otro día. La nueva fecha límite se sincroniza de inmediato en Google Sheets.' : 'Los desarrolladores pueden usar el botón <code>Día</code> para revisar en detalle la agenda horaria del día presente sin alterar las fechas maestras fijadas por la jefatura.'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FIGURA 4.3: VISTA DIARIA -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/calendario_vista_dia.jpg" alt="Calendario STF - Vista Día" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 4.3 · Vista Diaria con Detalle de Jornada</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 4.3:</strong> Inspección puntual de la jornada diaria (6:00 AM - 1:00 PM) para consultar entregas específicas de la fecha seleccionada.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/calendario_vista_dia.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="${isAdmin ? 'crown' : 'info'}"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Control de Fechas para el Administrador' : 'Compromisos de Entrega para el Desarrollador'}</h4>
          <p>
            ${isAdmin 
              ? 'Todas las modificaciones que realices en el calendario recalculan automáticamente los días restantes en la vista de Tareas y el estado de riesgo en el Dashboard.' 
              : 'Las fechas fijadas en tu calendario representan los compromisos oficiales de entrega ante la Dirección TI. El sistema te alertará automáticamente cuando falten 4 días para el vencimiento.'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 7: MESA DE AYUDA Y SOPORTE TÉCNICO DE PLANTA
// ============================================================================
function renderManualSectionSupport(isAdmin, userName, myApps) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="headphones"></i></div>
          <div>
            <h2>Mesa de Ayuda, Soporte Técnico de Planta & Evidencias Drive</h2>
            <p class="mhb-subtitle">
              ${isAdmin 
                ? 'Supervisión de tickets de planta textil, depuración de incidencias y trazabilidad de SLA de respuesta.' 
                : `Bandeja de atención técnica para ${userName}: recepción automática, visor de evidencias fotográficas en Drive y dictámenes.`}
            </p>
          </div>
        </div>
      </div>

      <!-- FIGURA 7.1: BANDEJA DEV -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/soporte_bandeja_dev.jpg" alt="Bandeja de Soporte Técnico del Desarrollador" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 7.1 · Bandeja de Soporte de Planta y Telemetría en Vivo</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 7.1:</strong> Bandeja de Soporte de ${userName} con barra de telemetría (7 terminales conectadas, enlace activo), 4 tarjetas de conteo y auto-enrutamiento de aplicativos a cargo.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/soporte_bandeja_dev.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: BANDEJA Y TELEMETRÍA -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Telemetría y Recepción de Incidencias</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Barra de Telemetría en Vivo</h4>
              <p>En el extremo superior se visualiza la conexión con planta textil:</p>
              <ul>
                <li><strong>Enlace Planta Industrial STF:</strong> Comunicación directa sin intermediarios.</li>
                <li><strong>Terminales Conectadas:</strong> Número de computadores y tablets en planta interactuando con el sistema.</li>
                <li><strong>Protocolo SLA Activo:</strong> Cronómetro de respuesta en horas hábiles.</li>
                <li><strong>Botón Sincronizar Planta:</strong> Fuerza la actualización inmediata trayendo nuevos tickets de Google Sheets.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Auto-Enrutamiento por Aplicativo</h4>
              <p>No tienes que clasificar manualmente los tickets. Si un operario reporta un problema en <em>COLCHAS, GEO UBICACIÓN o OFICINA</em>, el sistema lo dirige automáticamente a la bandeja del programador responsable.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Contadores de Estado Operativo</h4>
              <p>Tarjetas numéricas clasificadas por estado:</p>
              <ul>
                <li><strong>Total Solicitudes:</strong> Histórico acumulado.</li>
                <li><strong>Pendientes por Atender:</strong> Novedades que requieren dictamen inmediato.</li>
                <li><strong>Aceptadas en Solución:</strong> Solicitudes en proceso de ajuste.</li>
                <li><strong>Rechazadas / No Aplica:</strong> Desestimadas con justificación técnica.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="shield-alert"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Permiso de Eliminación (Exclusivo Administrador)' : 'Seguridad: ¿Por qué no veo el botón Eliminar?'}</h4>
          <p>
            ${isAdmin 
              ? 'Solo el Super Administrador tiene habilitada la pestaña <code>🗑️ Eliminadas</code> y los botones de borrado para depurar tickets de prueba o duplicados.' 
              : 'Por auditoría de planta y bitácora industrial en STF GROUP, los desarrolladores <strong>no pueden eliminar tickets ni acceder a la papelera</strong>. Toda solicitud debe ser resuelta mediante Aceptación o Rechazo fundamentado.'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 6: EQUIPO TI & RENDIMIENTO DE INGENIERÍA
// ============================================================================
function renderManualSectionDevelopers(isAdmin, devList) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="users"></i></div>
          <div>
            <h2>Directorio de Desarrolladores, Rendimiento & Gestión de Usuarios</h2>
            <p class="mhb-subtitle">
              Métricas consolidadas de efectividad técnica, sincronización bidireccional con la hoja USUARIOS en Google Sheets y personalización de perfiles.
            </p>
          </div>
        </div>
      </div>

      <!-- FIGURA 6.1: DIRECTORIO DE DESARROLLADORES -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/equipo_directorio.jpg" alt="Directorio de Desarrolladores STF GROUP" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 6.1 · Directorio General de Desarrolladores y KPIs</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 6.1:</strong> Vista consolidada del equipo TI con los 4 indicadores superiores (5 Ingenieros, 91.8% Cumplimiento, 92.8% Calidad QA, 8.4 Tareas/Sem) y listado oficial sincronizado con Google Sheets.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/equipo_directorio.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: DIRECTORIO -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Métricas del Equipo y Canales de Contacto</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Los 4 Indicadores Consolidados de Ingeniería</h4>
              <p>En el encabezado se audita el rendimiento conjunto de toda la oficina de aplicativos:</p>
              <ul>
                <li><strong>Programadores Activos:</strong> 5 Ingenieros asignados al 100% de su capacidad.</li>
                <li><strong>Cumplimiento a Tiempo:</strong> 91.8% (+3.4% de mejora frente al mes anterior).</li>
                <li><strong>Índice de Calidad QA:</strong> 92.8% de entregas aprobadas sin fallas críticas en planta.</li>
                <li><strong>Velocidad Promedio:</strong> 8.4 Tareas semanales con cadencia de entrega continua.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Sincronización en Vivo con Google Sheets</h4>
              <p>El indicador verde <code>● Hoja Sheets: Usuarios (Sincronizado)</code> certifica que los nombres, correos electrónicos corporativos, usuarios (@username) y roles provienen de la hoja maestra <code>USUARIOS</code> sin discrepancias locales.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>El Equipo Oficial STF GROUP</h4>
              <p>El directorio reconoce formalmente a los 5 ingenieros:</p>
              <ul>
                <li><strong>Jose Guzman:</strong> <code>@jose@guzman</code> · joseoneiber711@gmail.com (3 Sistemas a cargo).</li>
                <li><strong>Juan David:</strong> <code>@juan@david</code> · juan.david@studiof.com.co (1 Sistema a cargo).</li>
                <li><strong>Esteban Escobar:</strong> <code>@esteban@escobar</code> · esteban.escobar@studiof.com.co (1 Sistema a cargo).</li>
                <li><strong>Jhon Eyder (Mocho):</strong> <code>@jhon@eyder</code> · jhon.eyder@studiof.com.co (1 Sistema a cargo).</li>
                <li><strong>Edwin Diaz:</strong> <code>@ediaz</code> · edwin.diaz@studiof.com.co (Admin Base & Dirección TI).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- FIGURA 6.2: MODAL ACTUALIZAR FOTO DE PERFIL -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/equipo_modal_foto.jpg" alt="Modal de Actualización de Foto de Perfil" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 6.2 · Modal de Actualización de Foto de Perfil</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 6.2:</strong> Modal interactivo de personalización de foto de perfil con vista previa en tiempo real, carga por arrastre, enlace URL o selección de avatares oficiales.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/equipo_modal_foto.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: CAMBIO DE FOTO -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="camera"></i> Paso a Paso: Cómo Cambiar tu Foto de Perfil</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Abrir el Modal de Foto</h4>
              <p>En tu propia fila del directorio (identificada con la etiqueta azul <em>[tú]</em>), haz clic en el botón <strong>"📷 Cambiar Mi Foto"</strong>. También puedes hacer clic sobre tu avatar en la esquina superior derecha del encabezado principal.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">05</div>
            <div class="step-body">
              <h4>3 Métodos para Asignar tu Foto</h4>
              <p>El sistema te ofrece total flexibilidad:</p>
              <ul>
                <li><strong>1. Arrastrar o Subir Archivo:</strong> Admite imágenes en formato JPG, PNG, WEBP o GIF con auto-recorte cuadrado automático.</li>
                <li><strong>2. Enlace Directo:</strong> Pega una URL de internet y presiona el botón <em>Probar</em>.</li>
                <li><strong>3. Avatares Oficiales:</strong> Si no tienes una foto a mano, selecciona cualquiera de los 5 avatares predeterminados con un solo clic.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">06</div>
            <div class="step-body">
              <h4>Guardar y Persistir</h4>
              <p>Presiona el botón <strong>"✓ Guardar Foto"</strong>. Tu nueva imagen se actualizará al instante en la barra superior, en las tarjetas del Dashboard, en el Calendario y quedará guardada de forma permanente para tus próximas sesiones.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="${isAdmin ? 'crown' : 'shield-check'}"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Gestión de Nuevos Programadores' : 'Seguridad de tu Cuenta de Ingeniero'}</h4>
          <p>
            ${isAdmin 
              ? 'Como Administrador tienes habilitado el botón <code>+ Nuevo Dev</code> para registrar nuevos programadores en Google Sheets asignándoles rol y credenciales.' 
              : 'Tu perfil está vinculado a tu cuenta en Google Sheets. Tu contraseña oficial es fija y segura, y puedes actualizar tu fotografía en cualquier momento.'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 6: MÉTRICAS DE CALIDAD, QA & ANALYTICS
// ============================================================================
function renderManualSectionAnalytics(isAdmin, allSystems, myApps, userName) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="bar-chart-2"></i></div>
          <div>
            <h2>Métricas de Calidad, QA & Analítica Industrial · STF GROUP</h2>
            <p class="mhb-subtitle">
              ${isAdmin 
                ? 'Control integral de defectos, estabilidad en planta, cobertura de digitalización y balanceo de carga del equipo.' 
                : `Tus métricas personales de calidad · ${userName}: defectos resueltos, avance ponderado y cumplimiento SLA.`}
            </p>
          </div>
        </div>
      </div>

      <!-- FIGURA 6.1: KPIS DE CALIDAD Y QA -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/metricas_kpis_dev.png" alt="Métricas Personales de QA & Avance" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 6.1 · Indicadores Clave de Calidad & QA</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 6.1:</strong> Las 4 tarjetas superiores de calidad de ${userName}: Sistemas Auditados (3), Avance Ponderado (69.0%), Incidencias QA (34 detectadas, 28 subsanadas al 82%) e Índice de Eficiencia (95% SLA).
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/metricas_kpis_dev.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: KPIS DE CALIDAD -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso: Interpretación de los Indicadores QA</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Sistemas Auditados</h4>
              <p>Conteo oficial de aplicativos a cargo del ingeniero que se encuentran en ciclo de vida activo (ej. <em>3 Sistemas a cargo de Jose Guzman</em>).</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Avance Ponderado Consolidado</h4>
              <p>Promedio ponderado global según las fases completadas (ej. <em>69.0% · 1 en Producción, 2 en curso</em>). Si un aplicativo avanza de fase, este porcentaje sube de inmediato.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Control de Incidencias QA</h4>
              <p>Monitoreo de bugs detectados durante pruebas de laboratorio y planta:</p>
              <ul>
                <li><strong>34 Detectadas:</strong> Total de novedades reportadas en pruebas técnicas.</li>
                <li><strong>28 Subsanadas (82%):</strong> Defectos corregidos y validados por el Jefe TI antes de la salida en vivo.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Índice de Eficiencia (SLA)</h4>
              <p>Medición del cumplimiento en tiempo (ej. <em>95% SLA · 100% en tiempo</em>). Refleja la estabilidad del software entregado y la ausencia de rebrotes de bugs.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FIGURA 6.2: GRÁFICAS ANALÍTICAS AVANZADAS -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/metricas_graficas_analiticas.png" alt="Gráficas Analíticas de Planta y Balanceo de Carga" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar en tamaño completo" />
          <div class="msc-badge-overlay">📸 Figura 6.2 · Gráficas Analíticas Avanzadas de Planta</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 6.2:</strong> Los 4 cuadrantes analíticos: Donut de Avance por Sistema (69%), Comparativa de Incidencias QA por Aplicativo, Madurez Tecnológica por Área Textil y Balanceo de Carga del Equipo.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/metricas_graficas_analiticas.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- EXPLICACIÓN PASO A PASO: 4 CUADRANTES ANALÍTICOS -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="pie-chart"></i> Análisis de los 4 Cuadrantes Analíticos</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">05</div>
            <div class="step-body">
              <h4>1. Avance Ponderado por Marca / Categoría</h4>
              <p>Gráfica de dona circular con el 69% promedio en el centro. Muestra el peso individual de cada desarrollo:</p>
              <ul>
                <li><code>GEO UBICACION TALLERES:</code> 10% de avance.</li>
                <li><code>OFICINA - APLICATIVOS:</code> 100% completado.</li>
                <li><code>COLCHAS:</code> 98% en certificación final.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">06</div>
            <div class="step-body">
              <h4>2. Estado de Pruebas QA & Incidencias</h4>
              <p>Barras comparativas de doble color por sistema:</p>
              <ul>
                <li><strong>Barra Naranja:</strong> Incidencias detectadas durante auditoría.</li>
                <li><strong>Barra Azul:</strong> Incidencias subsanadas y certificadas.</li>
                <li><strong>Bugs Críticos en Planta:</strong> 0 (Estabilidad confirmada).</li>
                <li><strong>Dictamen Auditoría:</strong> 98.5% AQL (Nivel de Calidad Aceptable de estándar internacional).</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">07</div>
            <div class="step-body">
              <h4>3. Cobertura de Digitalización por Área de Planta</h4>
              <p>Mide la penetración del software en la cadena de confección STF:</p>
              <ul>
                <li><strong>Manufactura (Colchas):</strong> 100% En Producción.</li>
                <li><strong>Aseguramiento de Calidad:</strong> 100% En Producción.</li>
                <li><strong>Torre de Control & TI:</strong> 100% En Producción.</li>
                <li><strong>Planta Textil (Tintorería):</strong> 100% En Producción.</li>
                <li><strong>Logística & Satélites:</strong> 10% En Desarrollo.</li>
                <li><strong>Control Textil (Laboratorio):</strong> 5% En Desarrollo.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">08</div>
            <div class="step-body">
              <h4>4. Balanceo de Capacidad & Carga del Equipo</h4>
              <p>Gráfica de saturación de ingeniería frente al benchmark del 100%:</p>
              <ul>
                <li><strong>Jose Guzman:</strong> 60% Carga Óptima (0 activas · 3 sistemas).</li>
                <li><strong>Juan David:</strong> 45% Carga Óptima (3 activas · 1 sistema).</li>
                <li><strong>Esteban Escobar:</strong> 30% Carga Óptima (2 activas · 1 sistema).</li>
                <li><strong>Jhon Eyder (Mocho):</strong> 30% Carga Óptima (2 activas · 1 sistema).</li>
                <li><strong>Edwin Diaz:</strong> 20% Capacidad Libre (0 activas · 1 sistema).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="${isAdmin ? 'crown' : 'check-circle-2'}"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Gestión de Carga para el Super Administrador' : 'Compromiso de Calidad para el Desarrollador'}</h4>
          <p>
            ${isAdmin 
              ? 'Usa el cuadrante de Balanceo de Capacidad para evitar la sobrecarga de un programador. Si un desarrollador supera el 80% de saturación, reasigna nuevas tareas a quienes tienen capacidad disponible.' 
              : 'Para mantener tu indicador de calidad por encima del 90%, asegúrate de subsanar los defectos reportados en la barra naranja antes de solicitar el pase a la Fase 6 de Producción.'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 7: BASE DE DATOS EN GOOGLE SHEETS & ARQUITECTURA
// ============================================================================
function renderManualSectionSheets(isAdmin) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="database"></i></div>
          <div>
            <h2>Base de Datos Cloud en Google Sheets & Google Apps Script</h2>
            <p class="mhb-subtitle">
              Estructura relacional de 6 hojas maestras conectadas en tiempo real sin servidores complejos.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/sheets.jpg" alt="Hoja USUARIOS en Google Sheets" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Base de Datos Maestra en Google Sheets</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 7.1:</strong> Hoja USUARIOS en Google Sheets mostrando las columnas blindadas contra sobreescritura (Columna A: ID).
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/sheets.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="table"></i> Las 6 Hojas Maestras Oficiales de la Plataforma</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>USUARIOS</h4>
              <p>Credenciales de acceso, contraseñas oficiales fijas, nombres completos, correos y roles (admin vs desarrollador).</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>SISTEMAS_WEB</h4>
              <p>Registro maestro de aplicativos, marcas (Studio F, ELA), URLs activas, líderes asignados y fechas límites.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>CONTROL_TAREAS</h4>
              <p>Módulos asignados, ponderación porcentual, estados de desarrollo y dictamen QA formal.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>SOLICITUDES_SOPORTE</h4>
              <p>Tickets generados por operarios en planta con enlaces directos a Google Drive para las evidencias.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">05</div>
            <div class="step-body">
              <h4>HISTORIAL_OBSERVACIONES</h4>
              <p>Bitácora de comentarios y justificaciones redactadas por los desarrolladores al atender tickets.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">06</div>
            <div class="step-body">
              <h4>BITACORA_HISTORIAL</h4>
              <p>Registro inmutable de auditoría con fecha, hora, usuario y acción ejecutada para control del Jefe TI.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 8: ACCESO, ROLES & SEGURIDAD
// ============================================================================
function renderManualSectionIntro(isAdmin, session, userName, myApps, totalApps) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="key-round"></i></div>
          <div>
            <h2>Credenciales Oficiales, Seguridad & Recuperación de Acceso</h2>
            <p class="mhb-subtitle">
              Mecanismos de autenticación, contraseñas fijas blindadas y restablecimiento seguro vía correo electrónico.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="lock"></i> Tu Cuenta en el Sistema</h3>
        <p>Tu cuenta actual es <strong>${session.username || 'usuario'}</strong> con el perfil de <strong>${isAdmin ? 'Super Administrador (Jefe TI)' : 'Desarrollador de Software'}</strong>.</p>
        <p>Las contraseñas se encuentran resguardadas y no se pierden al sincronizar con Google Sheets.</p>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="mail"></i> Recuperación de Contraseña Olvidada (Código OTP)</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Solicitar Código</h4>
              <p>En la pantalla de inicio de sesión haz clic en <em>"¿Olvidaste tu contraseña?"</em> e introduce tu usuario o correo corporativo STF.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Revisar Bandeja de Entrada</h4>
              <p>El backend de Google Apps Script genera un token de 6 dígitos numéricos y lo envía a tu Gmail corporativo.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Ingresar Nuevo Password</h4>
              <p>Escribe el código recibido y tu nueva contraseña. El sistema actualiza la fila correspondiente en la hoja <code>USUARIOS</code> de Google Sheets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Exportar globalmente
window.renderManualNativeView = renderManualNativeView;
window.switchManualTab = switchManualTab;
window.toggleManualRoleView = toggleManualRoleView;
window.setManualSimulatedDev = setManualSimulatedDev;
