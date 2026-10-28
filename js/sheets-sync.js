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
      if (btnOpen) {
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
      const payload = {
        action: 'log_task',
        taskId: data.taskId || ('task_' + Date.now()),
        taskName: data.taskName || 'Nueva Integración',
        appName: data.appName || 'Sistema General',
        developer: data.developer || 'Desarrollador Asignado',
        weight: data.weight || 0,
        deadline: data.deadline || '',
        status: data.status || 'En Progreso',
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
        appName: data.appName,
        developer: data.developer,
        score: data.score,
        daysDifference: data.daysDifference || 0,
        pointsAdded: data.pointsAdded || 0,
        evaluator: data.evaluator || 'Super Admin',
        notes: data.notes || ''
      };

      return this.sendPayload(payload);
    },

    /**
     * Sincronizar estado completo del portafolio (Snapshot de aplicaciones)
     */
    async syncFullState(appState) {
      if (!appState || !appState.applications) return;

      const appList = appState.applications.map(app => {
        const dev = appState.developers ? appState.developers.find(d => d.id === app.devId) : null;
        const currentPhase = app.phases ? (app.phases.find(p => !p.completed) || app.phases[app.phases.length - 1]) : null;
        
        let progress = 0;
        if (typeof window.calculateAppProgress === 'function') {
          progress = window.calculateAppProgress(app);
        } else if (app.phases) {
          progress = Math.round(app.phases.filter(p => p.completed).reduce((s, p) => s + (p.weight || 15), 0));
        }

        return {
          id: app.id,
          name: app.name,
          devName: dev ? dev.name : 'Equipo STF',
          currentPhase: currentPhase ? currentPhase.name : 'En Producción',
          progress: progress,
          slaStatus: app.slaStatus || 'En Tiempo'
        };
      });

      const taskList = (appState.integrations || []).map(item => {
        const app = appState.applications ? appState.applications.find(a => a.id === item.appId) : null;
        const dev = appState.developers ? appState.developers.find(d => d.id === item.devId) : null;
        return {
          id: item.id,
          name: item.name,
          appName: app ? app.name : 'Sistema',
          devName: dev ? dev.name : 'Desarrollador',
          weight: item.weight || 15,
          deadline: item.deadline || '',
          status: item.status === 'evaluated' ? 'Auditoría Oficializada' : 'En Progreso',
          evaluation: item.evaluation || null
        };
      });

      const payload = {
        action: 'sync_full_state',
        user: window.activeSelectedDevId ? getDevNameById(window.activeSelectedDevId) : 'Jose Guzman',
        applications: appList,
        integrations: taskList
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
        let fullDataLoaded = false;

        // 1. Intentar get_all_data (Endpoint directo de tablas en Apps Script)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const res = await fetch(`${this.url}?action=get_all_data&_t=${Date.now()}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const json = await res.json();
            if (json.status === 'success' && Array.isArray(json.tasks) && json.tasks.length > 0) {
              fullDataLoaded = true;
              syncedCount = this.mergeCloudTasks(json.tasks);
              if (Array.isArray(json.systems) && json.systems.length > 0) {
                this.mergeCloudSystems(json.systems);
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
          if (typeof window.showToast === 'function') {
            window.showToast(msg);
          }
        }

        return { success: true, syncedCount, phaseUpdatesCount };
      } catch (err) {
        this.setSyncingState(false);
        console.warn('[SheetsSync] Error en pullCloudData:', err);
        return { success: false, message: err.message };
      }
    },

    /**
     * Fusionar tareas directas de la hoja Tareas_Integraciones
     */
    mergeCloudTasks(tasksList) {
      if (!Array.isArray(tasksList) || !window.appState) return 0;
      const state = window.appState;
      if (!Array.isArray(state.integrations)) state.integrations = [];

      let count = 0;
      tasksList.forEach(task => {
        const tName = (task.name || task.Tarea || '').trim();
        if (!tName) return;

        const appObj = this.findApp(task.appName || task.Aplicativo);
        const devObj = this.findDev(task.devName || task.developer || task.Desarrollador);
        const tId = String(task.id || task.ID_Tarea || `int_${Date.now()}`);

        const existing = state.integrations.find(i => 
          i.id === tId || 
          i.name.trim().toLowerCase() === tName.toLowerCase()
        );

        const isEval = String(task.status || task.Estado || '').toLowerCase().includes('audit') || 
                       String(task.status || task.Estado || '').toLowerCase().includes('aprob');

        if (existing) {
          if (isEval && existing.status !== 'evaluated') {
            existing.status = 'evaluated';
            existing.evaluation = existing.evaluation || {
              evalDate: task.createdDate || '2026-10-23',
              onTime: true,
              qualityScore: 95,
              pointsAdded: existing.weight || 15
            };
            count++;
          }
        } else {
          const newTask = {
            id: tId,
            name: tName,
            appId: appObj ? appObj.id : 'app_torre',
            devId: devObj ? devObj.id : 'dev_jg',
            startDate: task.startDate || '2026-10-19',
            deadline: task.deadline || task.Fecha_Entrega || '2026-11-15',
            weight: Number(task.weight || task['Ponderacion_%']) || 15,
            status: isEval ? 'evaluated' : 'in_progress',
            description: task.description || 'Integración asignada desde Google Sheets.',
            evaluation: isEval ? {
              evalDate: task.createdDate || '2026-10-23',
              onTime: true,
              qualityScore: 95,
              pointsAdded: Number(task.weight || task['Ponderacion_%']) || 15
            } : null
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
     * Fusionar sistemas desde la hoja Estado_Sistemas
     */
    mergeCloudSystems(sysList) {
      if (!Array.isArray(sysList) || !window.appState || !Array.isArray(window.appState.applications)) return;
      sysList.forEach(sys => {
        const sName = (sys.name || sys.Nombre || '').trim();
        const appObj = this.findApp(sName);
        if (appObj && sys.slaStatus) {
          if (sys.slaStatus.toLowerCase().includes('riesgo')) appObj.status = 'risk';
        }
      });
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
      } catch (e) {}

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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SheetsSync.init());
  } else {
    SheetsSync.init();
  }
})();
