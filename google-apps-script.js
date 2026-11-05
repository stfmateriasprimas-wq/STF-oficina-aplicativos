/**
 * ============================================================================
 * STF GROUP · BASE DE DATOS EJECUTIVA EN GOOGLE SHEETS
 * Arquitectura Optimizada en 4 Hojas Maestras Conectadas en Tiempo Real
 * ============================================================================
 * 
 * ESTRUCTURA PROFESIONAL CONSOLIDADA:
 * 1. 👥 USUARIOS           -> Directorio de Cuentas, Roles y Envío de Correos
 * 2. 📊 PORTAFOLIO_SISTEMAS -> Cockpit Ejecutivo de los 6 Macro-Sistemas Industriales
 * 3. 📋 CONTROL_TAREAS      -> Fusión de Tareas + Entregables + Auditorías de Calidad
 * 4. 📜 BITACORA_HISTORIAL  -> Trazabilidad y Pista de Auditoría Cronológica
 * 
 * ============================================================================
 */

// Nombres canónicos de las 5 pestañas consolidadas
var TABS = {
  USUARIOS: "USUARIOS",
  SISTEMAS: "PORTAFOLIO_SISTEMAS",
  SISTEMAS_WEB: "SISTEMAS_WEB",
  TAREAS: "CONTROL_TAREAS",
  BITACORA: "BITACORA_HISTORIAL"
};

/**
 * Menú personalizado automático en la barra superior de Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ STF SISTEMA')
    .addItem('🚀 Reorganizar Base de Datos (Modo Ejecutivo 5 Hojas)', 'setupProfessionalDatabase')
    .addItem('🌐 Inicializar / Actualizar Hoja SISTEMAS_WEB', 'setupSistemasWebSheetDirect')
    .addItem('📧 Probar Notificación por Correo', 'testEmailNotification')
    .addToUi();
}

function setupSistemasWebSheetDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSistemasWebSheet(ss);
  cleanAndOrderSheets(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Pestaña SISTEMAS_WEB creada y formateada con éxito.', 'STF GROUP TI', 6);
}

/**
 * REORGANIZADOR MAESTRO: Transforma la hoja en un modelo de base de datos
 * ejecutivo de 5 pestañas limpias, estéticas y con alto estándar corporativo.
 */
function setupProfessionalDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Pestaña USUARIOS
  setupUsuariosSheet(ss);

  // 2. Pestaña PORTAFOLIO_SISTEMAS
  setupSistemasSheet(ss);

  // 3. Pestaña SISTEMAS_WEB (URLs publicadas y asignación de desarrolladores)
  setupSistemasWebSheet(ss);

  // 4. Pestaña CONTROL_TAREAS (Fusión Tareas + Auditorías de Calidad)
  setupTareasSheet(ss);

  // 5. Pestaña BITACORA_HISTORIAL
  setupBitacoraSheet(ss);

  // 6. Ordenar las 5 pestañas al frente y archivar hojas viejas redundantes
  cleanAndOrderSheets(ss);

  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Base de datos reorganizada con éxito en 5 pestañas ejecutivas (incluye SISTEMAS_WEB).', 'STF GROUP TI', 6);
}

/**
 * 1. Configurar Hoja USUARIOS
 */
function setupUsuariosSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.USUARIOS, ["Usuarios"]);
  if (s.getLastRow() === 0) {
    s.appendRow(["ID", "Usuario_Logueo", "Rol", "Correo", "Nombre_Completo", "Estado"]);
    s.appendRow(["1073524622", "jose@guzman", "desarrollador", "joseoneiber711@gmail.com", "Jose Guzman", "ACTIVO"]);
    s.appendRow(["1107047649", "juan@david", "desarrollador", "juan.david@studiof.com.co", "Juan David", "ACTIVO"]);
    s.appendRow(["1111", "esteban@escobar", "desarrollador", "esteban.escobar@studiof.com.co", "Esteban Escobar", "ACTIVO"]);
    s.appendRow(["1010159672", "jhon@eyder", "desarrollador", "jhon.eyder@studiof.com.co", "Jhon Eyder (Mocho)", "ACTIVO"]);
    s.appendRow(["Admin", "ediaz", "Admin", "edwin.diaz@studiof.com.co", "Edwin Diaz", "ADMIN"]);
  }
  formatCorporateSheet(s, "#0F172A", [120, 160, 130, 240, 180, 100]); // Slate Dark
}

