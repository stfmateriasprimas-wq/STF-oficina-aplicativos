/**
 * ============================================================================
 * STF GROUP · MENÚ CORPORATIVO E INSTALADOR AUTOMÁTICO EN GOOGLE SHEETS
 * ============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ STF SISTEMA')
    .addItem('📁 Ver Enlace de Carpeta Google Drive (Evidencias)', 'abrirCarpetaEvidenciasDrive')
    .addItem('🚀 Estabilizar Base de Datos (6 Hojas Oficiales)', 'setupProfessionalDatabase')
    .addItem('🎧 Configurar Hoja SOLICITUDES_SOPORTE', 'setupSoporteSheetMenu')
    .addItem('📋 Configurar Hoja CONTROL_TAREAS', 'setupTareasSheetMenu')
    .addItem('🌐 Configurar Hoja SISTEMAS_WEB', 'setupSistemasWebSheetMenu')
    .addItem('📝 Configurar Hoja HISTORIAL_OBSERVACIONES', 'setupObservacionesSheetMenu')
    .addToUi();
}

function setupSoporteSheetMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSoporteSheet(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast("Hoja SOLICITUDES_SOPORTE lista.", "⚙️ STF SISTEMA", 4);
}

function setupTareasSheetMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupTareasSheet(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast("Hoja CONTROL_TAREAS lista.", "⚙️ STF SISTEMA", 4);
}

function setupSistemasWebSheetMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSistemasWebSheet(ss, false);
  SpreadsheetApp.getActiveSpreadsheet().toast("Hoja SISTEMAS_WEB lista.", "⚙️ STF SISTEMA", 4);
}

function setupObservacionesSheetMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupObservacionesSheet(ss);
  SpreadsheetApp.getActiveSpreadsheet().toast("Hoja HISTORIAL_OBSERVACIONES lista.", "⚙️ STF SISTEMA", 4);
}

function abrirCarpetaEvidenciasDrive() {
  var folderUrl = "https://drive.google.com/drive/folders/1P-4nJESlFWxECqkPZhYsqWFId2Tttj2x";
  var htmlOutput = HtmlService.createHtmlOutput(
    "<div style=\"font-family: Arial, sans-serif; padding: 18px; text-align: center;\">" +
    "<h3 style=\"color: #0F172A; margin-top: 0;\">📁 Carpeta Oficial de Evidencias en Google Drive</h3>" +
    "<p style=\"font-size: 13px; color: #475569;\">Aquí se almacenan automáticamente todas las fotografías y capturas adjuntas a las soluciones y rechazos de soporte técnico:</p>" +
    "<div style=\"margin: 20px 0;\">" +
    "<a href=\"" + folderUrl + "\" target=\"_blank\" style=\"display: inline-block; background: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;\">Abrir Carpeta en Google Drive ↗</a>" +
    "</div>" +
    "<p style=\"font-size: 11px; color: #94A3B8;\">ID de carpeta: <strong>1P-4nJESlFWxECqkPZhYsqWFId2Tttj2x</strong></p>" +
    "</div>"
  ).setWidth(440).setHeight(220);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Acceso a Google Drive STF");
}

/**
 * Elimina la columna Q (Telefono_SMS) en la hoja SOLICITUDES_SOPORTE
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
