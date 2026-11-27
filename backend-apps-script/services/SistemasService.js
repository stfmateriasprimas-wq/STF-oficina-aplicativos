/**
 * ============================================================================
 * STF GROUP · SERVICIO DE SISTEMAS Y PORTAFOLIO WEB
 * ============================================================================
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
    ["Edwin Diaz", "LABORATORIO", customUrls["LABORATORIO"] || "https://stflab-calidad-textil.vercel.app/", "En Construcción"],
    ["Jose Guzman", "GEO UBICACION TALLERES", customUrls["GEO UBICACION TALLERES"] || "https://stf-rastreo-calidad.vercel.app/", "En Construcción"],
    ["Jose Guzman", "OFICINA - APLICATIVOS", customUrls["OFICINA - APLICATIVOS"] || "https://stf-oficina-aplicativos.vercel.app/", "En Construcción"],
    ["Juan David", "CALIDAD", customUrls["CALIDAD"] || "", "En Producción"],
    ["Jhon Eyder (Mocho)", "TINTORERIA", customUrls["TINTORERIA"] || "https://stf-tintoreria.netlify.app/?v=2", "En Producción"],
    ["Jose Guzman", "COLCHAS", customUrls["COLCHAS"] || "https://colchas.vercel.app/", "En Producción"],
    ["Esteban Escobar", "TORRE DE CONTROL", customUrls["TORRE DE CONTROL"] || "sharepoint", "En Producción"]
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
