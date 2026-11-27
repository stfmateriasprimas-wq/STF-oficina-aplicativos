/**
 * ============================================================================
 * STF GROUP · MANUAL DE USO INTERACTIVO Y CENTRO DE AYUDA POR ROLES
 * ============================================================================
 * Proporciona asistencia interactiva dentro del sistema adaptada dinámicamente
 * al perfil del usuario autenticado (Administrador vs. Desarrollador) con datos
 * reales del sistema, imágenes capturadas y actualización en tiempo real.
 */

let manualActiveTab = 'intro';
let manualSimulatedRole = null; // null usa el rol real de la sesión; permite al admin alternar vista

/**
 * Abre el modal interactivo del manual
 */
function openInteractiveManualModal() {
  const modal = document.getElementById('modalInteractiveManual');
  if (!modal) return;

  manualSimulatedRole = null; // Restablecer al rol real de la sesión
  manualActiveTab = 'intro';
  modal.style.display = 'flex';
  modal.classList.add('is-open');

  renderInteractiveManualContent();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Cierra el modal interactivo del manual
 */
function closeInteractiveManualModal() {
  const modal = document.getElementById('modalInteractiveManual');
  if (!modal) return;
  modal.style.display = 'none';
  modal.classList.remove('is-open');
}

/**
 * Conmuta la pestaña activa dentro del manual
 */
function switchManualTab(tabKey) {
  manualActiveTab = tabKey;
  
  // Actualizar botones de navegación lateral
  document.querySelectorAll('.manual-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  renderInteractiveManualContent();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Permite al Super Admin alternar la vista previa entre Admin y Desarrollador
 */
function toggleManualRoleView() {
  if (typeof isCurrentSessionAdmin === 'function' && !isCurrentSessionAdmin()) return;

  if (manualSimulatedRole === 'desarrollador') {
    manualSimulatedRole = 'admin';
  } else {
    manualSimulatedRole = 'desarrollador';
  }

  renderInteractiveManualContent();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Renderiza el contenido dinámico del manual según el rol y los datos reales
 */
function renderInteractiveManualContent() {
  const viewport = document.getElementById('manualContentViewport');
  const roleBadge = document.getElementById('manualRoleBadge');
  const userLive = document.getElementById('manualUserLive');
  const btnSwitchRole = document.getElementById('btnManualSwitchRole');
  const switchRoleText = document.getElementById('manualSwitchRoleText');
  if (!viewport) return;

  // Obtener datos reales de sesión
  let session = (typeof getLoggedSessionUser === 'function') ? getLoggedSessionUser() : null;
  if (!session) {
    try {
      session = JSON.parse(localStorage.getItem('STF_LOGGED_USER') || '{}');
    } catch (e) {
      session = { name: 'Usuario STF', username: 'stf_user', role: 'desarrollador' };
    }
  }

  const realIsAdmin = (typeof isCurrentSessionAdmin === 'function') ? isCurrentSessionAdmin() : (session.username === 'ediaz');
  const displayRole = manualSimulatedRole || (realIsAdmin ? 'admin' : 'desarrollador');
  const isAdminView = (displayRole === 'admin');

  // Actualizar botón de simulación si es el Super Admin real
  if (btnSwitchRole) {
    if (realIsAdmin) {
      btnSwitchRole.style.display = 'inline-flex';
      if (isAdminView) {
        switchRoleText.textContent = 'Ver cómo lo ve el Desarrollador';
      } else {
        switchRoleText.textContent = 'Regresar a vista Administrador';
      }
    } else {
      btnSwitchRole.style.display = 'none';
    }
  }

  // Encabezados dinámicos
  if (roleBadge) {
    roleBadge.textContent = isAdminView ? '👑 Panel de Administrador' : '💻 Panel de Desarrollador';
    roleBadge.className = isAdminView ? 'badge badge-admin' : 'badge badge-dev';
  }

  // Obtener aplicativos y estadísticas reales en vivo
  const allApps = (window.systemsData && Array.isArray(window.systemsData)) ? window.systemsData : 
                  (window.apps && Array.isArray(window.apps)) ? window.apps : [];
  
  const devName = session.name || session.username || 'Desarrollador';
  const myAssignedApps = allApps.filter(a => {
    const lead = String(a.lead || a.Lider_Responsable || a.leader || '').toLowerCase();
    const myName = String(devName).toLowerCase();
    const myUser = String(session.username || '').toLowerCase();
    return lead.includes(myName) || (myUser && lead.includes(myUser.split('@')[0]));
  });

  const myAppNames = myAssignedApps.map(a => a.name || a.Nombre_Aplicativo || a.title).join(', ') || 'Sistemas asignados según cronograma';

  if (userLive) {
    userLive.innerHTML = `<strong>${devName}</strong> (${session.username || 'activo'}) · ${isAdminView ? 'Supervisión de todo el portafolio' : `${myAssignedApps.length} aplicativos a cargo`}`;
  }

  // Generar contenido por pestaña
  let html = '';

  switch (manualActiveTab) {
    case 'intro':
      html = renderTabIntro(isAdminView, session, devName, myAppNames, myAssignedApps.length, allApps.length);
      break;
    case 'dashboard':
      html = renderTabDashboard(isAdminView, allApps.length);
      break;
    case 'calendar':
      html = renderTabCalendar(isAdminView);
      break;
    case 'tasks':
      html = renderTabTasks(isAdminView);
      break;
    case 'support':
      html = renderTabSupport(isAdminView);
      break;
    case 'sheets':
      html = renderTabSheets(isAdminView);
      break;
    default:
      html = renderTabIntro(isAdminView, session, devName, myAppNames, myAssignedApps.length, allApps.length);
  }

  viewport.innerHTML = html;
}

/**
 * Pestaña 1: Tu Perfil & Acceso
 */
function renderTabIntro(isAdmin, session, devName, myAppNames, myAppsCount, totalApps) {
  if (isAdmin) {
    return `
      <div class="manual-section">
        <div class="manual-section-hero">
          <h3>👑 Bienvenido al Panel de Administración · ${devName}</h3>
          <p>Como Super Administrador tienes el control total de la plataforma de ingeniería de STF GROUP. Puedes supervisar los <strong>${totalApps} aplicativos activos</strong>, asignar tareas con ponderación, calificar con dictámenes QA y administrar la base de datos en Google Sheets.</p>
        </div>

        <div class="manual-grid-cards">
          <div class="manual-card highlight">
            <div class="manual-card-icon"><i data-lucide="shield-check"></i></div>
            <h4>Tus Privilegios de Super Admin</h4>
            <ul>
              <li><strong>Creación y Asignación:</strong> Botones <code>+ Nuevo Aplicativo</code> y <code>+ Asignar Tarea</code> siempre disponibles.</li>
              <li><strong>Auditoría QA:</strong> Dictámenes de calidad formal para aprobar o rechazar entregas de software.</li>
              <li><strong>Gestión de Soporte:</strong> Acceso exclusivo a la papelera <code>🗑️ Eliminadas</code> y borrado definitivo de tickets.</li>
              <li><strong>Infraestructura:</strong> Conexión y sincronización forzada con Google Sheets y Google Apps Script.</li>
            </ul>
          </div>

          <div class="manual-card">
            <div class="manual-card-icon"><i data-lucide="key-round"></i></div>
            <h4>Credenciales y Seguridad</h4>
            <p>Tu usuario oficial es <code>${session.username || 'ediaz'}</code> con contraseña oficial fija. En caso de olvido, dispones del restablecimiento mediante código numérico OTP de 6 dígitos que llega a tu bandeja corporativa.</p>
          </div>
        </div>

        <div class="manual-callout info">
          <i data-lucide="info"></i>
          <div>
            <strong>Consejo para el Administrador:</strong> Puedes usar el botón superior <em>"Ver cómo lo ve el Desarrollador"</em> en este mismo manual para consultar la interfaz y permisos que tienen Jose Guzman, Juan David, Esteban y Mocho.
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="manual-section">
        <div class="manual-section-hero">
          <h3>💻 Bienvenido a tu Panel de Desarrollo · ${devName}</h3>
          <p>Esta plataforma te permite dar seguimiento a tus entregables, reportar avances de software, atender requerimientos de planta textil y coordinar tu calendario laboral sin datos ficticios.</p>
        </div>

        <div class="manual-grid-cards">
          <div class="manual-card highlight">
            <div class="manual-card-icon"><i data-lucide="layers"></i></div>
            <h4>Tus Aplicativos a Cargo (${myAppsCount})</h4>
            <p style="font-size: 13.5px; font-weight: 600; color: #4F46E5; margin: 8px 0;">${myAppNames}</p>
            <p style="font-size: 12.5px; color: #64748B;">Las solicitudes de soporte técnico y las tareas asignadas a estos sistemas ingresarán automáticamente a tus bandejas de trabajo.</p>
          </div>

          <div class="manual-card">
            <div class="manual-card-icon"><i data-lucide="clock"></i></div>
            <h4>Jornada Laboral STF</h4>
            <p>Tu calendario y entregas están calculados bajo el horario laboral oficial de STF GROUP:</p>
            <ul>
              <li><strong>Lunes a Sábado:</strong> 6:00 a.m. a 1:00 p.m. (7 horas diarias).</li>
              <li><strong>Domingos y Festivos:</strong> Descanso oficial (marcados en gris y rojo).</li>
            </ul>
          </div>
        </div>

        <div class="manual-callout success">
          <i data-lucide="check-circle-2"></i>
          <div>
            <strong>Tu Contraseña es Fija y Segura:</strong> Tu contraseña oficial en Google Sheets está blindada contra sobreescritura. Puedes iniciar sesión con total confianza desde cualquier computador de la compañía.
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Pestaña 2: Dashboard & KPIs
 */
function renderTabDashboard(isAdmin, totalApps) {
  return `
    <div class="manual-section">
      <div class="manual-section-hero">
        <h3>📊 ${isAdmin ? 'Monitoreo Ejecutivo y KPIs en Tiempo Real' : 'Mi Panel de Progreso y Aplicativos'}</h3>
        <p>El Dashboard principal centraliza los indicadores de avance porcentual y el estado de salud de cada desarrollo tecnológico.</p>
      </div>

      <div class="manual-image-container">
        <img src="assets/manual/dashboard.png" alt="Dashboard Principal STF GROUP" class="manual-screenshot" />
        <div class="manual-image-caption">
          <span>📸 Captura Real: Dashboard Ejecutivo, Curva de Avance y Métricas del Equipo STF GROUP</span>
        </div>
      </div>

      <div class="manual-steps-list">
        <div class="manual-step-item">
          <div class="manual-step-badge">1</div>
          <div class="manual-step-text">
            <h4>Indicadores Clave Superiores (KPIs)</h4>
            <p><strong>Aplicativos Activos:</strong> Total de desarrollos en curso (${totalApps} sistemas).<br/>
            <strong>En Riesgo:</strong> Conteo de aplicativos que presentan retraso frente a su fecha límite de entrega.<br/>
            <strong>Promedio General:</strong> Porcentaje matemático de avance consolidado de toda la ingeniería.<br/>
            <strong>Sheets Conectado:</strong> Luz verde que confirma que los datos en pantalla están sincronizados en vivo con Google Sheets.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">2</div>
          <div class="manual-step-text">
            <h4>Curva de Avance vs. Estimado</h4>
            <p>Grafica el progreso real histórico frente a la meta proyectada. Permite detectar desvíos con semanas de anticipación para tomar medidas preventivas.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">3</div>
          <div class="manual-step-text">
            <h4>Ponderación en 6 Fases de Ingeniería</h4>
            <p>Cada aplicativo alcanza el 100% sumando sus 6 fases oficiales:<br/>
            <code>Requerimientos (10%)</code> + <code>Wireframes (15%)</code> + <code>Frontend (25%)</code> + <code>Backend (30%)</code> + <code>Pruebas QA (10%)</code> + <code>Producción (10%)</code>.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Pestaña 3: Cronograma & Calendario de Entregas
 */
function renderTabCalendar(isAdmin) {
  return `
    <div class="manual-section">
      <div class="manual-section-hero">
        <h3>📅 Cronograma Futurista & Calendario de Entregas (v3.5)</h3>
        <p>Organización visual de fechas límite, entregables y compromisos reales. No contiene reuniones ni datos de prueba.</p>
      </div>

      <div class="manual-image-container">
        <img src="assets/manual/calendario.jpg" alt="Calendario de Entregas en vista MES" class="manual-screenshot" />
        <div class="manual-image-caption">
          <span>📸 Captura Real: Calendario en vista MES con Todo el Equipo, festivos colombianos y horario laboral</span>
        </div>
      </div>

      <div class="manual-steps-list">
        <div class="manual-step-item">
          <div class="manual-step-badge">1</div>
          <div class="manual-step-text">
            <h4>Configuración Predeterminada al Ingresar</h4>
            <p>El calendario carga automáticamente en la visual de <strong>MES</strong> y mostrando a <strong>Todo el Equipo</strong>, brindando una vista global inmediata sin tener que aplicar filtros manuales.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">2</div>
          <div class="manual-step-text">
            <h4>Convenciones de Colores</h4>
            <p>• <span class="badge badge-danger">Rojo Diagonales:</span> Días festivos oficiales colombianos (días no laborales).<br/>
            • <span class="badge badge-warning">Borde Amarillo:</span> Indicador visual del <strong>Día Actual (Hoy)</strong>.<br/>
            • <span class="badge" style="background:#E2E8F0; color:#475569;">Gris:</span> Domingos oficiales de descanso de ley.<br/>
            • <span class="badge badge-success">Cajas Verdes / Color:</span> Tareas y entregas fijadas con su hora y % de avance.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">3</div>
          <div class="manual-step-text">
            <h4>${isAdmin ? 'Supervisión por Proyecto o Programador' : 'Cómo Filtrar tus Proyectos'}</h4>
            <p>En el panel izquierdo puedes hacer clic en cualquier aplicativo (*Torre de Control, Laboratorio, Colchas...*) o en tu nombre en la lista de desarrolladores para aislar únicamente tus compromisos.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Pestaña 4: Control de Tareas & Dictamen QA
 */
function renderTabTasks(isAdmin) {
  return `
    <div class="manual-section">
      <div class="manual-section-hero">
        <h3>📋 ${isAdmin ? 'Asignación de Tareas y Auditoría de Calidad QA' : 'Ciclo de Vida de Tareas y Entregables'}</h3>
        <p>Flujo completo de ingeniería desde la asignación formal hasta la verificación y dictamen de calidad.</p>
      </div>

      <div class="manual-grid-cards">
        <div class="manual-card">
          <h4>1. Asignación y Notificación</h4>
          <p>${isAdmin ? 'Como Administrador, haz clic en <code>+ Asignar Tarea</code>. Define el aplicativo, programador responsable, ponderación (%) y fecha límite. El sistema envía un correo formal inmediato al desarrollador.' : 'Cada vez que el Super Admin te asigna un módulo o tarea, recibes una notificación automática en tu Gmail corporativo con los detalles y plazos.'}</p>
        </div>

        <div class="manual-card">
          <h4>2. Transición de Estados</h4>
          <p>Las tareas evolucionan en 4 etapas:<br/>
          <code>Pendiente</code> ➔ <code>En Desarrollo</code> ➔ <code>Pruebas QA</code> ➔ <code>Completada</code>.<br/>
          El desarrollador debe mover el estado a <em>Pruebas QA</em> cuando el código esté listo para validación.</p>
        </div>

        <div class="manual-card highlight">
          <h4>3. Dictamen de Calidad QA</h4>
          <p>El Super Admin evalúa la entrega asignando un puntaje:<br/>
          • <strong>Sobresaliente (100 pts)</strong>: Código y estabilidad perfecta.<br/>
          • <strong>Aprobado (85 pts)</strong>: Conforme a requerimientos.<br/>
          • <strong>Con Observaciones (70 pts)</strong>: Aprobado con ajustes menores.<br/>
          • <strong>No Conforme</strong>: Rechazo para corrección.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Pestaña 5: Mesa de Ayuda y Soporte Técnico (Planta)
 */
function renderTabSupport(isAdmin) {
  return `
    <div class="manual-section">
      <div class="manual-section-hero">
        <h3>🎧 Bandeja de Soporte Técnico en Planta Industrial</h3>
        <p>Atención directa y trazabilidad de requerimientos generados por operarios y supervisores textiles.</p>
      </div>

      <div class="manual-image-container">
        <img src="assets/manual/soporte.jpg" alt="Bandeja de Soporte Técnico" class="manual-screenshot" />
        <div class="manual-image-caption">
          <span>📸 Captura Real: Bandeja de Soporte, tarjetas de solicitudes, SLA y protocolo de atención</span>
        </div>
      </div>

      <div class="manual-steps-list">
        <div class="manual-step-item">
          <div class="manual-step-badge">1</div>
          <div class="manual-step-text">
            <h4>Recepción de Tickets desde Planta</h4>
            <p>Los operarios reportan incidencias en <code>solicitud-soporte.html</code> adjuntando fotografías de la falla. Cada ticket genera un código único (ej. <code>TCK-2026-0842</code>) y la imagen se almacena en Google Drive.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">2</div>
          <div class="manual-step-text">
            <h4>Acciones del Desarrollador (Aceptar o Rechazar)</h4>
            <p>• <strong>Aceptar en Solución:</strong> Haz clic en el botón verde y escribe el tiempo estimado de entrega (ETA). El operario recibe confirmación por correo.<br/>
            • <strong>Rechazar Solicitud:</strong> Haz clic en el botón rojo. Es <strong>obligatorio redactar una justificación técnica</strong> explicando por qué no procede y se puede adjuntar foto de contra-evidencia.</p>
          </div>
        </div>

        <div class="manual-step-item">
          <div class="manual-step-badge">3</div>
          <div class="manual-step-text">
            <h4>${isAdmin ? 'Permiso de Eliminación (Exclusivo Administrador)' : 'Seguridad: ¿Por qué no veo el botón Eliminar?'}</h4>
            <p>${isAdmin ? 'Como Super Admin tienes acceso exclusivo al filtro <code>🗑️ Eliminadas</code> y a los botones de borrado para depurar tickets duplicados o de prueba.' : 'Por auditoría de planta y bitácora, los desarrolladores <strong>tienen oculto el botón de eliminar y la papelera</strong>. Todas las solicitudes deben ser atendidas mediante dictamen (Aceptar o Rechazar).'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Pestaña 6: Base de Datos & Sheets
 */
function renderTabSheets(isAdmin) {
  return `
    <div class="manual-section">
      <div class="manual-section-hero">
        <h3>🗄️ Base de Datos en Google Sheets & Arquitectura en la Nube</h3>
        <p>Estructura relacional de 6 hojas maestras conectadas en tiempo real sin bases de datos complejas.</p>
      </div>

      <div class="manual-image-container">
        <img src="assets/manual/sheets.jpg" alt="Hoja USUARIOS en Google Sheets" class="manual-screenshot" />
        <div class="manual-image-caption">
          <span>📸 Captura Real: Hoja USUARIOS en Google Sheets mostrando el blindaje de la Columna A (ID)</span>
        </div>
      </div>

      <div class="manual-grid-cards">
        <div class="manual-card">
          <h4>Las 6 Hojas Maestras Oficiales</h4>
          <ul>
            <li><code>USUARIOS</code> (Credenciales fijas y roles)</li>
            <li><code>SISTEMAS_WEB</code> (URLs y directores)</li>
            <li><code>CONTROL_TAREAS</code> (Entregables y QA)</li>
            <li><code>HISTORIAL_OBSERVACIONES</code> (Novedades)</li>
            <li><code>BITACORA_HISTORIAL</code> (Auditoría inmutable)</li>
            <li><code>SOLICITUDES_SOPORTE</code> (Tickets de planta)</li>
          </ul>
        </div>

        <div class="manual-card highlight">
          <h4>Seguridad y Resiliencia Offline</h4>
          <p>• <strong>Anti-Fórmula Injection:</strong> Cualquier entrada que empiece por <code>=</code>, <code>+</code> o <code>-</code> se almacena con apóstrofe para neutralizar fórmulas maliciosas.<br/>
          • <strong>Modo Offline:</strong> Si se cae el internet en planta, el sistema guarda tus cambios en el navegador y los sincroniza automáticamente cuando regresa la red.</p>
        </div>
      </div>
    </div>
  `;
}

// Exponer funciones en window para invocación global
window.openInteractiveManualModal = openInteractiveManualModal;
window.closeInteractiveManualModal = closeInteractiveManualModal;
window.switchManualTab = switchManualTab;
window.toggleManualRoleView = toggleManualRoleView;
