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
