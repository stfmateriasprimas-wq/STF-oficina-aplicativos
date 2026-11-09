/**
 * STF GROUP · Base de Datos Real de Sistemas y Desarrolladores
 * Datos actualizados con el equipo oficial:
 * - Jose Guzman (Colchas, Laboratorio, Geo Ubicación Talleres, Torre de Control)
 * - Juan David (Calidad, Torre de Control)
 * - Mocho (Tintorería, Torre de Control)
 * - Esteban Escobar (Torre de Control & Proyecto por asignar)
 */

const STF_REAL_DATA = {
  // Configuración estándar de las 6 fases de desarrollo de software con ponderación oficial
  standardPhases: [
    {
      id: "phase_req",
      name: "1. Levantamiento & Requisitos",
      weight: 10,
      description: "Historias de usuario, alcance técnico y criterios de aceptación acordados con las áreas de STF.",
      completed: true
    },
    {
      id: "phase_ux",
      name: "2. Arquitectura & Diseño UI/UX",
      weight: 15,
      description: "Diagrama de base de datos, flujos de trabajo e interfaces de usuario validadas.",
      completed: true
    },
    {
      id: "phase_backend",
      name: "3. Desarrollo Backend & Lógica Core",
      weight: 30,
      description: "Modelado de datos, APIs, reglas de negocio e integraciones de servidor.",
      completed: true
    },
    {
      id: "phase_frontend",
      name: "4. Frontend & Integración de Interfaces",
      weight: 25,
      description: "Pantallas conectadas, interacción en planta/oficina, validaciones y responsividad.",
      completed: false
    },
    {
      id: "phase_qa",
      name: "5. Pruebas QA, Seguridad & UAT",
      weight: 15,
      description: "Pruebas de funcionalidad, corrección de incidencias y validación con usuarios clave.",
      completed: false
    },
    {
      id: "phase_deploy",
      name: "6. Despliegue & Salida a Producción",
      weight: 5,
      description: "Pase a producción, capacitación operativa a usuarios y monitoreo inicial.",
      completed: false
    }
  ],

  // Equipo Oficial de Programadores de STF GROUP
  developers: [
    {
      id: "dev_jg",
      name: "Jose Guzman",
      username: "jose@guzman",
      role: "desarrollador",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      email: "joseoneiber711@gmail.com",
      onTimeDelivery: 95,
      codeQuality: 93,
      sprintsCompleted: 16,
      score: "9.5 / 10",
      activeProjects: ["app_colchas", "app_laboratorio", "app_geo", "app_oficina", "app_torre"]
    },
    {
      id: "dev_jd",
      name: "Juan David",
      username: "juan@david",
      role: "desarrollador",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
      email: "juan.david@studiof.com.co",
      onTimeDelivery: 94,
      codeQuality: 96,
      sprintsCompleted: 14,
      score: "9.4 / 10",
      activeProjects: ["app_calidad", "app_torre"]
    },
    {
      id: "dev_ee",
      name: "Esteban Escobar",
      username: "esteban@escobar",
      role: "desarrollador",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      email: "esteban.escobar@studiof.com.co",
      onTimeDelivery: 95,
      codeQuality: 94,
      sprintsCompleted: 8,
      score: "9.3 / 10",
      activeProjects: ["app_torre"]
    },
    {
      id: "dev_mocho",
      name: "Jhon Eyder (Mocho)",
      username: "jhon@eyder",
      role: "desarrollador",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      email: "jhon.eyder@studiof.com.co",
      onTimeDelivery: 91,
      codeQuality: 92,
      sprintsCompleted: 12,
      score: "9.2 / 10",
      activeProjects: ["app_tintoreria", "app_torre"]
    },
    {
      id: "dev_ediaz",
      name: "Edwin Diaz",
      username: "ediaz",
      role: "Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      email: "edwin.diaz@studiof.com.co",
      onTimeDelivery: 99,
      codeQuality: 98,
      sprintsCompleted: 24,
      score: "9.9 / 10",
      activeProjects: ["app_torre", "app_colchas", "app_laboratorio", "app_calidad", "app_tintoreria", "app_geo"]
    }
  ],

  // Aplicativos Reales de STF GROUP en Desarrollo y Producción (Sincronizados con Google Sheets)
  applications: [
    {
      id: "app_torre",
      code: "STF-TC-01",
      name: "TORRE DE CONTROL",
      category: "Desarrollo Grupal",
      description: "Macro-sistema centralizador de operaciones, manufactura, seguimiento logístico y KPIs estratégicos en tiempo real para STF GROUP. Desarrollo colaborativo del equipo.",
      devId: "dev_jg", // Líder técnico principal
      devIds: ["dev_jg", "dev_jd", "dev_mocho", "dev_ee"], // Los 4 desarrolladores
      isGroupProject: true,
      deadline: "2026-12-15",
      priority: "Alta",
      status: "ontime",
      iconColor: "#4E65FF",
      iconInitial: "TDC",
      webUrl: "sharepoint",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: false },
        { id: "p3", name: "3. Desarrollo Backend & Integraciones", weight: 30, completed: false },
        { id: "p4", name: "4. Frontend & Cuadros de Mando", weight: 25, completed: false },
        { id: "p5", name: "5. Pruebas QA & Integración Grupal", weight: 15, completed: false },
        { id: "p6", name: "6. Despliegue en Servidores STF", weight: 5, completed: false }
      ]
    },
    {
      id: "app_laboratorio",
      code: "STF-LAB-03",
      name: "LABORATORIO",
      category: "Control Textil",
      description: "Módulo técnico para registro de pruebas de laboratorio: solidez de color, encogimiento, resistencia de fibras y fichas técnicas textiles.",
      devId: "dev_jg",
      deadline: "2026-11-30",
      priority: "Media",
      status: "ontime",
      iconColor: "#D88BF8",
      iconInitial: "LAB",
      webUrl: "https://stflab-calidad-textil.vercel.app/",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: false },
        { id: "p3", name: "3. Desarrollo Backend & Fórmulas", weight: 30, completed: false },
        { id: "p4", name: "4. Frontend & Reportes Técnicos", weight: 25, completed: false },
        { id: "p5", name: "5. Pruebas QA", weight: 15, completed: false },
        { id: "p6", name: "6. Despliegue Final", weight: 5, completed: false }
      ]
    },
    {
      id: "app_geo",
      code: "STF-GEO-04",
      name: "GEO UBICACION TALLERES",
      category: "Logística & Talleres",
      description: "Georreferenciación satelital de talleres de confección y maquila externa, capacidad instalada, rutas de recogida y entregas a tiempo.",
      devId: "dev_jg",
      deadline: "2026-11-15",
      priority: "Alta",
      status: "risk",
      iconColor: "#10B981",
      iconInitial: "GEO",
      webUrl: "https://stf-rastreo-calidad.vercel.app/",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Mapas Satelitales", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & APIs GPS", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend & Tablero Geográfico", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA de Conectividad", weight: 15, completed: false },
        { id: "p6", name: "6. Puesta en Marcha", weight: 5, completed: false }
      ]
    },
    {
      id: "app_oficina",
      code: "STF-OF-00",
      name: "OFICINA - APLICATIVOS",
      category: "Gestión TI & Control",
      description: "Plataforma central de supervisión, métricas de ingeniería, control de sprints y despliegues web para STF GROUP.",
      devId: "dev_jg",
      deadline: "2026-12-30",
      priority: "Alta",
      status: "ontime",
      iconColor: "#0EA5E9",
      iconInitial: "OFA",
      webUrl: "https://stf-oficina-aplicativos.vercel.app/",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Core & Integraciones", weight: 30, completed: true },
        { id: "p4", name: "4. Sincronización Google Sheets", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas de Despliegue Vercel", weight: 15, completed: true },
        { id: "p6", name: "6. Salida en Vivo", weight: 5, completed: false }
      ]
    },
    {
      id: "app_calidad",
      code: "STF-CAL-05",
      name: "CALIDAD",
      category: "Aseguramiento de Calidad",
      description: "Plataforma de auditoría técnica en planta: inspección en corte, confección, auditoría AQL por muestreo y control de prendas de segunda.",
      devId: "dev_jd",
      deadline: "2026-11-25",
      priority: "Alta",
      status: "ontime",
      iconColor: "#3B82F6",
      iconInitial: "CAL",
      webUrl: "",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Criterios AQL", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Auditorías", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend Móvil para Inspectores", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA en Línea de Producción", weight: 15, completed: true },
        { id: "p6", name: "6. Salida en Vivo", weight: 5, completed: false }
      ]
    },
    {
      id: "app_tintoreria",
      code: "STF-TIN-06",
      name: "TINTORERIA",
      category: "Planta Textil",
      description: "Control de barcas de teñido, recetas químicas de tintura, control de partidas, temperaturas y trazabilidad de lotes de tela.",
      devId: "dev_mocho",
      deadline: "2026-12-05",
      priority: "Alta",
      status: "ontime",
      iconColor: "#8B5CF6",
      iconInitial: "TIN",
      webUrl: "",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Fórmulas Químicas", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Barcas", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend para Operarios de Planta", weight: 25, completed: false },
        { id: "p5", name: "5. Pruebas QA", weight: 15, completed: false },
        { id: "p6", name: "6. Despliegue", weight: 5, completed: false }
      ]
    },
    {
      id: "app_colchas",
      code: "STF-COL-02",
      name: "COLCHAS",
      category: "Manufactura & Producción",
      description: "Sistema para la gestión, órdenes de producción, trazabilidad de insumos y control de confección de la línea de colchas y hogar.",
      devId: "dev_jg",
      deadline: "2026-11-20",
      priority: "Alta",
      status: "ontime",
      iconColor: "#FFA043",
      iconInitial: "COL",
      webUrl: "https://colchas.vercel.app/",
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Lógica Core", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend & Conexión Planta", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA con Operarios", weight: 15, completed: true },
        { id: "p6", name: "6. Salida en Vivo", weight: 5, completed: true }
      ]
    }
  ],

  // Integraciones y Tareas Reales Registradas en CONTROL_TAREAS de Google Sheets
  integrations: [
    {
      id: "int_kpi_lab",
      name: "Integración KPI",
      appId: "app_laboratorio",
      appName: "LABORATORIO",
      devId: "dev_jg",
      devName: "Jose Guzman",
      startDate: "2026-11-07",
      deadline: "2026-11-16",
      weight: 25,
      status: "in_progress",
      description: "KPI completos",
      evaluation: null,
      observations: []
    },
    {
      id: "int_sharepoint_lab",
      name: "Investigar como podemos aplicar app de laboratorio en SharePoint",
      appId: "app_laboratorio",
      appName: "LABORATORIO",
      devId: "dev_jg",
      devName: "Jose Guzman",
      startDate: "2026-10-19",
      deadline: "2026-11-09",
      weight: 10,
      status: "in_progress",
      description: "tenemos que crear y estabilizar el sistema de laboratorio por SharePoint para que nos quede en cuanto seguridad mas estable.",
      evaluation: null,
      observations: []
    },
    {
      id: "int_17937216525",
      name: "Iniciar el ajuste de LAB.",
      appId: "app_laboratorio",
      devId: "dev_jg",
      startDate: "2026-10-25",
      deadline: "2026-11-06",
      weight: 15,
      status: "evaluated",
      description: "Ajuste estructural de fórmulas de laboratorio textil y validación con operarios.",
      evaluation: {
        evalDate: "2026-11-05",
        onTime: true,
        daysDifference: 1,
        stabilityScore: 95,
        usabilityScore: 93,
        qaScore: 95,
        qualityScore: 94.3,
        pointsAdded: 14.1,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Implementación en planta validada con los operarios. Operatividad estable."
      }
    },
    {
      id: "int_17926874219",
      name: "Retomar incorporacion de base de datos.",
      appId: "app_laboratorio",
      devId: "dev_jg",
      startDate: "2026-10-18",
      deadline: "2026-10-29",
      weight: 20,
      status: "evaluated",
      description: "Conexión y normalización de tablas de resultados de pruebas físicas y químicas.",
      evaluation: {
        evalDate: "2026-11-04",
        onTime: true,
        daysDifference: 0,
        stabilityScore: 95,
        usabilityScore: 93,
        qaScore: 95,
        qualityScore: 94.3,
        pointsAdded: 18.9,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Implementación en planta validada con los operarios. Operatividad estable."
      }
    },
    {
      id: "int_17926830187",
      name: "hacer indicador - juan",
      appId: "app_calidad",
      devId: "dev_jd",
      startDate: "2026-10-22",
      deadline: "2026-10-29",
      weight: 15,
      status: "evaluated",
      description: "Pasar indicadores manuales de inspección de calidad en línea a tableros digitales.",
      evaluation: {
        evalDate: "2026-11-05",
        onTime: true,
        daysDifference: 0,
        stabilityScore: 95,
        usabilityScore: 93,
        qaScore: 95,
        qualityScore: 94.3,
        pointsAdded: 14.1,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Implementación en planta validada con los operarios. Operatividad estable."
      }
    },
    {
      id: "int_0",
      name: "Gateway de Autenticación & Roles Operativos",
      appId: "app_torre",
      devId: "dev_jg",
      startDate: "2026-10-01",
      deadline: "2026-10-12",
      weight: 15,
      status: "evaluated",
      description: "Módulo central de login y asignación de permisos para supervisores y operarios en planta para Torre de Control.",
      evaluation: {
        evalDate: "2026-11-04",
        onTime: true,
        daysDifference: -1,
        stabilityScore: 98,
        usabilityScore: 95,
        qaScore: 96,
        qualityScore: 96.3,
        pointsAdded: 14.4,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Excelente arquitectura e integración limpia. Pruebas de estrés superadas con cero latencia."
      }
    },
    {
      id: "int_1",
      name: "Conexión Báscula Digital & Pesaje de Telas",
      appId: "app_colchas",
      devId: "dev_jg",
      startDate: "2026-10-14",
      deadline: "2026-10-24",
      weight: 15,
      status: "evaluated",
      description: "Integración de protocolo RS232 de la báscula de planta para pesar rollos de tela y registrar merma automáticamente en COLCHAS.",
      evaluation: {
        evalDate: "2026-11-04",
        onTime: true,
        daysDifference: 0,
        stabilityScore: 98,
        usabilityScore: 98,
        qaScore: 98,
        qualityScore: 98.0,
        pointsAdded: 14.7,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Auditada & Aprobada por Jefatura TI. Operando al 100% en línea de Colchas."
      }
    },
    {
      id: "int_2",
      name: "Auditoría AQL Móvil & Muestreo en Planta",
      appId: "app_calidad",
      devId: "dev_jd",
      startDate: "2026-10-12",
      deadline: "2026-10-22",
      weight: 20,
      status: "in_progress",
      description: "Desarrollo de interfaz táctil para auditores de calidad en mesa de corte con cálculo automático de tablas militares estándar AQL.",
      evaluation: null
    },
    {
      id: "int_3",
      name: "Automatización de Recetas Químicas en Barcas",
      appId: "app_tintoreria",
      devId: "dev_mocho",
      startDate: "2026-10-15",
      deadline: "2026-10-28",
      weight: 15,
      status: "in_progress",
      description: "Algoritmo de cálculo de dosificación de tintes y reactivos según el peso del lote de tela a teñir.",
      evaluation: null
    },
    {
      id: "int_4",
      name: "Módulo GPS & Trazabilidad de Talleres Satélites",
      appId: "app_geo",
      devId: "dev_jg",
      startDate: "2026-10-05",
      deadline: "2026-10-18",
      weight: 20,
      status: "evaluated",
      description: "Visualización de geocercas y cálculo de tiempos de transporte entre talleres satélites y el CEDI central de STF.",
      evaluation: {
        evalDate: "2026-11-04",
        onTime: true,
        daysDifference: 0,
        stabilityScore: 95,
        usabilityScore: 93,
        qaScore: 95,
        qualityScore: 94.3,
        pointsAdded: 18.9,
        evaluator: "Super Admin (Jefe TI)",
        notes: "Módulo de rastreo validado e integrado con éxito."
      }
    },
    {
      id: "int_5",
      name: "Servicio de Notificaciones en Tiempo Real (WebSockets)",
      appId: "app_torre",
      devId: "dev_ee",
      startDate: "2026-10-16",
      deadline: "2026-10-26",
      weight: 10,
      status: "in_progress",
      description: "Infraestructura de alertas críticas en Torre de Control ante paradas de línea de producción o retrasos en planta.",
      evaluation: null
    }
  ]
};

