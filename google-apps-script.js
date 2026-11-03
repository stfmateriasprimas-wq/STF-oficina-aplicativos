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
      "Correo",
      "Nombre"
    ]);
    formatHeaderRow(sUsuarios, "#0F172A"); // Slate dark
    sUsuarios.appendRow(["1073524622", "jose@guzman", "desarrollador", "joseoneiber711@gmail.com", "Jose Guzman"]);
    sUsuarios.appendRow(["1107047649", "juan@david", "desarrollador", "juan.david@studiof.com.co", "Juan David"]);
    sUsuarios.appendRow(["1111", "esteban@escobar", "desarrollador", "esteban.escobar@studiof.com.co", "Esteban Escobar"]);
    sUsuarios.appendRow(["1010159672", "jhon@eyder", "desarrollador", "jhon.eyder@studiof.com.co", "Jhon Eyder (Mocho)"]);
    sUsuarios.appendRow(["Admin", "ediaz", "Admin", "edwin.diaz@studiof.com.co", "Edwin Diaz"]);
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
          idPassword: String(uRows[r][0] || "").trim(),
          username: String(uRows[r][1] || "").trim(),
          role: String(uRows[r][2] || "").trim(),
          email: String(uRows[r][3] || "").trim(),
          name: uRows[r].length > 4 ? String(uRows[r][4] || "").trim() : ""
        });
      }
    }
    return createJsonResponse({ status: "success", users: usersList });
  }

  if (action === "get_all_data") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sTareas = getOrCreateSheet(ss, TABS.TAREAS);
    var tRows = sTareas.getDataRange().getValues();
    var tasks = [];
    if (tRows.length > 1) {
      for (var t = 1; t < tRows.length; t++) {
        tasks.push({
          id: String(tRows[t][0] || "").trim(),
          name: String(tRows[t][1] || "").trim(),
          appName: String(tRows[t][2] || "").trim(),
          devName: String(tRows[t][3] || "").trim(),
          weight: Number(tRows[t][4]) || 15,
          deadline: String(tRows[t][5] || "").trim(),
          status: String(tRows[t][6] || "").trim(),
          evaluation: String(tRows[t][7] || "").trim(),
          createdDate: String(tRows[t][8] || "").trim()
        });
      }
    }

    var sSistemas = getOrCreateSheet(ss, TABS.SISTEMAS);
    var sysRows = sSistemas.getDataRange().getValues();
    var systems = [];
    if (sysRows.length > 1) {
      for (var s = 1; s < sysRows.length; s++) {
        systems.push({
          id: String(sysRows[s][0] || "").trim(),
          name: String(sysRows[s][1] || "").trim(),
          devName: String(sysRows[s][2] || "").trim(),
          currentPhase: String(sysRows[s][3] || "").trim(),
          progress: Number(sysRows[s][4]) || 0,
          slaStatus: String(sysRows[s][5] || "").trim()
        });
      }
    }

    return createJsonResponse({
      status: "success",
      tasks: tasks,
      systems: systems
    });
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
    // ACCIÓN 3: Registrar Asignación de Tarea / Integración & Enviar Correo Automático
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

      // Enviar correo electrónico automático al desarrollador asignado
      var emailSent = false;
      var targetEmail = (payload.email || "").trim();
      var devName = payload.developer || "Desarrollador";

      // Si no viene en el payload, buscar en la Columna D de la hoja 'Usuarios' o 'USUARIOS'
      if (!targetEmail) {
        var sUserSheet = ss.getSheetByName(TABS.USUARIOS) || ss.getSheetByName("USUARIOS") || ss.getSheetByName("Usuarios");
        if (sUserSheet) {
          var userValues = sUserSheet.getDataRange().getValues();
          // Fila 0 es encabezado: [ID, Usuario_Logueo, Rol, Correo, Nombre]
          for (var u = 1; u < userValues.length; u++) {
            var rowDevId = String(userValues[u][0] || "").toLowerCase().trim();
            var rowUser = String(userValues[u][1] || "").toLowerCase().trim();
            var rowEmail = String(userValues[u][3] || "").trim(); // Columna D
            var rowName = String(userValues[u][4] || userValues[u][1] || "").toLowerCase().trim();
            var searchTarget = String(devName).toLowerCase().trim();

            if (rowName.indexOf(searchTarget) !== -1 || searchTarget.indexOf(rowName) !== -1 ||
                rowUser.indexOf(searchTarget) !== -1 || searchTarget.indexOf(rowUser) !== -1 ||
                rowDevId === searchTarget) {
              if (rowEmail && rowEmail.indexOf("@") !== -1) {
                targetEmail = rowEmail;
                break;
              }
            }
          }
        }
      }

      // Si encontramos correo válido, enviar notificación HTML con diseño corporativo STF GROUP
      if (targetEmail && targetEmail.indexOf("@") !== -1) {
        try {
          var emailSubject = "⚡ Nueva Tarea Asignada: " + (payload.taskName || "Integración") + " · STF GROUP";
          var htmlBody = "" +
            "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);\">" +
              "<div style=\"background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 24px; color: #FFFFFF; text-align: left;\">" +
                "<div style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 8px;\">STF GROUP · CONTROL TI</div>" +
                "<h2 style=\"margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF;\">Nueva Tarea / Integración Asignada</h2>" +
                "<p style=\"margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;\">El Administrador te ha cargado una nueva responsabilidad en planta.</p>" +
              "</div>" +
              "<div style=\"padding: 24px;\">" +
                "<p style=\"font-size: 15px; color: #1E293B; margin-top: 0;\">Hola <strong>" + devName + "</strong>,</p>" +
                "<p style=\"font-size: 13.5px; color: #475569; line-height: 1.5;\">Se te ha asignado un nuevo módulo operativo en el <strong>Sistema de Control de Desarrollo de STF GROUP</strong>:</p>" +
                "<div style=\"background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;\">" +
                  "<div style=\"font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;\">Nombre de la Tarea</div>" +
                  "<div style=\"font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 14px;\">" + (payload.taskName || "Módulo") + "</div>" +
                  "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">" +
                    "<tr><td style=\"padding: 6px 0; color: #64748B;\">📁 <strong>Aplicativo:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #1E293B;\">" + (payload.appName || "Sistema") + "</td></tr>" +
                    "<tr><td style=\"padding: 6px 0; color: #64748B;\">⚖️ <strong>Ponderación:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #4E65FF;\">+" + (payload.weight || 15) + "% al avance del sistema</td></tr>" +
                    "<tr><td style=\"padding: 6px 0; color: #64748B;\">📅 <strong>Fecha Límite:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #EF4444;\">" + (payload.deadline || "Próximamente") + "</td></tr>" +
                    (payload.description ? "<tr><td style=\"padding: 6px 0; color: #64748B; vertical-align: top;\">📝 <strong>Instrucciones:</strong></td><td style=\"padding: 6px 0; color: #334155;\">" + payload.description + "</td></tr>" : "") +
                  "</table>" +
                "</div>" +
                "<div style=\"text-align: center; margin: 24px 0;\">" +
                  "<a href=\"https://stf-oficina-aplicativos.vercel.app\" style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 14px rgba(78, 101, 255, 0.35);\">Ingresar a la Plataforma STF</a>" +
                "</div>" +
                "<p style=\"font-size: 12px; color: #94A3B8; text-align: center; margin: 0;\">Este es un correo automático generado por el Sistema de Supervisión de Software STF GROUP.</p>" +
              "</div>" +
            "</div>";

          MailApp.sendEmail({
            to: targetEmail,
            subject: emailSubject,
            htmlBody: htmlBody
          });
          emailSent = true;
        } catch (mailErr) {
          // Si ocurre error enviando correo, registrar sin bloquear la respuesta
        }
      }

      return createJsonResponse({
        status: "success",
        message: "Tarea registrada en Tareas_Integraciones exitosamente" + (emailSent ? " y correo enviado a " + targetEmail : ""),
        emailSent: emailSent,
        recipient: targetEmail,
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
          userItem.email || "",
          userItem.name || ""
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