/**
 * 2. Configurar Hoja PORTAFOLIO_SISTEMAS
 */
function setupSistemasSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.SISTEMAS, ["Estado_Sistemas", "Avances_Fases"]);
  if (s.getLastRow() === 0) {
    s.appendRow([
      "Codigo",
      "Nombre_Aplicativo",
      "Area_Planta",
      "Lider_Responsable",
      "Fase_Actual",
      "Avance_%",
      "Estado_SLA",
      "Fecha_Limite",
      "Ultima_Actualizacion"
    ]);
    var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");
    s.appendRow(["STF-TC-01", "TORRE DE CONTROL", "Control Central TI", "Equipo Grupal (4 Devs)", "Fase 2: Arquitectura & Diseño UI/UX", 15, "En Tiempo", "2026-12-15", nowStr]);
    s.appendRow(["STF-COL-02", "COLCHAS", "Manufactura & Producción", "Jose Guzman", "Fase 6: Desplegado en Producción", 100, "En Producción", "2026-10-18", nowStr]);
    s.appendRow(["STF-LAB-03", "LABORATORIO", "Control Textil", "Jose Guzman", "Fase 4: Frontend & Reportes Técnicos", 55, "En Tiempo", "2026-11-30", nowStr]);
    s.appendRow(["STF-GEO-04", "GEO UBICACION TALLERES", "Logística & Talleres", "Jose Guzman", "Fase 4: Frontend & Tablero Geográfico", 55, "En Riesgo", "2026-11-15", nowStr]);
    s.appendRow(["STF-CAL-05", "CALIDAD & AUDITORIA", "Auditoría en Línea", "Juan David", "Fase 5: Pruebas QA & AQL en Planta", 70, "En Tiempo", "2026-11-20", nowStr]);
    s.appendRow(["STF-TIN-06", "TINTORERIA INDUSTRIAL", "Planta Tintorería", "Esteban Escobar", "Fase 4: Integración de Recetas & PLC", 60, "En Tiempo", "2026-12-05", nowStr]);
  }
  formatCorporateSheet(s, "#1E1B4B", [110, 220, 180, 180, 260, 90, 120, 110, 140]); // Indigo Navy
}

/**
 * 3. Configurar Hoja SISTEMAS_WEB
 * Estructura solicitada: Nombre del desarrollador, sistemas que tiene a cargo y la URL de cada sistema.
 */
function setupSistemasWebSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.SISTEMAS_WEB, ["SISTEMAS_WEB", "Sistemas_Web", "Urls_Web", "SISTEMAS_PUBLICADOS"]);
  
  // Preservar datos si la hoja ya contiene filas del usuario
  if (s.getLastRow() === 0) {
    s.appendRow([
      "Desarrollador",
      "Sistema_a_Cargo",
      "URL_Sistema_Web",
      "Estado"
    ]);

    s.appendRow(["Jose Guzman", "TORRE DE CONTROL", "sharepoint", "En Desarrollo"]);
    s.appendRow(["Jose Guzman", "COLCHAS", "https://colchas.vercel.app/", "En Producción"]);
    s.appendRow(["Jose Guzman", "LABORATORIO", "https://stflab-calidad-textil.vercel.app/", "En Desarrollo"]);
    s.appendRow(["Jose Guzman", "GEO UBICACION TALLERES", "https://stf-rastreo-calidad.vercel.app/", "En Desarrollo"]);
    s.appendRow(["Jose Guzman", "OFICINA - APLICATIVOS", "https://stf-oficina-aplicativos.vercel.app/", "En Desarrollo"]);
    s.appendRow(["Juan David", "CALIDAD", "", "En Desarrollo"]);
    s.appendRow(["Juan David", "TORRE DE CONTROL", "sharepoint", "En Desarrollo"]);
    s.appendRow(["Jhon Eyder (Mocho)", "TINTORERIA", "", "En Desarrollo"]);
    s.appendRow(["Jhon Eyder (Mocho)", "TORRE DE CONTROL", "sharepoint", "En Desarrollo"]);
    s.appendRow(["Esteban Escobar", "TORRE DE CONTROL", "sharepoint", "En Desarrollo"]);

    formatCorporateSheet(s, "#1E3A8A", [220, 260, 340, 140]); // Royal Blue
  }
}

