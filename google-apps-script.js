/**
 * ============================================================================
 * STF GROUP · Google Apps Script Backend para Google Sheets
 * Base de Datos en la Nube para Control de Aplicativos & Auditorías
 * ============================================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN RÁPIDA (2 MINUTOS):
 * 1. Crea una hoja de cálculo nueva en Google Drive (ej: "STF GROUP - Base de Datos Aplicativos").
 * 2. En el menú superior de Google Sheets, ve a: Extensiones > Apps Script.
 * 3. Borra todo el código que aparezca y pega este archivo completo.
 * 4. Haz clic en "Guardar" (ícono de disquete).
 * 5. Haz clic en el botón azul superior "Implementar" > "Nueva implementación".
 * 6. En el engranaje "Seleccionar tipo", elige "Aplicación web".
 * 7. Configura:
 *    - Descripción: STF DB Sync API
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier usuario" (Anyone) -> IMPORTANTE para permitir sincronizar desde la web.
 * 8. Haz clic en "Implementar", autoriza los permisos y COPIA la "URL de la aplicación web".
 * 9. Pega esa URL en el modal de "Google Sheets" dentro del aplicativo. ¡Listo!
 * ============================================================================
 */

// Nombres estándar de las pestañas
var TABS = {
  BITACORA: "Bitacora_Cambios",
  AVANCES: "Avances_Fases",
  TAREAS: "Tareas_Integraciones",
  AUDITORIAS: "Auditorias_Calidad",
  SISTEMAS: "Estado_Sistemas",
  USUARIOS: "Usuarios"
};

/**
 * Menú personalizado automático en la barra superior de Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ STF SISTEMA')
    .addItem('🚀 Inicializar Hojas y Usuarios', 'initializeSheets')
    .addToUi();
}

/**
 * Inicializa y da formato profesional a las pestañas si no existen
 */
function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Bitacora_Cambios
  var sBitacora = getOrCreateSheet(ss, TABS.BITACORA);
  if (sBitacora.getLastRow() === 0) {
    sBitacora.appendRow([
      "Timestamp",
      "Fecha_Hora",
      "Desarrollador",
      "Tipo_Evento",
      "Aplicativo",
      "Descripcion",
      "Version",
      "Detalles_JSON"
    ]);
    formatHeaderRow(sBitacora, "#1E293B"); // Slate dark
  }

  // 2. Avances_Fases
  var sAvances = getOrCreateSheet(ss, TABS.AVANCES);
  if (sAvances.getLastRow() === 0) {
    sAvances.appendRow([
      "Timestamp",
      "Fecha",
      "Aplicativo",
      "Fase_ID",
      "Fase_Nombre",
      "Avance_Porcentaje",
      "Completada",
      "Responsable",
      "Notas"
    ]);
    formatHeaderRow(sAvances, "#2563EB"); // Blue
  }

  // 3. Tareas_Integraciones
  var sTareas = getOrCreateSheet(ss, TABS.TAREAS);
  if (sTareas.getLastRow() === 0) {
    sTareas.appendRow([
      "ID_Tarea",
      "Tarea",
      "Aplicativo",
      "Desarrollador",
      "Ponderacion_%",
      "Fecha_Entrega",
      "Estado",
      "Evaluacion_Calidad",
      "Fecha_Registro"
    ]);
    formatHeaderRow(sTareas, "#059669"); // Emerald Green
  }

  // 4. Auditorias_Calidad
  var sAuditorias = getOrCreateSheet(ss, TABS.AUDITORIAS);
  if (sAuditorias.getLastRow() === 0) {
    sAuditorias.appendRow([
      "Timestamp",
      "Fecha_Eval",
      "Aplicativo",
      "Desarrollador",
      "Puntaje_Calidad",
      "Dias_Holgura",
      "Puntos_Sumados",
      "Evaluador",
      "Notas_Auditoria"
    ]);
    formatHeaderRow(sAuditorias, "#D97706"); // Amber
  }

  // 5. Estado_Sistemas (Dashboard Snapshot)
  var sSistemas = getOrCreateSheet(ss, TABS.SISTEMAS);
  if (sSistemas.getLastRow() === 0) {
    sSistemas.appendRow([
      "ID_App",
      "Nombre_Aplicativo",
      "Desarrollador_Lider",
      "Fase_Actual",
      "Avance_Total_%",
      "Cumplimiento_SLA",
      "Ultima_Actualizacion"
    ]);
    formatHeaderRow(sSistemas, "#7C3AED"); // Purple
  }

  // 6. Usuarios (Credenciales y Roles de Acceso)
  var sUsuarios = getOrCreateSheet(ss, TABS.USUARIOS);
  if (sUsuarios.getLastRow() === 0) {
    sUsuarios.appendRow([
      "ID",
      "Usuario_Logueo",
      "Rol",
      "Correo"
    ]);
    formatHeaderRow(sUsuarios, "#0F172A"); // Slate dark
    sUsuarios.appendRow(["1073524622", "jose@guzman", "desarrollador", "joseoneiber711@gmail.com"]);
    sUsuarios.appendRow(["1107047649", "juan@david", "desarrollador", ""]);
    sUsuarios.appendRow(["1111", "esteban@escobar", "desarrollador", ""]);
    sUsuarios.appendRow(["1010159672", "jhon@eyder", "desarrollador", ""]);
    sUsuarios.appendRow(["Admin", "ediaz", "Admin", "edwin.diaz@studiof.com.co"]);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeaderRow(sheet, hexBg) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground(hexBg)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontFamily("Arial");
  sheet.setFrozenRows(1);
}

