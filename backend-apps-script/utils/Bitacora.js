/**
 * ============================================================================
 * STF GROUP · MÓDULO DE BITÁCORA Y AUDITORÍA HISTÓRICA
 * ============================================================================
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