// Alias de compatibilidad global para STF_DATA y STF_REAL_DATA
const STF_DATA = STF_REAL_DATA;
if (typeof window !== 'undefined') {
  window.STF_REAL_DATA = STF_REAL_DATA;
  window.STF_DATA = STF_REAL_DATA;
}

// Filtro estricto para eliminar cualquier rastro de "Sistema_a_Cargo" o cabeceras de Sheets
function isInvalidPhantomApp(appOrId) {
  if (!appOrId) return false;
  if (typeof appOrId === 'string') {
    const cleanId = appOrId.trim().toLowerCase();
    if (!cleanId) return false;
    return cleanId === 'app_sistema_a_cargo' || cleanId === 'sistema_a_cargo' || cleanId === 'stf-sis-99';
  }
  const id = String(appOrId.id || '').trim().toLowerCase();
  const code = String(appOrId.code || '').trim().toLowerCase();
  const name = String(appOrId.name || '').trim().toLowerCase();
  const normalizedName = name.replace(/[\s_-]+/g, '');
  if (id === 'app_sistema_a_cargo' || code === 'stf-sis-99') return true;
  if (normalizedName === 'sistemaacargo' || normalizedName === 'nombreaplicativo' || normalizedName === 'urlsistemaweb') return true;
  if (['sistema_a_cargo', 'sistema a cargo', 'nombre_aplicativo', 'desarrollador', 'estado', 'codigo'].includes(name)) return true;
  return false;
}

