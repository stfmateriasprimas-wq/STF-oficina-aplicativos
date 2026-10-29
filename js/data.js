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
      activeProjects: ["app_colchas", "app_laboratorio", "app_geo", "app_torre"]
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

  // Aplicativos Reales de STF GROUP en Desarrollo
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Integraciones", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend & Cuadros de Mando", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA & Integración Grupal", weight: 15, completed: false },
        { id: "p6", name: "6. Despliegue en Servidores STF", weight: 5, completed: false }
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Lógica Core", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend & Conexión Planta", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA con Operarios", weight: 15, completed: false },
        { id: "p6", name: "6. Salida en Vivo", weight: 5, completed: false }
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Diseño UI/UX", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Fórmulas", weight: 30, completed: true },
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Mapas Satelitales", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & APIs GPS", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend & Tablero Geográfico", weight: 25, completed: false },
        { id: "p5", name: "5. Pruebas QA de Conectividad", weight: 15, completed: false },
        { id: "p6", name: "6. Puesta en Marcha", weight: 5, completed: false }
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Criterios AQL", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Auditorías", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend Móvil para Inspectores", weight: 25, completed: true },
        { id: "p5", name: "5. Pruebas QA en Línea de Producción", weight: 15, completed: false },
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
      phases: [
        { id: "p1", name: "1. Levantamiento & Requisitos", weight: 10, completed: true },
        { id: "p2", name: "2. Arquitectura & Fórmulas Químicas", weight: 15, completed: true },
        { id: "p3", name: "3. Desarrollo Backend & Barcas", weight: 30, completed: true },
        { id: "p4", name: "4. Frontend para Operarios de Planta", weight: 25, completed: false },
        { id: "p5", name: "5. Pruebas QA", weight: 15, completed: false },
        { id: "p6", name: "6. Despliegue", weight: 5, completed: false }
      ]
    }
  ],

  // Integraciones y Tareas Asignadas por el Super Admin (Jefe de Desarrollo)
  integrations: [
    {
      id: "int_juan_indicador",
      name: "hacer indicador - juan",
      appId: "app_calidad",
      devId: "dev_jd",
      startDate: "2026-10-22",
      deadline: "2026-10-29",
      weight: 15,
      status: "in_progress",
      description: "pasar indicadopres manuales a digitales",
      evaluation: null
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
        evalDate: "2026-10-11",
        onTime: true,
        daysDifference: -1,
        stabilityScore: 98,
        usabilityScore: 95,
        qaScore: 96,
        qualityScore: 96.3,
        pointsAdded: 14.4,
        evaluator: "Super Admin (Jefe de Desarrollo)",
        notes: "Excelente arquitectura e integración limpia. Pruebas de estrés superadas con cero latencia."
      }
    },
    {
      id: "int_1",
      name: "Conexión Báscula Digital & Pesaje de Telas",
      appId: "app_colchas",
      devId: "dev_jg",
      startDate: "2026-10-14",
      deadline: "2026-10-24", // 10 días
      weight: 15, // Vale 15% del aplicativo
      status: "in_progress", // 'in_progress', 'evaluated'
      description: "Integración de protocolo RS232 de la báscula de planta para pesar rollos de tela y registrar merma automáticamente en COLCHAS.",
      evaluation: null
    },
    {
      id: "int_2",
      name: "Auditoría AQL Móvil & Muestreo en Planta",
      appId: "app_calidad",
      devId: "dev_jd",
      startDate: "2026-10-12",
      deadline: "2026-10-22", // 10 días
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
      deadline: "2026-10-28", // 13 días
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
      deadline: "2026-10-18", // Venció hace 1 día -> Alerta de retraso
      weight: 20,
      status: "in_progress",
      description: "Visualización de geocercas y cálculo de tiempos de transporte entre talleres satélites y el CEDI central de STF.",
      evaluation: null
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

// Guardar o inicializar en LocalStorage con migración inteligente
function getStoredData() {
  const STORAGE_KEY = 'STF_GROUP_REAL_DATA_V6';
  const local = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;
  
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.developers && parsed.developers.some(d => d.name === "Jose Guzman") && parsed.integrations) {
        // Asegurar que dev_ediaz (ADMIN) esté presente
        if (!parsed.developers.some(d => d.id === 'dev_ediaz')) {
          const ediazDev = STF_REAL_DATA.developers.find(d => d.id === 'dev_ediaz');
          if (ediazDev) parsed.developers.push(ediazDev);
        }
        // Asegurar usernames, roles oficiales y array de proyectos activos
        STF_REAL_DATA.developers.forEach(officialDev => {
          const target = parsed.developers.find(d => d.id === officialDev.id);
          if (target) {
            target.username = officialDev.username;
            target.role = officialDev.role;
            if (officialDev.email) target.email = officialDev.email;
            if (!Array.isArray(target.activeProjects)) target.activeProjects = [...(officialDev.activeProjects || [])];
          }
        });
        // Asegurar que applications e integrations sean arrays válidos
        if (!Array.isArray(parsed.applications) || parsed.applications.length === 0) {
          parsed.applications = JSON.parse(JSON.stringify(STF_REAL_DATA.applications));
        }
        if (!Array.isArray(parsed.integrations)) {
          parsed.integrations = JSON.parse(JSON.stringify(STF_REAL_DATA.integrations));
        }
        saveData(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing localStorage data, using defaults", e);
    }
  }

  // Guardar datos reales oficiales
  saveData(STF_REAL_DATA);
  return STF_REAL_DATA;
}

function saveData(data) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('STF_GROUP_REAL_DATA_V6', JSON.stringify(data));
  }
}

if (typeof window !== 'undefined') {
  window.saveData = saveData;
  window.getStoredData = getStoredData;
}


