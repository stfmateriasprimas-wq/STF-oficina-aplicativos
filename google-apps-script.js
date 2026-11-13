/**
 * ============================================================================
 * STF GROUP · BASE DE DATOS EJECUTIVA EN GOOGLE SHEETS (v3.5 PRODUCTION)
 * Arquitectura Estabilizada en 5 Hojas Maestras Oficiales Conectadas en Tiempo Real
 * ============================================================================
 *
 * ESTRUCTURA OFICIAL DE LAS 5 HOJAS MAESTRAS (100% ALINEADA A TABLAS NATIVAS):
 * 1. 👥 USUARIOS                (6 Columnas A:F) -> Credenciales, Roles, Correos y Acceso
 * 2. 🌐 SISTEMAS_WEB            (4 Columnas A:D) -> Enlaces Web / SharePoint y Estado en Planta
 * 3. 📋 CONTROL_TAREAS          (9 Columnas A:I) -> Integraciones, Tiempos, Calidad QA y Dictamen
 * 4. 📝 HISTORIAL_OBSERVACIONES (6 Columnas A:F) -> Bloqueos, Avances, Ajustes y Novedades por Tarea
 * 5. 📜 BITACORA_HISTORIAL      (7 Columnas A:G) -> Trazabilidad Completa de Todos los Procesos
 *
 * ============================================================================
 */

var TABS = {
  USUARIOS: "USUARIOS",
  SISTEMAS_WEB: "SISTEMAS_WEB",
  TAREAS: "CONTROL_TAREAS",
  OBSERVACIONES: "HISTORIAL_OBSERVACIONES",
  BITACORA: "BITACORA_HISTORIAL",
  SOPORTE: "SOLICITUDES_SOPORTE"
};

var HEADERS = {
  USUARIOS: [
    "ID",
    "Usuario_Logueo",
    "Rol",
    "Correo",
    "Nombre_Completo",
    "Estado"
  ],
  SISTEMAS: [
    "Codigo",
    "Nombre_Aplicativo",
    "Area_Planta",
    "Lider_Responsable",
    "Fase_Actual",
    "Avance_%",
    "Estado_SLA",
    "Fecha_Limite",
    "Ultima_Actualizacion"
  ],
  SISTEMAS_WEB: [
    "Desarrollador",
    "Sistema_a_Cargo",
    "URL_Sistema_Web",
    "Estado"
  ],
  TAREAS: [
    "Tarea",
    "Aplicativo",
    "Desarrollador",
    "Ponderacion_%",
    "Fecha_Entrega",
    "Estado",
    "Evaluacion_Calidad",
    "Fecha_Registro",
    "Observaciones_Auditoria"
  ],
  BITACORA: [
    "Timestamp",
    "Fecha_Hora",
    "Desarrollador",
    "Tipo_Evento",
    "Aplicativo",
    "Descripcion",
    "Version"
  ],
  OBSERVACIONES: [
    "FECHA",
    "APLICATIVO",
    "DESARROLLADOR",
    "TAREA",
    "NIVEL DE IMPACTO",
    "OBSERVACION"
  ],
  SOPORTE: [
    "ID_Ticket",
    "Fecha_Solicitud",
    "Tipo_Solicitud",
    "Sistema",
    "Codigo_Sistema",
    "Solicitante",
    "Area_Modulo",
    "Titulo",
    "Descripcion",
    "Desarrollador_Responsable",
    "Estado",
    "Fecha_Respuesta",
    "Observacion_Desarrollador",
    "Tiempo_Estimado_ETA",
    "Resuelto_Por",
    "Correo_Solicitante"
  ]
};

/**
 * Menú personalizado automático en la barra superior de Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ STF SISTEMA')
    .addItem('🚀 Estabilizar Base de Datos (6 Hojas Oficiales)', 'setupProfessionalDatabase')
    .addItem('🎧 Crear / Configurar Hoja SOLICITUDES_SOPORTE', 'setupSoporteSheetDirect')
    .addItem('🗑️ Eliminar Columna Telefono_SMS de Sheets', 'eliminarColumnaTelefonoSMS')
    .addItem('🧹 Limpiar Tickets de Prueba (Dejar en 0)', 'limpiarTicketsPruebaSoporte')
    .addItem('🗑️ Eliminar Hoja PORTAFOLIO_SISTEMAS', 'removePortafolioSistemasSheet')
    .addItem('📋 Reparar & Alinear Hoja CONTROL_TAREAS', 'setupTareasSheetDirect')
    .addItem('🌐 Actualizar Hoja SISTEMAS_WEB', 'setupSistemasWebSheetDirect')
    .addItem('📝 Configurar Hoja HISTORIAL_OBSERVACIONES', 'setupObservacionesSheetDirect')
    .addItem('📧 Probar Notificación por Correo', 'testEmailNotification')
    .addToUi();
}

/**
 * Elimina la columna Q (Telefono_SMS) en la hoja SOLICITUDES_SOPORTE
 */
function eliminarColumnaTelefonoSMS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getMasterSheet(ss, "SOPORTE");
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast('❌ No se encontró la hoja SOLICITUDES_SOPORTE.', 'STF GROUP TI', 5);
    return;
  }
  
  var maxCols = Math.max(sheet.getLastColumn(), 17);
  var headers = sheet.getRange(1, 1, 1, maxCols).getValues()[0];
  var colIdx = -1;
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').toLowerCase().trim();
    if (h.indexOf('telefono') !== -1 || h.indexOf('sms') !== -1 || h.indexOf('celular') !== -1) {
      colIdx = c + 1;
      break;
    }
  }

  if (colIdx !== -1) {
    try {
      sheet.deleteColumn(colIdx);
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Columna Telefono_SMS eliminada exitosamente.', 'STF GROUP TI', 6);
    } catch (e) {
      try {
        sheet.getRange(1, colIdx, sheet.getMaxRows(), 1).clearContent();
        SpreadsheetApp.getActiveSpreadsheet().toast('✅ Contenido de columna Telefono_SMS borrado exitosamente.', 'STF GROUP TI', 6);
      } catch (e2) {}
    }
  } else if (sheet.getLastColumn() >= 17) {
    try {
      sheet.deleteColumn(17);
      SpreadsheetApp.getActiveSpreadsheet().toast('✅ Columna 17 (Q) eliminada exitosamente.', 'STF GROUP TI', 6);
    } catch (e3) {
      sheet.getRange(1, 17, sheet.getMaxRows(), 1).clearContent();
    }
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast('ℹ️ La columna Telefono_SMS ya no existe en la hoja.', 'STF GROUP TI', 5);
  }
}

/**
 * Deja la hoja SOLICITUDES_SOPORTE en 0 registros (elimina filas de prueba conservando encabezados de fila 1)
 */
function limpiarTicketsPruebaSoporte() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getMasterSheet(ss, "SOPORTE");
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast('❌ No se encontró la hoja SOLICITUDES_SOPORTE.', 'STF GROUP TI', 5);
    return;
  }
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
    SpreadsheetApp.getActiveSpreadsheet().toast('✅ Hoja SOLICITUDES_SOPORTE restablecida en 0 registros.', 'STF GROUP TI', 6);
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast('ℹ️ La hoja ya se encuentra en 0 registros.', 'STF GROUP TI', 5);
  }
}

/**
 * Elimina definitivamente la hoja vacía/redundante PORTAFOLIO_SISTEMAS
 */
function removePortafolioSistemasSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas") || ss.getSheetByName("Avances_Fases");
  if (sheet) {
    if (ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sheet);
        SpreadsheetApp.getActiveSpreadsheet().toast('🗑️ Pestaña PORTAFOLIO_SISTEMAS eliminada con éxito.', 'STF GROUP TI', 6);
      } catch (e) {
        try { sheet.hideSheet(); } catch (e2) { }
      }
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast('⚠️ No se puede eliminar la única pestaña de la hoja.', 'STF GROUP TI', 6);
    }
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast('ℹ️ La pestaña PORTAFOLIO_SISTEMAS ya no existe en el archivo.', 'STF GROUP TI', 6);
  }
  cleanAndOrderSheets(ss);
}

function setupTareasSheetDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupTareasSheet(ss);
  cleanAndOrderSheets(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Pestaña CONTROL_TAREAS reparada: fechas YYYY-MM-DD y porcentajes corregidos con éxito.', 'STF GROUP TI', 6);
}

function setupSistemasWebSheetDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSistemasWebSheet(ss, true);
  cleanAndOrderSheets(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Pestaña SISTEMAS_WEB reparada y actualizada con éxito.', 'STF GROUP TI', 6);
}

function setupObservacionesSheetDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupObservacionesSheet(ss);
  cleanAndOrderSheets(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Pestaña HISTORIAL_OBSERVACIONES configurada y enlazada con éxito.', 'STF GROUP TI', 6);
}

function setupSoporteSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.SOPORTE, ["Solicitudes_Soporte", "Soporte_Tecnico"]);
  ensureExactHeaders(s, HEADERS.SOPORTE);
  s.setTabColor('#f59e0b');

  // Si está vacía (solo fila de encabezado), dejamos listo el formato profesional
  if (s.getLastRow() <= 1) {
    s.getRange(1, 1, 1, HEADERS.SOPORTE.length)
      .setBackground('#4F46E5')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
  }
  return s;
}

function setupSoporteSheetDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSoporteSheet(ss);
  cleanAndOrderSheets(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Pestaña SOLICITUDES_SOPORTE creada y configurada con sus 15 columnas oficiales.', 'STF GROUP TI', 6);
}

/**
 * ESTABILIZADOR MAESTRO: Estabiliza la arquitectura oficial en las 6 hojas maestras:
 * USUARIOS, SISTEMAS_WEB, CONTROL_TAREAS, HISTORIAL_OBSERVACIONES, BITACORA_HISTORIAL, SOLICITUDES_SOPORTE
 */
function setupProfessionalDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 0. Eliminar pestaña obsoleta/vacía PORTAFOLIO_SISTEMAS
  removePortafolioSistemasSheet();

  // 1. Pestaña USUARIOS (6 Columnas A:F)
  setupUsuariosSheet(ss);

  // 2. Pestaña SISTEMAS_WEB (4 Columnas A:D)
  setupSistemasWebSheet(ss, true);

  // 3. Pestaña CONTROL_TAREAS (9 Columnas A:I)
  setupTareasSheet(ss);

  // 4. Pestaña HISTORIAL_OBSERVACIONES (6 Columnas A:F)
  setupObservacionesSheet(ss);

  // 5. Pestaña BITACORA_HISTORIAL (7 Columnas A:G con auto-reparación de filas)
  setupBitacoraSheet(ss);

  // 6. Pestaña SOLICITUDES_SOPORTE (15 Columnas A:O)
  setupSoporteSheet(ss);

  // 7. Ordenar las 6 pestañas oficiales al frente
  cleanAndOrderSheets(ss);

  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Base de datos estabilizada con éxito en las 6 hojas maestras oficiales.', 'STF GROUP TI', 7);
}