/**
 * 3. Configurar Hoja CONTROL_TAREAS (Tareas + Entregables + Auditorías en una sola fila)
 */
function setupTareasSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.TAREAS, ["Tareas_Integraciones", "Auditorias_Calidad", "Efectividad_Calidad"]);
  if (s.getLastRow() === 0) {
    s.appendRow([
      "ID_Tarea",
      "Tarea",
      "Aplicativo",
      "Desarrollador",
      "Peso_%",
      "Fecha_Entrega",
      "Estado",
      "Calidad_QA",
      "Puntos_Sumados",
      "Fecha_Auditoria",
      "Dictamen_Evaluador"
    ]);
    var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");
    s.appendRow(["int_05", "Iniciar el ajuste de LAB.", "LABORATORIO", "Jose Guzman", 15, "2026-11-06", "En Progreso", "Pendiente", "0%", "-", "En curso - Ritmo óptimo"]);
    s.appendRow(["int_04", "Retomar incorporacion de base de datos.", "LABORATORIO", "Jose Guzman", 20, "2026-10-29", "En Riesgo", "Pendiente", "0%", "-", "Desfase detectado en planta"]);
    s.appendRow(["int_03", "Conexión Báscula Digital & Pesaje de Telas", "COLCHAS", "Jose Guzman", 15, "2026-10-24", "Auditada", "98.0%", "+14.7%", "2026-10-25", "Auditada & Aprobada por Jefatura TI"]);
    s.appendRow(["int_02", "Módulo GPS & Trazabilidad de Talleres Satélites", "GEO UBICACION TALLERES", "Jose Guzman", 20, "2026-10-18", "En Riesgo", "Pendiente", "0%", "-", "Desfase acumulado"]);
    s.appendRow(["int_01", "Gateway de Autenticación & Roles Operativos", "TORRE DE CONTROL", "Jose Guzman", 15, "2026-10-12", "Auditada", "96.3%", "+14.4%", "2026-10-13", "Auditada & Aprobada por Jefatura TI"]);
  }
  formatCorporateSheet(s, "#064E3B", [100, 280, 180, 150, 80, 110, 110, 100, 110, 120, 240]); // Emerald Green
}

/**
 * 4. Configurar Hoja BITACORA_HISTORIAL
 */
function setupBitacoraSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.BITACORA, ["Bitacora_Cambios", "Ingresos_Cambios"]);
  if (s.getLastRow() === 0) {
    s.appendRow([
      "Fecha_Hora",
      "Usuario",
      "Tipo_Evento",
      "Aplicativo",
      "Descripcion_Cambio",
      "Impacto"
    ]);
    var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");
    s.appendRow([nowStr, "Super Admin", "SISTEMA_INICIALIZADO", "Global", "Base de datos reorganizada a modelo ejecutivo de 4 hojas maestras", "ALTO"]);
  }
  formatCorporateSheet(s, "#1E293B", [160, 150, 180, 180, 320, 90]); // Slate Dark
}

/**
 * Aplica estilos ejecutivos corporativos (tipografía, padding, colores, bordes suaves)
 */
function formatCorporateSheet(sheet, headerHexColor, columnWidths) {
  sheet.setFrozenRows(1);
  var lastCol = Math.max(1, sheet.getLastColumn());
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  
  headerRange
    .setBackground(headerHexColor)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setFontFamily("Arial")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  
  sheet.setRowHeight(1, 32);

  if (columnWidths && Array.isArray(columnWidths)) {
    for (var i = 0; i < columnWidths.length && i < lastCol; i++) {
      sheet.setColumnWidth(i + 1, columnWidths[i]);
    }
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    dataRange
      .setFontFamily("Arial")
      .setFontSize(9.5)
      .setVerticalAlignment("middle");
    
    // Aplicar altura cómoda de fila
    for (var r = 2; r <= lastRow; r++) {
      sheet.setRowHeight(r, 24);
    }
  }
}

/**
 * Organiza las pestañas colocando las 5 maestras de primero y ocultando las obsoletas
 */
