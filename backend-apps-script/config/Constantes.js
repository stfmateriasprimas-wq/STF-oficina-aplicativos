/**
 * ============================================================================
 * STF GROUP · CONFIGURACIÓN Y CONSTANTES MAESTRAS (APPS SCRIPT V8)
 * ============================================================================
 */

var TABS = {
  USUARIOS: "USUARIOS",
  SISTEMAS_WEB: "SISTEMAS_WEB",
  TAREAS: "CONTROL_TAREAS",
  OBSERVACIONES: "HISTORIAL_OBSERVACIONES",
  BITACORA: "BITACORA_HISTORIAL",
  SOPORTE: "SOLICITUDES_SOPORTE",
  MAESTRA_COLCHAS: "MAESTRA_SOLIC_STEC_COLCHAS"
};

var HEADERS = {
  USUARIOS: [
    "ID",
    "Usuario_Logueo",
    "Rol",
    "Correo",
    "Nombre_Completo",
    "Estado",
    "Avatar"
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
    "Correo_Solicitante",
    "Evidencia_Fotografica"
  ]
};

/**
 * Contraseñas maestras fijas e inmutables del equipo STF GROUP.
 * Blindaje absoluto contra sobreescritura accidental.
 */
var OFFICIAL_MASTER_PASSWORDS = {
  "jose@guzman": "159",
  "dev_jg": "159",
  "dev_jose_guzman": "159",
  "juan@david": "2222",
  "dev_jd": "2222",
  "dev_juan_david": "2222",
  "esteban@escobar": "1111",
  "dev_ee": "1111",
  "dev_esteban_escobar": "1111",
  "jhon@eyder": "4444",
  "dev_mocho": "4444",
  "dev_jhon_eyder": "4444",
  "ediaz": "Admin",
  "dev_ediaz": "Admin"
};

var DRIVE_EVIDENCE_FOLDER_ID = "1P-4nJESlFWxECqkPZhYsqWFId2Tttj2x";