/**
 * Garantiza que la Fila 1 tenga exactamente los encabezados oficiales
 * (Blindado contra errores de Tablas Nativas de Google Sheets: nunca limpia encabezados en Fila 1)
 */
function ensureExactHeaders(sheet, expectedHeaders) {
  if (!sheet || !expectedHeaders || !expectedHeaders.length) return;
  try {
    var numCols = expectedHeaders.length;
    var maxCol = Math.max(sheet.getLastColumn(), numCols);
    if (maxCol < 1) maxCol = numCols;

    var currentVals = sheet.getRange(1, 1, 1, maxCol).getValues()[0];
    for (var j = 0; j < numCols; j++) {
      var targetVal = String(expectedHeaders[j]).trim();
      var currentVal = String(currentVals[j] || "").trim();
      if (currentVal !== targetVal) {
        try {
          sheet.getRange(1, j + 1).setValue(targetVal);
        } catch (eCell) {
          // Ignorar restricciones si la tabla nativa protege la celda
        }
      }
    }
  } catch (err) {
    Logger.log("ensureExactHeaders safe catch: " + err.toString());
  }
}

/**
 * Normaliza cualquier formato de fecha a 'YYYY-MM-DD' estricto para evitar errores en Google Sheets
 */
function formatDateToYMD(val) {
  if (!val) return "2026-11-15";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "America/Bogota", "yyyy-MM-dd");
  }
  var str = String(val).trim();
  if (str.indexOf("Mon Nov") !== -1 || str.indexOf("Nov 09") !== -1 || str.indexOf("Nov 9") !== -1) {
    return "2026-11-09";
  }
  var mYMD = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mYMD) {
    var y = mYMD[1];
    var m = ("0" + mYMD[2]).slice(-2);
    var d = ("0" + mYMD[3]).slice(-2);
    return y + "-" + m + "-" + d;
  }
  var mDMY = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mDMY) {
    var d2 = ("0" + mDMY[1]).slice(-2);
    var m2 = ("0" + mDMY[2]).slice(-2);
    var y2 = mDMY[3];
    return y2 + "-" + m2 + "-" + d2;
  }
  var parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, "America/Bogota", "yyyy-MM-dd");
  }
  return str.split("T")[0].split(" ")[0];
}

/**
 * 1. Configurar y Estabilizar Hoja USUARIOS (6 Columnas A:F)
 */
function setupUsuariosSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.USUARIOS, ["Usuarios"]);
  ensureExactHeaders(s, HEADERS.USUARIOS);

  if (s.getLastRow() <= 1) {
    var defaultUsers = [
      ["1073524622", "jose@guzman", "desarrollador", "joseoneiber711@gmail.com", "Jose Guzman", "ACTIVO"],
      ["1107047649", "juan@david", "desarrollador", "juan.david@studiof.com.co", "Juan David", "ACTIVO"],
      ["1111", "esteban@escobar", "desarrollador", "esteban.escobar@studiof.com.co", "Esteban Escobar", "ACTIVO"],
      ["1010159672", "jhon@eyder", "desarrollador", "jhon.eyder@studiof.com.co", "Jhon Eyder (Mocho)", "ACTIVO"],
      ["Admin", "ediaz", "Admin", "edwin.diaz@studiof.com.co", "Edwin Diaz", "ADMIN"]
    ];
    s.getRange(2, 1, defaultUsers.length, 6).setValues(defaultUsers);
  } else {
    // Asegurar que todas las filas existentes tengan Nombre_Completo (Col E) y Estado (Col F)
    var rows = s.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var uLog = String(rows[r][1] || "").toLowerCase().trim();
      var role = String(rows[r][2] || "desarrollador").trim();
      var name = String(rows[r][4] || "").trim();
      var state = String(rows[r][5] || "").trim();

      if (!name) {
        if (uLog.indexOf("jose") !== -1) name = "Jose Guzman";
        else if (uLog.indexOf("juan") !== -1) name = "Juan David";
        else if (uLog.indexOf("esteban") !== -1) name = "Esteban Escobar";
        else if (uLog.indexOf("jhon") !== -1 || uLog.indexOf("mocho") !== -1) name = "Jhon Eyder (Mocho)";
        else if (uLog.indexOf("ediaz") !== -1) name = "Edwin Diaz";
        else name = uLog;
        s.getRange(r + 1, 5).setValue(name);
      }
      if (!state) {
        s.getRange(r + 1, 6).setValue(role.toLowerCase() === "admin" ? "ADMIN" : "ACTIVO");
      }
    }
  }
  formatCorporateSheet(s, "#0F172A", [120, 160, 130, 240, 180, 100]);
}

/**
 * 2. Función de eliminación de compatibilidad para PORTAFOLIO_SISTEMAS (Hoja retirada)
 */
function setupSistemasSheet(ss, forceRealData) {
  removePortafolioSistemasSheet();
}

/**
 * 3. Configurar y Estabilizar Hoja SISTEMAS_WEB (4 Columnas A:D)
 * Corrige "Columna 1..4" en Fila 1, elimina encabezados duplicados en Fila 2
 * y sincroniza el estado real de los 7 sistemas.
 */
function setupSistemasWebSheet(ss, forceClean) {
  var s = getOrCreateSheetByName(ss, TABS.SISTEMAS_WEB, ["SISTEMAS_WEB", "Sistemas_Web", "Urls_Web", "SISTEMAS_PUBLICADOS"]);

  // Preservar URLs personalizadas que el usuario haya ingresado
  var customUrls = {};
  if (s.getLastRow() > 1) {
    var existingData = s.getDataRange().getValues();
    for (var i = 1; i < existingData.length; i++) {
      var sysName = String(existingData[i][1] || "").trim().toUpperCase();
      var urlVal = String(existingData[i][2] || "").trim();
      if (sysName && sysName !== "SISTEMA_A_CARGO" && urlVal && urlVal.toLowerCase() !== "url_sistema_web") {
        customUrls[sysName] = urlVal;
      }
    }
  }

  // Asegurar encabezados exactos en Fila 1 (elimina Columna 1, Columna 2, Columna 3, Columna 4)
  ensureExactHeaders(s, HEADERS.SISTEMAS_WEB);

  var officialWebRows = [
    ["Equipo Grupal (4 Devs)", "TORRE DE CONTROL", customUrls["TORRE DE CONTROL"] || "sharepoint", "En Construcción"],
    ["Jose Guzman", "LABORATORIO", customUrls["LABORATORIO"] || "https://stflab-calidad-textil.vercel.app/", "En Construcción"],
    ["Jose Guzman", "GEO UBICACION TALLERES", customUrls["GEO UBICACION TALLERES"] || "https://stf-rastreo-calidad.vercel.app/", "En Construcción"],
    ["Jose Guzman", "OFICINA - APLICATIVOS", customUrls["OFICINA - APLICATIVOS"] || "https://stf-oficina-aplicativos.vercel.app/", "En Construcción"],
    ["Juan David", "CALIDAD", customUrls["CALIDAD"] || "", "En Producción"],
    ["Jhon Eyder (Mocho)", "TINTORERIA", customUrls["TINTORERIA"] || "https://stf-tintoreria.netlify.app/?v=2", "En Producción"],
    ["Jose Guzman", "COLCHAS", customUrls["COLCHAS"] || "https://colchas.vercel.app/", "En Producción"]
  ];

  var lastR = s.getLastRow();
  if (lastR > 1) {
    s.getRange(2, 1, lastR - 1, Math.max(4, s.getLastColumn())).clearContent();
    if (lastR > officialWebRows.length + 1) {
      try {
        s.deleteRows(officialWebRows.length + 2, lastR - (officialWebRows.length + 1));
      } catch (e) { }
    }
  }
  s.getRange(2, 1, officialWebRows.length, 4).setValues(officialWebRows);
  formatCorporateSheet(s, "#14532D", [200, 230, 320, 140]);
}

/**
 * 4. Configurar y Estabilizar Hoja CONTROL_TAREAS (9 Columnas Oficiales A:I)
 * Alineada exactamente a Tabla_1:
 * Col A: Tarea
 * Col B: Aplicativo
 * Col C: Desarrollador
 * Col D: Ponderacion_%
 * Col E: Fecha_Entrega (formato estricto YYYY-MM-DD para evitar errores)
 * Col F: Estado (En Progreso / Auditada / En Riesgo)
 * Col G: Evaluacion_Calidad (Pendiente de Auditoría o 94.3% (+14.1%) - corrige 0.943%)
 * Col H: Fecha_Registro
 * Col I: Observaciones_Auditoria
 */
function setupTareasSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.TAREAS, ["Tareas_Integraciones", "Auditorias_Calidad", "Efectividad_Calidad"]);
  ensureExactHeaders(s, HEADERS.TAREAS);

  var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

  var officialTasks = [
    ["Integración KPI", "LABORATORIO", "Jose Guzman", 25, "2026-11-16", "En Progreso", "Pendiente de Auditoría", "2026-11-07 07:03:48", "KPI completos"],
    ["Investigar como podemos aplicar app de laboratorio en SharePoint", "LABORATORIO", "Jose Guzman", 10, "2026-11-09", "En Progreso", "Pendiente de Auditoría", "2026-11-07 07:03:48", "tenemos que crear y estabilizar el sistema de laboratorio por SharePoint para que nos quede en cuanto seguridad mas estable."],
    ["Iniciar el ajuste de LAB.", "LABORATORIO", "Jose Guzman", 15, "2026-11-06", "Auditada", "94.3% (+14.1%)", "2026-11-05 08:00:00", "Implementación en planta validada con los operarios. Operatividad estable."],
    ["Retomar incorporacion de base de datos.", "LABORATORIO", "Jose Guzman", 20, "2026-10-29", "Auditada", "94.3% (+18.9%)", "2026-11-04 08:00:00", "Implementación en planta validada con los operarios. Operatividad estable."],
    ["hacer indicador - juan", "CALIDAD", "Juan David", 15, "2026-10-29", "Auditada", "94.3% (+14.1%)", "2026-11-05 08:00:00", "Implementación en planta validada con los operarios. Operatividad estable."],
    ["Gateway de Autenticación & Roles Operativos", "TORRE DE CONTROL", "Jose Guzman", 15, "2026-10-12", "Auditada", "96.3% (+14.4%)", "2026-11-04 08:00:00", "Excelente arquitectura e integración limpia. Pruebas de estrés superadas."],
    ["Conexión Báscula Digital & Pesaje de Telas", "COLCHAS", "Jose Guzman", 15, "2026-10-24", "Auditada", "98.0% (+14.7%)", "2026-11-04 08:00:00", "Auditada & Aprobada por Jefatura TI. Operando al 100% en línea de Colchas."],
    ["Auditoría AQL Móvil & Muestreo en Planta", "CALIDAD", "Juan David", 20, "2026-10-22", "En Progreso", "Pendiente de Auditoría", "2026-11-07 07:03:48", "Desarrollo de interfaz táctil para auditores de calidad en mesa de corte con cálculo automático de tablas militares estándar AQL."],
    ["Automatización de Recetas Químicas en Barcas", "TINTORERIA", "Jhon Eyder (Mocho)", 15, "2026-10-28", "En Progreso", "Pendiente de Auditoría", "2026-11-07 07:03:48", "Algoritmo de cálculo de dosificación de tintes y reactivos según el peso del lote de tela a teñir."],
    ["Módulo GPS & Trazabilidad de Talleres Satélites", "GEO UBICACION TALLERES", "Jose Guzman", 20, "2026-10-18", "Auditada", "94.3% (+18.9%)", "2026-11-04 08:00:00", "Módulo de rastreo validado e integrado con éxito."],
    ["Servicio de Notificaciones en Tiempo Real (WebSockets)", "TORRE DE CONTROL", "Esteban Escobar", 10, "2026-10-26", "En Progreso", "Pendiente de Auditoría", "2026-11-07 07:03:48", "Infraestructura de alertas críticas en Torre de Control ante paradas de línea de producción o retrasos en planta."]
  ];

  if (s.getLastRow() <= 1) {
    s.getRange(2, 1, officialTasks.length, 9).setValues(officialTasks);
  } else {
    // Normalizar filas existentes de CONTROL_TAREAS
    var data = s.getDataRange().getValues();
    var firstCell = String(data[0][0] || "").toLowerCase().trim();
    var hasIdCol = (firstCell === "id_tarea" || firstCell === "id");

    var cleanedRows = [];
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var nameT = String(hasIdCol ? row[1] : row[0] || "").trim();
      if (!nameT || nameT.toLowerCase() === "tarea") continue;

      var appT = String(hasIdCol ? row[2] : row[1] || "").trim();
      var devT = String(hasIdCol ? row[3] : row[2] || "").trim();
      var weightT = Number(hasIdCol ? row[4] : row[3]) || 15;

      // Normalizar Fecha_Entrega: corregir Mon Nov 09 2026 00:00:1 -> 2026-11-09
      var rawDeadline = hasIdCol ? row[5] : row[4];
      var cleanDeadline = formatDateToYMD(rawDeadline);

      var rawState = String(hasIdCol ? row[6] : row[5] || "En Progreso").trim();
      var normState = (rawState.toLowerCase().indexOf("audit") !== -1 || rawState.toLowerCase().indexOf("aprob") !== -1)
        ? "Auditada"
        : (rawState.toLowerCase().indexOf("riesgo") !== -1 ? "En Riesgo" : "En Progreso");

      // Corregir Evaluacion_Calidad: si viene 0.943% -> convertir a 94.3% (+14.1%)
      var rawEval = String(hasIdCol ? row[7] : row[6] || "").trim();
      var evalQual = "Pendiente de Auditoría";
      if (normState === "Auditada") {
        if (/0\.(\d{2,3})%/.test(rawEval)) {
          evalQual = rawEval.replace(/0\.(\d{2,3})%/, function (m, p) {
            return (parseFloat("0." + p) * 100).toFixed(1) + "%";
          });
        } else if (rawEval && rawEval !== "Pendiente de Auditoría") {
          evalQual = rawEval;
        } else {
          evalQual = "94.3% (+14.1%)";
        }
      }

      var rawRegDate = hasIdCol ? row[8] : row[7];
      var regDate = (rawRegDate instanceof Date)
        ? Utilities.formatDate(rawRegDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
        : (String(rawRegDate || "").trim() || nowStr);

      var obs = String(hasIdCol ? (row[9] || "") : (row[8] || "")).trim();
      if (!obs) {
        obs = normState === "Auditada"
          ? "Implementación en planta validada con los operarios. Operatividad estable."
          : "En desarrollo activo en planta.";
      }

      cleanedRows.push([
        nameT,
        appT,
        devT,
        weightT,
        cleanDeadline,
        normState,
        evalQual,
        regDate,
        obs
      ]);
    }

    if (cleanedRows.length > 0) {
      s.getRange(2, 1, cleanedRows.length, 9).setValues(cleanedRows);
      if (s.getLastColumn() > 9) {
        s.getRange(1, 10, s.getLastRow(), s.getLastColumn() - 9).clearContent();
      }
    }
  }

  formatCorporateSheet(s, "#854D0E", [260, 180, 160, 110, 120, 125, 150, 150, 300]);
}

/**
 * 5. Configurar y Estabilizar Hoja HISTORIAL_OBSERVACIONES (6 Columnas A:F)
 * Columnas Oficiales: FECHA | APLICATIVO | DESARROLLADOR | TAREA | NIVEL DE IMPACTO | OBSERVACION
 */
function setupObservacionesSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.OBSERVACIONES, ["Historial_Observaciones", "Observaciones", "HISTORIAL_OBSERVACIONES"]);
  ensureExactHeaders(s, HEADERS.OBSERVACIONES);
  formatCorporateSheet(s, "#312E81", [150, 190, 175, 230, 150, 380]);
}

/**
 * 6. Configurar y Auto-Reparar Hoja BITACORA_HISTORIAL (7 Columnas A:G compatible con Tabla_7)
 * Repara automáticamente las filas históricas de 6 columnas corridas hacia la izquierda
 * para eliminar el triángulo rojo de validación en la Columna B (Fecha_Hora).
 */
function setupBitacoraSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.BITACORA, ["Bitacora_Cambios", "Ingresos_Cambios"]);
  ensureExactHeaders(s, HEADERS.BITACORA);

  var lastR = s.getLastRow();
  if (lastR <= 1) {
    var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");
    s.appendRow([nowStr, nowStr, "Edwin Diaz (Admin)", "BASE_DATOS_ESTABILIZADA", "Portafolio STF GROUP", "Base de datos oficial de 5 hojas verificada y lista para pruebas en planta.", "ALTO · v3.5"]);
  } else {
    // Detectar y reparar filas corridas (cuando Col B tiene el nombre del desarrollador en vez de la Fecha_Hora y Col G está vacía)
    var bData = s.getRange(2, 1, lastR - 1, 7).getValues();
    var repaired = false;
    for (var i = 0; i < bData.length; i++) {
      var r = bData[i];
      var colA = r[0];
      var colB = String(r[1] || "").trim();
      var colG = String(r[6] || "").trim();

      // Si Col B NO empieza por año (202...) y no es un objeto Date, entonces la fila está corrida 1 columna a la izquierda
      var isColBDate = (r[1] instanceof Date) || /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(colB);
      if (!isColBDate && colB !== "" && colG === "") {
        var fixedDate = colA || Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");
        bData[i] = [
          fixedDate,                   // Col A: Timestamp
          fixedDate,                   // Col B: Fecha_Hora (Fecha válida para Tabla_7)
          r[1],                        // Col C: Desarrollador
          r[2],                        // Col D: Tipo_Evento
          r[3],                        // Col E: Aplicativo
          r[4],                        // Col F: Descripcion
          String(r[5] || "INFO") + " · v3.5" // Col G: Version / Impacto
        ];
        repaired = true;
      }
    }
    if (repaired) {
      s.getRange(2, 1, bData.length, 7).setValues(bData);
    }
  }
  formatCorporateSheet(s, "#14532D", [145, 145, 155, 175, 185, 340, 110]);
}

/**
 * Función auxiliar para insertar siempre 7 columnas exactas en BITACORA_HISTORIAL
 */
function appendBitacoraRow(ss, dateStr, usuario, tipoEvento, aplicativo, descripcion, impactoVersion) {
  var sBit = getMasterSheet(ss, "BITACORA");
  ensureExactHeaders(sBit, HEADERS.BITACORA);
  sBit.appendRow([
    dateStr,
    dateStr,
    usuario || "Sistema STF",
    tipoEvento || "ACTUALIZACION",
    aplicativo || "Portafolio STF",
    descripcion || "",
    impactoVersion || "INFO · v3.5"
  ]);
}

/**
 * Aplica estilos ejecutivos corporativos
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

    for (var r = 2; r <= lastRow; r++) {
      sheet.setRowHeight(r, 24);
    }
  }
}

/**
 * Organiza las pestañas colocando las 5 oficiales de primero y eliminando las obsoletas
 */
function cleanAndOrderSheets(ss) {
  // Eliminar definitivamente la pestaña PORTAFOLIO_SISTEMAS si todavía existe
  var portSheet = ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas") || ss.getSheetByName("Avances_Fases");
  if (portSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(portSheet);
    } catch (e) {
      try { portSheet.hideSheet(); } catch (e2) { }
    }
  }

  var orderedTabs = [TABS.USUARIOS, TABS.SISTEMAS_WEB, TABS.TAREAS, TABS.OBSERVACIONES, TABS.BITACORA, TABS.SOPORTE];
  for (var i = 0; i < orderedTabs.length; i++) {
    var tabSheet = ss.getSheetByName(orderedTabs[i]);
    if (tabSheet) {
      ss.setActiveSheet(tabSheet);
      ss.moveActiveSheet(i + 1);
    }
  }

  var obsoleteSheets = [
    "PORTAFOLIO_SISTEMAS",
    "Estado_Sistemas",
    "Avances_Fases",
    "Respuestas de formulario 1",
    "Auditorias_Calidad",
    "Efectividad_Calidad",
    "Bitacora_Cambios",
    "Ingresos_Cambios",
    "Tareas_Integraciones"
  ];
  obsoleteSheets.forEach(function (name) {
    var obs = ss.getSheetByName(name);
    if (obs && orderedTabs.indexOf(name) === -1) {
      try {
        if (ss.getSheets().length > 1) {
          ss.deleteSheet(obs);
        } else {
          obs.hideSheet();
        }
      } catch (e) {
        try { obs.hideSheet(); } catch (e2) { }
      }
    }
  });

  var firstSheet = ss.getSheetByName(TABS.USUARIOS);
  if (firstSheet) ss.setActiveSheet(firstSheet);
}