/**
 * Petición GET: Test de conectividad o consulta de registros
 */
function doGet(e) {
  initializeSheets();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";

  if (action === "ping") {
    return createJsonResponse({
      status: "success",
      message: "STF GROUP Cloud Database Online",
      timestamp: new Date().toISOString(),
      sheets: Object.values(TABS)
    });
  }

  if (action === "get_updates") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(TABS.BITACORA);
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var data = [];

    for (var i = rows.length - 1; i >= 1 && data.length < 50; i--) {
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = rows[i][h];
      }
      data.push(item);
    }

    return createJsonResponse({ status: "success", data: data });
  }

  if (action === "get_users") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sU = getOrCreateSheet(ss, TABS.USUARIOS);
    var uRows = sU.getDataRange().getValues();
    var usersList = [];
    if (uRows.length > 1) {
      for (var r = 1; r < uRows.length; r++) {
        usersList.push({
          idPassword: String(uRows[r][0]).trim(),
          username: String(uRows[r][1]).trim(),
          role: String(uRows[r][2]).trim(),
          email: String(uRows[r][3]).trim()
        });
      }
    }
    return createJsonResponse({ status: "success", users: usersList });
  }

  return createJsonResponse({ status: "error", message: "Acción no reconocida" });
}

/**
 * Petición POST: Guardar cambios, actualizaciones y avances
 */