function purgePhantomAppsFromState(stateObj) {
  if (!stateObj || typeof stateObj !== 'object') return stateObj;
  if (Array.isArray(stateObj.applications)) {
    stateObj.applications = stateObj.applications.filter(a => a && !isInvalidPhantomApp(a));
  }
  if (Array.isArray(stateObj.developers)) {
    stateObj.developers.forEach(d => {
      if (Array.isArray(d.activeProjects)) {
        d.activeProjects = d.activeProjects.filter(pid => pid && !isInvalidPhantomApp(pid));
      }
    });
  }
  if (Array.isArray(stateObj.integrations)) {
    stateObj.integrations = stateObj.integrations.filter(i => {
      if (!i) return false;
      if (i.appId && isInvalidPhantomApp(i.appId)) return false;
      if (i.appName && isInvalidPhantomApp(i.appName)) return false;
      return true;
    });
  }
  return stateObj;
}

// Sanitizar y deduplicar perfiles de desarrolladores para garantizar que nunca existan registros fantasma ni duplicados
function sanitizeAndDeduplicateDevelopers(devList) {
  if (!Array.isArray(devList) || devList.length === 0) {
    return JSON.parse(JSON.stringify(STF_REAL_DATA.developers));
  }

  const canonicalAliases = {
    'dev_jg': 'dev_jg', 'dev_jose_guzman': 'dev_jg', 'dev_jose': 'dev_jg',
    'jose@guzman': 'dev_jg', 'jose.guzman': 'dev_jg', 'joseoneiber711@gmail.com': 'dev_jg',
    'jose': 'dev_jg', 'jose guzman': 'dev_jg', '1073524622': 'dev_jg', 'jg': 'dev_jg', 'jguzman': 'dev_jg',
    'dev_jd': 'dev_jd', 'dev_juan_david': 'dev_jd', 'juan@david': 'dev_jd',
    'juan.david': 'dev_jd', 'juan.david@studiof.com.co': 'dev_jd', 'juan': 'dev_jd',
    'juan david': 'dev_jd', '1107047649': 'dev_jd', 'jd': 'dev_jd',
    'dev_ee': 'dev_ee', 'dev_esteban_escobar': 'dev_ee', 'esteban@escobar': 'dev_ee',
    'esteban.escobar': 'dev_ee', 'esteban.escobar@studiof.com.co': 'dev_ee', 'esteban': 'dev_ee',
    'esteban escobar': 'dev_ee', '1111': 'dev_ee', 'ee': 'dev_ee',
    'dev_mocho': 'dev_mocho', 'dev_jhon_eyder': 'dev_mocho', 'jhon@eyder': 'dev_mocho',
    'jhon.eyder': 'dev_mocho', 'jhon.eyder@studiof.com.co': 'dev_mocho', 'mocho': 'dev_mocho',
    'jhon': 'dev_mocho', 'jhon eyder': 'dev_mocho', 'jhon eyder (mocho)': 'dev_mocho', '1010159672': 'dev_mocho',
    'dev_ediaz': 'dev_ediaz', 'dev_edwin_diaz': 'dev_ediaz', 'ediaz': 'dev_ediaz',
    'edwin.diaz@studiof.com.co': 'dev_ediaz', 'edwin': 'dev_ediaz', 'edwin diaz': 'dev_ediaz', 'admin': 'dev_ediaz'
  };

  function resolveId(item) {
    if (!item) return 'dev_jg';
    if (typeof item === 'string') {
      const clean = item.trim().toLowerCase();
      return canonicalAliases[clean] || clean;
    }
    const candidates = [item.id, item.username, item.email, item.name, item.idPassword];
    for (const c of candidates) {
      if (!c) continue;
      const clean = String(c).trim().toLowerCase();
      if (canonicalAliases[clean]) return canonicalAliases[clean];
    }
    return item.id || 'dev_jg';
  }

  const map = new Map();

  devList.forEach(d => {
    if (!d) return;
    const cid = resolveId(d);
    const official = (typeof STF_REAL_DATA !== 'undefined' && Array.isArray(STF_REAL_DATA.developers))
      ? STF_REAL_DATA.developers.find(o => o.id === cid)
      : null;

    if (!map.has(cid)) {
      const unified = {
        ...d,
        id: cid,
        name: official ? official.name : (d.name || 'Desarrollador'),
        username: official ? official.username : (d.username || cid),
        avatar: official ? official.avatar : (d.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'),
        role: official ? official.role : (d.role || 'desarrollador'),
        idPassword: d.idPassword || (official ? official.idPassword : null),
        onTimeDelivery: official ? official.onTimeDelivery : (d.onTimeDelivery || 95),
        codeQuality: official ? official.codeQuality : (d.codeQuality || 93),
        sprintsCompleted: official ? official.sprintsCompleted : (d.sprintsCompleted || 10),
        score: official ? official.score : (d.score || '9.5 / 10'),
        activeProjects: Array.isArray(d.activeProjects) ? [...d.activeProjects] : (official ? [...official.activeProjects] : [])
      };
      if (official && Array.isArray(official.activeProjects)) {
        official.activeProjects.forEach(p => {
          if (!unified.activeProjects.includes(p)) unified.activeProjects.push(p);
        });
      }
      map.set(cid, unified);
    } else {
      // Duplicado encontrado: fusionar sistemas y mantener información legítima
      const existing = map.get(cid);
      if (official) {
        existing.name = official.name;
        existing.avatar = official.avatar;
        existing.username = official.username;
        existing.role = official.role;
        existing.onTimeDelivery = official.onTimeDelivery;
        existing.codeQuality = official.codeQuality;
      }
      if (Array.isArray(d.activeProjects)) {
        d.activeProjects.forEach(p => {
          if (!existing.activeProjects.includes(p)) existing.activeProjects.push(p);
        });
      }
      if (d.idPassword && !existing.idPassword) {
        existing.idPassword = d.idPassword;
      }
    }
  });

  // Asegurar que los 5 desarrolladores oficiales siempre existan
  if (typeof STF_REAL_DATA !== 'undefined' && Array.isArray(STF_REAL_DATA.developers)) {
    STF_REAL_DATA.developers.forEach(official => {
      if (!map.has(official.id)) {
        map.set(official.id, JSON.parse(JSON.stringify(official)));
      }
    });
  }

  return Array.from(map.values());
}

// Guardar o inicializar en LocalStorage con migración inteligente
function getStoredData() {
  const STORAGE_KEY = 'STF_GROUP_REAL_DATA_V6';
  const local = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;

  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.developers && Array.isArray(parsed.developers)) {
        // Sanitizar y deduplicar inmediatamente los perfiles de desarrolladores
        parsed.developers = sanitizeAndDeduplicateDevelopers(parsed.developers);

        // Asegurar que dev_ediaz (ADMIN) esté presente
        if (!parsed.developers.some(d => d.id === 'dev_ediaz')) {
          const ediazDev = STF_REAL_DATA.developers.find(d => d.id === 'dev_ediaz');
          if (ediazDev) parsed.developers.push(ediazDev);
        }
        // Asegurar usernames, IDs canónicos, nombres completos, roles oficiales y array de proyectos activos
        STF_REAL_DATA.developers.forEach(officialDev => {
          const target = parsed.developers.find(d =>
            d.id === officialDev.id ||
            (d.username && d.username.toLowerCase() === officialDev.username.toLowerCase())
          );
          if (target) {
            target.id = officialDev.id;
            target.name = officialDev.name;
            target.username = officialDev.username;
            target.role = officialDev.role;
            if (officialDev.email) target.email = officialDev.email;
            if (!Array.isArray(target.activeProjects)) {
              target.activeProjects = [...(officialDev.activeProjects || [])];
            } else {
              (officialDev.activeProjects || []).forEach(pId => {
                if (!target.activeProjects.includes(pId)) target.activeProjects.push(pId);
              });
            }
          } else {
            parsed.developers.push(JSON.parse(JSON.stringify(officialDev)));
          }
        });
        // Asegurar que applications e integrations sean arrays válidos con los enlaces reales oficiales
        if (!Array.isArray(parsed.applications) || parsed.applications.length === 0) {
          parsed.applications = JSON.parse(JSON.stringify(STF_REAL_DATA.applications));
        } else {
          STF_REAL_DATA.applications.forEach(official => {
            const existing = parsed.applications.find(a => a.id === official.id || (a.name && official.name && a.name.toLowerCase().trim() === official.name.toLowerCase().trim()));
            if (!existing) {
              parsed.applications.push(JSON.parse(JSON.stringify(official)));
            } else {
              // Sincronizar URL oficial correspondiente a la tabla real SISTEMAS_WEB
              if (official.webUrl !== undefined) {
                existing.webUrl = official.webUrl;
              }
              if (official.devId && !existing.devId) existing.devId = official.devId;
              if (official.devIds) existing.devIds = official.devIds;
            }
          });
        }
        // Si integrations no es array o quedó vacío por error anterior, restaurar las tareas reales
        if (!Array.isArray(parsed.integrations) || parsed.integrations.length === 0) {
          parsed.integrations = JSON.parse(JSON.stringify(STF_REAL_DATA.integrations));
        } else {
          // Asegurar appName y devName en cada integración existente
          parsed.integrations.forEach(item => {
            if (!item.appName && item.appId) {
              const app = (parsed.applications || []).find(a => a.id === item.appId);
              if (app) item.appName = app.name;
            }
            if (!item.devName && item.devId) {
              const dev = (parsed.developers || []).find(d => d.id === item.devId);
              if (dev) item.devName = dev.name;
            }
          });
        }
        purgePhantomAppsFromState(parsed);
        saveData(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing localStorage data, using defaults", e);
    }
  }

  // Guardar datos reales oficiales
  purgePhantomAppsFromState(STF_REAL_DATA);
  saveData(STF_REAL_DATA);
  return STF_REAL_DATA;
}

function saveData(data) {
  purgePhantomAppsFromState(data);
  if (data && Array.isArray(data.developers)) {
    data.developers = sanitizeAndDeduplicateDevelopers(data.developers);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('STF_GROUP_REAL_DATA_V6', JSON.stringify(data));
  }
}

if (typeof window !== 'undefined') {
  window.saveData = saveData;
  window.getStoredData = getStoredData;
  window.sanitizeAndDeduplicateDevelopers = sanitizeAndDeduplicateDevelopers;
  window.isInvalidPhantomApp = isInvalidPhantomApp;
  window.purgePhantomAppsFromState = purgePhantomAppsFromState;
}


