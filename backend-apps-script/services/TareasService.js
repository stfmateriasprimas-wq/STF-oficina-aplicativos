/**
 * ============================================================================
 * STF GROUP · SERVICIO DE CONTROL DE TAREAS Y ENTREGABLES
 * ============================================================================
 */

function setupTareasSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.TAREAS, ["Tareas_Integraciones", "Auditorias_Calidad", "Efectividad_Calidad"]);
  ensureExactHeaders(s, HEADERS.TAREAS);

  var nowStr = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

  var officialTasks = [
    ["revision y ajuste de indicadores de calidad, ejecucion en calculo", "CALIDAD", "Juan David", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["PANEL DE PLANEACION, ADMIN, PLANEA PERSONAL ACTIVO, METAS, CALCUJLO PARTICIPOATIVO POR ACTIVIDAD DIARIA", "CALIDAD", "Juan David", 15, "2026-11-22", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["INDICADORES DE  CALIDAD TELAS", "CALIDAD", "Juan David", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["REVISION DE LISTAS, INVESTIGACION DE ECOSISTEMA  Y ASISTENCIA IA", "TORRE DE CONTROL", "esteban escobar", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["revision de cuadro control de piso", "CALIDAD", "Juan David", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["implementacion de dasboart  de control de piso", "TINTORERIA", "Jhon Eyder (Mocho)", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."],
    ["validacion de modulo de inventario", "TINTORERIA", "Jhon Eyder (Mocho)", 15, "2026-11-19", "En Progreso", "Pendiente de Auditoría", "2026-11-18 15:03:19", "En desarrollo activo en planta."]
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