function cleanAndOrderSheets(ss) {
  var orderedTabs = [TABS.USUARIOS, TABS.SISTEMAS, TABS.SISTEMAS_WEB, TABS.TAREAS, TABS.BITACORA];
  for (var i = 0; i < orderedTabs.length; i++) {
    var tabSheet = ss.getSheetByName(orderedTabs[i]);
    if (tabSheet) {
      ss.setActiveSheet(tabSheet);
      ss.moveActiveSheet(i + 1);
    }
  }

  // Ocultar hojas residuales que generaban ruido si existen
  var obsoleteSheets = [
    "Respuestas de formulario 1",
    "Avances_Fases",
    "Auditorias_Calidad",
    "Efectividad_Calidad",
    "Estado_Sistemas",
    "Bitacora_Cambios",
    "Ingresos_Cambios",
    "Tareas_Integraciones"
  ];
  obsoleteSheets.forEach(function(name) {
    var obs = ss.getSheetByName(name);
    // Solo ocultar si NO es una de las 5 maestras activas
    if (obs && orderedTabs.indexOf(name) === -1) {
      try {
        obs.hideSheet();
      } catch (e) {}
    }
  });

  // Activar por defecto la primera pestaña
  var firstSheet = ss.getSheetByName(TABS.USUARIOS);
  if (firstSheet) ss.setActiveSheet(firstSheet);
}

/**
 * Obtiene la pestaña o la crea/renombra según aliases soportados
 */
function getOrCreateSheetByName(ss, targetName, aliases) {
  var sheet = ss.getSheetByName(targetName);
  if (sheet) return sheet;

  // Buscar si existe con alguno de sus nombres antiguos para reutilizarla
  if (aliases && Array.isArray(aliases)) {
    for (var a = 0; a < aliases.length; a++) {
      var aliasSheet = ss.getSheetByName(aliases[a]);
      if (aliasSheet) {
        aliasSheet.setName(targetName);
        return aliasSheet;
      }
    }
  }

  return ss.insertSheet(targetName);
}

function getMasterSheet(ss, tabKey) {
  var preferredName = TABS[tabKey];
  var sheet = ss.getSheetByName(preferredName);
  if (sheet) return sheet;

  // Fallbacks universales
  if (tabKey === "USUARIOS") {
    return ss.getSheetByName("USUARIOS") || ss.getSheetByName("Usuarios") || ss.insertSheet(TABS.USUARIOS);
  } else if (tabKey === "SISTEMAS") {
    return ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas") || ss.insertSheet(TABS.SISTEMAS);
  } else if (tabKey === "SISTEMAS_WEB") {
    return ss.getSheetByName("SISTEMAS_WEB") || ss.getSheetByName("Sistemas_Web") || ss.getSheetByName("Urls_Web") || ss.insertSheet(TABS.SISTEMAS_WEB);
  } else if (tabKey === "TAREAS") {
    return ss.getSheetByName("CONTROL_TAREAS") || ss.getSheetByName("Tareas_Integraciones") || ss.insertSheet(TABS.TAREAS);
  } else if (tabKey === "BITACORA") {
    return ss.getSheetByName("BITACORA_HISTORIAL") || ss.getSheetByName("Bitacora_Cambios") || ss.getSheetByName("Ingresos_Cambios") || ss.insertSheet(TABS.BITACORA);
  }
  return ss.getSheetByName(preferredName) || ss.insertSheet(preferredName);
}

