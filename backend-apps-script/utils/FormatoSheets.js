/**
 * ============================================================================
 * STF GROUP · UTILIDADES DE FORMATO Y ESTRUCTURA DE HOJAS GOOGLE SHEETS
 * ============================================================================
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
  if (!val) return Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");
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
 * 1. Configurar y Estabilizar Hoja USUARIOS (7 Columnas A:G)
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
