/**
 * ============================================================================
 * STF GROUP · SERVICIO DE SOPORTE TÉCNICO Y GESTIÓN DE EVIDENCIAS DRIVE
 * ============================================================================
 */

function getOfficialDriveEvidenceFolder() {
  var folderId = "1P-4nJESlFWxECqkPZhYsqWFId2Tttj2x";
  try {
    return DriveApp.getFolderById(folderId);
  } catch (eId) {
    Logger.log("Error al abrir por ID, buscando por nombre: " + eId.toString());
    var folderName = "STF_EVIDENCIAS_SOPORTE";
    var folders = DriveApp.getFoldersByName(folderName);
    return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  }
}

/**
 * Muestra el enlace directo a la carpeta de Google Drive donde se guardan las evidencias fotográficas
 */

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