function getOrCreateSheetByName(ss, targetName, aliases) {
  var sheet = ss.getSheetByName(targetName);
  if (sheet) return sheet;

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

  if (tabKey === "USUARIOS") {
    return ss.getSheetByName("USUARIOS") || ss.getSheetByName("Usuarios") || ss.insertSheet(TABS.USUARIOS);
  } else if (tabKey === "SISTEMAS") {
    return ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas");
  } else if (tabKey === "SISTEMAS_WEB") {
    return ss.getSheetByName("SISTEMAS_WEB") || ss.getSheetByName("Sistemas_Web") || ss.getSheetByName("Urls_Web") || ss.insertSheet(TABS.SISTEMAS_WEB);
  } else if (tabKey === "TAREAS") {
    return ss.getSheetByName("CONTROL_TAREAS") || ss.getSheetByName("Tareas_Integraciones") || ss.insertSheet(TABS.TAREAS);
  } else if (tabKey === "OBSERVACIONES") {
    return ss.getSheetByName("HISTORIAL_OBSERVACIONES") || ss.getSheetByName("Historial_Observaciones") || ss.getSheetByName("Observaciones") || ss.insertSheet(TABS.OBSERVACIONES);
  } else if (tabKey === "BITACORA") {
    return ss.getSheetByName("BITACORA_HISTORIAL") || ss.getSheetByName("Bitacora_Cambios") || ss.getSheetByName("Ingresos_Cambios") || ss.insertSheet(TABS.BITACORA);
  } else if (tabKey === "SOPORTE") {
    return ss.getSheetByName("SOLICITUDES_SOPORTE") || ss.getSheetByName("Solicitudes_Soporte") || ss.getSheetByName("Soporte_Tecnico") || ss.insertSheet(TABS.SOPORTE);
  }
  return ss.getSheetByName(preferredName) || (preferredName ? ss.insertSheet(preferredName) : null);
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
      message: "STF GROUP Executive Database Online (5 Master Sheets v3.5)",
      timestamp: new Date().toISOString(),
      sheets: Object.values(TABS)
    });
  }

  // 1. Obtener Lista de Usuarios para Autenticación (Mapeo Inteligente y Dinámico de Columnas)
  if (action === "get_users") {
    var sU = getMasterSheet(ss, "USUARIOS");
    var uRows = sU.getDataRange().getValues();
    var usersList = [];
    if (uRows.length > 1) {
      // Detección dinámica de índices de columna por encabezado
      var hRow = uRows[0].map(function(h) { return String(h || "").trim().toLowerCase(); });
      var idxPass = -1, idxUser = -1, idxRole = -1, idxEmail = -1, idxName = -1, idxStatus = -1;

      for (var c = 0; c < hRow.length; c++) {
        var h = hRow[c];
        if (idxPass === -1 && (h === "id" || h.indexOf("pass") !== -1 || h.indexOf("clave") !== -1 || h.indexOf("contra") !== -1)) idxPass = c;
        else if (idxUser === -1 && (h.indexOf("usuario") !== -1 || h.indexOf("login") !== -1 || h === "user")) idxUser = c;
        else if (idxRole === -1 && (h.indexOf("rol") !== -1 || h.indexOf("role") !== -1 || h.indexOf("perfil") !== -1)) idxRole = c;
        else if (idxEmail === -1 && (h.indexOf("correo") !== -1 || h.indexOf("email") !== -1 || h.indexOf("mail") !== -1)) idxEmail = c;
        else if (idxName === -1 && (h.indexOf("nombre") !== -1 || h.indexOf("name") !== -1 || h.indexOf("desarrollador") !== -1)) idxName = c;
        else if (idxStatus === -1 && (h.indexOf("estado") !== -1 || h.indexOf("status") !== -1 || h.indexOf("activo") !== -1)) idxStatus = c;
      }

      // Fallback a posiciones predeterminadas A..F
      if (idxPass === -1) idxPass = 0;
      if (idxUser === -1) idxUser = 1;
      if (idxRole === -1) idxRole = 2;
      if (idxEmail === -1) idxEmail = 3;
      if (idxName === -1) idxName = 4;
      if (idxStatus === -1) idxStatus = 5;

      for (var r = 1; r < uRows.length; r++) {
        var uLogin = String(uRows[r][idxUser] !== undefined ? uRows[r][idxUser] : "").trim();
        if (!uLogin || uLogin.toLowerCase() === "usuario_logueo" || uLogin.toLowerCase() === "usuario") continue;
        usersList.push({
          idPassword: String(uRows[r][idxPass] !== undefined ? uRows[r][idxPass] : "").trim(),
          username: uLogin,
          role: String(uRows[r][idxRole] || "desarrollador").trim(),
          email: String(uRows[r][idxEmail] || "").trim(),
          name: idxName < uRows[r].length ? String(uRows[r][idxName] || "").trim() : "",
          status: idxStatus < uRows[r].length ? String(uRows[r][idxStatus] || "ACTIVO").trim() : "ACTIVO"
        });
      }
    }
    return createJsonResponse({ status: "success", users: usersList });
  }

  // 2. Obtener Historial de Eventos
  if (action === "get_updates") {
    var sB = getMasterSheet(ss, "BITACORA");
    var bRows = sB.getDataRange().getValues();
    var headers = HEADERS.BITACORA;
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

  // 3. Obtener Todo el Portafolio (Tareas + Sistemas + Sistemas Web + Usuarios)
  if (action === "get_all_data") {
    // A. Tareas desde CONTROL_TAREAS (9 Columnas Oficiales A:I)
    var sT = getMasterSheet(ss, "TAREAS");
    var tRows = sT.getDataRange().getValues();
    var tasks = [];
    if (tRows.length > 1) {
      var colAHeader = String(tRows[0][0] || "").toLowerCase().trim();
      var hasIdCol = (colAHeader === "id_tarea" || colAHeader === "id");

      for (var t = 1; t < tRows.length; t++) {
        var row = tRows[t];
        var tName = String(hasIdCol ? row[1] : row[0] || "").trim();
        if (!tName || tName.toLowerCase() === "tarea") continue;

        var tId = hasIdCol ? String(row[0] || "").trim() : ("int_" + t);
        var appName = String(hasIdCol ? row[2] : row[1] || "").trim();
        var devName = String(hasIdCol ? row[3] : row[2] || "").trim();
        var weight = Number(hasIdCol ? row[4] : row[3]) || 15;
        var deadline = formatDateToYMD(hasIdCol ? row[5] : row[4]);
        var status = String(hasIdCol ? row[6] : row[5] || "").trim();
        var rawEval = String(hasIdCol ? row[7] : row[6] || "").trim();
        var evaluation = rawEval.replace(/0\.(\d{2,3})%/, function (match, p1) {
          return (parseFloat("0." + p1) * 100).toFixed(1) + "%";
        });
        var rawRegDate = hasIdCol ? row[8] : row[7];
        var createdDate = (rawRegDate instanceof Date)
          ? Utilities.formatDate(rawRegDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(rawRegDate || "").trim();
        var notes = String(hasIdCol ? (row[9] || "") : (row[8] || "")).trim();

        tasks.push({
          id: tId,
          name: tName,
          appName: appName,
          devName: devName,
          weight: weight,
          deadline: deadline,
          status: status,
          evaluation: evaluation,
          createdDate: createdDate,
          notes: notes
        });
      }
    }

    // B. Sistemas desde SISTEMAS_WEB (o PORTAFOLIO_SISTEMAS si existe)
    var sS = ss.getSheetByName("PORTAFOLIO_SISTEMAS");
    var sysRows = sS ? sS.getDataRange().getValues() : [];
    var systems = [];
    if (sysRows.length > 1) {
      for (var s = 1; s < sysRows.length; s++) {
        var sysName = String(sysRows[s][1] || "").trim();
        if (!sysName || sysName.toLowerCase() === "nombre_aplicativo" || sysName.toLowerCase() === "sistema_a_cargo") continue;
        systems.push({
          code: String(sysRows[s][0] || "").trim(),
          name: sysName,
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

    // C. Enlaces de Sistemas Web Publicados desde SISTEMAS_WEB (4 Columnas A:D)
    var sW = getMasterSheet(ss, "SISTEMAS_WEB");
    var wRows = sW ? sW.getDataRange().getValues() : [];
    var webSystems = [];
    if (wRows.length > 1) {
      for (var w = 1; w < wRows.length; w++) {
        var sysNameW = String(wRows[w][1] || "").trim();
        if (!sysNameW || sysNameW.toLowerCase() === "sistema_a_cargo" || sysNameW.toLowerCase() === "nombre_aplicativo" || sysNameW.toLowerCase() === "columna 2") continue;
        webSystems.push({
          devName: String(wRows[w][0] || "").trim(),
          name: sysNameW,
          webUrl: String(wRows[w][2] || "").trim(),
          status: String(wRows[w][3] || "").trim()
        });
      }
    }

    // D. Observaciones desde HISTORIAL_OBSERVACIONES (6 Columnas A:F)
    var sO = getMasterSheet(ss, "OBSERVACIONES");
    var oRows = sO ? sO.getDataRange().getValues() : [];
    var observations = [];
    if (oRows.length > 1) {
      for (var o = 1; o < oRows.length; o++) {
        var rawODate = oRows[o][0];
        var oDateFormatted = (rawODate instanceof Date)
          ? Utilities.formatDate(rawODate, "America/Bogota", "yyyy-MM-dd HH:mm")
          : String(rawODate || "").trim();
        var oApp = String(oRows[o][1] || "").trim();
        var oDev = String(oRows[o][2] || "").trim();
        var oTask = String(oRows[o][3] || "").trim();
        var oImpact = String(oRows[o][4] || "NORMAL").trim();
        var oText = String(oRows[o][5] || "").trim();

        if (!oText && !oTask) continue;
        if (oTask.toLowerCase() === "tarea" && oText.toLowerCase() === "observacion") continue;

        observations.push({
          date: oDateFormatted,
          appName: oApp,
          developer: oDev,
          taskName: oTask,
          impact: oImpact,
          observation: oText
        });
      }
    }

    // E. Solicitudes de Soporte desde SOLICITUDES_SOPORTE (15 Columnas A:O)
    var sSup = getMasterSheet(ss, "SOPORTE");
    var supRows = sSup ? sSup.getDataRange().getValues() : [];
    var supportTickets = [];
    var SUPPORT_OFFICIAL_CUTOFF = new Date('2026-11-13T16:05:00.000Z').getTime();
    if (supRows.length > 1) {
      for (var sp = 1; sp < supRows.length; sp++) {
        var rowSp = supRows[sp];
        var code = String(rowSp[0] || "").trim();
        if (!code || code.toLowerCase() === "id_ticket" || code.toLowerCase() === "id") continue;

        var reqDate = rowSp[1];
        var reqDateFormatted = (reqDate instanceof Date)
          ? Utilities.formatDate(reqDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(reqDate || "").trim();

        var rowTime = (reqDate instanceof Date) ? reqDate.getTime() : new Date(reqDateFormatted || 0).getTime();
        if (rowTime > 0 && rowTime < SUPPORT_OFFICIAL_CUTOFF) {
          continue; // Omitir tickets de prueba anteriores a la puesta en marcha oficial
        }

        var typeStr = String(rowSp[2] || "soporte").toLowerCase().trim();
        var normalizedType = (typeStr.indexOf("act") !== -1) ? "actualizacion" : "soporte";

        var appName = String(rowSp[3] || "").trim();
        var appCode = String(rowSp[4] || "").trim();
        var reqName = String(rowSp[5] || "Operario").trim();
        var reqArea = String(rowSp[6] || "Planta STF").trim();
        var title = String(rowSp[7] || "").trim();
        var desc = String(rowSp[8] || "").trim();
        var devName = String(rowSp[9] || "Jose Guzman").trim();
        var rawStatus = String(rowSp[10] || "pendiente").toLowerCase().trim();
        var status = "pendiente";
        if (rawStatus.indexOf("acept") !== -1) status = "aceptada";
        else if (rawStatus.indexOf("rechaz") !== -1) status = "rechazada";

        var resDate = rowSp[11];
        var resDateFormatted = (resDate instanceof Date)
          ? Utilities.formatDate(resDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(resDate || "").trim();

        var observation = String(rowSp[12] || "").trim();
        var etaHours = String(rowSp[13] || "").trim();
        var resolvedBy = String(rowSp[14] || "").trim();

        var emailReq = String(rowSp[15] || "").trim();

        var dId = "dev_jg";
        var dLower = devName.toLowerCase();
        var aLower = (appName + " " + appCode).toLowerCase();
        if (dLower.indexOf("juan") !== -1 || aLower.indexOf("calidad") !== -1) {
          dId = "dev_jd";
          if (!devName || devName === "Desarrollador Oficial") devName = "Juan David";
        } else if (dLower.indexOf("mocho") !== -1 || dLower.indexOf("jhon") !== -1 || dLower.indexOf("eyder") !== -1 || aLower.indexOf("tinto") !== -1) {
          dId = "dev_mocho";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jhon Eyder (Mocho)";
        } else if (dLower.indexOf("esteban") !== -1) {
          dId = "dev_ee";
          if (!devName || devName === "Desarrollador Oficial") devName = "Esteban Escobar";
        } else {
          dId = "dev_jg";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jose Guzman";
        }

        supportTickets.push({
          id: "sup_" + code.replace(/[^a-zA-Z0-9]/g, "_"),
          code: code,
          createdAt: reqDateFormatted || new Date().toISOString(),
          type: normalizedType,
          appName: appName,
          appCode: appCode,
          devId: dId,
          devName: devName,
          requester: {
            name: reqName,
            role: "Planta STF",
            area: reqArea,
            email: emailReq,
            phone: phoneReq
          },
          title: title,
          description: desc,
          status: status,
          resolution: (status !== "pendiente" && observation) ? {
            action: status,
            resolvedBy: resolvedBy || devName,
            resolvedAt: resDateFormatted || new Date().toISOString(),
            observation: observation,
            etaHours: etaHours
          } : null
        });
      }
    }

    return createJsonResponse({
      status: "success",
      tasks: tasks,
      systems: systems,
      webSystems: webSystems,
      observations: observations,
      supportTickets: supportTickets
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
        if (!sysNameWO || sysNameWO.toLowerCase() === "sistema_a_cargo" || sysNameWO.toLowerCase() === "nombre_aplicativo" || sysNameWO.toLowerCase() === "columna 2") continue;
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

  // 5. Obtener Historial de Observaciones por Tarea
  if (action === "get_observations") {
    var sObsOnly = getMasterSheet(ss, "OBSERVACIONES");
    var oOnlyRows = sObsOnly ? sObsOnly.getDataRange().getValues() : [];
    var obsOnlyList = [];
    if (oOnlyRows.length > 1) {
      for (var oo = 1; oo < oOnlyRows.length; oo++) {
        var rawDateOnly = oOnlyRows[oo][0];
        var dFormatted = (rawDateOnly instanceof Date)
          ? Utilities.formatDate(rawDateOnly, "America/Bogota", "yyyy-MM-dd HH:mm")
          : String(rawDateOnly || "").trim();
        var ooApp = String(oOnlyRows[oo][1] || "").trim();
        var ooDev = String(oOnlyRows[oo][2] || "").trim();
        var ooTask = String(oOnlyRows[oo][3] || "").trim();
        var ooImpact = String(oOnlyRows[oo][4] || "NORMAL").trim();
        var ooText = String(oOnlyRows[oo][5] || "").trim();

        if (!ooText && !ooTask) continue;
        if (ooTask.toLowerCase() === "tarea" && ooText.toLowerCase() === "observacion") continue;

        obsOnlyList.push({
          date: dFormatted,
          appName: ooApp,
          developer: ooDev,
          taskName: ooTask,
          impact: ooImpact,
          observation: ooText
        });
      }
    }
    return createJsonResponse({ status: "success", observations: obsOnlyList });
  }

  return createJsonResponse({ status: "error", message: "Acción GET no reconocida" });
}

/**
 * ============================================================================
 * ENDPOINT POST (Escritura de Todos los Procesos Operativos en las 5 Hojas)
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
      ensureExactHeaders(sTareas, HEADERS.TAREAS);

      var cleanDeadline = formatDateToYMD(payload.deadline);

      // Insertar en CONTROL_TAREAS (9 Columnas exactas A:I)
      sTareas.appendRow([
        payload.taskName || "",
        payload.appName || "",
        payload.developer || "",
        Number(payload.weight) || 15,
        cleanDeadline,
        "En Progreso",
        "Pendiente de Auditoría",
        dateStr,
        payload.description || "Integración técnica asignada desde plataforma web."
      ]);

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G)
      appendBitacoraRow(
        ss,
        dateStr,
        "Super Admin (Jefe TI)",
        "NUEVA_TAREA_ASIGNADA",
        payload.appName || "Sistema",
        "Tarea '" + payload.taskName + "' asignada a " + payload.developer + " (Plazo: " + cleanDeadline + ", Peso: +" + payload.weight + "%)",
        "OPERATIVO · v3.5"
      );

      // Enviar Correo Automático al Desarrollador si está habilitado
      var emailSent = { sent: false, recipient: "" };
      if (payload.sendEmail !== false) {
        emailSent = sendTaskAssignmentEmail(ss, payload);
      }

      return createJsonResponse({
        status: "success",
        message: "Tarea registrada en CONTROL_TAREAS exitosamente" + (emailSent.sent ? " y notificada por correo a " + emailSent.recipient : ""),
        emailSent: emailSent.sent,
        recipient: emailSent.recipient,
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 2: Registrar Auditoría de Calidad (Actualiza CONTROL_TAREAS y BITACORA)
    // =========================================================================
    if (action === "log_audit") {
      var sTareas2 = getMasterSheet(ss, "TAREAS");
      ensureExactHeaders(sTareas2, HEADERS.TAREAS);
      var tData = sTareas2.getDataRange().getValues();
      var foundRow = -1;

      var targetTaskName = String(payload.taskName || "").trim().toLowerCase();
      var targetAppName = String(payload.appName || "").trim().toLowerCase();
      var targetDev = String(payload.developer || "").trim().toLowerCase();

      // 1. Buscar primero por nombre de tarea (Col A)
      for (var r = 1; r < tData.length; r++) {
        var rowTaskName = String(tData[r][0] || "").trim().toLowerCase();
        if (targetTaskName && rowTaskName === targetTaskName) {
          foundRow = r + 1;
          break;
        }
      }

      // 2. Fallback por Aplicativo + Desarrollador
      if (foundRow === -1) {
        for (var r2 = 1; r2 < tData.length; r2++) {
          var rApp = String(tData[r2][1] || "").toLowerCase();
          var rDev = String(tData[r2][2] || "").toLowerCase();
          if ((rDev.indexOf(targetDev) !== -1 || targetDev.indexOf(rDev) !== -1) &&
            (rApp.indexOf(targetAppName) !== -1 || targetAppName.indexOf(rApp) !== -1)) {
            foundRow = r2 + 1;
            break;
          }
        }
      }

      var scoreNum = Number(payload.score) || 95;
      var pointsAddedNum = Number(payload.pointsAdded) || 15;
      var scoreFormatted = scoreNum.toFixed(1) + "% (+" + pointsAddedNum.toFixed(1) + "%)";
      var auditNotes = payload.notes || "Implementación en planta validada con los operarios. Operatividad estable.";

      if (foundRow !== -1) {
        sTareas2.getRange(foundRow, 6).setValue("Auditada");        // Col F: Estado
        sTareas2.getRange(foundRow, 7).setValue(scoreFormatted);    // Col G: Evaluacion_Calidad
        sTareas2.getRange(foundRow, 8).setValue(dateStr);           // Col H: Fecha_Registro
        sTareas2.getRange(foundRow, 9).setValue(auditNotes);       // Col I: Observaciones_Auditoria
      }

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G)
      appendBitacoraRow(
        ss,
        dateStr,
        payload.evaluator || "Super Admin (Jefe TI)",
        "AUDITORIA_CALIFICADA",
        payload.appName || "Sistema",
        "Auditoría a " + payload.developer + (payload.taskName ? " [" + payload.taskName + "]" : "") + ": Nota " + scoreFormatted + ". " + auditNotes,
        "ALTO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Auditoría registrada y consolidada en CONTROL_TAREAS",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN: Registrar Observación de Tarea en HISTORIAL_OBSERVACIONES (6 Columnas A:F)
    // =========================================================================
    if (action === "log_observation") {
      var sObs = getMasterSheet(ss, "OBSERVACIONES");
      ensureExactHeaders(sObs, HEADERS.OBSERVACIONES);

      var obsDate = payload.date || dateStr;
      var obsApp = payload.appName || "Sistema";
      var obsDev = payload.developer || "Desarrollador";
      var obsTask = payload.taskName || "Tarea";
      var obsImpact = String(payload.impact || payload.severity || "NORMAL").toUpperCase();
      var obsText = payload.observation || payload.text || "";

      // Insertar en HISTORIAL_OBSERVACIONES (6 Columnas A:F)
      sObs.appendRow([
        obsDate,
        obsApp,
        obsDev,
        obsTask,
        obsImpact,
        obsText
      ]);

      // Formatear corporativamente
      formatCorporateSheet(sObs, "#312E81", [150, 190, 175, 230, 150, 380]);

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G) para trazabilidad central
      appendBitacoraRow(
        ss,
        dateStr,
        obsDev,
        "OBSERVACION_REGISTRADA",
        obsApp,
        "[" + obsTask + "] (" + obsImpact + ") " + obsText,
        obsImpact + " · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Observación registrada con éxito en HISTORIAL_OBSERVACIONES",
        date: obsDate
      });
    }

    // =========================================================================
    // ACCIÓN 3: Registrar Avance en Fases de Desarrollo (SISTEMAS_WEB + BITACORA)
    // =========================================================================
    if (action === "log_phase") {
      var sWebPh = getMasterSheet(ss, "SISTEMAS_WEB");
      if (sWebPh && payload.slaStatus) {
        var wData = sWebPh.getDataRange().getValues();
        var targetAppW = String(payload.appName || "").toLowerCase().trim();
        for (var w = 1; w < wData.length; w++) {
          var wSysName = String(wData[w][1] || "").toLowerCase().trim();
          if (wSysName === targetAppW || wSysName.indexOf(targetAppW) !== -1 || targetAppW.indexOf(wSysName) !== -1) {
            sWebPh.getRange(w + 1, 4).setValue(payload.slaStatus);
            break;
          }
        }
      }

      appendBitacoraRow(
        ss,
        dateStr,
        payload.developer || "Super Admin (Jefe TI)",
        "FASE_ACTUALIZADA",
        payload.appName || "Sistema",
        "Fase '" + payload.phaseName + "' actualizada al " + payload.progress + "%" + (payload.notes ? " (" + payload.notes + ")" : ""),
        "MEDIO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Avance de fase registrado exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 4: Sincronizar Directorio de Usuarios (USUARIOS + BITACORA)
    // =========================================================================
    if (action === "sync_users") {
      var users = payload.users || [];
      if (users.length > 0) {
        var sU = getMasterSheet(ss, "USUARIOS");
        ensureExactHeaders(sU, HEADERS.USUARIOS);
        var lastRU = sU.getLastRow();
        if (lastRU > 1) {
          sU.getRange(2, 1, lastRU - 1, Math.max(6, sU.getLastColumn())).clearContent();
        }
        var uMatrix = [];
        for (var u = 0; u < users.length; u++) {
          var usr = users[u];
          var roleStr = usr.role || "desarrollador";
          uMatrix.push([
            usr.idPassword || usr.id || "123456",
            usr.username || "",
            roleStr,
            usr.email || "",
            usr.name || usr.username || "",
            String(roleStr).toLowerCase() === "admin" ? "ADMIN" : "ACTIVO"
          ]);
        }
        sU.getRange(2, 1, uMatrix.length, 6).setValues(uMatrix);
        formatCorporateSheet(sU, "#0F172A", [120, 160, 130, 240, 180, 100]);

        appendBitacoraRow(
          ss,
          dateStr,
          "Super Admin (Jefe TI)",
          "USUARIOS_SINCRONIZADOS",
          "Directorio de Usuarios",
          "Actualización de cuentas y credenciales en hoja USUARIOS (" + uMatrix.length + " usuarios activos).",
          "INFO · v3.5"
        );
      }

      return createJsonResponse({
        status: "success",
        message: "Hoja USUARIOS sincronizada exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 5: Sincronización Maestra de las 5 Hojas Oficiales (sync_full_state)
    // Sincroniza SISTEMAS_WEB, CONTROL_TAREAS, HISTORIAL_OBSERVACIONES, USUARIOS y BITACORA_HISTORIAL
    // =========================================================================
    if (action === "sync_full_state") {
      var apps = (payload.applications || []).filter(function (a) {
        var n = String(a.name || "").toLowerCase().trim();
        return n !== "" && n !== "sistema_a_cargo" && n !== "nombre_aplicativo" && a.code !== "STF-SIS-99";
      });

      // 0. Eliminar definitivamente la pestaña obsoleta/vacía PORTAFOLIO_SISTEMAS si existe
      var sPortObs = ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas") || ss.getSheetByName("Avances_Fases");
      if (sPortObs && ss.getSheets().length > 1) {
        try { ss.deleteSheet(sPortObs); } catch (e) { try { sPortObs.hideSheet(); } catch (e2) { } }
      }

      // 1. Actualizar SISTEMAS_WEB (4 Columnas A:D) eliminando "Columna 1..4" y filas duplicadas
      if (apps.length > 0) {
        var sWeb = getMasterSheet(ss, "SISTEMAS_WEB");
        if (sWeb) {
          // Rescatar URLs manuales existentes en la hoja
          var existingUrls = {};
          if (sWeb.getLastRow() > 1) {
            var wExisting = sWeb.getDataRange().getValues();
            for (var ew = 1; ew < wExisting.length; ew++) {
              var eName = String(wExisting[ew][1] || "").trim().toUpperCase();
              var eUrl = String(wExisting[ew][2] || "").trim();
              if (eName && eName !== "SISTEMA_A_CARGO" && eUrl && eUrl.toLowerCase() !== "url_sistema_web") {
                existingUrls[eName] = eUrl;
              }
            }
          }

          ensureExactHeaders(sWeb, HEADERS.SISTEMAS_WEB);
          var lastRW = sWeb.getLastRow();
          if (lastRW > 1) {
            sWeb.getRange(2, 1, lastRW - 1, Math.max(4, sWeb.getLastColumn())).clearContent();
            if (lastRW > apps.length + 1) {
              try {
                sWeb.deleteRows(apps.length + 2, lastRW - (apps.length + 1));
              } catch (e) { }
            }
          }

          var webMatrix = [];
          for (var w = 0; w < apps.length; w++) {
            var wp = apps[w];
            var uKey = String(wp.name || "").trim().toUpperCase();
            var finalUrl = wp.webUrl || existingUrls[uKey] || "";
            var isProdApp = (wp.stageId === "stage_prod") || (String(wp.slaStatus || "").indexOf("Producción") !== -1) ||
              (uKey === "CALIDAD" || uKey === "TINTORERIA" || uKey === "COLCHAS");
            webMatrix.push([
              wp.devName || "Equipo STF",
              wp.name || "",
              finalUrl,
              isProdApp ? "En Producción" : "En Construcción"
            ]);
          }
          sWeb.getRange(2, 1, webMatrix.length, 4).setValues(webMatrix);
          formatCorporateSheet(sWeb, "#14532D", [200, 230, 320, 140]);
        }
      }

      // 3. Actualizar CONTROL_TAREAS (9 Columnas Oficiales A:I)
      var tasksList = payload.integrations || [];
      if (tasksList.length > 0) {
        var sTar = getMasterSheet(ss, "TAREAS");
        ensureExactHeaders(sTar, HEADERS.TAREAS);
        var lastRT = sTar.getLastRow();
        if (lastRT > 1) {
          sTar.getRange(2, 1, lastRT - 1, Math.max(9, sTar.getLastColumn())).clearContent();
          if (lastRT > tasksList.length + 1) {
            try {
              sTar.deleteRows(tasksList.length + 2, lastRT - (tasksList.length + 1));
            } catch (e) { }
          }
        }

        var tMatrix = [];
        for (var ti = 0; ti < tasksList.length; ti++) {
          var tk = tasksList[ti];
          var isEvaluated = (tk.status === "evaluated") || (String(tk.status || "").toLowerCase().indexOf("audit") !== -1);
          var stateClean = isEvaluated ? "Auditada" : (String(tk.status || "").toLowerCase().indexOf("riesgo") !== -1 ? "En Riesgo" : "En Progreso");
          var qualText = "Pendiente de Auditoría";
          var obsText = tk.description || "En desarrollo activo en planta.";
          var regDateText = tk.createdDate || dateStr;

          if (tk.evaluation && typeof tk.evaluation === "object") {
            var qScore = Number(tk.evaluation.qualityScore) || 95;
            var pAdd = Number(tk.evaluation.pointsAdded) || Number(tk.weight) || 15;
            qualText = qScore.toFixed(1) + "% (+" + pAdd.toFixed(1) + "%)";
            obsText = tk.evaluation.notes || "Implementación en planta validada con los operarios. Operatividad estable.";
            if (tk.evaluation.evalDate) regDateText = tk.evaluation.evalDate + " 08:00:00";
          } else if (typeof tk.evaluation === "string" && tk.evaluation) {
            qualText = tk.evaluation.replace(/0\.(\d{2,3})%/, function (m, p) {
              return (parseFloat("0." + p) * 100).toFixed(1) + "%";
            });
          }

          var taskDeadline = formatDateToYMD(tk.deadline);

          tMatrix.push([
            tk.name || "",
            tk.appName || "Sistema",
            tk.devName || "Desarrollador",
            Number(tk.weight) || 15,
            taskDeadline,
            stateClean,
            qualText,
            regDateText,
            obsText
          ]);
        }
        sTar.getRange(2, 1, tMatrix.length, 9).setValues(tMatrix);
        if (sTar.getLastColumn() > 9) {
          sTar.getRange(1, 10, sTar.getLastRow(), sTar.getLastColumn() - 9).clearContent();
        }
        formatCorporateSheet(sTar, "#854D0E", [260, 180, 160, 110, 120, 125, 150, 150, 300]);
      }

      // 4. Sincronizar USUARIOS si vienen en el payload
      if (Array.isArray(payload.users) && payload.users.length > 0) {
        var sUsr = getMasterSheet(ss, "USUARIOS");
        ensureExactHeaders(sUsr, HEADERS.USUARIOS);
        var lastRUsr = sUsr.getLastRow();
        if (lastRUsr > 1) {
          sUsr.getRange(2, 1, lastRUsr - 1, Math.max(6, sUsr.getLastColumn())).clearContent();
        }
        var usrRows = payload.users.map(function (u) {
          var r = u.role || "desarrollador";
          return [
            u.idPassword || u.id || "123456",
            u.username || "",
            r,
            u.email || "",
            u.name || u.username || "",
            String(r).toLowerCase() === "admin" ? "ADMIN" : "ACTIVO"
          ];
        });
        sUsr.getRange(2, 1, usrRows.length, 6).setValues(usrRows);
        formatCorporateSheet(sUsr, "#0F172A", [120, 160, 130, 240, 180, 100]);
      }

      // 5. Sincronizar HISTORIAL_OBSERVACIONES si vienen observaciones en el payload
      var obsList = payload.observations || [];
      if (obsList.length > 0) {
        var sObsFull = getMasterSheet(ss, "OBSERVACIONES");
        ensureExactHeaders(sObsFull, HEADERS.OBSERVACIONES);
        var lastRObsFull = sObsFull.getLastRow();
        if (lastRObsFull > 1) {
          sObsFull.getRange(2, 1, lastRObsFull - 1, Math.max(6, sObsFull.getLastColumn())).clearContent();
          if (lastRObsFull > obsList.length + 1) {
            try {
              sObsFull.deleteRows(obsList.length + 2, lastRObsFull - (obsList.length + 1));
            } catch (e) { }
          }
        }
        var obsFullMatrix = obsList.map(function (o) {
          return [
            o.date || dateStr,
            o.appName || "Sistema",
            o.developer || o.author || "Desarrollador",
            o.taskName || "Tarea",
            String(o.impact || o.severity || "NORMAL").toUpperCase(),
            o.observation || o.text || ""
          ];
        });
        sObsFull.getRange(2, 1, obsFullMatrix.length, 6).setValues(obsFullMatrix);
        formatCorporateSheet(sObsFull, "#312E81", [150, 190, 175, 230, 150, 380]);
      }

      // 5. Reparar y registrar en BITACORA_HISTORIAL
      setupBitacoraSheet(ss);
      appendBitacoraRow(
        ss,
        dateStr,
        payload.user || "Super Admin (Jefe TI)",
        "SINCRONIZACION_MAESTRA",
        "Portafolio STF GROUP",
        "Sincronización integral de las 5 hojas maestras (" + apps.length + " sistemas, " + tasksList.length + " tareas y " + obsList.length + " observaciones verificadas).",
        "ALTO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Las 5 hojas maestras oficiales (USUARIOS, SISTEMAS_WEB, CONTROL_TAREAS, HISTORIAL_OBSERVACIONES, BITACORA_HISTORIAL) han sido estabilizadas y sincronizadas.",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 6: Registro General en Bitácora (Login, Nuevos Aplicativos, Config TI)
    // =========================================================================
    if (action === "log_update") {
      setupBitacoraSheet(ss);
      appendBitacoraRow(
        ss,
        dateStr,
        payload.developer || "Sistema STF",
        payload.eventType || "ACTUALIZACION",
        payload.appName || "Global",
        payload.description || "Cambio operativo registrado",
        (payload.impact || "INFO") + " · " + (payload.version || "v3.5")
      );

      return createJsonResponse({
        status: "success",
        message: "Evento registrado en BITACORA_HISTORIAL",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 7: Registrar Solicitud de Soporte / Actualización (SOLICITUDES_SOPORTE)
    // =========================================================================
    if (action === "log_support_ticket") {
      var sSoporte = getMasterSheet(ss, "SOPORTE");
      ensureExactHeaders(sSoporte, HEADERS.SOPORTE);

      var ticketCode = payload.ticketCode || payload.ticketId || ("STF-SUP-" + Math.floor(1000 + Math.random() * 9000));
      var tipoTxt = payload.type === 'actualizacion' ? 'Actualización' : 'Soporte Técnico';
      var reqDate = payload.createdAt ? Utilities.formatDate(new Date(payload.createdAt), "America/Bogota", "yyyy-MM-dd HH:mm:ss") : dateStr;

      // Auto-asignación garantizada por aplicativo si viene genérico o vacío
      var resolvedDev = payload.devName || '';
      var aNorm = String((payload.appName || '') + ' ' + (payload.appCode || '')).toLowerCase();
      if (!resolvedDev || resolvedDev === 'Desarrollador Oficial' || resolvedDev === 'Sistema STF') {
        if (aNorm.indexOf('calidad') !== -1) resolvedDev = 'Juan David';
        else if (aNorm.indexOf('tinto') !== -1) resolvedDev = 'Jhon Eyder (Mocho)';
        else if (aNorm.indexOf('esteban') !== -1) resolvedDev = 'Esteban Escobar';
        else resolvedDev = 'Jose Guzman';
      }

      // Estructura Oficial: 16 Columnas A:P (Blindada para Tablas Nativas)
      var rowData = [
        ticketCode,
        reqDate,
        tipoTxt,
        payload.appName || '',
        payload.appCode || '',
        payload.requesterName || 'Operario de Planta',
        payload.requesterArea || 'Planta STF',
        payload.title || '',
        payload.description || '',
        resolvedDev,
        'Pendiente',
        '', // Fecha_Respuesta
        '', // Observacion_Desarrollador
        '', // Tiempo_Estimado_ETA
        '',  // Resuelto_Por
        payload.requesterEmail || ''
      ];

      try {
        sSoporte.appendRow(rowData);
      } catch (eApp) {
        try {
          sSoporte.appendRow(rowData.slice(0, 15));
          var newR = sSoporte.getLastRow();
          if (payload.requesterEmail) sSoporte.getRange(newR, 16).setValue(payload.requesterEmail);
        } catch (eFallback) {
          Logger.log("Row append fallback: " + eFallback.toString());
        }
      }

      // =======================================================================
      // AUTOMATIZACIÓN 1: Enviar Correo de Confirmación al Operario y Alerta al Dev
      // =======================================================================
      var emailDispatch = sendSupportConfirmationEmail(ss, payload, ticketCode, tipoTxt);

      appendBitacoraRow(
        ss,
        dateStr,
        (payload.requesterName || "Planta") + " (" + (payload.appName || "Sistema") + ")",
        payload.type === 'actualizacion' ? "SOLICITUD_ACTUALIZACION" : "SOLICITUD_SOPORTE_TECNICO",
        payload.appName || "Planta",
        "[" + tipoTxt.toUpperCase() + "] " + (payload.title || '') + " -> Asignado a " + (payload.devName || 'Desarrollador') +
          (payload.requesterEmail ? " | Email: " + payload.requesterEmail : ""),
        "PLANTA · v1.0"
      );

      return createJsonResponse({
        status: "success",
        ticketCode: ticketCode,
        message: "Solicitud de planta registrada exitosamente en SOLICITUDES_SOPORTE",
        emailResult: emailDispatch,
        date: dateStr
      });
    }

    // ACCIÓN 10: Eliminar Columna Telefono_SMS
    if (action === "delete_sms_column") {
      eliminarColumnaTelefonoSMS();
      return createJsonResponse({
        status: "success",
        message: "Columna Telefono_SMS procesada exitosamente"
      });
    }

    // =========================================================================
    // ACCIÓN 8: Oficializar Dictamen de Soporte (Aceptar / Rechazar con Observación)
    // =========================================================================
    if (action === "resolve_support_ticket") {
      var sSoporte = getMasterSheet(ss, "SOPORTE");
      ensureExactHeaders(sSoporte, HEADERS.SOPORTE);

      var targetCode = String(payload.ticketCode || payload.ticketId || '').trim();
      var lastRow = sSoporte.getLastRow();
      var foundRow = -1;

      if (lastRow > 1) {
        var ids = sSoporte.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var r = 0; r < ids.length; r++) {
          if (String(ids[r][0]).trim().toUpperCase() === targetCode.toUpperCase()) {
            foundRow = r + 2;
            break;
          }
        }
      }

      var decisionText = payload.decision === 'aceptada' ? 'Aceptada' : 'Rechazada';
      var resDate = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

      if (foundRow > 0) {
        // Col K(11): Estado, Col L(12): Fecha_Respuesta, Col M(13): Observacion, Col N(14): ETA, Col O(15): Resuelto_Por
        sSoporte.getRange(foundRow, 11).setValue(decisionText);
        sSoporte.getRange(foundRow, 12).setValue(resDate);
        sSoporte.getRange(foundRow, 13).setValue(payload.observation || '');
        sSoporte.getRange(foundRow, 14).setValue(payload.etaHours || '');
        sSoporte.getRange(foundRow, 15).setValue(payload.resolvedBy || 'Desarrollador');
      } else {
        sSoporte.appendRow([
          targetCode || ("STF-SUP-" + Math.floor(1000 + Math.random() * 9000)),
          payload.createdAt || resDate,
          payload.type === 'actualizacion' ? 'Actualización' : 'Soporte Técnico',
          payload.appName || '',
          payload.appCode || '',
          payload.requesterName || 'Operario de Planta',
          payload.requesterArea || 'Planta STF',
          payload.title || '',
          payload.description || '',
          payload.devName || 'Desarrollador Oficial',
          decisionText,
          resDate,
          payload.observation || '',
          payload.etaHours || '',
          payload.resolvedBy || 'Desarrollador'
        ]);
      }

      appendBitacoraRow(
        ss,
        dateStr,
        payload.resolvedBy || "Desarrollador",
        payload.decision === 'aceptada' ? "SOPORTE_ACEPTADO" : "SOPORTE_RECHAZADO",
        payload.appName || "Soporte",
        "Ticket " + targetCode + " marcado como " + decisionText + ": " + (payload.observation || '') + (payload.etaHours ? " (ETA: " + payload.etaHours + ")" : ""),
        "SOPORTE · v1.0"
      );

      return createJsonResponse({
        status: "success",
        ticketCode: targetCode,
        decision: decisionText,
        message: "Dictamen de soporte actualizado exitosamente en SOLICITUDES_SOPORTE",
        date: dateStr
      });
    }

    // ACCIÓN 9: Limpiar Solicitudes de Soporte de Prueba (Dejar en 0)
    if (action === "clear_support_tickets") {
      var sSup = getMasterSheet(ss, "SOPORTE");
      var deleted = 0;
      if (sSup && sSup.getLastRow() > 1) {
        deleted = sSup.getLastRow() - 1;
        sSup.deleteRows(2, deleted);
      }
      return createJsonResponse({
        status: "success",
        deleted: deleted,
        message: "Hoja SOLICITUDES_SOPORTE restablecida en 0 registros exitosamente"
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

/**
 * AUTOMATIZACIÓN 1: Enviar Correo de Confirmación de Ticket al Solicitante y Alerta al Dev
 */
function sendSupportConfirmationEmail(ss, payload, ticketCode, tipoTxt) {
  var results = { requesterSent: false, devSent: false };
  var reqEmail = (payload.requesterEmail || "").trim();
  var appName = payload.appName || "Sistema Industrial";
  var devName = payload.devName || "Jose Guzman";

  // 1. Correo Formal al Solicitante de Planta
  if (reqEmail && reqEmail.indexOf("@") !== -1) {
    try {
      var subjectReq = "🎟️ Radicado Oficial: " + ticketCode + " · " + tipoTxt + " en " + appName + " (STF GROUP)";
      var htmlReq = "" +
        "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; overflow: hidden; color: #FFFFFF;\">" +
        "<div style=\"background: linear-gradient(135deg, #07090e 0%, #1e1b4b 100%); padding: 26px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center;\">" +
        "<div style=\"font-size: 11px; font-weight: 800; color: #fbbf24; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;\">● STF GROUP · TERMINAL DE SOPORTE PLANTA</div>" +
        "<h2 style=\"margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em;\">¡Solicitud Radicada con Éxito!</h2>" +
        "<p style=\"margin: 8px 0 0 0; font-size: 13px; color: #94A3B8;\">Tu requerimiento ha sido registrado en tiempo real en la hoja oficial de ingeniería.</p>" +
        "</div>" +
        "<div style=\"padding: 24px;\">" +
        "<div style=\"background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px; margin-bottom: 20px;\">" +
        "<table style=\"width: 100%; border-collapse: collapse; font-size: 13.5px; color: #FFFFFF;\">" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">📋 <strong>Radicado Oficial:</strong></td><td style=\"padding: 7px 0; font-weight: 800; color: #fbbf24; font-family: monospace; font-size: 15px;\">" + ticketCode + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">⚙️ <strong>Tipo:</strong></td><td style=\"padding: 7px 0; font-weight: 700;\">" + tipoTxt + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">🏢 <strong>Aplicativo:</strong></td><td style=\"padding: 7px 0; font-weight: 700;\">" + appName + " (" + (payload.appCode || '') + ")</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">👤 <strong>Solicitante:</strong></td><td style=\"padding: 7px 0;\">" + (payload.requesterName || '') + " · " + (payload.requesterArea || '') + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">💻 <strong>Desarrollador Asignado:</strong></td><td style=\"padding: 7px 0; font-weight: 700; color: #38bdf8;\">" + devName + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">📌 <strong>Título:</strong></td><td style=\"padding: 7px 0; font-weight: 600;\">" + (payload.title || '') + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">⏳ <strong>Estado Actual:</strong></td><td style=\"padding: 7px 0; font-weight: 700; color: #fbbf24;\">Pendiente de Dictamen</td></tr>" +
        "</table>" +
        "</div>" +
        "<p style=\"font-size: 12.5px; color: #94A3B8; line-height: 1.5; margin: 0 0 16px 0;\">Tan pronto el programador revise el caso y determine la solución, recibirás la respuesta formal directamente a este correo.</p>" +
        "<div style=\"text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;\">" +
        "<p style=\"font-size: 11px; color: #64748B; margin: 0;\">STF GROUP S.A. · Dirección de Tecnologías de Información & Desarrollo de Software</p>" +
        "</div>" +
        "</div>" +
        "</div>";

      MailApp.sendEmail({
        to: reqEmail,
        subject: subjectReq,
        htmlBody: htmlReq
      });
      results.requesterSent = true;
    } catch (errReq) {
      results.requesterError = errReq.toString();
    }
  }

  // 2. Alerta Inmediata al Desarrollador Responsable
  try {
    var devEmail = "";
    var sLower = devName.toLowerCase();
    if (sLower.indexOf("jose") !== -1 || sLower.indexOf("guzman") !== -1) devEmail = "joseoneiber711@gmail.com";
    else if (sLower.indexOf("juan") !== -1) devEmail = "juan.david@studiof.com.co";
    else if (sLower.indexOf("mocho") !== -1 || sLower.indexOf("jhon") !== -1) devEmail = "jhon.eyder@studiof.com.co";

    if (devEmail) {
      var subjectDev = "🚨 [PLANTA] Nueva Solicitud " + ticketCode + " en " + appName + " (" + (payload.title || 'Novedad') + ")";
      var htmlDev = "" +
        "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;\">" +
        "<div style=\"border-bottom: 2px solid #F59E0B; padding-bottom: 12px; margin-bottom: 16px;\">" +
        "<span style=\"background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;\">NOVEDAD DE PLANTA</span>" +
        "<h3 style=\"margin: 8px 0 0 0; color: #0F172A;\">" + (payload.title || 'Solicitud de Planta') + "</h3>" +
        "</div>" +
        "<p>Hola <strong>" + devName + "</strong>, se ha radicado una nueva solicitud para tu aplicativo:</p>" +
        "<ul>" +
        "<li><strong>Radicado:</strong> " + ticketCode + "</li>" +
        "<li><strong>Sistema:</strong> " + appName + "</li>" +
        "<li><strong>Tipo:</strong> " + tipoTxt + "</li>" +
        "<li><strong>Solicitante:</strong> " + (payload.requesterName || '') + " (" + (payload.requesterArea || '') + ")</li>" +
        (reqEmail ? "<li><strong>Correo Solicitante:</strong> " + reqEmail + "</li>" : "") +
        (payload.requesterPhone ? "<li><strong>Celular / SMS:</strong> " + payload.requesterPhone + "</li>" : "") +
        "<li><strong>Descripción:</strong> " + (payload.description || '') + "</li>" +
        "</ul>" +
        "<p style=\"text-align: center; margin-top: 20px;\">" +
        "<a href=\"https://stf-oficina-aplicativos.vercel.app\" style=\"background: #4F46E5; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Abrir Bandeja de Soporte</a>" +
        "</p>" +
        "</div>";

      MailApp.sendEmail({
        to: devEmail,
        subject: subjectDev,
        htmlBody: htmlDev
      });
      results.devSent = true;
    }
  } catch (errDev) {
    results.devError = errDev.toString();
  }

  return results;
}

/**
 * AUTOMATIZACIÓN 2: Disparar Notificación de Mensaje de Texto (SMS)
 */
function sendSupportNotificationSMS(ss, payload, ticketCode, tipoTxt) {
  var phone = String(payload.requesterPhone || "").replace(/\D/g, "");
  if (!phone || phone.length < 7) {
    return { sent: false, reason: "Sin número de celular válido" };
  }

  var appName = payload.appName || "Sistema Industrial";
  var devName = payload.devName || "Jose Guzman";

  // Mensaje oficial SMS conciso y claro
  var smsText = "STF GROUP: Solicitud " + ticketCode + " (" + tipoTxt + ") para " + appName + " radicada con exito. Asignado a: " + devName + ". Estado: Pendiente.";

  // Si existe configuración de pasarela SMS en ScriptProperties o variables
  var props = PropertiesService.getScriptProperties();
  var smsEndpoint = props.getProperty("SMS_GATEWAY_URL");
  var smsApiKey = props.getProperty("SMS_API_KEY");

  var dispatchStatus = "REGISTRADO_EN_COLA";

  if (smsEndpoint && smsApiKey) {
    try {
      var smsPayload = {
        to: phone,
        message: smsText,
        apiKey: smsApiKey
      };
      var resp = UrlFetchApp.fetch(smsEndpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(smsPayload),
        muteHttpExceptions: true
      });
      dispatchStatus = "ENVIADO_PASARELA_HTTP_" + resp.getResponseCode();
    } catch (e) {
      dispatchStatus = "ERROR_PASARELA: " + e.toString();
    }
  }

  return {
    sent: true,
    recipient: phone,
    text: smsText,
    dispatchStatus: dispatchStatus
  };
}

/**
 * PASO 1: EJECUTAR ESTA FUNCIÓN PARA QUE GOOGLE MUESTRE LA VENTANA DE AUTORIZACIÓN
 * (No tiene try/catch a propósito para obligar a Google a desplegar la ventana de permisos)
 */
function autorizarPermisoCorreo() {
  MailApp.sendEmail(
    "joseoneiber711@gmail.com",
    "✅ Autorización Concedida · STF GROUP",
    "¡Excelente! Los permisos de envío automático de correo para la Oficina de Aplicativos y Planta han sido autorizados con éxito."
  );
}

function testEmailNotification() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var res = sendTaskAssignmentEmail(ss, {
    developer: "Jose Guzman",
    taskName: "Prueba de Conexión Automatizada",
    appName: "TORRE DE CONTROL",
    weight: 15,
    deadline: "2026-11-15"
  });
  if (res.sent) {
    SpreadsheetApp.getUi().alert("✅ Correo de prueba enviado con éxito a: " + res.recipient);
  } else {
    SpreadsheetApp.getUi().alert("⚠️ No se pudo enviar el correo: " + (res.error || res.reason));
  }
}

/**
 * Función de Prueba Directa y Autorización de Correo de Soporte STF
 */
function testSupportEmailDirect() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    requesterName: "MAYA",
    requesterArea: "CALIDAD TELAS",
    requesterEmail: "joseoneiber711@gmail.com",
    requesterPhone: "3116795548",
    appName: "COLCHAS",
    appCode: "STF-COL-02",
    devName: "Jose Guzman",
    title: "ACTUALIZAR VISTA PRE - SOLICITUD",
    description: "Hola jose buen dia requiero que hagamos una actualización de la interfaz de Pre - solicitud por favor",
    type: "actualizacion",
    priority: "media"
  };
  var res = sendSupportConfirmationEmail(ss, payload, "STF-SUP-2606", "Actualización");
  Logger.log(JSON.stringify(res));
  if (res.requesterSent) {
    SpreadsheetApp.getUi().alert("✅ ¡Correo de soporte enviado con éxito a: joseoneiber711@gmail.com! Revisa tu bandeja de entrada.");
  } else {
    SpreadsheetApp.getUi().alert("⚠️ Error al enviar: " + (res.requesterError || "Permiso de correo pendiente"));
  }
}

function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
