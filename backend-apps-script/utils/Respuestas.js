/**
 * ============================================================================
 * STF GROUP · HELPER DE RESPUESTAS JSON Y CABECERAS
 * ============================================================================
 */

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