/**
 * ============================================================================
 * ENDPOINT GET (Lectura, Consultas & Verificación en Tiempo Real)
 * ============================================================================
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "ping") {
    return createJsonResponse({
      status: "success",
      message: "STF GROUP Executive Database Online (4 Master Sheets)",
      timestamp: new Date().toISOString(),
      sheets: Object.values(TABS)
    });
  }

  // 1. Obtener Lista de Usuarios para Autenticación
  if (action === "get_users") {
    var sU = getMasterSheet(ss, "USUARIOS");
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

  // 2. Obtener Historial de Eventos
  if (action === "get_updates") {
    var sB = getMasterSheet(ss, "BITACORA");
    var bRows = sB.getDataRange().getValues();
    var headers = bRows[0] || [];
    var data = [];

    for (var i = bRows.length - 1; i >= 1 && data.length < 50; i--) {
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = bRows[i][h];
      }
      data.push(item);
    }
    return createJsonResponse({ status: "success", data: data });
  }

  // 3. Obtener Todo el Portafolio (Tareas + Sistemas)
  if (action === "get_all_data") {
    // A. Tareas desde CONTROL_TAREAS
    var sT = getMasterSheet(ss, "TAREAS");
    var tRows = sT.getDataRange().getValues();
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
          pointsAdded: String(tRows[t][8] || "").trim(),
          evalDate: String(tRows[t][9] || "").trim(),
          notes: String(tRows[t][10] || "").trim()
        });
      }
    }

    // B. Sistemas desde PORTAFOLIO_SISTEMAS
    var sS = getMasterSheet(ss, "SISTEMAS");
    var sysRows = sS.getDataRange().getValues();
    var systems = [];
    if (sysRows.length > 1) {
      for (var s = 1; s < sysRows.length; s++) {
        systems.push({
          code: String(sysRows[s][0] || "").trim(),
          name: String(sysRows[s][1] || "").trim(),
          area: String(sysRows[s][2] || "").trim(),
          devName: String(sysRows[s][3] || "").trim(),
          currentPhase: String(sysRows[s][4] || "").trim(),
          progress: Number(sysRows[s][5]) || 0,
          slaStatus: String(sysRows[s][6] || "").trim(),
          deadline: String(sysRows[s][7] || "").trim(),
          lastUpdate: String(sysRows[s][8] || "").trim()
        });
      }
    }

    // C. Enlaces de Sistemas Web Publicados desde SISTEMAS_WEB
    var sW = getMasterSheet(ss, "SISTEMAS_WEB");
    var wRows = sW ? sW.getDataRange().getValues() : [];
    var webSystems = [];
    if (wRows.length > 1) {
      for (var w = 1; w < wRows.length; w++) {
        var sysNameW = String(wRows[w][1] || "").trim();
        if (!sysNameW || sysNameW.toLowerCase() === "sistema_a_cargo" || sysNameW.toLowerCase() === "nombre_aplicativo") continue;
        webSystems.push({
          devName: String(wRows[w][0] || "").trim(),
          name: sysNameW,
          webUrl: String(wRows[w][2] || "").trim(),
          status: String(wRows[w][3] || "").trim()
        });
      }
    }

    return createJsonResponse({
      status: "success",
      tasks: tasks,
      systems: systems,
      webSystems: webSystems
    });
  }

  // 4. Obtener Enlaces de Sistemas Web Publicados
  if (action === "get_sistemas_web") {
    var sWebOnly = getMasterSheet(ss, "SISTEMAS_WEB");
    var woRows = sWebOnly ? sWebOnly.getDataRange().getValues() : [];
    var webList = [];
    if (woRows.length > 1) {
      for (var wo = 1; wo < woRows.length; wo++) {
        var sysNameWO = String(woRows[wo][1] || "").trim();
        if (!sysNameWO || sysNameWO.toLowerCase() === "sistema_a_cargo" || sysNameWO.toLowerCase() === "nombre_aplicativo") continue;
        webList.push({
          devName: String(woRows[wo][0] || "").trim(),
          name: sysNameWO,
          webUrl: String(woRows[wo][2] || "").trim(),
          status: String(woRows[wo][3] || "").trim()
        });
      }
    }
    return createJsonResponse({ status: "success", webSystems: webList });
  }

  return createJsonResponse({ status: "error", message: "Acción GET no reconocida" });
}

/**
 * ============================================================================
 * ENDPOINT POST (Escritura, Asignación de Tareas, Fases, Auditorías & Correos)
 * ============================================================================
 */