function doPost(e) {
  initializeSheets();

  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
    } else {
      payload = e.parameter;
    }

    var action = payload.action || "log_update";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "America/Bogota", "yyyy-MM-dd HH:mm:ss");

    // =========================================================================
    // ACCIÓN 1: Registrar Evento en Bitácora de Cambios
    // =========================================================================
    if (action === "log_update") {
      var sBitacora = getOrCreateSheet(ss, TABS.BITACORA);
      sBitacora.appendRow([
        now.getTime(),
        dateStr,
        payload.developer || "Sistema",
        payload.eventType || "ACTUALIZACION",
        payload.appName || "Global",
        payload.description || "Sin descripción",
        payload.version || "v2.6",
        payload.extra ? JSON.stringify(payload.extra) : ""
      ]);

      return createJsonResponse({
        status: "success",
        message: "Cambio registrado exitosamente en Bitácora",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 2: Registrar Avance en Fases de Desarrollo
    // =========================================================================
    if (action === "log_phase") {
      var sAvances = getOrCreateSheet(ss, TABS.AVANCES);
      sAvances.appendRow([
        now.getTime(),
        dateStr,
        payload.appName || "",
        payload.phaseId || "",
        payload.phaseName || "",
        payload.progress || 0,
        payload.completed ? "SÍ" : "NO",
        payload.developer || "",
        payload.notes || ""
      ]);

      // También registrar en bitácora
      var sBit = getOrCreateSheet(ss, TABS.BITACORA);
      sBit.appendRow([
        now.getTime(),
        dateStr,
        payload.developer || "Sistema",
        "CAMBIO_FASE",
        payload.appName || "",
        "Fase '" + payload.phaseName + "' actualizada al " + payload.progress + "% (Completada: " + (payload.completed ? "SÍ" : "NO") + ")",
        "v2.6",
        ""
      ]);

      return createJsonResponse({
        status: "success",
        message: "Avance de fase registrado exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 3: Registrar Asignación de Tarea / Integración
    // =========================================================================
    if (action === "log_task") {
      var sTareas = getOrCreateSheet(ss, TABS.TAREAS);
      sTareas.appendRow([
        payload.taskId || ("int_" + now.getTime()),
        payload.taskName || "",
        payload.appName || "",
        payload.developer || "",
        payload.weight || 0,
        payload.deadline || "",
        payload.status || "En Progreso",
        payload.qualityScore ? (payload.qualityScore + " / 100") : "Pendiente de Auditoría",
        dateStr
      ]);

      var sBitTask = getOrCreateSheet(ss, TABS.BITACORA);
      sBitTask.appendRow([
        now.getTime(),
        dateStr,
        payload.developer || "Sistema",
        "ASIGNACION_INTEGRACION",
        payload.appName || "",
        "Tarea '" + payload.taskName + "' asignada a " + payload.developer + " (+ " + payload.weight + "% avance, plazo: " + payload.deadline + ")",
        "v2.6",
        ""
      ]);

      return createJsonResponse({
        status: "success",
        message: "Tarea registrada en Tareas_Integraciones exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 4: Registrar Auditoría de Calidad
    // =========================================================================
    if (action === "log_audit") {
      var sAuditorias = getOrCreateSheet(ss, TABS.AUDITORIAS);
      sAuditorias.appendRow([
        now.getTime(),
        dateStr,
        payload.appName || "",
        payload.developer || "",
        payload.score || 0,
        payload.daysDifference || 0,
        payload.pointsAdded || 0,
        payload.evaluator || "Super Admin",
        payload.notes || ""
      ]);

      var sBit2 = getOrCreateSheet(ss, TABS.BITACORA);
      sBit2.appendRow([
        now.getTime(),
        dateStr,
        payload.evaluator || "Super Admin",
        "AUDITORIA_FIRMADA",
        payload.appName || "",
        "Auditoría aplicada a " + payload.developer + ": " + payload.score + " pts. Notas: " + payload.notes,
        "v2.6",
        ""
      ]);

      return createJsonResponse({
        status: "success",
        message: "Auditoría registrada exitosamente en Google Sheets",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 4: Sincronización Completa del Estado de los Aplicativos
    // =========================================================================
    if (action === "sync_full_state") {
      var sSistemas = getOrCreateSheet(ss, TABS.SISTEMAS);
      // Limpiar datos antiguos conservando encabezados
      var lastRow = sSistemas.getLastRow();
      if (lastRow > 1) {
        sSistemas.deleteRows(2, lastRow - 1);
      }

      var apps = payload.applications || [];
      for (var i = 0; i < apps.length; i++) {
        var app = apps[i];
        sSistemas.appendRow([
          app.id || ("app_" + i),
          app.name || "",
          app.devName || "",
          app.currentPhase || "",
          app.progress || 0,
          app.slaStatus || "En Tiempo",
          dateStr
        ]);
      }

      // Sincronizar también todas las tareas/integraciones operativas
      var tasks = payload.integrations || [];
      if (tasks.length > 0) {
        var sTareas = getOrCreateSheet(ss, TABS.TAREAS);
        var lastRowTasks = sTareas.getLastRow();
        if (lastRowTasks > 1) {
          sTareas.deleteRows(2, lastRowTasks - 1);
        }
        for (var t = 0; t < tasks.length; t++) {
          var tsk = tasks[t];
          sTareas.appendRow([
            tsk.id || ("int_" + t),
            tsk.name || "",
            tsk.appName || "",
            tsk.devName || "",
            tsk.weight || 0,
            tsk.deadline || "",
            tsk.status || "En Progreso",
            tsk.evaluation ? (tsk.evaluation.qualityScore + " / 100") : "Pendiente de Auditoría",
            dateStr
          ]);
        }
      }

      var sBit3 = getOrCreateSheet(ss, TABS.BITACORA);
      sBit3.appendRow([
        now.getTime(),
        dateStr,
        payload.user || "Administrador",
        "SYNC_TOTAL",
        "Todos los Sistemas",
        "Sincronización completa de portafolio (" + apps.length + " aplicativos y " + tasks.length + " tareas sincronizadas)",
        "v2.6",
        ""
      ]);

      return createJsonResponse({
        status: "success",
        message: "Base de datos actualizada con " + apps.length + " aplicativos y " + tasks.length + " tareas",
        count: apps.length,
        taskCount: tasks.length,
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 5: Sincronizar Usuarios
    // =========================================================================
    if (action === "sync_users") {
      var sUsers = getOrCreateSheet(ss, TABS.USUARIOS);
      var lastRowUsers = sUsers.getLastRow();
      if (lastRowUsers > 1) {
        sUsers.deleteRows(2, lastRowUsers - 1);
      } else if (lastRowUsers === 0) {
        sUsers.appendRow(["ID", "Usuario_Logueo", "Rol", "Correo"]);
        formatHeaderRow(sUsers, "#0F172A");
      }

      var uData = payload.users || [
        { id: "1073524622", username: "jose@guzman", role: "desarrollador", email: "joseoneiber711@gmail.com" },
        { id: "1107047649", username: "juan@david", role: "desarrollador", email: "" },
        { id: "1111", username: "esteban@escobar", role: "desarrollador", email: "" },
        { id: "1010159672", username: "jhon@eyder", role: "desarrollador", email: "" },
        { id: "Admin", username: "ediaz", role: "Admin", email: "edwin.diaz@studiof.com.co" }
      ];

      for (var k = 0; k < uData.length; k++) {
        var userItem = uData[k];
        sUsers.appendRow([
          userItem.id || userItem.idPassword || "",
          userItem.username || "",
          userItem.role || "desarrollador",
          userItem.email || ""
        ]);
      }

      return createJsonResponse({
        status: "success",
        message: "Pestaña Usuarios actualizada exitosamente con " + uData.length + " usuarios",
        count: uData.length,
        date: dateStr
      });
    }

    return createJsonResponse({ status: "error", message: "Acción '" + action + "' desconocida" });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
