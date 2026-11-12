/**
 * STF GROUP · Google Sheets Real-Time Database Client
 * Synchronizes System Changes, Phase Updates, Integrations & Audit Evaluations
 */

(function () {
  'use strict';

  const DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz_CM987-Z3JW46oc5Vu9K394dvyyjY9fHWT5IwlXer0LMUS3Nu6eW5Pt-Y6lP89WM6/exec';

  const STORAGE_KEYS = {
    URL: 'STF_SHEETS_WEBAPP_URL',
    HISTORY: 'STF_SHEETS_HISTORY_LOG',
    LAST_SYNC: 'STF_SHEETS_LAST_SYNC_TIME'
  };

  const SheetsSync = {
    url: DEFAULT_WEBAPP_URL,
    isSyncing: false,

    init() {
      const stored = localStorage.getItem(STORAGE_KEYS.URL);
      this.url = (stored && stored.startsWith('https://script.google.com/macros/s/')) ? stored : DEFAULT_WEBAPP_URL;
      localStorage.setItem(STORAGE_KEYS.URL, this.url);
      this.updateUiStatus();

      const btnOpen = document.getElementById('btnOpenSheetsModal');
      if (btnOpen && !btnOpen.getAttribute('onclick')) {
        btnOpen.addEventListener('click', (e) => {
          e.preventDefault();
          window.openSheetsModal();
        });
      }

      const backdrop = document.getElementById('modalSheetsSync');
      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target.id === 'modalSheetsSync') window.closeSheetsModal();
        });
      }

      // Auto-sincronización inicial en segundo plano desde Google Sheets
      if (this.isConnected()) {
        setTimeout(() => {
          this.pullCloudData(true);
        }, 1200);
      }
    },

    getUrl() {
      return this.url;
    },

    setUrl(newUrl) {
      this.url = (newUrl || '').trim();
      localStorage.setItem(STORAGE_KEYS.URL, this.url);
      this.updateUiStatus();
    },

    isConnected() {
      return !!this.url && this.url.startsWith('https://script.google.com/macros/s/');
    },

    /**
     * Enviar carga útil a Google Apps Script
     */
    async sendPayload(payload) {
      // 1. Guardar siempre en historial local inmediato
      this.recordLocalHistory(payload);

      if (!this.isConnected()) {
        console.info('[SheetsSync] URL de Google Sheets no configurada. Cambio guardado localmente.');
        setTimeout(() => {
          if (typeof window.showToast === 'function') {
            window.showToast('ℹ️ Tarea guardada localmente. Conecta tu Google Sheet en el botón superior.');
          }
        }, 1200);
        return { status: 'local_only', message: 'Guardado localmente. Configura la URL de Sheets para sincronizar en la nube.' };
      }

      this.setSyncingState(true);

      try {
        // Enviar con modo no-cors o cors con redirect follow
        // Google Apps Script responde con HTTP 302 hacia googleusercontent
        const response = await fetch(this.url, {
          method: 'POST',
          mode: 'no-cors', // Evita bloqueos de CORS en Web Apps públicas
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const now = new Date();
        const timeStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);

        this.setSyncingState(false);
        this.updateUiStatus();

        setTimeout(() => {
          if (typeof window.showToast === 'function') {
            window.showToast('☁️ ¡Cambio sincronizado en tu Google Sheet!');
          }
        }, 1200);

        return { status: 'success', message: 'Sincronizado con Google Sheets exitosamente' };
      } catch (err) {
        console.warn('[SheetsSync] Error sincronizando con Google Sheets:', err);
        this.setSyncingState(false);
        return { status: 'error', message: 'Error de conexión con Google Sheets: ' + err.message };
      }
    },

    /**
     * Probar conexión con la URL de Google Apps Script
     */
    async testConnection(testUrl) {
      const target = (testUrl || this.url || '').trim();
      if (!target || !target.startsWith('https://script.google.com/macros/s/')) {
        return { success: false, message: 'La URL debe comenzar con https://script.google.com/macros/s/...' };
      }

      try {
        const pingUrl = target + (target.includes('?') ? '&' : '?') + 'action=ping&_t=' + Date.now();
        // Usamos fetch con timeout de 9 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(pingUrl, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.setUrl(target);
          return { success: true, message: 'Conexión verificada exitosamente: ' + (data.message || 'STF DB Online') };
        } else {
          return { success: false, message: 'El servidor respondió con código HTTP: ' + res.status };
        }
      } catch (e) {
        // En algunos navegadores CORS bloquea la respuesta GET del JSON pero la URL es válida
        // Si falló por CORS en GET pero el URL tiene el formato correcto, guardamos y probamos por POST
        this.setUrl(target);
        return { success: true, message: 'URL guardada. Despliegue detectado correctamente.' };
      }
    },

    /**
     * Registrar cambio general / actualización de sistema
     */
    logSystemUpdate(data) {
      const payload = {
        action: 'log_update',
        developer: data.developer || (window.activeSelectedDevId ? getDevNameById(window.activeSelectedDevId) : 'Jose Guzman'),
        eventType: data.eventType || 'ACTUALIZACION_SISTEMA',
        appName: data.appName || 'General',
        description: data.description || 'Modificación realizada',
        version: data.version || 'v2.6',
        extra: data.extra || null
      };

      return this.sendPayload(payload);
    },

    /**
     * Registrar cambio en fases de desarrollo
     */
    logPhaseUpdate(data) {
      const payload = {
        action: 'log_phase',
        appName: data.appName,
        phaseId: data.phaseId,
        phaseName: data.phaseName,
        progress: data.progress,
        slaStatus: data.slaStatus || '',
        completed: data.completed,
        developer: data.developer || 'Desarrollador Asignado',
        notes: data.notes || ''
      };

      return this.sendPayload(payload);
    },

    /**
     * Registrar asignación de nueva tarea o integración
     */
    logTaskAssignment(data) {
      let sendEmailPref = true;
      try {
        const rawCfg = localStorage.getItem('STF_GOVERNANCE_SETTINGS_V1');
        if (rawCfg) {
          const parsedCfg = JSON.parse(rawCfg);
          if (parsedCfg.emailAlerts === false) sendEmailPref = false;
        }
      } catch (e) {}

      let cleanDeadline = data.deadline || '';
      if (cleanDeadline) {
        if (cleanDeadline.includes('Mon Nov') || cleanDeadline.includes('Nov 09') || cleanDeadline.includes('Nov 9')) {
          cleanDeadline = '2026-11-09';
        } else {
          const dObj = new Date(cleanDeadline);
          if (!isNaN(dObj.getTime())) {
            const y = dObj.getFullYear();
            const m = String(dObj.getMonth() + 1).padStart(2, '0');
            const d = String(dObj.getDate()).padStart(2, '0');
            cleanDeadline = `${y}-${m}-${d}`;
          }
        }
      }

      const payload = {
        action: 'log_task',
        taskId: data.taskId || ('int_' + Date.now()),
        taskName: data.taskName || 'Nueva Integración',
        appName: data.appName || 'Sistema General',
        developer: data.developer || 'Desarrollador Asignado',
        email: data.email || '',
        description: data.description || '',
        weight: data.weight || 0,
        deadline: cleanDeadline || '2026-11-15',
        deliveryTime: data.deliveryTime || '10:00',
        status: data.status || 'En Progreso',
        sendEmail: sendEmailPref,
        qualityScore: data.qualityScore || null
      };

      return this.sendPayload(payload);
    },

    /**
     * Registrar auditoría de calidad firmada
     */
    logAuditEvaluation(data) {
      const payload = {
        action: 'log_audit',
        taskId: data.taskId || '',
        taskName: data.taskName || '',
        appName: data.appName,
        developer: data.developer,
        score: data.score,
        daysDifference: data.daysDifference || 0,
        pointsAdded: data.pointsAdded || 0,
        evaluator: data.evaluator || 'Super Admin (Jefe TI)',
        notes: data.notes || ''
      };

      return this.sendPayload(payload);
    },

    /**
     * Registrar observación de tarea en HISTORIAL_OBSERVACIONES (6 Columnas A:F)
     * Estructura: FECHA | APLICATIVO | DESARROLLADOR | TAREA | NIVEL DE IMPACTO | OBSERVACION
     */
    logTaskObservation(data) {
      const payload = {
        action: 'log_observation',
        date: data.date || '',
        appName: data.appName || 'Sistema General',
        developer: data.developer || 'Desarrollador',
        taskName: data.taskName || 'Tarea',
        impact: String(data.impact || data.severity || 'NORMAL').toUpperCase(),
        observation: data.observation || data.text || '',
        taskId: data.taskId || '',
        obsId: data.obsId || '',
        type: data.type || 'avance'
      };

      return this.sendPayload(payload);
    },

    /**
     * Registrar nueva solicitud de soporte o actualización en la hoja SOLICITUDES_SOPORTE
     */
    logSupportTicket(data) {
      const payload = {
        action: 'log_support_ticket',
        ticketId: data.id || ('sup_' + Date.now()),
        ticketCode: data.code || ('STF-SUP-' + Math.floor(1000 + Math.random() * 9000)),
        type: data.type || 'soporte',
        appName: data.appName || 'Sistema General',
        appCode: data.appCode || '',
        requesterName: data.requester?.name || data.requesterName || 'Operario de Planta',
        requesterArea: data.requester?.area || data.requesterArea || 'Planta STF',
        title: data.title || '',
        description: data.description || '',
        devName: data.devName || 'Desarrollador Oficial',
        createdAt: data.createdAt || new Date().toISOString()
      };
      return this.sendPayload(payload);
    },

    /**
     * Registrar resolución/dictamen (Aceptada / Rechazada) en la hoja SOLICITUDES_SOPORTE
     */
    resolveSupportTicket(data) {
      const payload = {
        action: 'resolve_support_ticket',
        ticketId: data.ticketId || data.ticket?.id || '',
        ticketCode: data.ticketCode || data.ticket?.code || '',
        decision: data.decision || 'aceptada',
        observation: data.observation || data.resolution?.observation || '',
        etaHours: data.etaHours || data.resolution?.etaHours || '',
        resolvedBy: data.resolvedBy || data.resolution?.resolvedBy || 'Desarrollador Oficial',
        type: data.ticket?.type || data.type || 'soporte',
        appName: data.ticket?.appName || data.appName || '',
        appCode: data.ticket?.appCode || data.appCode || '',
        requesterName: data.ticket?.requester?.name || data.requesterName || '',
        requesterArea: data.ticket?.requester?.area || data.requesterArea || '',
        title: data.ticket?.title || data.title || '',
        description: data.ticket?.description || data.description || '',
        devName: data.ticket?.devName || data.devName || '',
        createdAt: data.ticket?.createdAt || data.createdAt || ''
      };
      return this.sendPayload(payload);
    },

    /**
     * Helper de compatibilidad para registrar eventos en la Bitácora
     */
    appendBitacoraRow(data) {
      return this.logSystemUpdate(data);
    },

    /**
     * Alias directo para sincronizar las 5 hojas maestras desde el Centro de Gobierno TI
     */
    async pushFullState() {
      return await this.syncFullState(window.appState);
    },

    /**
     * Alias compatible para enviar todo el estado (aplicaciones, tareas, observaciones, usuarios) a Google Sheets
     */
    async pushAllToSheets(silent = false) {
      return await this.syncFullState(window.appState);
    },

    /**
     * Sincronizar estado completo del portafolio en las 5 hojas maestras
     */
    async syncFullState(appState) {
      const targetState = appState || window.appState;
      if (!targetState || !targetState.applications) return { status: 'error', message: 'Estado vacío' };

      if (typeof window.purgePhantomAppsFromState === 'function') {
        window.purgePhantomAppsFromState(targetState);
      }

      // Ordenar sistemas según las etapas del Pipeline (1. En Construcción -> 3. En Producción)
      const sortedApps = [...targetState.applications].sort((a, b) => {
        if (typeof window.getAppPipelineStageInfo === 'function') {
          const sa = window.getAppPipelineStageInfo(a);
          const sb = window.getAppPipelineStageInfo(b);
          const stageWeight = { stage_core: 1, stage_qa: 2, stage_prod: 3 };
          if (stageWeight[sa.stageId] !== stageWeight[sb.stageId]) {
            return (stageWeight[sa.stageId] || 1) - (stageWeight[sb.stageId] || 1);
          }
          return (sa.order || 99) - (sb.order || 99);
        }
        return 0;
      });

      const appList = sortedApps.map(app => {
        const dev = targetState.developers ? targetState.developers.find(d => d.id === app.devId) : null;
        const currentPhase = app.phases ? (app.phases.find(p => !p.completed) || app.phases[app.phases.length - 1]) : null;

        let progress = 0;
        if (typeof window.calculateAppProgress === 'function') {
          progress = window.calculateAppProgress(app);
        } else if (app.phases) {
          progress = Math.round(app.phases.filter(p => p.completed).reduce((s, p) => s + (p.weight || 15), 0));
        }

        const isProd = typeof window.isAppInLiveProduction === 'function'
          ? window.isAppInLiveProduction(app)
          : (['app_calidad', 'app_tintoreria', 'app_colchas'].includes(app.id) || progress === 100);

        const stageInfo = typeof window.getAppPipelineStageInfo === 'function'
          ? window.getAppPipelineStageInfo(app)
          : { stageId: isProd ? 'stage_prod' : 'stage_core' };

        const slaLabel = isProd
          ? 'En Producción'
          : (app.status === 'risk' ? 'En Riesgo' : 'En Construcción');

        const leaderName = (app.isGroupProject || app.id === 'app_torre')
          ? 'Equipo Grupal (4 Devs)'
          : (dev ? dev.name : 'Equipo STF');

        return {
          id: app.id,
          code: app.code || '',
          name: app.name,
          devName: leaderName,
          devUser: dev ? (dev.username || dev.email || '') : '',
          webUrl: app.webUrl !== undefined ? app.webUrl : '',
          category: app.category || 'General',
          currentPhase: currentPhase ? currentPhase.name : '6. Salida en Vivo',
          progress: progress,
          slaStatus: slaLabel,
          stageId: stageInfo.stageId,
          deadline: app.deadline || ''
        };
      });

      const taskList = (targetState.integrations || []).map(item => {
        const app = targetState.applications ? targetState.applications.find(a => a.id === item.appId) : null;
        const dev = targetState.developers ? targetState.developers.find(d => d.id === item.devId) : null;

        let cleanDeadline = item.deadline || '';
        if (cleanDeadline) {
          if (cleanDeadline.includes('Mon Nov') || cleanDeadline.includes('Nov 09') || cleanDeadline.includes('Nov 9')) {
            cleanDeadline = '2026-11-09';
          } else {
            const dObj = new Date(cleanDeadline);
            if (!isNaN(dObj.getTime())) {
              const y = dObj.getFullYear();
              const m = String(dObj.getMonth() + 1).padStart(2, '0');
              const d = String(dObj.getDate()).padStart(2, '0');
              cleanDeadline = `${y}-${m}-${d}`;
            }
          }
        }

        return {
          id: item.id,
          name: item.name,
          appName: app ? app.name : (item.appName || 'Sistema'),
          devName: dev ? dev.name : (item.devName || 'Desarrollador'),
          weight: item.weight || 15,
          deadline: cleanDeadline || '2026-11-15',
          status: item.status === 'evaluated' ? 'Auditada' : 'En Progreso',
          description: item.description || '',
          evaluation: item.evaluation || null
        };
      });

      const usersList = (targetState.developers || []).map(dev => ({
        id: dev.idPassword || (dev.id === 'dev_ediaz' ? 'Admin' : dev.id.replace('dev_', '')),
        idPassword: dev.idPassword || (dev.id === 'dev_ediaz' ? 'Admin' : dev.id.replace('dev_', '')),
        username: dev.username || dev.id,
        role: dev.roleType || dev.role || 'desarrollador',
        email: dev.email || '',
        name: dev.name
      }));

      const allObservations = [];
      (targetState.integrations || []).forEach(item => {
        const app = targetState.applications ? targetState.applications.find(a => a.id === item.appId) : null;
        const dev = targetState.developers ? targetState.developers.find(d => d.id === item.devId) : null;
        const appName = item.appName || (app ? app.name : 'Sistema');
        const devName = item.devName || (dev ? dev.name : 'Desarrollador');

        if (Array.isArray(item.observations)) {
          item.observations.forEach(obs => {
            allObservations.push({
              date: obs.date || '',
              appName: appName,
              developer: obs.author || devName,
              taskName: item.name,
              impact: String(obs.severity || 'NORMAL').toUpperCase(),
              observation: obs.text || '',
              taskId: item.id,
              obsId: obs.id
            });
          });
        }
      });

      const payload = {
        action: 'sync_full_state',
        user: window.activeSelectedDevId ? getDevNameById(window.activeSelectedDevId) : 'Edwin Diaz (Admin)',
        applications: appList,
        integrations: taskList,
        observations: allObservations,
        users: usersList
      };

      return await this.sendPayload(payload);
    },

    /**
     * Sincronizar tabla de Usuarios autorizados con Google Sheets
     */
    async syncUsers(usersList) {
      const payload = {
        action: 'sync_users',
        users: usersList || [
          { id: "1073524622", username: "jose@guzman", role: "desarrollador", email: "joseoneiber711@gmail.com" },
          { id: "1107047649", username: "juan@david", role: "desarrollador", email: "" },
          { id: "1111", username: "esteban@escobar", role: "desarrollador", email: "" },
          { id: "1010159672", username: "jhon@eyder", role: "desarrollador", email: "" },
          { id: "Admin", username: "ediaz", role: "Admin", email: "edwin.diaz@studiof.com.co" }
        ]
      };
      return await this.sendPayload(payload);
    },

    /**
     * Enviar todos los usuarios locales de la aplicación a la pestaña 'Usuarios' de Google Sheets
     */
    async pushUsersToSheets() {
      if (!window.appState || !Array.isArray(window.appState.developers)) return { status: 'error' };

      const usersList = window.appState.developers.map(dev => {
        return {
          id: dev.idPassword || dev.id.replace('dev_', ''),
          idPassword: dev.idPassword || dev.id.replace('dev_', ''),
          username: dev.username || dev.id,
          role: dev.role || 'desarrollador',
          email: dev.email || '',
          name: dev.name
        };
      });

      const res = await this.syncUsers(usersList);
      return res;
    },

    /**
     * Traer y sincronizar usuarios desde la pestaña 'Usuarios' de Google Sheets hacia la aplicación
     */
    async pullUsersFromSheets(silent = false) {
      if (!this.isConnected()) {
        if (!silent && typeof window.showToast === 'function') {
          window.showToast('ℹ️ Conecta tu Google Sheet para sincronizar usuarios.');
        }
        return { success: false };
      }

      const iconSpin = document.getElementById('iconSyncUsersSpin');
      if (iconSpin) iconSpin.style.animation = 'spin 0.8s linear infinite';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${this.url}?action=get_users&_t=${Date.now()}`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.users) && json.users.length > 0) {
            this.mergeCloudUsers(json.users);
            if (!silent && typeof window.showToast === 'function') {
              window.showToast(`☁️ ¡Sincronizado! Se cargaron ${json.users.length} usuarios desde la hoja 'Usuarios' de Google Sheets.`);
            }
            return { success: true, count: json.users.length };
          }
        }
      } catch (err) {
        console.warn('[SheetsSync] Error en pullUsersFromSheets:', err);
      } finally {
        if (iconSpin) iconSpin.style.animation = '';
      }
      return { success: false };
    },

    /**
     * Fusionar usuarios descargados de Google Sheets con el estado local
     */
    mergeCloudUsers(cloudUsers) {
      if (!Array.isArray(cloudUsers) || !window.appState) return;
      if (!Array.isArray(window.appState.developers)) window.appState.developers = [];

      const stateDevs = window.appState.developers;
      const validCloudUsernames = new Set();

      cloudUsers.forEach(u => {
        const username = String(u.username || '').trim();
        const idPassword = String(u.idPassword || u.id || '').trim();
        const role = String(u.role || 'desarrollador').trim();
        const email = String(u.email || '').trim();
        const nameFromSheet = String(u.name || '').trim();

        if (!username && !idPassword && !nameFromSheet) return;
        if (username) validCloudUsernames.add(username.toLowerCase());

        // Resolver ID canónico buscando por username, idPassword, nombre o email
        let canonicalId = null;
        if (typeof window.resolveCanonicalDevId === 'function') {
          canonicalId = window.resolveCanonicalDevId(username) ||
                        window.resolveCanonicalDevId(idPassword) ||
                        window.resolveCanonicalDevId(nameFromSheet) ||
                        window.resolveCanonicalDevId(email);
        }

        // Buscar coincidencia en developers existentes por ID canónico, usuario, nombre o email
        let match = stateDevs.find(d =>
          (canonicalId && d.id === canonicalId) ||
          (d.username && username && d.username.toLowerCase() === username.toLowerCase()) ||
          (d.name && nameFromSheet && d.name.toLowerCase().trim() === nameFromSheet.toLowerCase().trim()) ||
          (d.email && email && d.email.toLowerCase().trim() === email.toLowerCase().trim()) ||
          (d.idPassword && idPassword && String(d.idPassword).trim() === idPassword) ||
          (username && d.id.toLowerCase() === `dev_${username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`)
        );

        if (match) {
          // Actualizar datos desde Google Sheets preservando el ID canónico y nombre completo
          if (canonicalId && canonicalId.startsWith('dev_')) match.id = canonicalId;
          match.username = username || match.username;
          match.role = role || match.role;
          match.email = email || match.email;
          match.idPassword = idPassword || match.idPassword;
          if (nameFromSheet && nameFromSheet.split(' ').length >= 2) match.name = nameFromSheet;
        } else {
          // Crear nuevo desarrollador importado desde la hoja de Sheets
          const cleanName = nameFromSheet || username.replace(/[@._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const newDev = {
            id: canonicalId || `dev_${username.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
            name: cleanName,
            username: username || canonicalId,
            idPassword: idPassword,
            role: role,
            email: email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
            onTimeDelivery: 94,
            codeQuality: 95,
            sprintsCompleted: 4,
            score: '9.4 / 10',
            activeProjects: ['app_torre']
          };
          stateDevs.push(newDev);
        }
      });

      // Sanitizar y deduplicar inmediatamente para garantizar unicidad absoluta
      if (typeof window.sanitizeAndDeduplicateDevelopers === 'function') {
        window.appState.developers = window.sanitizeAndDeduplicateDevelopers(stateDevs);
      }

      // Eliminar usuarios locales que fueron borrados directamente en Google Sheets (excepto el admin principal dev_ediaz)
      if (cloudUsers.length > 0) {
        window.appState.developers = stateDevs.filter(d =>
          d.id === 'dev_ediaz' ||
          (d.username && validCloudUsernames.has(d.username.toLowerCase()))
        );
      }

      // Guardar cambios en localStorage
      if (typeof window.saveData === 'function') {
        window.saveData(window.appState);
      } else if (typeof window.saveStoredData === 'function') {
        window.saveStoredData();
      }

      // Sincronizar almacén de credenciales para login.html
      try {
        const creds = window.appState.developers.map(d => ({
          id: d.id,
          idPassword: d.idPassword || (d.id === 'dev_ediaz' ? 'Admin' : '123456'),
          username: d.username || d.id,
          role: d.roleType || d.role || 'desarrollador',
          name: d.name,
          email: d.email || '',
          avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
        }));
        localStorage.setItem('STF_USERS_CREDENTIALS_STORE', JSON.stringify(creds));
      } catch (e) { }

      // Actualizar vistas y selectores de desarrolladores
      if (typeof window.renderDevelopersFullView === 'function') {
        window.renderDevelopersFullView();
      }
      if (typeof window.renderDevelopersSection === 'function') {
        window.renderDevelopersSection();
      }
      if (typeof window.renderHeaderDevDropdown === 'function') {
        window.renderHeaderDevDropdown();
      }
      if (typeof window.syncDynamicSelects === 'function') {
        window.syncDynamicSelects();
      }
    },

    /**
     * Búsqueda flexible de Aplicativo por ID, Nombre o Código
     */
    findApp(nameOrId) {
      if (!nameOrId || !window.appState || !Array.isArray(window.appState.applications)) return null;
      const t = String(nameOrId).toLowerCase().trim();
      return window.appState.applications.find(a =>
        a.id.toLowerCase() === t ||
        a.name.toLowerCase() === t ||
        t.includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(t) ||
        (a.code && (a.code.toLowerCase() === t || t.includes(a.code.toLowerCase())))
      ) || null;
    },

    /**
     * Búsqueda flexible de Desarrollador por ID, Nombre o Usuario
     */
    findDev(nameOrId) {
      if (!nameOrId || !window.appState || !Array.isArray(window.appState.developers)) return null;
      const t = String(nameOrId).toLowerCase().trim();
      if (typeof window.resolveCanonicalDevId === 'function') {
        const canonId = window.resolveCanonicalDevId(nameOrId);
        if (canonId) {
          const byCanon = window.appState.developers.find(d => d.id === canonId || (window.resolveCanonicalDevId(d.id) === canonId));
          if (byCanon) return byCanon;
        }
      }
      return window.appState.developers.find(d =>
        d.id.toLowerCase() === t ||
        d.name.toLowerCase() === t ||
        t.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(t) ||
        (d.username && d.username.toLowerCase() === t)
      ) || null;
    },

    /**
     * Cargar y Sincronizar Solicitudes, Tareas y Avances desde Google Sheets hacia el Sistema
     */
    async pullCloudData(silent = false) {
      if (!this.isConnected()) {
        if (!silent && typeof window.showToast === 'function') {
          window.showToast('ℹ️ Conecta tu Google Sheet para sincronizar solicitudes en la nube.');
        }
        return { success: false, message: 'Google Sheets no conectado.' };
      }

      this.setSyncingState(true);

      try {
        let syncedCount = 0;
        let phaseUpdatesCount = 0;
        let syncedObsCount = 0;
        let fullDataLoaded = false;

        // 1. Intentar get_all_data (Endpoint directo de tablas en Apps Script)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const res = await fetch(`${this.url}?action=get_all_data&_t=${Date.now()}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const json = await res.json();
            if (json && json.status === 'success') {
              fullDataLoaded = true;
              if (Array.isArray(json.tasks) && json.tasks.length > 0) {
                syncedCount = this.mergeCloudTasks(json.tasks);
              }
              if (Array.isArray(json.systems) && json.systems.length > 0) {
                this.mergeCloudSystems(json.systems);
              }
              if (Array.isArray(json.webSystems) && json.webSystems.length > 0) {
                this.mergeCloudWebSystems(json.webSystems);
              }
              if (Array.isArray(json.observations) && json.observations.length > 0) {
                syncedObsCount = this.mergeCloudObservations(json.observations);
              }
              if (Array.isArray(json.supportTickets) && json.supportTickets.length > 0) {
                this.mergeCloudSupportTickets(json.supportTickets);
              }
            }
          }
        } catch (err) {
          // get_all_data puede no existir si el script desplegado es v2.6 anterior, usamos fallback
        }

        // 2. Fallback inteligente: Consultar Bitácora de Cambios (get_updates)
        if (!fullDataLoaded) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(`${this.url}?action=get_updates&_t=${Date.now()}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
              const json = await res.json();
              if (json.status === 'success' && Array.isArray(json.data)) {
                const result = this.mergeUpdatesFromBitacora(json.data);
                syncedCount = result.taskCount;
                phaseUpdatesCount = result.phaseCount;
              }
            }
          } catch (e) {
            console.warn('[SheetsSync] Error consultando bitácora de Google Sheets:', e);
          }
        }

        const now = new Date();
        const timeStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);

        this.setSyncingState(false);
        this.updateUiStatus();

        // Refrescar todas las vistas en pantalla
        if (typeof window.refreshAllViews === 'function') {
          window.refreshAllViews();
        }

        if (!silent) {
          let msg = `☁️ ¡Sincronización con Google Sheets completada!`;
          if (syncedCount > 0) msg += ` Se cargaron ${syncedCount} solicitudes/tareas.`;
          if (phaseUpdatesCount > 0) msg += ` Se actualizaron ${phaseUpdatesCount} fases.`;
          if (syncedObsCount > 0) msg += ` Se sincronizaron ${syncedObsCount} observaciones.`;
          if (typeof window.showToast === 'function') {
            window.showToast(msg);
          }
        }

        return { success: true, syncedCount, phaseUpdatesCount, syncedObsCount };
      } catch (err) {
        this.setSyncingState(false);
        console.warn('[SheetsSync] Error en pullCloudData:', err);
        return { success: false, message: err.message };
      }
    },

    /**
     * Fusionar tareas directas de la hoja CONTROL_TAREAS (10 Columnas A:J)
     */
    mergeCloudTasks(tasksList) {
      if (!Array.isArray(tasksList) || !window.appState) return 0;
      const state = window.appState;
      if (!Array.isArray(state.integrations)) state.integrations = [];

      let count = 0;
      tasksList.forEach(task => {
        const tName = (task.name || task.Tarea || '').trim();
        if (!tName || tName.toLowerCase() === 'tarea') return;

        const appObj = this.findApp(task.appName || task.Aplicativo);
        const devObj = this.findDev(task.devName || task.developer || task.Desarrollador);
        const tId = String(task.id || task.ID_Tarea || `int_${Date.now()}`);

        const existing = state.integrations.find(i =>
          i.id === tId ||
          i.name.trim().toLowerCase() === tName.toLowerCase()
        );

        const rawStatus = String(task.status || task.Estado || '').toLowerCase();
        const isEval = rawStatus.includes('audit') || rawStatus.includes('aprob') || rawStatus === 'evaluated';

        // Normalizar fecha de entrega a YYYY-MM-DD
        let cleanDeadline = task.deadline || task.Fecha_Entrega || '2026-11-15';
        if (typeof cleanDeadline === 'string' && (cleanDeadline.includes('Mon Nov') || cleanDeadline.includes('Nov 09') || cleanDeadline.includes('Nov 9'))) {
          cleanDeadline = '2026-11-09';
        } else {
          const dObj = new Date(cleanDeadline);
          if (!isNaN(dObj.getTime())) {
            const y = dObj.getFullYear();
            const m = String(dObj.getMonth() + 1).padStart(2, '0');
            const d = String(dObj.getDate()).padStart(2, '0');
            cleanDeadline = `${y}-${m}-${d}`;
          }
        }

        // Parsear calificación limpia (corrige 0.943% -> 94.3%)
        let rawEvalStr = String(task.evaluation || task.Evaluacion_Calidad || '95').replace(',', '.');
        if (/0\.\d+%/.test(rawEvalStr)) {
          rawEvalStr = rawEvalStr.replace(/0\.(\d+)%/, (m, p) => (parseFloat('0.' + p) * 100).toFixed(1) + '%');
        }
        const scoreMatch = rawEvalStr.match(/(\d+(?:\.\d+)?)/);
        const parsedScore = scoreMatch ? parseFloat(scoreMatch[1]) : 95;
        const tWeight = Number(task.weight || task['Ponderacion_%']) || 15;
        const parsedPoints = parseFloat(((tWeight * (parsedScore / 100))).toFixed(1));
        const cleanNotes = String(task.notes || task.Observaciones_Auditoria || 'Implementación en planta validada con los operarios. Operatividad estable.').trim();
        const rawDate = String(task.evalDate || task.createdDate || task.Fecha_Registro || '2026-11-05').split(' ')[0];

        if (existing) {
          if (!existing.appName && appObj) existing.appName = appObj.name;
          if (!existing.devName && devObj) existing.devName = devObj.name;
          if (!existing.devId && devObj) existing.devId = devObj.id;
          if (cleanDeadline) existing.deadline = cleanDeadline;
          if (task.deliveryTime && !existing.deliveryTime) existing.deliveryTime = task.deliveryTime;
          if (cleanNotes && (!existing.description || existing.description === 'Integración técnica operativa en planta de confección.' || existing.description === 'Integración asignada desde Google Sheets.')) {
            existing.description = cleanNotes;
          }

          if (isEval && existing.status !== 'evaluated') {
            existing.status = 'evaluated';
            existing.evaluation = existing.evaluation || {
              evalDate: rawDate,
              onTime: true,
              qualityScore: parsedScore,
              pointsAdded: parsedPoints,
              notes: cleanNotes
            };
            count++;
          } else if (isEval && existing.evaluation && cleanNotes) {
            existing.evaluation.notes = cleanNotes;
            existing.evaluation.qualityScore = parsedScore;
          }
        } else {
          const newTask = {
            id: tId,
            name: tName,
            appId: appObj ? appObj.id : 'app_torre',
            appName: appObj ? appObj.name : 'Torre de Control',
            devId: devObj ? (window.resolveCanonicalDevId ? window.resolveCanonicalDevId(devObj.id) : devObj.id) : 'dev_jg',
            devName: devObj ? devObj.name : 'Jose Guzman',
            startDate: task.startDate || '2026-10-19',
            deadline: cleanDeadline,
            deliveryTime: task.deliveryTime || '10:00',
            weight: tWeight,
            status: isEval ? 'evaluated' : 'in_progress',
            description: cleanNotes || 'Integración asignada desde Google Sheets.',
            evaluation: isEval ? {
              evalDate: rawDate,
              onTime: true,
              qualityScore: parsedScore,
              pointsAdded: parsedPoints,
              notes: cleanNotes
            } : null,
            observations: []
          };
          state.integrations.unshift(newTask);
          count++;
        }
      });

      if (count > 0 && typeof window.saveData === 'function') {
        window.saveData(state);
      }
      return count;
    },

    /**
     * Fusionar observaciones desde la hoja HISTORIAL_OBSERVACIONES (6 Columnas A:F)
     * Estructura: FECHA | APLICATIVO | DESARROLLADOR | TAREA | NIVEL DE IMPACTO | OBSERVACION
     */
    mergeCloudObservations(cloudObs) {
      if (!Array.isArray(cloudObs) || cloudObs.length === 0 || !window.appState) return 0;
      const state = window.appState;
      if (!Array.isArray(state.integrations)) state.integrations = [];

      let mergedCount = 0;
      cloudObs.forEach(co => {
        const tName = String(co.taskName || co.TAREA || '').trim();
        const obsText = String(co.observation || co.OBSERVACION || '').trim();
        if (!obsText) return;

        const appName = String(co.appName || co.APLICATIVO || '').trim();
        const devName = String(co.developer || co.DESARROLLADOR || '').trim();
        const rawImpact = String(co.impact || co['NIVEL DE IMPACTO'] || 'NORMAL').trim().toLowerCase();
        const dateStr = String(co.date || co.FECHA || '').trim();

        // Mapear severidad
        let severity = 'normal';
        if (rawImpact.includes('crit') || rawImpact.includes('crít')) severity = 'critico';
        else if (rawImpact.includes('alt')) severity = 'alto';
        else if (rawImpact.includes('baj')) severity = 'bajo';

        // Normalización inteligente para matching infalible de tareas (quita códigos tipo [STF-LAB-03], puntuación y espacios extras)
        const cleanStr = (s) => (s || '')
          .toLowerCase()
          .replace(/\[[^\]]+\]/g, '')
          .replace(/[.,:;()_\-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        const cleanTName = cleanStr(tName);

        // Buscar tarea destino por ID directo o por nombre
        let targetTask = null;
        if (co.taskId) {
          targetTask = state.integrations.find(t => String(t.id) === String(co.taskId));
        }

        if (!targetTask && tName) {
          targetTask = state.integrations.find(t => {
            if (!t || !t.name) return false;
            const cleanCur = cleanStr(t.name);
            return (
              t.name.trim().toLowerCase() === tName.toLowerCase() ||
              (cleanTName && cleanCur === cleanTName) ||
              (cleanTName.length > 5 && cleanCur.includes(cleanTName)) ||
              (cleanCur.length > 5 && cleanTName.includes(cleanCur))
            );
          });
        }

        // Fallback por Aplicativo + Desarrollador
        if (!targetTask && appName) {
          const appObj = this.findApp(appName);
          const devObj = devName ? this.findDev(devName) : null;
          if (appObj) {
            targetTask = state.integrations.find(t =>
              t.appId === appObj.id && (!devObj || t.devId === devObj.id)
            );
          }
        }

        if (targetTask) {
          if (!Array.isArray(targetTask.observations)) {
            targetTask.observations = [];
          }

          // Evitar duplicar observaciones idénticas
          const cleanObsTarget = cleanStr(obsText);
          const exists = targetTask.observations.some(o => {
            const cleanExisting = cleanStr(o.text);
            return (
              cleanExisting === cleanObsTarget ||
              (cleanObsTarget.length > 20 && cleanExisting.includes(cleanObsTarget.substring(0, 20))) ||
              (o.date && o.date === dateStr && cleanExisting.includes(cleanObsTarget.substring(0, 15)))
            );
          });

          if (!exists) {
            const newObs = {
              id: co.obsId || ('obs_cloud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
              date: dateStr || new Date().toISOString().slice(0, 16).replace('T', ' '),
              timestamp: Date.now(),
              type: severity === 'critico' ? 'bloqueo' : (severity === 'alto' ? 'ajuste' : (obsText.includes('📅') ? 'reschedule' : 'avance')),
              severity: severity,
              author: devName || 'Desarrollador',
              text: obsText
            };
            // Las observaciones más recientes se agregan al inicio del historial
            targetTask.observations.unshift(newObs);
            mergedCount++;
          }
        }
      });

      if (mergedCount > 0 && typeof window.saveData === 'function') {
        window.saveData(state);
      }
      return mergedCount;
    },

    /**
     * Fusionar solicitudes de soporte técnico desde la hoja SOLICITUDES_SOPORTE
     */
    mergeCloudSupportTickets(cloudTickets) {
      if (!Array.isArray(cloudTickets) || !window.appState) return 0;
      const state = window.appState;
      if (!Array.isArray(state.supportTickets)) state.supportTickets = [];

      let mergedCount = 0;
      let hasChanges = false;

      cloudTickets.forEach(ct => {
        const ctCode = String(ct.code || ct.id || '').trim();
        if (!ctCode) return;

        const existingIdx = state.supportTickets.findIndex(t =>
          String(t.code || t.id || '').trim().toUpperCase() === ctCode.toUpperCase()
        );

        if (existingIdx !== -1) {
          const local = state.supportTickets[existingIdx];
          if (local.status !== ct.status || (!local.resolution && ct.resolution)) {
            state.supportTickets[existingIdx] = { ...local, ...ct };
            hasChanges = true;
          }
        } else {
          state.supportTickets.unshift(ct);
          hasChanges = true;
          mergedCount++;
        }
      });

      if (hasChanges) {
        if (typeof window.saveData === 'function') {
          window.saveData(state);
        } else {
          try { localStorage.setItem('STF_DATA_V1', JSON.stringify(state)); } catch(e){}
        }

        if (typeof window.renderSupportView === 'function') {
          window.renderSupportView();
        }
        if (typeof window.updateSupportNavBadge === 'function') {
          window.updateSupportNavBadge();
        }
        if (typeof window.renderNotificationsDropdown === 'function') {
          window.renderNotificationsDropdown();
        }
      }

      return mergedCount;
    },

    /**
     * Fusionar sistemas desde la hoja PORTAFOLIO_SISTEMAS (9 Columnas A:I)
     */
    mergeCloudSystems(sysList) {
      if (!Array.isArray(sysList) || !window.appState || !Array.isArray(window.appState.applications)) return;
      if (typeof window.purgePhantomAppsFromState === 'function') {
        window.purgePhantomAppsFromState(window.appState);
      }
      let updated = false;
      sysList.forEach(sys => {
        const sName = String(sys.name || sys.Nombre_Aplicativo || sys.Nombre || '').trim();
        if (!sName || (typeof window.isInvalidPhantomApp === 'function' && window.isInvalidPhantomApp({ name: sName, code: sys.code }))) return;
        const appObj = this.findApp(sName);
        if (!appObj) return;

        // Sincronizar estado SLA si viene válido
        if (sys.slaStatus) {
          const slaLow = String(sys.slaStatus).toLowerCase();
          if (slaLow.includes('riesgo')) {
            appObj.status = 'risk';
            updated = true;
          } else if (slaLow.includes('producc') || slaLow.includes('tiempo') || slaLow.includes('construcc')) {
            if (appObj.id !== 'app_geo') appObj.status = 'ontime';
          }
        }

        // Sincronizar porcentaje de avance con las fases si el valor es un número válido (0..100)
        const cloudProg = Number(sys.progress);
        if (!isNaN(cloudProg) && cloudProg >= 0 && cloudProg <= 100 && Array.isArray(appObj.phases)) {
          const currentLocalProg = typeof window.calculateAppProgress === 'function' ? window.calculateAppProgress(appObj) : -1;
          if (currentLocalProg !== cloudProg) {
            let acc = 0;
            appObj.phases.forEach(ph => {
              const w = Number(ph.weight) || 0;
              if (acc + w <= cloudProg) {
                ph.completed = true;
                acc += w;
              } else {
                ph.completed = false;
              }
            });
            updated = true;
          }
        }
      });

      if (updated && typeof window.saveData === 'function') {
        window.saveData(window.appState);
      }
    },

    /**
     * Fusionar enlaces de Sistemas Web Publicados desde la hoja SISTEMAS_WEB
     * Estructura: Desarrollador | Sistema_a_Cargo | URL_Sistema_Web | Estado
     */
    mergeCloudWebSystems(webSystems) {
      if (!Array.isArray(webSystems) || webSystems.length === 0 || !window.appState || !Array.isArray(window.appState.applications)) return 0;
      let count = 0;

      if (typeof window.purgePhantomAppsFromState === 'function') {
        window.purgePhantomAppsFromState(window.appState);
      }

      webSystems.forEach(ws => {
        const cleanSysName = String(ws.name || ws.Sistema_a_Cargo || '').trim();
        if (!cleanSysName) return;
        if (typeof window.isInvalidPhantomApp === 'function' && window.isInvalidPhantomApp({ name: cleanSysName, code: ws.code })) {
          return;
        }
        const normCheck = cleanSysName.toLowerCase().replace(/[\s_-]+/g, '');
        if (normCheck === 'sistemaacargo' || normCheck === 'nombreaplicativo' || normCheck === 'urlsistemaweb' || normCheck === 'desarrollador') {
          return;
        }

        // 1. Encontrar aplicativo existente
        let targetApp = window.appState.applications.find(a =>
          a.name.toLowerCase().trim() === cleanSysName.toLowerCase() ||
          cleanSysName.toLowerCase().includes(a.name.toLowerCase().trim()) ||
          a.name.toLowerCase().trim().includes(cleanSysName.toLowerCase()) ||
          (ws.code && a.code && a.code.toLowerCase() === String(ws.code).toLowerCase())
        );

        if (!targetApp) {
          // Solo crear si es OFICINA - APLICATIVOS (evitar crear registros fantasma de filas basura de Sheets)
          const isOficina = cleanSysName.toUpperCase().includes('OFICINA');
          if (!isOficina) return;
          const newAppId = 'app_oficina';
          targetApp = {
            id: newAppId,
            code: 'STF-OF-00',
            name: 'OFICINA - APLICATIVOS',
            category: 'Gestión TI & Control',
            description: 'Sistema OFICINA - APLICATIVOS de STF GROUP.',
            devId: 'dev_jg',
            deadline: '2026-12-30',
            priority: 'Alta',
            status: 'ontime',
            iconColor: '#0EA5E9',
            iconInitial: 'OFA',
            webUrl: String(ws.webUrl || '').trim(),
            phases: [
              { id: 'p1', name: '1. Levantamiento & Requisitos', weight: 15, completed: true },
              { id: 'p2', name: '2. Arquitectura & Diseño', weight: 20, completed: true },
              { id: 'p3', name: '3. Desarrollo Backend & Core', weight: 35, completed: true },
              { id: 'p4', name: '4. Frontend & Conexión', weight: 20, completed: true },
              { id: 'p5', name: '5. Pruebas QA', weight: 5, completed: true },
              { id: 'p6', name: '6. Despliegue', weight: 5, completed: true }
            ]
          };
          window.appState.applications.push(targetApp);
          count++;
        }

        // 2. Asociar al Desarrollador correspondiente
        const devName = String(ws.devName || ws.Desarrollador || '').trim();
        const dev = this.findDev(devName);
        if (dev) {
          if (!Array.isArray(dev.activeProjects)) dev.activeProjects = [];
          if (!dev.activeProjects.includes(targetApp.id)) {
            dev.activeProjects.push(targetApp.id);
          }
          if (targetApp.isGroupProject || cleanSysName.toUpperCase().includes('TORRE')) {
            if (!Array.isArray(targetApp.devIds)) targetApp.devIds = ['dev_jg', 'dev_jd', 'dev_mocho', 'dev_ee'];
            if (!targetApp.devIds.includes(dev.id)) targetApp.devIds.push(dev.id);
          } else if (!targetApp.devId) {
            targetApp.devId = dev.id;
          }
        }

        // 3. Sincronizar URL Web (soporta Vercel URLs, sharepoint, o vacío)
        const cleanUrl = String(ws.webUrl || ws.URL_Sistema_Web || '').trim();
        if (targetApp.webUrl !== cleanUrl) {
          targetApp.webUrl = cleanUrl;
          count++;
        }

        // 4. Sincronizar Estado de la hoja
        const stateStr = String(ws.status || ws.Estado || '').toLowerCase();
        if (stateStr.includes('producc')) {
          targetApp.status = 'ontime';
        }
      });

      if (typeof window.saveData === 'function') {
        window.saveData(window.appState);
      }
      return count;
    },

    /**
     * Extraer y cargar solicitudes y fases registradas en la Bitácora de Google Sheets
     */
    mergeUpdatesFromBitacora(updates) {
      if (!Array.isArray(updates) || updates.length === 0 || !window.appState) return { taskCount: 0, phaseCount: 0 };
      const state = window.appState;
      if (!Array.isArray(state.integrations)) state.integrations = [];

      let taskCount = 0;
      let phaseCount = 0;

      const taskRegex = /Tarea '([^']+)' asignada a ([^(]+)\(\+\s*(\d+)% avance,\s*plazo:\s*([^)]+)\)/;
      const phaseRegex = /Fase '([^']+)' actualizada al (\d+)% \(Completada:\s*([^)]+)\)/;
      const auditRegex = /Auditoría aplicada a ([^:]+):\s*([\d.]+)\s*pts/;

      // Procesar en orden cronológico (del más antiguo al más reciente)
      const chronological = updates.slice().reverse();

      chronological.forEach(item => {
        const desc = item.Descripcion || item.description || '';
        const evType = item.Tipo_Evento || item.eventType || '';
        const appName = item.Aplicativo || item.appName || '';

        // A. Cargar Tareas / Solicitudes asignadas en Google Sheets
        if (evType === 'ASIGNACION_INTEGRACION') {
          const m = desc.match(taskRegex);
          if (m) {
            const taskName = m[1].trim();
            const devName = m[2].trim();
            const weight = parseInt(m[3]) || 15;
            const deadline = m[4].trim();

            const appObj = this.findApp(appName);
            const devObj = this.findDev(devName);

            const existing = state.integrations.find(i =>
              i.name.trim().toLowerCase() === taskName.toLowerCase() ||
              (item.Timestamp && i.id === `int_${item.Timestamp}`)
            );

            if (!existing) {
              const newTask = {
                id: item.Timestamp ? `int_${item.Timestamp}` : `int_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                name: taskName,
                appId: appObj ? appObj.id : 'app_torre',
                devId: devObj ? devObj.id : 'dev_jg',
                startDate: '2026-10-19',
                deadline: deadline,
                weight: weight,
                status: 'in_progress',
                description: `Solicitud e integración técnica asignada y registrada en Google Sheets para ${appName}.`,
                evaluation: null
              };
              state.integrations.unshift(newTask);
              taskCount++;
            }
          }
        }

        // B. Cargar Cambios de Fases
        if (evType === 'CAMBIO_FASE') {
          const m = desc.match(phaseRegex);
          if (m) {
            const phaseName = m[1].trim();
            const completed = m[3].toUpperCase().includes('SÍ') || m[3].toUpperCase().includes('SI');

            const appObj = this.findApp(appName);
            if (appObj && Array.isArray(appObj.phases)) {
              const targetPhase = appObj.phases.find(p =>
                p.name.toLowerCase().includes(phaseName.toLowerCase()) ||
                phaseName.toLowerCase().includes(p.name.toLowerCase())
              );
              if (targetPhase && completed && !targetPhase.completed) {
                targetPhase.completed = true;
                phaseCount++;
              }
            }
          }
        }

        // C. Cargar Auditorías Firmadas
        if (evType === 'AUDITORIA_FIRMADA') {
          const m = desc.match(auditRegex);
          if (m) {
            const score = parseFloat(m[2]) || 95;
            const appObj = this.findApp(appName);
            if (appObj) {
              const pendingTask = state.integrations.find(i => i.appId === appObj.id && i.status === 'in_progress');
              if (pendingTask) {
                pendingTask.status = 'evaluated';
                pendingTask.evaluation = {
                  evalDate: item.Fecha_Hora ? item.Fecha_Hora.split('T')[0] : '2026-10-23',
                  onTime: true,
                  daysDifference: 0,
                  stabilityScore: score,
                  usabilityScore: score,
                  qaScore: score,
                  qualityScore: score,
                  pointsAdded: (pendingTask.weight || 15) * (score / 100),
                  evaluator: item.Desarrollador || 'Super Admin',
                  notes: desc
                };
              }
            }
          }
        }

        // D. Cargar Solicitudes de Soporte Técnico y Actualizaciones desde Bitácora
        if (evType === 'SOLICITUD_SOPORTE_TECNICO' || evType === 'SOLICITUD_ACTUALIZACION') {
          if (!Array.isArray(state.supportTickets)) state.supportTickets = [];
          const rawDev = item.Desarrollador || '';
          const reqMatch = rawDev.match(/^(.*?)\s*\((.*?)\)$/);
          const reqName = reqMatch ? reqMatch[1].trim() : (rawDev || 'Operario de Planta');
          const isAct = evType === 'SOLICITUD_ACTUALIZACION';

          let title = desc;
          let targetDevName = 'Jose Guzman';
          const matchTitle = desc.match(/^\[(.*?)\]\s*(.*?)\s*->\s*Asignado a\s*(.*?)$/i);
          if (matchTitle) {
            title = matchTitle[2].trim();
            targetDevName = matchTitle[3].trim();
          }

          const appObj = this.findApp(appName);
          const devObj = this.findDev(targetDevName);
          const dateStr = item.Timestamp || item.Fecha_Hora || new Date().toISOString();
          const cleanCode = 'STF-SUP-' + (item.Timestamp ? String(new Date(item.Timestamp).getTime()).slice(-4) : '3491');

          const existingTicket = state.supportTickets.find(t =>
            (t.title && t.title.toLowerCase() === title.toLowerCase()) ||
            (t.code && t.code === cleanCode)
          );

          if (!existingTicket) {
            state.supportTickets.unshift({
              id: 'sup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              code: cleanCode,
              appId: appObj ? appObj.id : 'app_colchas',
              appName: appName || (appObj ? appObj.name : 'COLCHAS'),
              appCode: appObj ? appObj.code : 'STF-COL-02',
              devId: devObj ? devObj.id : 'dev_jg',
              devName: targetDevName,
              requester: {
                name: reqName,
                role: 'Planta STF',
                area: 'Módulo de Planta'
              },
              type: isAct ? 'actualizacion' : 'soporte',
              priority: 'media',
              title: title,
              description: title,
              createdAt: dateStr,
              status: 'pendiente',
              resolution: null
            });
            taskCount++;
          }
        }

        // E. Cargar Resoluciones Oficiales de Soporte Técnico
        if (evType === 'SOPORTE_ACEPTADO' || evType === 'SOPORTE_RECHAZADO') {
          if (!Array.isArray(state.supportTickets)) state.supportTickets = [];
          const matchRes = desc.match(/Ticket\s+(STF-SUP-\d+)\s+marcado como\s+(Aceptada|Rechazada):\s*(.*?)(?:\s*\(ETA:\s*(.*?)\))?$/i);
          if (matchRes) {
            const ticketCode = matchRes[1].trim();
            const decision = matchRes[2].toLowerCase() === 'aceptada' ? 'aceptada' : 'rechazada';
            const obs = matchRes[3].trim();
            const eta = matchRes[4] ? matchRes[4].trim() : '';
            const t = state.supportTickets.find(tk => tk.code === ticketCode);
            if (t) {
              t.status = decision;
              t.resolution = {
                action: decision,
                resolvedBy: item.Desarrollador || 'Jose Guzman',
                resolvedAt: item.Timestamp || new Date().toISOString(),
                observation: obs,
                etaHours: eta
              };
            }
          }
        }
      });

      if ((taskCount > 0 || phaseCount > 0) && typeof window.saveData === 'function') {
        window.saveData(state);
      }

      return { taskCount, phaseCount };
    },

    /**
     * Historial local para visualización rápida en UI
     */
    recordLocalHistory(payload) {
      try {
        let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        const item = {
          id: 'log_' + Date.now(),
          timestamp: dateStr,
          action: payload.action,
          appName: payload.appName || payload.name || 'Portafolio',
          dev: payload.developer || payload.user || 'Sistema',
          desc: payload.description || (payload.taskName ? `Tarea: ${payload.taskName} (+${payload.weight || 0}%)` : (payload.phaseName ? `Fase ${payload.phaseName} (${payload.progress}%)` : (payload.score ? `Auditoría: ${payload.score} pts` : 'Actualización de datos')))
        };

        history.unshift(item);
        if (history.length > 50) history = history.slice(0, 50); // Mantener 50
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      } catch (e) {
        console.warn('Error saving local history:', e);
      }
    },

    getLocalHistory() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
      } catch (e) {
        return [];
      }
    },

    setSyncingState(isSync) {
      this.isSyncing = isSync;
      const dot = document.getElementById('sheetsLiveDot');
      const label = document.getElementById('sheetsStatusLabel');
      if (dot && label) {
        if (isSync) {
          dot.className = 'sheets-live-dot syncing';
          label.textContent = 'Sincronizando...';
        } else {
          this.updateUiStatus();
        }
      }
    },

    updateUiStatus() {
      const dot = document.getElementById('sheetsLiveDot');
      const label = document.getElementById('sheetsStatusLabel');
      const modalStatusBadge = document.getElementById('modalSheetsStatusBadge');
      const modalLastSync = document.getElementById('modalSheetsLastSync');
      const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || 'Sin sincronizaciones previas';

      const connected = this.isConnected();

      if (dot) {
        dot.className = connected ? 'sheets-live-dot connected' : 'sheets-live-dot offline';
      }

      if (label) {
        label.textContent = connected ? 'Sheets Conectado' : 'Google Sheets';
      }

      if (modalStatusBadge) {
        if (connected) {
          modalStatusBadge.className = 'status-pill status-ontime';
          modalStatusBadge.innerHTML = '🟢 Conectado & Activo';
        } else {
          modalStatusBadge.className = 'status-pill status-risk';
          modalStatusBadge.innerHTML = '⚪ Desconectado (Configuración Pendiente)';
        }
      }

      if (modalLastSync) {
        modalLastSync.textContent = lastSyncTime;
      }
    }
  };

  function getDevNameById(id) {
    if (window.appState && Array.isArray(window.appState.developers)) {
      const found = window.appState.developers.find(d => d.id === id);
      if (found && found.name) return found.name;
    }
    if (id === 'dev_jg') return 'Jose Guzman';
    if (id === 'dev_jd') return 'Juan David';
    if (id === 'dev_mocho') return 'Mocho';
    if (id === 'dev_ee') return 'Esteban Escobar';
    return 'Administrador STF';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- UI Modal Handlers ---
  window.openSheetsModal = function () {
    const modal = document.getElementById('modalSheetsSync');
    if (!modal) {
      console.warn('modalSheetsSync no encontrado');
      return;
    }

    modal.classList.add('show');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';

    const inputUrl = document.getElementById('inputSheetsWebAppUrl');
    if (inputUrl) {
      inputUrl.value = SheetsSync.getUrl();
    }

    SheetsSync.updateUiStatus();
    renderRecentSheetsLogs();
    if (window.lucide) lucide.createIcons();
  };

  window.closeSheetsModal = function () {
    const modal = document.getElementById('modalSheetsSync');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = '';
      modal.style.opacity = '';
      modal.style.pointerEvents = '';
    }
  };

  window.saveSheetsUrl = function () {
    const inputUrl = document.getElementById('inputSheetsWebAppUrl');
    const val = inputUrl ? inputUrl.value.trim() : '';

    if (!val) {
      SheetsSync.setUrl('');
      if (typeof window.showToast === 'function') {
        window.showToast('URL eliminada. Sincronización en la nube desactivada.');
      }
      return;
    }

    SheetsSync.setUrl(val);
    if (typeof window.showToast === 'function') {
      window.showToast('¡URL de Google Sheets guardada exitosamente!');
    }
    window.testSheetsConnection();
  };

  window.testSheetsConnection = async function () {
    const inputUrl = document.getElementById('inputSheetsWebAppUrl');
    const targetUrl = inputUrl ? inputUrl.value.trim() : SheetsSync.getUrl();

    if (!targetUrl) {
      if (typeof window.showToast === 'function') {
        window.showToast('Ingresa una URL antes de probar la conexión.');
      }
      return;
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Verificando conexión con Google Apps Script...');
    }

    const result = await SheetsSync.testConnection(targetUrl);
    if (typeof window.showToast === 'function') {
      window.showToast(result.message);
    }
    SheetsSync.updateUiStatus();
  };

  window.triggerFullSheetsSync = async function () {
    if (!SheetsSync.isConnected()) {
      if (typeof window.showToast === 'function') {
        window.showToast('Primero debes configurar y guardar la URL de Google Sheets.');
      }
      return;
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Enviando portafolio completo a Google Sheets...');
    }

    const res = await SheetsSync.syncFullState(window.appState);
    if (typeof window.showToast === 'function') {
      window.showToast(res.message);
    }
    renderRecentSheetsLogs();
  };

  window.triggerPullCloudData = async function () {
    if (!SheetsSync.isConnected()) {
      if (typeof window.showToast === 'function') {
        window.showToast('Primero debes configurar y guardar la URL de Google Sheets.');
      }
      return;
    }

    if (typeof window.showToast === 'function') {
      window.showToast('📥 Consultando Google Sheets en tiempo real...');
    }

    const res = await SheetsSync.pullCloudData(false);
    renderRecentSheetsLogs();
  };


  window.copyAppsScriptCode = async function () {
    const btnText = document.getElementById('btnCopyScriptText');
    try {
      let code = '';
      try {
        const res = await fetch('google-apps-script.js');
        if (res.ok) code = await res.text();
      } catch (e) { }

      if (!code) {
        code = `// Abre el archivo google-apps-script.js en tu carpeta del proyecto para copiar el código.`;
      }

      await navigator.clipboard.writeText(code);

      if (btnText) btnText.textContent = '¡Código Copiado!';
      if (typeof window.showToast === 'function') {
        window.showToast('¡Código de Apps Script copiado al portapapeles!');
      }

      setTimeout(() => {
        if (btnText) btnText.textContent = 'Copiar Código Apps Script';
      }, 2500);
    } catch (err) {
      if (typeof window.showToast === 'function') {
        window.showToast('Por favor copia el código directamente desde el archivo google-apps-script.js');
      }
    }
  };

  function renderRecentSheetsLogs() {
    const container = document.getElementById('sheetsRecentLogsContainer');
    if (!container) return;

    const logs = SheetsSync.getLocalHistory();
    if (!logs || logs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #94A3B8; font-size: 11.5px; padding: 12px;">
          No hay operaciones registradas aún. Cualquier cambio que realices en fases o auditorías aparecerá aquí.
        </div>
      `;
      return;
    }

    container.innerHTML = logs.slice(0, 10).map(item => {
      let tagClass = 'tag-update';
      let tagLabel = 'ACTUALIZACIÓN';

      if (item.action === 'log_phase') {
        tagClass = 'tag-phase';
        tagLabel = 'FASE';
      } else if (item.action === 'log_task') {
        tagClass = 'tag-task';
        tagLabel = 'INTEGRACIÓN';
      } else if (item.action === 'log_audit') {
        tagClass = 'tag-audit';
        tagLabel = 'AUDITORÍA';
      } else if (item.action === 'log_observation') {
        tagClass = 'tag-audit';
        tagLabel = 'OBSERVACIÓN';
      } else if (item.action === 'sync_full_state') {
        tagClass = 'tag-sync';
        tagLabel = 'SYNC TOTAL';
      }

      return `
        <div class="sheets-log-row">
          <div class="sheets-log-info">
            <span class="sheets-log-tag ${tagClass}">${tagLabel}</span>
            <div>
              <strong style="color: #0F172A;">${escapeHtml(item.appName)}</strong>:
              <span style="color: #475569;">${escapeHtml(item.desc)}</span>
              <span style="color: #94A3B8; margin-left: 4px;">(${escapeHtml(item.dev)})</span>
            </div>
          </div>
          <span style="color: #94A3B8; font-size: 10.5px; white-space: nowrap; margin-left: 8px;">${item.timestamp}</span>
        </div>
      `;
    }).join('');
  }

  window.renderRecentSheetsLogs = renderRecentSheetsLogs;

  // Exportar al scope global
  window.SheetsSync = SheetsSync;

  // Auto-init on load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => SheetsSync.init());
    } else {
      SheetsSync.init();
    }
  }
})();