function doPost(e) {
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
    // ACCIÓN 1: Registrar Asignación de Tarea & Enviar Correo Automático
    // =========================================================================
    if (action === "log_task") {
      var sTareas = getMasterSheet(ss, "TAREAS");
      var taskId = payload.taskId || ("int_" + now.getTime());
      
      // Registrar tarea en CONTROL_TAREAS
      sTareas.appendRow([
        taskId,
        payload.taskName || "",
        payload.appName || "",
        payload.developer || "",
        payload.weight || 15,
        payload.deadline || "",
        payload.status || "En Progreso",
        "Pendiente", // Calidad_QA
        "0%",        // Puntos_Sumados
        "-",         // Fecha_Auditoria
        "Asignada desde App Web" // Dictamen
      ]);

      // Registrar evento en BITACORA_HISTORIAL
      var sBit = getMasterSheet(ss, "BITACORA");
      sBit.appendRow([
        dateStr,
        "Super Admin",
        "NUEVA_TAREA_ASIGNADA",
        payload.appName || "Sistema",
        "Tarea '" + payload.taskName + "' asignada a " + payload.developer + " (Plazo: " + payload.deadline + ", Peso: +" + payload.weight + "%)",
        "OPERATIVO"
      ]);

      // Enviar Correo Automático al Desarrollador
      var emailSent = sendTaskAssignmentEmail(ss, payload);

      return createJsonResponse({
        status: "success",
        message: "Tarea registrada en CONTROL_TAREAS exitosamente" + (emailSent.sent ? " y notificada por correo a " + emailSent.recipient : ""),
        emailSent: emailSent.sent,
        recipient: emailSent.recipient,
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 2: Registrar Auditoría de Calidad
    // =========================================================================
    if (action === "log_audit") {
      var sTareas2 = getMasterSheet(ss, "TAREAS");
      var tData = sTareas2.getDataRange().getValues();
      var foundRow = -1;
      var targetTaskName = String(payload.appName || "").toLowerCase();
      var targetDev = String(payload.developer || "").toLowerCase();

      // Buscar la tarea para actualizar su auditoría en la misma fila
      for (var r = 1; r < tData.length; r++) {
        var rowTaskName = String(tData[r][1] || "").toLowerCase();
        var rowApp = String(tData[r][2] || "").toLowerCase();
        var rowDev = String(tData[r][3] || "").toLowerCase();

        if (rowDev.indexOf(targetDev) !== -1 || targetDev.indexOf(rowDev) !== -1) {
          if (rowTaskName.indexOf(targetTaskName) !== -1 || rowApp.indexOf(targetTaskName) !== -1) {
            foundRow = r + 1;
            break;
          }
        }
      }

      if (foundRow !== -1) {
        sTareas2.getRange(foundRow, 7).setValue("Auditada"); // Estado
        sTareas2.getRange(foundRow, 8).setValue((payload.score || 95) + "%"); // Calidad_QA
        sTareas2.getRange(foundRow, 9).setValue("+" + (payload.pointsAdded || 15) + "%"); // Puntos_Sumados
        sTareas2.getRange(foundRow, 10).setValue(dateStr.substring(0, 10)); // Fecha_Auditoria
        sTareas2.getRange(foundRow, 11).setValue(payload.notes || "Auditada & Aprobada"); // Dictamen
      }

      // Registrar en BITACORA_HISTORIAL
      var sBit2 = getMasterSheet(ss, "BITACORA");
      sBit2.appendRow([
        dateStr,
        payload.evaluator || "Super Admin",
        "AUDITORIA_CALIFICADA",
        payload.appName || "Sistema",
        "Auditoría a " + payload.developer + ": Nota " + payload.score + "% (Sumó +" + payload.pointsAdded + "%). " + (payload.notes || ""),
        "ALTO"
      ]);

      return createJsonResponse({
        status: "success",
        message: "Auditoría registrada y consolidada en CONTROL_TAREAS",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 3: Registrar Avance en Fases de Desarrollo
    // =========================================================================
    if (action === "log_phase") {
      var sSistemas = getMasterSheet(ss, "SISTEMAS");
      var sysData = sSistemas.getDataRange().getValues();
      var targetAppName = String(payload.appName || "").toLowerCase();
      
      for (var s = 1; s < sysData.length; s++) {
        var curName = String(sysData[s][1] || "").toLowerCase();
        if (curName.indexOf(targetAppName) !== -1 || targetAppName.indexOf(curName) !== -1) {
          sSistemas.getRange(s + 1, 5).setValue(payload.phaseName || "Fase Actualizada");
          sSistemas.getRange(s + 1, 6).setValue(payload.progress || 0);
          sSistemas.getRange(s + 1, 9).setValue(dateStr);
          break;
        }
      }

      var sBit3 = getMasterSheet(ss, "BITACORA");
      sBit3.appendRow([
        dateStr,
        payload.developer || "Super Admin",
        "FASE_ACTUALIZADA",
        payload.appName || "Sistema",
        "Fase '" + payload.phaseName + "' actualizada al " + payload.progress + "%",
        "MEDIO"
      ]);

      return createJsonResponse({
        status: "success",
        message: "Avance de fase actualizado en PORTAFOLIO_SISTEMAS",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 4: Sincronización Completa de Estado (Snapshot)
    // =========================================================================
    if (action === "sync_full_state") {
      var apps = payload.applications || [];
      if (apps.length > 0) {
        var sSis = getMasterSheet(ss, "SISTEMAS");
        var lastR = sSis.getLastRow();
        if (lastR > 1) sSis.deleteRows(2, lastR - 1);

        for (var a = 0; a < apps.length; a++) {
          var ap = apps[a];
          sSis.appendRow([
            ap.code || ("STF-APP-" + (a + 1)),
            ap.name || "",
            ap.category || "General",
            ap.devName || "Equipo STF",
            ap.currentPhase || "En Desarrollo",
            ap.progress || 0,
            ap.slaStatus || "En Tiempo",
            ap.deadline || "2026-12-31",
            dateStr
          ]);
        }
        formatCorporateSheet(sSis, "#1E1B4B", [110, 220, 180, 180, 260, 90, 120, 110, 140]);
      }

      // Sincronizar también SISTEMAS_WEB preservando las filas y URLs manuales del usuario
      if (apps.length > 0) {
        var sWeb = getMasterSheet(ss, "SISTEMAS_WEB");
        if (sWeb) {
          if (sWeb.getLastRow() <= 1) {
            if (sWeb.getLastRow() === 0) {
              sWeb.appendRow(["Desarrollador", "Sistema_a_Cargo", "URL_Sistema_Web", "Estado"]);
            }
            for (var w = 0; w < apps.length; w++) {
              var wp = apps[w];
              sWeb.appendRow([
                wp.devName || "Equipo STF",
                wp.name || "",
                wp.webUrl || "",
                wp.progress === 100 ? "En Producción" : "En Desarrollo"
              ]);
            }
            formatCorporateSheet(sWeb, "#1E3A8A", [220, 260, 340, 140]);
          } else {
            // Ya existen filas manuales configuradas por el usuario: actualizar solo URLs si vienen definidas sin borrar la hoja
            var wData = sWeb.getDataRange().getValues();
            for (var w = 0; w < apps.length; w++) {
              var wp = apps[w];
              if (!wp.webUrl) continue;
              for (var r = 1; r < wData.length; r++) {
                var rowSys = String(wData[r][1] || "").toLowerCase().trim();
                var curSys = String(wp.name || "").toLowerCase().trim();
                if (rowSys === curSys || rowSys.indexOf(curSys) !== -1 || curSys.indexOf(rowSys) !== -1) {
                  if (!wData[r][2] || String(wData[r][2]).trim() === "") {
                    sWeb.getRange(r + 1, 3).setValue(wp.webUrl);
                  }
                  break;
                }
              }
            }
          }
        }
      }

      return createJsonResponse({
        status: "success",
        message: "Portafolio y URLs sincronizados en PORTAFOLIO_SISTEMAS y SISTEMAS_WEB (" + apps.length + " sistemas)",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 5: Registro General en Bitácora
    // =========================================================================
    if (action === "log_update") {
      var sBitLog = getMasterSheet(ss, "BITACORA");
      sBitLog.appendRow([
        dateStr,
        payload.developer || "Sistema",
        payload.eventType || "ACTUALIZACION",
        payload.appName || "Global",
        payload.description || "Cambio operativo registrado",
        "INFO"
      ]);

      return createJsonResponse({
        status: "success",
        message: "Evento registrado en BITACORA_HISTORIAL",
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

/**
 * Función auxiliar para buscar el correo y enviar notificación HTML
 */
function sendTaskAssignmentEmail(ss, payload) {
  var devName = payload.developer || "Desarrollador";
  var targetEmail = (payload.email || "").trim();

  if (!targetEmail) {
    var sUsers = getMasterSheet(ss, "USUARIOS");
    var uValues = sUsers.getDataRange().getValues();
    var search = devName.toLowerCase().trim();

    for (var u = 1; u < uValues.length; u++) {
      var rUser = String(uValues[u][1] || "").toLowerCase().trim();
      var rEmail = String(uValues[u][3] || "").trim();
      var rName = String(uValues[u][4] || "").toLowerCase().trim();

      if (rName.indexOf(search) !== -1 || search.indexOf(rName) !== -1 ||
          rUser.indexOf(search) !== -1 || search.indexOf(rUser) !== -1 ||
          (search.indexOf("jose") !== -1 && rUser.indexOf("jose") !== -1)) {
        if (rEmail && rEmail.indexOf("@") !== -1) {
          targetEmail = rEmail;
          break;
        }
      }
    }
  }

  // Fallback de seguridad
  if (!targetEmail) {
    var sLower = devName.toLowerCase();
    if (sLower.indexOf("jose") !== -1 || sLower.indexOf("guzman") !== -1) targetEmail = "joseoneiber711@gmail.com";
    else if (sLower.indexOf("juan") !== -1) targetEmail = "juan.david@studiof.com.co";
    else if (sLower.indexOf("esteban") !== -1) targetEmail = "esteban.escobar@studiof.com.co";
    else if (sLower.indexOf("mocho") !== -1 || sLower.indexOf("jhon") !== -1) targetEmail = "jhon.eyder@studiof.com.co";
  }

  if (targetEmail && targetEmail.indexOf("@") !== -1) {
    try {
      var subject = "⚡ Nueva Tarea Asignada: " + (payload.taskName || "Módulo") + " · STF GROUP";
      var html = "" +
        "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);\">" +
          "<div style=\"background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 24px; color: #FFFFFF; text-align: left;\">" +
            "<div style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 8px;\">STF GROUP · CONTROL TI</div>" +
            "<h2 style=\"margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF;\">Nueva Tarea / Integración Asignada</h2>" +
            "<p style=\"margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;\">El Administrador te ha cargado una nueva responsabilidad en planta.</p>" +
          "</div>" +
          "<div style=\"padding: 24px;\">" +
            "<p style=\"font-size: 15px; color: #1E293B; margin-top: 0;\">Hola <strong>" + devName + "</strong>,</p>" +
            "<p style=\"font-size: 13.5px; color: #475569; line-height: 1.5;\">Se te ha asignado una nueva integración en la plataforma:</p>" +
            "<div style=\"background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;\">" +
              "<div style=\"font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;\">Nombre de la Tarea</div>" +
              "<div style=\"font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 14px;\">" + (payload.taskName || "Módulo") + "</div>" +
              "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">" +
                "<tr><td style=\"padding: 6px 0; color: #64748B;\">📁 <strong>Aplicativo:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #1E293B;\">" + (payload.appName || "Sistema") + "</td></tr>" +
                "<tr><td style=\"padding: 6px 0; color: #64748B;\">⚖️ <strong>Ponderación:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #4E65FF;\">+" + (payload.weight || 15) + "% al avance del sistema</td></tr>" +
                "<tr><td style=\"padding: 6px 0; color: #64748B;\">📅 <strong>Fecha Límite:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #EF4444;\">" + (payload.deadline || "Próximamente") + "</td></tr>" +
              "</table>" +
            "</div>" +
            "<div style=\"text-align: center; margin: 24px 0;\">" +
              "<a href=\"https://stf-oficina-aplicativos.vercel.app\" style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 14px rgba(78, 101, 255, 0.35);\">Ingresar a la Plataforma STF</a>" +
            "</div>" +
            "<p style=\"font-size: 12px; color: #94A3B8; text-align: center; margin: 0;\">Este es un correo automático generado por el Sistema de Supervisión STF GROUP.</p>" +
          "</div>" +
        "</div>";

      MailApp.sendEmail({
        to: targetEmail,
        subject: subject,
        htmlBody: html
      });
      return { sent: true, recipient: targetEmail };
    } catch (e) {
      return { sent: false, error: e.toString() };
    }
  }
  return { sent: false, reason: "Sin correo válido" };
}

function testEmailNotification() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = sendTaskAssignmentEmail(ss, {
    developer: "Jose Guzman",
    taskName: "Prueba de Conexión Automatizada",
    appName: "LABORATORIO",
    weight: 15,
    deadline: "2026-11-10",
    email: "joseoneiber711@gmail.com"
  });

  if (res.sent) {
    SpreadsheetApp.getUi().alert("✅ Correo de prueba enviado con éxito a " + res.recipient);
  } else {
    SpreadsheetApp.getUi().alert("⚠️ No se pudo enviar el correo: " + (res.error || res.reason));
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
