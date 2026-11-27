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

  // 3. Barra de Navegación por Apartados (Pestañas nativas)
  const tabs = [
    { key: 'dashboard', label: '1. Dashboard & Curva S', icon: 'layout-dashboard' },
    { key: 'projects', label: '2. Portafolio & Fases', icon: 'folder-git-2' },
    { key: 'tasks', label: '3. Tareas & Dictamen QA', icon: 'check-square' },
    { key: 'calendar', label: '4. Cronograma & Calendario', icon: 'calendar' },
    { key: 'support', label: '5. Mesa de Ayuda de Planta', icon: 'headphones' },
    { key: 'developers', label: '6. Equipo TI & Rendimiento', icon: 'users' },
    { key: 'sheets', label: '7. Base de Datos & Sheets', icon: 'database' },
    { key: 'intro', label: '8. Credenciales & Seguridad', icon: 'key-round' }
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
    case 'support':
      contentHtml = renderManualSectionSupport(isAdminView, devNameForFilter, myAssignedApps);
      break;
    case 'developers':
      contentHtml = renderManualSectionDevelopers(isAdminView, devList);
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
  const myTotal = myApps.length || 1;

  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="layout-dashboard"></i></div>
          <div>
            <h2>Panel de Control Principal (Dashboard) & Curva S de Avance</h2>
            <p class="mhb-subtitle">
              ${isAdmin 
                ? 'Supervisión en tiempo real del estado de ingeniería, curva de avance vs estimado y asignación del equipo.' 
                : `Tu centro de comando personal · ${userName}: aplicativos asignados, avance de fases y porcentaje ponderado.`}
            </p>
          </div>
        </div>
      </div>

      <!-- Screenshot Real -->
      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/dashboard.png" alt="Dashboard Principal STF GROUP" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para abrir imagen en tamaño completo" />
          <div class="msc-badge-overlay">📸 Pantallazo Real del Sistema STF GROUP</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 1.1:</strong> Vista general del Dashboard con KPIs superiores, baraja de sistemas, Curva S acumulada y tarjetas de desarrolladores.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/dashboard.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <!-- Explicación Paso a Paso -->
      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Guía Paso a Paso: Cómo Navegar e Interpretar el Dashboard</h3>

        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Barra Superior de Indicadores (KPIs Clave)</h4>
              <p>En el extremo superior derecho se muestran los contadores consolidados calculados matemáticamente:</p>
              <ul>
                <li><strong>Aplicativos Activos:</strong> ${total} sistemas registrados en la hoja de Google Sheets.</li>
                <li><strong>En Riesgo:</strong> Conteo de proyectos cuya fecha estimada de entrega está vencida o próxima a vencer.</li>
                <li><strong>Promedio General:</strong> Sumatoria ponderada del avance de todas las fases.</li>
                <li><strong>Sheets Conectado:</strong> Indicador verde que confirma que los datos provienen directamente de la nube sin intermediarios.</li>
              </ul>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>La Baraja de Sistemas (Stacked Deck)</h4>
              <p>Muestra el aplicativo activo seleccionado. Haz clic en las pestañas laterales para alternar entre sistemas (<em>Torre de Control, Laboratorio, Colchas, etc.</em>).</p>
              <p>El porcentaje visual refleja la fórmula matemática de las 6 fases de ingeniería (Requerimientos, Wireframes, Frontend, Backend, Pruebas QA y Producción).</p>
              ${isAdmin 
                ? '<div class="role-tip admin-tip"><strong>Acción de Admin:</strong> Haz clic en el botón de lápiz azul para editar el nombre, líder asignado o fecha límite.</div>'
                : '<div class="role-tip dev-tip"><strong>Visualización Dev:</strong> Solo lectura. Para solicitar cambios de fecha límite debes acordarlo con el Jefe TI.</div>'}
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Curva de Avance vs. Estimado (Curva S)</h4>
              <p>Gráfica interactiva de alta resolución que traza dos líneas de tiempo:</p>
              <ul>
                <li><strong>Línea Continua Púrpura:</strong> Avance real acumulado reportado en las fases completadas.</li>
                <li><strong>Línea Discontinua Naranja:</strong> Meta proyectada que debería tener el proyecto a la fecha actual.</li>
              </ul>
              <p>Si la línea púrpura está por debajo de la naranja, el sistema marca el proyecto como retrasado.</p>
            </div>
          </div>

          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Tarjetas de Desarrolladores y Filtrado Inmediato</h4>
              <p>En la parte inferior se exhiben los ingenieros del equipo con su avatar real, % de efectividad y cantidad de aplicativos asignados.</p>
              <p><strong>Interacción clave:</strong> Al hacer clic sobre cualquier desarrollador (por ejemplo, <em>${userName}</em>), todo el dashboard filtra de inmediato sus métricas personales, su baraja de sistemas y sus tareas pendientes.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de Permisos -->
      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="${isAdmin ? 'crown' : 'info'}"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Atribuciones del Administrador en el Dashboard' : 'Atribuciones del Desarrollador en el Dashboard'}</h4>
          <p>
            ${isAdmin 
              ? 'Puedes crear nuevos aplicativos con <code>+ Nuevo Aplicativo</code>, reasignar líderes, modificar fechas de entrega, ajustar la jornada laboral y auditar el avance global de todo el equipo.' 
              : `Tienes acceso de consulta completo a tus <strong>${myTotal} aplicativos a cargo</strong>. Puedes consultar el progreso detallado de tus fases, revisar entregables y ver el estado de salud de tus proyectos.`}
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
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="folder-git-2"></i></div>
          <div>
            <h2>Portafolio de Sistemas Industriales, Marcas y Ciclo de Vida</h2>
            <p class="mhb-subtitle">
              Visualización multi-modo (Pipeline por Fases, Matriz Operativa y Cuadrícula de Marcas) con control de fases del 10% al 100%.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/proyectos.png" alt="Portafolio de Sistemas STF GROUP" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Portafolio de Proyectos y Fases</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 2.1:</strong> Módulo de Portafolio Industrial, agrupado por marcas corporativas y desglose de las 6 fases de desarrollo.
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

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Paso a Paso para Inspeccionar y Gestionar un Sistema</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Filtro Rápido por Marca</h4>
              <p>Haz clic en las pestañas superiores (<em>Todas, Studio F, ELA, Top Mark</em>) para segmentar el portafolio según la línea de negocio textil a la que pertenece cada desarrollo.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Alternar Vistas (Pipeline vs Cuadrícula)</h4>
              <p>Usa los botones de la esquina derecha para ver los sistemas como tarjetas agrupadas por su fase actual o como una tabla detallada con fechas y entregables.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Abrir la Ficha Técnica de Auditoría</h4>
              <p>Haz clic en cualquier tarjeta para abrir el modal de desglose completo. Allí podrás ver el enlace oficial al sistema web, la fecha límite exacta y los módulos entregados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 3: CONTROL DE TAREAS EN VIVO & DICTAMEN QA
// ============================================================================
function renderManualSectionTasks(isAdmin, allSystems, myApps, userName) {
  return `
    <div class="manual-view-section">
      <div class="manual-header-banner">
        <div class="mhb-title-row">
          <div class="mhb-icon-badge"><i data-lucide="check-square"></i></div>
          <div>
            <h2>Integraciones Operativas, Control de Tareas & Dictamen QA</h2>
            <p class="mhb-subtitle">
              ${isAdmin 
                ? 'Asignación ponderada de tareas, control de días transcurridos vs deadline y calificación formal de calidad.' 
                : `Tus compromisos asignados por el Jefe TI · ${userName}: seguimiento de plazos, cambio de estados y dictámenes.`}
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/tareas.png" alt="Control de Tareas y Dictamen QA" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Módulo de Tareas y Auditoría QA</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 3.1:</strong> Bandeja de Tareas con semáforo de vencimiento, días transcurridos, ponderación (%) y dictamen del Jefe TI.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/tareas.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="sliders"></i> El Flujo de Estados de una Tarea Técnica</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Asignación Inicial (Pendiente)</h4>
              <p>${isAdmin ? 'Haces clic en <code>+ Asignar Tarea</code>, eliges el aplicativo, el programador responsable, la ponderación del entregable (%) y la fecha límite.' : 'Recibes una notificación en tu correo corporativo con los requerimientos exactos y la fecha límite acordada.'}</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>En Desarrollo</h4>
              <p>El programador inicia la codificación del módulo. El sistema calcula en vivo los días transcurridos desde la fecha de asignación.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Paso a Pruebas QA</h4>
              <p>Cuando el código está listo, el desarrollador cambia el estado a <em>Pruebas QA</em> para que el Administrador evalúe el entregable.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Dictamen de Calidad QA</h4>
              <p>El Super Admin audita la solución y otorga una calificación formal:</p>
              <ul>
                <li><strong>Sobresaliente (100 pts):</strong> Código sin fallas y entrega en tiempo récord.</li>
                <li><strong>Aprobado (85 pts):</strong> Conforme a requerimientos técnicos.</li>
                <li><strong>Con Observaciones (70 pts):</strong> Aprobado con ajustes menores requeridos.</li>
                <li><strong>No Conforme:</strong> Rechazo formal con solicitud de corrección.</li>
              </ul>
            </div>
          </div>
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
              Sincronizado con la jornada laboral oficial de STF GROUP: Lunes a Sábado de 6:00 a.m. a 1:00 p.m. con festivos colombianos.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/calendario.jpg" alt="Calendario de Entregas STF" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Calendario en Vista Mes con Todo el Equipo</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 4.1:</strong> Calendario mensual con festivos de ley en Colombia (diagonales rojas), día actual resaltado y entregables por desarrollador.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/calendario.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="clock"></i> Reglas Laborales y Convenciones Visuales</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Jornada Laboral STF</h4>
              <p>• <strong>Lunes a Sábado:</strong> 6:00 a.m. a 1:00 p.m. (7 horas hábiles diarias).<br/>
              • <strong>Domingos:</strong> Días no laborales (color gris suave).<br/>
              • <strong>Festivos Oficiales de Colombia:</strong> Días no laborales con patrón de rayas rojas de advertencia.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Carga Automática Predeterminada</h4>
              <p>Al abrir el calendario, el sistema inicia automáticamente en visual de <strong>MES</strong> y mostrando a <strong>Todo el Equipo</strong>, ofreciendo una panorámica global sin pasos adicionales.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Filtro de Desarrollador</h4>
              <p>En el panel izquierdo puedes hacer clic sobre tu nombre o sobre un proyecto específico para limpiar la visualización y ver exclusivamente los plazos que te competen.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>${isAdmin ? 'Reprogramación por Arrastre (Drag & Drop)' : 'Inspección de Compromisos'}</h4>
              <p>${isAdmin ? 'Como Super Admin puedes arrastrar cualquier bloque de entrega a un nuevo día. La fecha límite se actualiza de inmediato en Google Sheets.' : 'Los desarrolladores pueden consultar las fechas programadas sin alterar las fechas maestras fijadas por la jefatura.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// APARTADO 5: MESA DE AYUDA Y SOPORTE TÉCNICO DE PLANTA
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
              Atención directa a solicitudes reportadas por operarios y supervisores textiles desde planta de producción.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/soporte.jpg" alt="Mesa de Ayuda y Soporte" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Bandeja de Soporte Técnico y SLA</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 5.1:</strong> Módulo de Soporte Técnico con tarjetas de incidencias, SLA de respuesta, botón de visor de evidencias y dictámenes.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/soporte.jpg', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="list-ordered"></i> Protocolo de Atención para Desarrolladores</h3>
        <div class="manual-steps-grid">
          <div class="manual-step-card">
            <div class="step-number">01</div>
            <div class="step-body">
              <h4>Recepción Automática de Incidencias</h4>
              <p>Los operarios de planta envían tickets desde <code>solicitud-soporte.html</code>. El sistema lee el aplicativo reportado y lo asigna automáticamente al desarrollador responsable.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">02</div>
            <div class="step-body">
              <h4>Inspección de Evidencia Fotográfica</h4>
              <p>Haz clic en el botón <strong>"Ver Evidencia"</strong> de la tarjeta. Se abrirá el visor fotográfico con la imagen capturada por el operario en planta (almacenada en Google Drive).</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">03</div>
            <div class="step-body">
              <h4>Aceptar en Solución</h4>
              <p>Si la falla es válida, haz clic en <strong>Aceptar en Solución</strong> (botón verde). Define el tiempo estimado de entrega (ETA). El solicitante recibe un correo automático de confirmación.</p>
            </div>
          </div>
          <div class="manual-step-card">
            <div class="step-number">04</div>
            <div class="step-body">
              <h4>Rechazar Solicitud (Con Justificación Obligatoria)</h4>
              <p>Si la solicitud no procede (por ejemplo, error operativo o mal uso), haz clic en <strong>Rechazar</strong>. Es <strong>estrictamente obligatorio escribir una justificación técnica clara</strong> para informar al operario.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="manual-callout ${isAdmin ? 'callout-admin' : 'callout-dev'}">
        <div class="callout-icon"><i data-lucide="shield-alert"></i></div>
        <div class="callout-content">
          <h4>${isAdmin ? 'Gestión de Eliminación Exclusiva para Administradores' : '¿Por qué no puedo eliminar tickets?'}</h4>
          <p>
            ${isAdmin 
              ? 'Solo el Super Administrador tiene visible la pestaña <code>🗑️ Eliminadas</code> y los botones de borrado para depurar tickets duplicados o de prueba.' 
              : 'Por políticas de auditoría y trazabilidad industrial en STF GROUP, los desarrolladores <strong>no pueden eliminar tickets</strong>. Toda solicitud debe ser resuelta mediante Aceptación o Rechazo fundamentado.'}
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
              Métricas individuales de efectividad técnica, canales de contacto y capacidad operativa del equipo.
            </p>
          </div>
        </div>
      </div>

      <div class="manual-screenshot-card">
        <div class="msc-frame">
          <img src="assets/manual/desarrolladores.png" alt="Directorio de Desarrolladores STF" class="msc-img" onclick="window.open(this.src, '_blank')" title="Clic para ampliar" />
          <div class="msc-badge-overlay">📸 Pantallazo Real: Directorio y Efectividad del Equipo TI</div>
        </div>
        <div class="msc-footer">
          <div class="msc-caption">
            <strong>Figura 6.1:</strong> Tarjetas individuales de los 5 ingenieros del equipo con sus indicadores de cumplimiento y aplicativos asignados.
          </div>
          <button type="button" class="btn-zoom-img" onclick="window.open('assets/manual/desarrolladores.png', '_blank')">
            <i data-lucide="maximize-2"></i> Ver Imagen Completa
          </button>
        </div>
      </div>

      <div class="manual-guide-block">
        <h3 class="manual-block-title"><i data-lucide="award"></i> Cómo se Calcula la Efectividad del Desarrollador</h3>
        <p>El porcentaje de efectividad de cada programador se calcula automáticamente combinando 3 factores:</p>
        <ul>
          <li><strong>Puntualidad en Entregas (40%):</strong> Cumplimiento de fechas límite fijadas en el cronograma.</li>
          <li><strong>Promedio de Calificación QA (40%):</strong> Puntuación otorgada por el Jefe TI en los dictámenes formales.</li>
          <li><strong>Resolución de Soporte (20%):</strong> Velocidad y calidad en la atención de solicitudes de planta.</li>
        </ul>
      </div>

      ${isAdmin ? `
        <div class="manual-callout callout-admin">
          <div class="callout-icon"><i data-lucide="user-plus"></i></div>
          <div class="callout-content">
            <h4>Creación y Gestión de Usuarios para el Administrador</h4>
            <p>Puedes crear nuevos desarrolladores con el botón <code>+ Nuevo Dev</code>. El sistema crea el usuario localmente y lo ancla en la hoja <code>USUARIOS</code> de Google Sheets sin sobrescribir contraseñas existentes.</p>
          </div>
        </div>
      ` : ''}
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
