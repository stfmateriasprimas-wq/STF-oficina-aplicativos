/**
 * ============================================================================
 * STF GROUP · SERVICIO DE HISTORIAL DE OBSERVACIONES Y NOVEDADES
 * ============================================================================
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
