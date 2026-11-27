/**
 * ============================================================================
 * STF GROUP · ENRUTADOR PRINCIPAL API REST (doGet & doPost)
 * ============================================================================
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "ping") {
    return createJsonResponse({
      status: "success",
      message: "STF GROUP Executive Database Online (5 Master Sheets v3.5)",
      timestamp: new Date().toISOString(),
      sheets: Object.values(TABS)
    });
  }

  // 1. Obtener Lista de Usuarios para Autenticación (Mapeo Inteligente y Dinámico de Columnas)
  if (action === "get_users") {
    var sU = getMasterSheet(ss, "USUARIOS");
    var uRows = sU.getDataRange().getValues();
    var usersList = [];
    if (uRows.length > 1) {
      // Detección dinámica de índices de columna por encabezado
      var hRow = uRows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
      var idxPass = -1, idxUser = -1, idxRole = -1, idxEmail = -1, idxName = -1, idxStatus = -1, idxAvatar = -1;

      for (var c = 0; c < hRow.length; c++) {
        var h = hRow[c];
        if (idxPass === -1 && (h === "id" || h.indexOf("pass") !== -1 || h.indexOf("clave") !== -1 || h.indexOf("contra") !== -1)) idxPass = c;
        else if (idxUser === -1 && (h.indexOf("usuario") !== -1 || h.indexOf("login") !== -1 || h === "user")) idxUser = c;
        else if (idxRole === -1 && (h.indexOf("rol") !== -1 || h.indexOf("role") !== -1 || h.indexOf("perfil") !== -1)) idxRole = c;
        else if (idxEmail === -1 && (h.indexOf("correo") !== -1 || h.indexOf("email") !== -1 || h.indexOf("mail") !== -1)) idxEmail = c;
        else if (idxName === -1 && (h.indexOf("nombre") !== -1 || h.indexOf("name") !== -1 || h.indexOf("desarrollador") !== -1)) idxName = c;
        else if (idxStatus === -1 && (h.indexOf("estado") !== -1 || h.indexOf("status") !== -1 || h.indexOf("activo") !== -1)) idxStatus = c;
        else if (idxAvatar === -1 && (h.indexOf("avatar") !== -1 || h.indexOf("foto") !== -1 || h.indexOf("img") !== -1 || h.indexOf("imagen") !== -1)) idxAvatar = c;
      }

      // Fallback a posiciones predeterminadas A..G
      if (idxPass === -1) idxPass = 0;
      if (idxUser === -1) idxUser = 1;
      if (idxRole === -1) idxRole = 2;
      if (idxEmail === -1) idxEmail = 3;
      if (idxName === -1) idxName = 4;
      if (idxStatus === -1) idxStatus = 5;
      if (idxAvatar === -1 && hRow.length > 6) idxAvatar = 6;

      for (var r = 1; r < uRows.length; r++) {
        var uLogin = String(uRows[r][idxUser] !== undefined ? uRows[r][idxUser] : "").trim();
        if (!uLogin || uLogin.toLowerCase() === "usuario_logueo" || uLogin.toLowerCase() === "usuario") continue;
        var userAvatar = (idxAvatar !== -1 && idxAvatar < uRows[r].length) ? String(uRows[r][idxAvatar] || "").trim() : "";
        usersList.push({
          id: "dev_" + uLogin.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
          username: uLogin,
          role: String(uRows[r][idxRole] || "desarrollador").trim(),
          email: String(uRows[r][idxEmail] || "").trim(),
          name: idxName < uRows[r].length ? String(uRows[r][idxName] || "").trim() : "",
          status: idxStatus < uRows[r].length ? String(uRows[r][idxStatus] || "ACTIVO").trim() : "ACTIVO",
          avatar: userAvatar
        });
      }
    }
    return createJsonResponse({ status: "success", users: usersList });
  }

  // 1.1 Autenticación Segura en el Servidor (Verifica credenciales contra la hoja USUARIOS)
  if (action === "authenticate") {
    var checkUser = String((e && e.parameter && e.parameter.username) || "").trim().toLowerCase();
    var checkPass = String((e && e.parameter && e.parameter.password) || "").trim();

    if (!checkUser || !checkPass) {
      return createJsonResponse({ status: "error", authorized: false, message: "Usuario y contraseña requeridos" });
    }

    var sU2 = getMasterSheet(ss, "USUARIOS");
    var uRows2 = sU2.getDataRange().getValues();
    if (uRows2.length > 1) {
      var hRow2 = uRows2[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
      var idxPass2 = -1, idxUser2 = -1, idxRole2 = -1, idxEmail2 = -1, idxName2 = -1, idxAvatar2 = -1;
      for (var c2 = 0; c2 < hRow2.length; c2++) {
        var h2 = hRow2[c2];
        if (idxPass2 === -1 && (h2 === "id" || h2.indexOf("pass") !== -1 || h2.indexOf("clave") !== -1 || h2.indexOf("contra") !== -1)) idxPass2 = c2;
        else if (idxUser2 === -1 && (h2.indexOf("usuario") !== -1 || h2.indexOf("login") !== -1 || h2 === "user")) idxUser2 = c2;
        else if (idxRole2 === -1 && (h2.indexOf("rol") !== -1 || h2.indexOf("role") !== -1 || h2.indexOf("perfil") !== -1)) idxRole2 = c2;
        else if (idxEmail2 === -1 && (h2.indexOf("correo") !== -1 || h2.indexOf("email") !== -1 || h2.indexOf("mail") !== -1)) idxEmail2 = c2;
        else if (idxName2 === -1 && (h2.indexOf("nombre") !== -1 || h2.indexOf("name") !== -1 || h2.indexOf("desarrollador") !== -1)) idxName2 = c2;
        else if (idxAvatar2 === -1 && (h2.indexOf("avatar") !== -1 || h2.indexOf("foto") !== -1 || h2.indexOf("img") !== -1)) idxAvatar2 = c2;
      }
      if (idxPass2 === -1) idxPass2 = 0;
      if (idxUser2 === -1) idxUser2 = 1;
      if (idxRole2 === -1) idxRole2 = 2;
      if (idxEmail2 === -1) idxEmail2 = 3;
      if (idxName2 === -1) idxName2 = 4;

      for (var r2 = 1; r2 < uRows2.length; r2++) {
        var rowUser = String(uRows2[r2][idxUser2] || "").trim().toLowerCase();
        var rowPass = String(uRows2[r2][idxPass2] || "").trim();
        var rowEmail = String(uRows2[r2][idxEmail2] || "").trim().toLowerCase();

        if (rowUser === checkUser || rowEmail === checkUser) {
          if (rowPass === checkPass) {
            return createJsonResponse({
              status: "success",
              authorized: true,
              user: {
                id: "dev_" + rowUser.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
                username: uRows2[r2][idxUser2],
                role: String(uRows2[r2][idxRole2] || "desarrollador").trim(),
                email: String(uRows2[r2][idxEmail2] || "").trim(),
                name: (idxName2 < uRows2[r2].length) ? String(uRows2[r2][idxName2] || "").trim() : rowUser,
                avatar: (idxAvatar2 !== -1 && idxAvatar2 < uRows2[r2].length) ? String(uRows2[r2][idxAvatar2] || "").trim() : ""
              }
            });
          } else {
            return createJsonResponse({ status: "error", authorized: false, message: "Contraseña incorrecta" });
          }
        }
      }
    }
    return createJsonResponse({ status: "error", authorized: false, message: "Usuario no encontrado" });
  }

  // 1.2 Alerta de Bloqueo de Seguridad por Intentos Fallidos (3 o 8 intentos)
  if (action === "security_lockout_alert") {
    return handleSecurityLockoutAlert(ss, e.parameter || {});
  }

  // 1.3 Solicitud de Código OTP para Restablecer Contraseña
  if (action === "request_password_reset") {
    return handleRequestPasswordReset(ss, e.parameter || {});
  }

  // 1.4 Restablecimiento y Reemplazo de Contraseña en Hoja USUARIOS
  if (action === "reset_password") {
    return handleResetPassword(ss, e.parameter || {});
  }

  // 2. Obtener Historial de Eventos
  if (action === "get_updates") {
    var sB = getMasterSheet(ss, "BITACORA");
    var bRows = sB.getDataRange().getValues();
    var headers = HEADERS.BITACORA;
    var data = [];

    for (var i = bRows.length - 1; i >= 1 && data.length < 50; i--) {
      var item = {};
      for (var h = 0; h < headers.length; h++) {
        item[headers[h]] = bRows[i][h];
      }
      data.push(item);
    }
    return createJsonResponse({ status: "success", data: data });
  }

  // 3. Obtener Todo el Portafolio (Tareas + Sistemas + Sistemas Web + Usuarios)
  if (action === "get_all_data") {
    // A. Tareas desde CONTROL_TAREAS (9 Columnas Oficiales A:I)
    var sT = getMasterSheet(ss, "TAREAS");
    var tRows = sT.getDataRange().getValues();
    var tasks = [];
    if (tRows.length > 1) {
      var colAHeader = String(tRows[0][0] || "").toLowerCase().trim();
      var hasIdCol = (colAHeader === "id_tarea" || colAHeader === "id");

      for (var t = 1; t < tRows.length; t++) {
        var row = tRows[t];
        var tName = String(hasIdCol ? row[1] : row[0] || "").trim();
        if (!tName || tName.toLowerCase() === "tarea") continue;

        var tId = hasIdCol ? String(row[0] || "").trim() : ("int_" + t);
        var appName = String(hasIdCol ? row[2] : row[1] || "").trim();
        var devName = String(hasIdCol ? row[3] : row[2] || "").trim();
        var weight = Number(hasIdCol ? row[4] : row[3]) || 15;
        var deadline = formatDateToYMD(hasIdCol ? row[5] : row[4]);
        var status = String(hasIdCol ? row[6] : row[5] || "").trim();
        var rawEval = String(hasIdCol ? row[7] : row[6] || "").trim();
        var evaluation = rawEval.replace(/0\.(\d{2,3})%/, function (match, p1) {
          return (parseFloat("0." + p1) * 100).toFixed(1) + "%";
        });
        var rawRegDate = hasIdCol ? row[8] : row[7];
        var createdDate = (rawRegDate instanceof Date)
          ? Utilities.formatDate(rawRegDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(rawRegDate || "").trim();
        var notes = String(hasIdCol ? (row[9] || "") : (row[8] || "")).trim();

        var todayBogota = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd");
        var createdDay = createdDate ? createdDate.substring(0, 10) : todayBogota;
        var isTaskEvaluated = (status.toLowerCase().indexOf("audit") !== -1 || status.toLowerCase().indexOf("aprob") !== -1);
        // Si la tarea está activa (en progreso) y su deadline quedó en fecha pasada (ej. 16 nov):
        if (!isTaskEvaluated && deadline < todayBogota) {
          deadline = todayBogota;
        }

        var dId = "dev_jg";
        var dLower = devName.toLowerCase();
        var aLower = (appName || "").toLowerCase();
        if (dLower.indexOf("edwin") !== -1 || aLower.indexOf("lab") !== -1) {
          dId = "dev_ediaz";
          if (!devName || devName === "Desarrollador Oficial") devName = "Edwin Diaz";
        } else if (dLower.indexOf("juan") !== -1 || aLower.indexOf("calidad") !== -1) {
          dId = "dev_jd";
          if (!devName || devName === "Desarrollador Oficial") devName = "Juan David";
        } else if (dLower.indexOf("mocho") !== -1 || dLower.indexOf("jhon") !== -1 || dLower.indexOf("eyder") !== -1 || aLower.indexOf("tinto") !== -1) {
          dId = "dev_mocho";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jhon Eyder (Mocho)";
        } else if (dLower.indexOf("esteban") !== -1) {
          dId = "dev_ee";
          if (!devName || devName === "Desarrollador Oficial") devName = "Esteban Escobar";
        } else {
          dId = "dev_jg";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jose Guzman";
        }

        tasks.push({
          id: tId,
          name: tName,
          appName: appName,
          devName: devName,
          developer: devName,
          devId: dId,
          weight: weight,
          startDate: (!isTaskEvaluated && (!createdDay || createdDay < todayBogota)) ? todayBogota : (createdDay || todayBogota),
          createdDate: createdDate || (todayBogota + " 08:00:00"),
          deadline: deadline,
          deliveryTime: "13:00",
          status: status,
          evaluation: evaluation,
          notes: notes
        });
      }
    }

    // B. Sistemas desde SISTEMAS_WEB (o PORTAFOLIO_SISTEMAS si existe)
    var sS = ss.getSheetByName("PORTAFOLIO_SISTEMAS");
    var sysRows = sS ? sS.getDataRange().getValues() : [];
    var systems = [];
    if (sysRows.length > 1) {
      for (var s = 1; s < sysRows.length; s++) {
        var sysName = String(sysRows[s][1] || "").trim();
        if (!sysName || sysName.toLowerCase() === "nombre_aplicativo" || sysName.toLowerCase() === "sistema_a_cargo") continue;
        systems.push({
          code: String(sysRows[s][0] || "").trim(),
          name: sysName,
          area: String(sysRows[s][2] || "").trim(),
          devName: String(sysRows[s][3] || "").trim(),
          currentPhase: String(sysRows[s][4] || "").trim(),
          progress: Number(sysRows[s][5]) || 0,
          slaStatus: String(sysRows[s][6] || "").trim(),
          deadline: String(sysRows[s][7] || "").trim(),
          lastUpdate: String(sysRows[s][8] || "").trim()
        });
      }
    }

    // C. Enlaces de Sistemas Web Publicados desde SISTEMAS_WEB (4 Columnas A:D)
    var sW = getMasterSheet(ss, "SISTEMAS_WEB");
    var wRows = sW ? sW.getDataRange().getValues() : [];
    var webSystems = [];
    if (wRows.length > 1) {
      for (var w = 1; w < wRows.length; w++) {
        var sysNameW = String(wRows[w][1] || "").trim();
        if (!sysNameW || sysNameW.toLowerCase() === "sistema_a_cargo" || sysNameW.toLowerCase() === "nombre_aplicativo" || sysNameW.toLowerCase() === "columna 2") continue;
        webSystems.push({
          devName: String(wRows[w][0] || "").trim(),
          name: sysNameW,
          webUrl: String(wRows[w][2] || "").trim(),
          status: String(wRows[w][3] || "").trim()
        });
      }
    }

    // D. Observaciones desde HISTORIAL_OBSERVACIONES (6 Columnas A:F)
    var sO = getMasterSheet(ss, "OBSERVACIONES");
    var oRows = sO ? sO.getDataRange().getValues() : [];
    var observations = [];
    if (oRows.length > 1) {
      for (var o = 1; o < oRows.length; o++) {
        var rawODate = oRows[o][0];
        var oDateFormatted = (rawODate instanceof Date)
          ? Utilities.formatDate(rawODate, "America/Bogota", "yyyy-MM-dd HH:mm")
          : String(rawODate || "").trim();
        var oApp = String(oRows[o][1] || "").trim();
        var oDev = String(oRows[o][2] || "").trim();
        var oTask = String(oRows[o][3] || "").trim();
        var oImpact = String(oRows[o][4] || "NORMAL").trim();
        var oText = String(oRows[o][5] || "").trim();

        if (!oText && !oTask) continue;
        if (oTask.toLowerCase() === "tarea" && oText.toLowerCase() === "observacion") continue;

        observations.push({
          date: oDateFormatted,
          appName: oApp,
          developer: oDev,
          taskName: oTask,
          impact: oImpact,
          observation: oText
        });
      }
    }

    // E. Solicitudes de Soporte desde SOLICITUDES_SOPORTE (15 Columnas A:O)
    var sSup = getMasterSheet(ss, "SOPORTE");
    var supRows = sSup ? sSup.getDataRange().getValues() : [];
    var supportTickets = [];
    var SUPPORT_OFFICIAL_CUTOFF = new Date('2026-11-13T16:05:00.000Z').getTime();
    if (supRows.length > 1) {
      for (var sp = 1; sp < supRows.length; sp++) {
        var rowSp = supRows[sp];
        var code = String(rowSp[0] || "").trim();
        if (!code || code.toLowerCase() === "id_ticket" || code.toLowerCase() === "id") continue;

        var reqDate = rowSp[1];
        var reqDateFormatted = (reqDate instanceof Date)
          ? Utilities.formatDate(reqDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(reqDate || "").trim();

        var rowTime = (reqDate instanceof Date) ? reqDate.getTime() : new Date(reqDateFormatted || 0).getTime();
        if (rowTime > 0 && rowTime < SUPPORT_OFFICIAL_CUTOFF) {
          continue; // Omitir tickets de prueba anteriores a la puesta en marcha oficial
        }

        var typeStr = String(rowSp[2] || "soporte").toLowerCase().trim();
        var normalizedType = (typeStr.indexOf("act") !== -1) ? "actualizacion" : "soporte";

        var appName = String(rowSp[3] || "").trim();
        var appCode = String(rowSp[4] || "").trim();
        var reqName = String(rowSp[5] || "Operario").trim();
        var reqArea = String(rowSp[6] || "Planta STF").trim();
        var title = String(rowSp[7] || "").trim();
        var desc = String(rowSp[8] || "").trim();
        var devName = String(rowSp[9] || "Jose Guzman").trim();
        var rawStatus = String(rowSp[10] || "pendiente").toLowerCase().trim();
        var status = "pendiente";
        if (rawStatus.indexOf("acept") !== -1) status = "aceptada";
        else if (rawStatus.indexOf("rechaz") !== -1) status = "rechazada";

        var resDate = rowSp[11];
        var resDateFormatted = (resDate instanceof Date)
          ? Utilities.formatDate(resDate, "America/Bogota", "yyyy-MM-dd HH:mm:ss")
          : String(resDate || "").trim();

        var observation = String(rowSp[12] || "").trim();
        var etaHours = String(rowSp[13] || "").trim();
        var resolvedBy = String(rowSp[14] || "").trim();

        var emailReq = String(rowSp[15] || "").trim();
        var phoneReq = String(rowSp[16] || "").trim();

        var dId = "dev_jg";
        var dLower = devName.toLowerCase();
        var aLower = (appName + " " + appCode).toLowerCase();
        if (dLower.indexOf("edwin") !== -1 || aLower.indexOf("lab") !== -1) {
          dId = "dev_ediaz";
          if (!devName || devName === "Desarrollador Oficial") devName = "Edwin Diaz";
        } else if (dLower.indexOf("juan") !== -1 || aLower.indexOf("calidad") !== -1) {
          dId = "dev_jd";
          if (!devName || devName === "Desarrollador Oficial") devName = "Juan David";
        } else if (dLower.indexOf("mocho") !== -1 || dLower.indexOf("jhon") !== -1 || dLower.indexOf("eyder") !== -1 || aLower.indexOf("tinto") !== -1) {
          dId = "dev_mocho";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jhon Eyder (Mocho)";
        } else if (dLower.indexOf("esteban") !== -1) {
          dId = "dev_ee";
          if (!devName || devName === "Desarrollador Oficial") devName = "Esteban Escobar";
        } else {
          dId = "dev_jg";
          if (!devName || devName === "Desarrollador Oficial") devName = "Jose Guzman";
        }

        supportTickets.push({
          id: "sup_" + code.replace(/[^a-zA-Z0-9]/g, "_"),
          code: code,
          createdAt: reqDateFormatted || new Date().toISOString(),
          type: normalizedType,
          appName: appName,
          appCode: appCode,
          devId: dId,
          devName: devName,
          requester: {
            name: reqName,
            role: "Planta STF",
            area: reqArea,
            email: emailReq,
            phone: phoneReq
          },
          title: title,
          description: desc,
          status: status,
          resolution: (status !== "pendiente" && observation) ? {
            action: status,
            resolvedBy: resolvedBy || devName,
            resolvedAt: resDateFormatted || new Date().toISOString(),
            observation: observation,
            etaHours: etaHours
          } : null
        });
      }
    }

    return createJsonResponse({
      status: "success",
      tasks: tasks,
      systems: systems,
      webSystems: webSystems,
      observations: observations,
      supportTickets: supportTickets
    });
  }

  // 4. Obtener Enlaces de Sistemas Web Publicados
  if (action === "get_sistemas_web") {
    var sWebOnly = getMasterSheet(ss, "SISTEMAS_WEB");
    var woRows = sWebOnly ? sWebOnly.getDataRange().getValues() : [];
    var webList = [];
    if (woRows.length > 1) {
      for (var wo = 1; wo < woRows.length; wo++) {
        var sysNameWO = String(woRows[wo][1] || "").trim();
        if (!sysNameWO || sysNameWO.toLowerCase() === "sistema_a_cargo" || sysNameWO.toLowerCase() === "nombre_aplicativo" || sysNameWO.toLowerCase() === "columna 2") continue;
        webList.push({
          devName: String(woRows[wo][0] || "").trim(),
          name: sysNameWO,
          webUrl: String(woRows[wo][2] || "").trim(),
          status: String(woRows[wo][3] || "").trim()
        });
      }
    }
    return createJsonResponse({ status: "success", webSystems: webList });
  }

  // 5. Obtener Historial de Observaciones por Tarea
  if (action === "get_observations") {
    var sObsOnly = getMasterSheet(ss, "OBSERVACIONES");
    var oOnlyRows = sObsOnly ? sObsOnly.getDataRange().getValues() : [];
    var obsOnlyList = [];
    if (oOnlyRows.length > 1) {
      for (var oo = 1; oo < oOnlyRows.length; oo++) {
        var rawDateOnly = oOnlyRows[oo][0];
        var dFormatted = (rawDateOnly instanceof Date)
          ? Utilities.formatDate(rawDateOnly, "America/Bogota", "yyyy-MM-dd HH:mm")
          : String(rawDateOnly || "").trim();
        var ooApp = String(oOnlyRows[oo][1] || "").trim();
        var ooDev = String(oOnlyRows[oo][2] || "").trim();
        var ooTask = String(oOnlyRows[oo][3] || "").trim();
        var ooImpact = String(oOnlyRows[oo][4] || "NORMAL").trim();
        var ooText = String(oOnlyRows[oo][5] || "").trim();

        if (!ooText && !ooTask) continue;
        if (ooTask.toLowerCase() === "tarea" && ooText.toLowerCase() === "observacion") continue;

        obsOnlyList.push({
          date: dFormatted,
          appName: ooApp,
          developer: ooDev,
          taskName: ooTask,
          impact: ooImpact,
          observation: ooText
        });
      }
    }
    return createJsonResponse({ status: "success", observations: obsOnlyList });
  }

  // 6. Obtener Lista Maestra de Operarios / Solicitantes para COLCHAS (Auto-relleno)
  if (action === "get_colchas_master" || action === "get_master_colchas") {
    var sColchas = ss.getSheetByName(TABS.MAESTRA_COLCHAS || "MAESTRA_SOLIC_STEC_COLCHAS");
    var masterList = [];
    if (sColchas) {
      var rows = sColchas.getDataRange().getValues();
      if (rows && rows.length > 1) {
        var hRow = rows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
        var idxNombre = 1; // Default Columna B (índice 1)
        var idxArea = 3;   // Default Columna D (índice 3)
        var idxCorreo = 4; // Default Columna E (índice 4)

        for (var c = 0; c < hRow.length; c++) {
          var h = hRow[c];
          if (h.indexOf("nombre") !== -1 || h.indexOf("solicitante") !== -1 || h.indexOf("operario") !== -1 || h.indexOf("cliente") !== -1 || h.indexOf("personal") !== -1) idxNombre = c;
          else if (h.indexOf("area") !== -1 || h.indexOf("área") !== -1 || h.indexOf("modulo") !== -1 || h.indexOf("módulo") !== -1 || h.indexOf("seccion") !== -1) idxArea = c;
          else if (h.indexOf("correo") !== -1 || h.indexOf("email") !== -1 || h.indexOf("mail") !== -1) idxCorreo = c;
        }

        for (var r = 1; r < rows.length; r++) {
          var nom = String(rows[r][idxNombre] !== undefined ? rows[r][idxNombre] : "").trim();
          if (!nom || nom.toLowerCase() === "nombre" || nom.toLowerCase() === "tu nombre completo") continue;
          var ar = String(rows[r][idxArea] !== undefined ? rows[r][idxArea] : "").trim();
          var mail = String(rows[r][idxCorreo] !== undefined ? rows[r][idxCorreo] : "").trim();
          masterList.push({
            nombre: nom,
            area: ar,
            correo: mail
          });
        }
      }
    }
    return createJsonResponse({
      status: "success",
      count: masterList.length,
      data: masterList
    });
  }

  return createJsonResponse({ status: "error", message: "Acción GET no reconocida" });
}

/**
 * DEFENSIVE APPEC HELPER:
 * Sanitiza valores de entrada para Google Sheets previniendo la inyección de fórmulas (Formula / CSV Injection).
 * Si el texto comienza con '=', '+', '-', '@', '\t' o '\r', antepone una comilla simple (') para forzar
 * su almacenamiento como cadena literal inofensiva en Google Sheets y en exportaciones a Excel.
 */

function doPost(e) {
  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
    } else {
      payload = e.parameter;
    }

    var action = payload.action || "log_update";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "America/Bogota", "yyyy-MM-dd HH:mm:ss");

    // =========================================================================
    // ACCIÓN 0: Autenticación Segura de Usuarios contra Hoja USUARIOS
    // =========================================================================
    if (action === "authenticate") {
      var checkUser = String(payload.username || "").trim().toLowerCase();
      var checkPass = String(payload.password || "").trim();

      if (!checkUser || !checkPass) {
        return createJsonResponse({ status: "error", authorized: false, message: "Usuario y contraseña requeridos" });
      }

      var sUsers = getMasterSheet(ss, "USUARIOS");
      var uRows = sUsers.getDataRange().getValues();
      if (uRows.length > 1) {
        var hRow = uRows[0].map(function (h) { return String(h || "").trim().toLowerCase(); });
        var idxPass = -1, idxUser = -1, idxRole = -1, idxEmail = -1, idxName = -1, idxAvatar = -1;
        for (var c = 0; c < hRow.length; c++) {
          var h = hRow[c];
          if (idxPass === -1 && (h === "id" || h.indexOf("pass") !== -1 || h.indexOf("clave") !== -1 || h.indexOf("contra") !== -1)) idxPass = c;
          else if (idxUser === -1 && (h.indexOf("usuario") !== -1 || h.indexOf("login") !== -1 || h === "user")) idxUser = c;
          else if (idxRole === -1 && (h.indexOf("rol") !== -1 || h.indexOf("role") !== -1 || h.indexOf("perfil") !== -1)) idxRole = c;
          else if (idxEmail === -1 && (h.indexOf("correo") !== -1 || h.indexOf("email") !== -1 || h.indexOf("mail") !== -1)) idxEmail = c;
          else if (idxName === -1 && (h.indexOf("nombre") !== -1 || h.indexOf("name") !== -1 || h.indexOf("desarrollador") !== -1)) idxName = c;
          else if (idxAvatar === -1 && (h.indexOf("avatar") !== -1 || h.indexOf("foto") !== -1 || h.indexOf("img") !== -1)) idxAvatar = c;
        }
        if (idxPass === -1) idxPass = 0;
        if (idxUser === -1) idxUser = 1;
        if (idxRole === -1) idxRole = 2;
        if (idxEmail === -1) idxEmail = 3;
        if (idxName === -1) idxName = 4;

        for (var r = 1; r < uRows.length; r++) {
          var rowUser = String(uRows[r][idxUser] || "").trim().toLowerCase();
          var rowPass = String(uRows[r][idxPass] || "").trim();
          var rowEmail = String(uRows[r][idxEmail] || "").trim().toLowerCase();

          if (rowUser === checkUser || rowEmail === checkUser) {
            if (rowPass === checkPass) {
              return createJsonResponse({
                status: "success",
                authorized: true,
                user: {
                  id: "dev_" + rowUser.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase(),
                  username: uRows[r][idxUser],
                  role: String(uRows[r][idxRole] || "desarrollador").trim(),
                  email: String(uRows[r][idxEmail] || "").trim(),
                  name: (idxName < uRows.length) ? String(uRows[r][idxName] || "").trim() : rowUser,
                  avatar: (idxAvatar !== -1 && idxAvatar < uRows[r].length) ? String(uRows[r][idxAvatar] || "").trim() : ""
                }
              });
            } else {
              return createJsonResponse({ status: "error", authorized: false, message: "Contraseña incorrecta" });
            }
          }
        }
      }
      return createJsonResponse({ status: "error", authorized: false, message: "Usuario no registrado" });
    }

    // =========================================================================
    // ACCIÓN 0.1: Alerta de Bloqueo de Seguridad por Intentos Fallidos
    // =========================================================================
    if (action === "security_lockout_alert") {
      return handleSecurityLockoutAlert(ss, payload);
    }

    // =========================================================================
    // ACCIÓN 0.2: Solicitud de Código OTP para Restablecer Contraseña
    // =========================================================================
    if (action === "request_password_reset") {
      return handleRequestPasswordReset(ss, payload);
    }

    // =========================================================================
    // ACCIÓN 0.3: Restablecimiento y Reemplazo de Contraseña en USUARIOS
    // =========================================================================
    if (action === "reset_password") {
      return handleResetPassword(ss, payload);
    }

    // =========================================================================
    // ACCIÓN 1: Registrar Asignación de Tarea & Enviar Correo Automático
    // =========================================================================
    if (action === "log_task") {
      var sTareas = getMasterSheet(ss, "TAREAS");
      ensureExactHeaders(sTareas, HEADERS.TAREAS);

      var cleanDeadline = formatDateToYMD(payload.deadline);

      // Insertar en CONTROL_TAREAS (9 Columnas exactas A:I sanitizadas contra inyección de fórmulas)
      sTareas.appendRow([
        sanitizeSheetInput(payload.taskName || ""),
        sanitizeSheetInput(payload.appName || ""),
        sanitizeSheetInput(payload.developer || ""),
        Number(payload.weight) || 15,
        cleanDeadline,
        "En Progreso",
        "Pendiente de Auditoría",
        dateStr,
        sanitizeSheetInput(payload.description || "Integración técnica asignada desde plataforma web.")
      ]);

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G)
      appendBitacoraRow(
        ss,
        dateStr,
        "Super Admin (Jefe TI)",
        "NUEVA_TAREA_ASIGNADA",
        payload.appName || "Sistema",
        "Tarea '" + payload.taskName + "' asignada a " + payload.developer + " (Plazo: " + cleanDeadline + ", Peso: +" + payload.weight + "%)",
        "OPERATIVO · v3.5"
      );

      // Enviar Correo Automático al Desarrollador si está habilitado
      var emailSent = { sent: false, recipient: "" };
      if (payload.sendEmail !== false) {
        emailSent = sendTaskAssignmentEmail(ss, payload);
      }

      return createJsonResponse({
        status: "success",
        message: "Tarea registrada en CONTROL_TAREAS exitosamente" + (emailSent.sent ? " y notificada por correo a " + emailSent.recipient : ""),
        emailSent: emailSent.sent,
        recipient: emailSent.recipient,
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN: Eliminar Tarea de CONTROL_TAREAS (Solo Super Admin)
    // =========================================================================
    if (action === "delete_task") {
      var sTareasDel = getMasterSheet(ss, "TAREAS");
      var deleted = false;
      var targetTaskName = String(payload.taskName || "").trim().toLowerCase();
      var targetTaskId = String(payload.taskId || "").trim().toLowerCase();

      if (sTareasDel) {
        var tDataDel = sTareasDel.getDataRange().getValues();
        for (var rd = tDataDel.length - 1; rd >= 1; rd--) {
          var rowTaskName = String(tDataDel[rd][0] || "").trim().toLowerCase();
          if ((targetTaskName && rowTaskName === targetTaskName) ||
              (targetTaskId && rowTaskName.indexOf(targetTaskId) !== -1)) {
            sTareasDel.deleteRow(rd + 1);
            deleted = true;
            break;
          }
        }
      }

      setupBitacoraSheet(ss);
      appendBitacoraRow(
        ss,
        "TAREAS",
        "ELIMINAR TAREA",
        payload.taskName || payload.taskId || "Tarea",
        "Super Admin TI",
        payload.developer || "Desarrollador",
        "Tarea eliminada definitivamente por el Administrador. Filas y estadísticas actualizadas."
      );

      return createJsonResponse({
        status: "success",
        message: deleted ? "Tarea eliminada exitosamente de CONTROL_TAREAS" : "Tarea procesada y retirada del registro",
        deleted: deleted,
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 2: Registrar Auditoría de Calidad (Actualiza CONTROL_TAREAS y BITACORA)
    // =========================================================================
    if (action === "log_audit") {
      var sTareas2 = getMasterSheet(ss, "TAREAS");
      ensureExactHeaders(sTareas2, HEADERS.TAREAS);
      var tData = sTareas2.getDataRange().getValues();
      var foundRow = -1;

      var targetTaskName = String(payload.taskName || "").trim().toLowerCase();
      var targetAppName = String(payload.appName || "").trim().toLowerCase();
      var targetDev = String(payload.developer || "").trim().toLowerCase();

      // 1. Buscar primero por nombre de tarea (Col A)
      for (var r = 1; r < tData.length; r++) {
        var rowTaskName = String(tData[r][0] || "").trim().toLowerCase();
        if (targetTaskName && rowTaskName === targetTaskName) {
          foundRow = r + 1;
          break;
        }
      }

      // 2. Fallback por Aplicativo + Desarrollador
      if (foundRow === -1) {
        for (var r2 = 1; r2 < tData.length; r2++) {
          var rApp = String(tData[r2][1] || "").toLowerCase();
          var rDev = String(tData[r2][2] || "").toLowerCase();
          if ((rDev.indexOf(targetDev) !== -1 || targetDev.indexOf(rDev) !== -1) &&
            (rApp.indexOf(targetAppName) !== -1 || targetAppName.indexOf(rApp) !== -1)) {
            foundRow = r2 + 1;
            break;
          }
        }
      }

      var scoreNum = Number(payload.score) || 95;
      var pointsAddedNum = Number(payload.pointsAdded) || 15;
      var scoreFormatted = scoreNum.toFixed(1) + "% (+" + pointsAddedNum.toFixed(1) + "%)";
      var auditNotes = payload.notes || "Implementación en planta validada con los operarios. Operatividad estable.";

      if (foundRow !== -1) {
        sTareas2.getRange(foundRow, 6).setValue("Auditada");        // Col F: Estado
        sTareas2.getRange(foundRow, 7).setValue(scoreFormatted);    // Col G: Evaluacion_Calidad
        sTareas2.getRange(foundRow, 8).setValue(dateStr);           // Col H: Fecha_Registro
        sTareas2.getRange(foundRow, 9).setValue(auditNotes);       // Col I: Observaciones_Auditoria
      }

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G)
      appendBitacoraRow(
        ss,
        dateStr,
        payload.evaluator || "Super Admin (Jefe TI)",
        "AUDITORIA_CALIFICADA",
        payload.appName || "Sistema",
        "Auditoría a " + payload.developer + (payload.taskName ? " [" + payload.taskName + "]" : "") + ": Nota " + scoreFormatted + ". " + auditNotes,
        "ALTO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Auditoría registrada y consolidada en CONTROL_TAREAS",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN: Registrar Observación de Tarea en HISTORIAL_OBSERVACIONES (6 Columnas A:F)
    // =========================================================================
    if (action === "log_observation") {
      var sObs = getMasterSheet(ss, "OBSERVACIONES");
      ensureExactHeaders(sObs, HEADERS.OBSERVACIONES);

      var obsDate = payload.date || dateStr;
      var obsApp = payload.appName || "Sistema";
      var obsDev = payload.developer || "Desarrollador";
      var obsTask = payload.taskName || "Tarea";
      var obsImpact = String(payload.impact || payload.severity || "NORMAL").toUpperCase();
      var obsText = payload.observation || payload.text || "";

      // Insertar en HISTORIAL_OBSERVACIONES (6 Columnas A:F)
      sObs.appendRow([
        obsDate,
        obsApp,
        obsDev,
        obsTask,
        obsImpact,
        obsText
      ]);

      // Formatear corporativamente
      formatCorporateSheet(sObs, "#312E81", [150, 190, 175, 230, 150, 380]);

      // Registrar en BITACORA_HISTORIAL (7 Columnas A:G) para trazabilidad central
      appendBitacoraRow(
        ss,
        dateStr,
        obsDev,
        "OBSERVACION_REGISTRADA",
        obsApp,
        "[" + obsTask + "] (" + obsImpact + ") " + obsText,
        obsImpact + " · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Observación registrada con éxito en HISTORIAL_OBSERVACIONES",
        date: obsDate
      });
    }

    // =========================================================================
    // ACCIÓN 3: Registrar Avance en Fases de Desarrollo (SISTEMAS_WEB + BITACORA)
    // =========================================================================
    if (action === "log_phase") {
      var sWebPh = getMasterSheet(ss, "SISTEMAS_WEB");
      if (sWebPh && payload.slaStatus) {
        var wData = sWebPh.getDataRange().getValues();
        var targetAppW = String(payload.appName || "").toLowerCase().trim();
        for (var w = 1; w < wData.length; w++) {
          var wSysName = String(wData[w][1] || "").toLowerCase().trim();
          if (wSysName === targetAppW || wSysName.indexOf(targetAppW) !== -1 || targetAppW.indexOf(wSysName) !== -1) {
            sWebPh.getRange(w + 1, 4).setValue(payload.slaStatus);
            break;
          }
        }
      }

      appendBitacoraRow(
        ss,
        dateStr,
        payload.developer || "Super Admin (Jefe TI)",
        "FASE_ACTUALIZADA",
        payload.appName || "Sistema",
        "Fase '" + payload.phaseName + "' actualizada al " + payload.progress + "%" + (payload.notes ? " (" + payload.notes + ")" : ""),
        "MEDIO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Avance de fase registrado exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 4: Sincronizar Directorio de Usuarios (USUARIOS + BITACORA)
    // =========================================================================
    if (action === "sync_users") {
      if (!isAuthorizedRequest(payload, e)) {
        return createJsonResponse({
          status: "unauthorized",
          authorized: false,
          message: "Acceso denegado: La sincronización del directorio de usuarios requiere clave de autorización (authKey)."
        });
      }
      var users = payload.users || [];
      if (users.length > 0) {
        var sU = getMasterSheet(ss, "USUARIOS");
        ensureExactHeaders(sU, HEADERS.USUARIOS);
        var lastRU = sU.getLastRow();
        if (lastRU > 1) {
          sU.getRange(2, 1, lastRU - 1, Math.max(7, sU.getLastColumn())).clearContent();
        }
        var OFFICIAL_MASTER_PASSWORDS = {
          "jose@guzman": "159",
          "juan@david": "2222",
          "esteban@escobar": "1111",
          "jhon@eyder": "4444",
          "ediaz": "Admin"
        };
        var uMatrix = [];
        for (var u = 0; u < users.length; u++) {
          var usr = users[u];
          var roleStr = usr.role || "desarrollador";
          var uUser = String(usr.username || "").toLowerCase().trim();
          var fixedPass = OFFICIAL_MASTER_PASSWORDS[uUser] || usr.idPassword || usr.id;
          if (!fixedPass || String(fixedPass).indexOf("dev_") === 0) {
            fixedPass = OFFICIAL_MASTER_PASSWORDS[uUser] || "159";
          }
          uMatrix.push([
            fixedPass,
            usr.username || "",
            roleStr,
            usr.email || "",
            usr.name || usr.username || "",
            String(roleStr).toLowerCase() === "admin" ? "ADMIN" : "ACTIVO",
            usr.avatar || ""
          ]);
        }
        sU.getRange(2, 1, uMatrix.length, 7).setValues(uMatrix);
        formatCorporateSheet(sU, "#0F172A", [120, 160, 130, 240, 180, 100, 240]);

        appendBitacoraRow(
          ss,
          dateStr,
          "Super Admin (Jefe TI)",
          "USUARIOS_SINCRONIZADOS",
          "Directorio de Usuarios",
          "Actualización de cuentas y credenciales en hoja USUARIOS (" + uMatrix.length + " usuarios activos).",
          "INFO · v3.5"
        );
      }

      return createJsonResponse({
        status: "success",
        message: "Hoja USUARIOS sincronizada exitosamente",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 5: Sincronización Maestra de las 5 Hojas Oficiales (sync_full_state)
    // Sincroniza SISTEMAS_WEB, CONTROL_TAREAS, HISTORIAL_OBSERVACIONES, USUARIOS y BITACORA_HISTORIAL
    // =========================================================================
    if (action === "sync_full_state") {
      if (!isAuthorizedRequest(payload, e)) {
        return createJsonResponse({
          status: "unauthorized",
          authorized: false,
          message: "Acceso denegado: La sincronización maestra total de hojas requiere clave de autorización (authKey)."
        });
      }
      var apps = (payload.applications || []).filter(function (a) {
        var n = String(a.name || "").toLowerCase().trim();
        return n !== "" && n !== "sistema_a_cargo" && n !== "nombre_aplicativo" && a.code !== "STF-SIS-99";
      });

      // 0. Eliminar definitivamente la pestaña obsoleta/vacía PORTAFOLIO_SISTEMAS si existe
      var sPortObs = ss.getSheetByName("PORTAFOLIO_SISTEMAS") || ss.getSheetByName("Estado_Sistemas") || ss.getSheetByName("Avances_Fases");
      if (sPortObs && ss.getSheets().length > 1) {
        try { ss.deleteSheet(sPortObs); } catch (e) { try { sPortObs.hideSheet(); } catch (e2) { } }
      }

      // 1. Actualizar SISTEMAS_WEB (4 Columnas A:D) eliminando "Columna 1..4" y filas duplicadas
      if (apps.length > 0) {
        var sWeb = getMasterSheet(ss, "SISTEMAS_WEB");
        if (sWeb) {
          // Rescatar URLs manuales existentes en la hoja
          var existingUrls = {};
          if (sWeb.getLastRow() > 1) {
            var wExisting = sWeb.getDataRange().getValues();
            for (var ew = 1; ew < wExisting.length; ew++) {
              var eName = String(wExisting[ew][1] || "").trim().toUpperCase();
              var eUrl = String(wExisting[ew][2] || "").trim();
              if (eName && eName !== "SISTEMA_A_CARGO" && eUrl && eUrl.toLowerCase() !== "url_sistema_web") {
                existingUrls[eName] = eUrl;
              }
            }
          }

          ensureExactHeaders(sWeb, HEADERS.SISTEMAS_WEB);
          var lastRW = sWeb.getLastRow();
          if (lastRW > 1) {
            sWeb.getRange(2, 1, lastRW - 1, Math.max(4, sWeb.getLastColumn())).clearContent();
            if (lastRW > apps.length + 1) {
              try {
                sWeb.deleteRows(apps.length + 2, lastRW - (apps.length + 1));
              } catch (e) { }
            }
          }

          var webMatrix = [];
          for (var w = 0; w < apps.length; w++) {
            var wp = apps[w];
            var uKey = String(wp.name || "").trim().toUpperCase();
            var finalUrl = wp.webUrl || existingUrls[uKey] || "";
            var isProdApp = (wp.stageId === "stage_prod") || (String(wp.slaStatus || "").indexOf("Producción") !== -1) ||
              (uKey === "CALIDAD" || uKey === "TINTORERIA" || uKey === "COLCHAS");
            webMatrix.push([
              wp.devName || "Equipo STF",
              wp.name || "",
              finalUrl,
              isProdApp ? "En Producción" : "En Construcción"
            ]);
          }
          sWeb.getRange(2, 1, webMatrix.length, 4).setValues(webMatrix);
          formatCorporateSheet(sWeb, "#14532D", [200, 230, 320, 140]);
        }
      }

      // 3. Actualizar CONTROL_TAREAS (9 Columnas Oficiales A:I)
      var tasksList = payload.integrations || [];
      if (tasksList.length > 0) {
        var sTar = getMasterSheet(ss, "TAREAS");
        ensureExactHeaders(sTar, HEADERS.TAREAS);
        var lastRT = sTar.getLastRow();
        if (lastRT > 1) {
          sTar.getRange(2, 1, lastRT - 1, Math.max(9, sTar.getLastColumn())).clearContent();
          if (lastRT > tasksList.length + 1) {
            try {
              sTar.deleteRows(tasksList.length + 2, lastRT - (tasksList.length + 1));
            } catch (e) { }
          }
        }

        var tMatrix = [];
        for (var ti = 0; ti < tasksList.length; ti++) {
          var tk = tasksList[ti];
          var isEvaluated = (tk.status === "evaluated") || (String(tk.status || "").toLowerCase().indexOf("audit") !== -1);
          var stateClean = isEvaluated ? "Auditada" : (String(tk.status || "").toLowerCase().indexOf("riesgo") !== -1 ? "En Riesgo" : "En Progreso");
          var qualText = "Pendiente de Auditoría";
          var obsText = tk.description || "En desarrollo activo en planta.";
          var regDateText = tk.createdDate || dateStr;

          if (tk.evaluation && typeof tk.evaluation === "object") {
            var qScore = Number(tk.evaluation.qualityScore) || 95;
            var pAdd = Number(tk.evaluation.pointsAdded) || Number(tk.weight) || 15;
            qualText = qScore.toFixed(1) + "% (+" + pAdd.toFixed(1) + "%)";
            obsText = tk.evaluation.notes || "Implementación en planta validada con los operarios. Operatividad estable.";
            if (tk.evaluation.evalDate) regDateText = tk.evaluation.evalDate + " 08:00:00";
          } else if (typeof tk.evaluation === "string" && tk.evaluation) {
            qualText = tk.evaluation.replace(/0\.(\d{2,3})%/, function (m, p) {
              return (parseFloat("0." + p) * 100).toFixed(1) + "%";
            });
          }

          var taskDeadline = formatDateToYMD(tk.deadline);

          tMatrix.push([
            tk.name || "",
            tk.appName || "Sistema",
            tk.devName || "Desarrollador",
            Number(tk.weight) || 15,
            taskDeadline,
            stateClean,
            qualText,
            regDateText,
            obsText
          ]);
        }
        sTar.getRange(2, 1, tMatrix.length, 9).setValues(tMatrix);
        if (sTar.getLastColumn() > 9) {
          sTar.getRange(1, 10, sTar.getLastRow(), sTar.getLastColumn() - 9).clearContent();
        }
        formatCorporateSheet(sTar, "#854D0E", [260, 180, 160, 110, 120, 125, 150, 150, 300]);
      }

      // 4. Sincronizar USUARIOS si vienen en el payload (garantizando contraseñas oficiales fijas)
      if (Array.isArray(payload.users) && payload.users.length > 0) {
        var sUsr = getMasterSheet(ss, "USUARIOS");
        ensureExactHeaders(sUsr, HEADERS.USUARIOS);
        var lastRUsr = sUsr.getLastRow();
        if (lastRUsr > 1) {
          sUsr.getRange(2, 1, lastRUsr - 1, Math.max(7, sUsr.getLastColumn())).clearContent();
        }
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
        var usrRows = payload.users.map(function (u) {
          var r = u.role || "desarrollador";
          var uUser = String(u.username || "").toLowerCase().trim();
          var fixedPass = OFFICIAL_MASTER_PASSWORDS[uUser] || u.idPassword || u.id;
          if (!fixedPass || String(fixedPass).indexOf("dev_") === 0) {
            fixedPass = OFFICIAL_MASTER_PASSWORDS[uUser] || "159";
          }
          return [
            fixedPass,
            u.username || "",
            r,
            u.email || "",
            u.name || u.username || "",
            String(r).toLowerCase() === "admin" ? "ADMIN" : "ACTIVO",
            u.avatar || ""
          ];
        });
        sUsr.getRange(2, 1, usrRows.length, 7).setValues(usrRows);
        formatCorporateSheet(sUsr, "#0F172A", [120, 160, 130, 240, 180, 100, 240]);
      }

      // 5. Sincronizar HISTORIAL_OBSERVACIONES si vienen observaciones en el payload
      var obsList = payload.observations || [];
      if (obsList.length > 0) {
        var sObsFull = getMasterSheet(ss, "OBSERVACIONES");
        ensureExactHeaders(sObsFull, HEADERS.OBSERVACIONES);
        var lastRObsFull = sObsFull.getLastRow();
        if (lastRObsFull > 1) {
          sObsFull.getRange(2, 1, lastRObsFull - 1, Math.max(6, sObsFull.getLastColumn())).clearContent();
          if (lastRObsFull > obsList.length + 1) {
            try {
              sObsFull.deleteRows(obsList.length + 2, lastRObsFull - (obsList.length + 1));
            } catch (e) { }
          }
        }
        var obsFullMatrix = obsList.map(function (o) {
          return [
            o.date || dateStr,
            o.appName || "Sistema",
            o.developer || o.author || "Desarrollador",
            o.taskName || "Tarea",
            String(o.impact || o.severity || "NORMAL").toUpperCase(),
            o.observation || o.text || ""
          ];
        });
        sObsFull.getRange(2, 1, obsFullMatrix.length, 6).setValues(obsFullMatrix);
        formatCorporateSheet(sObsFull, "#312E81", [150, 190, 175, 230, 150, 380]);
      }

      // 5. Reparar y registrar en BITACORA_HISTORIAL
      setupBitacoraSheet(ss);
      appendBitacoraRow(
        ss,
        dateStr,
        payload.user || "Super Admin (Jefe TI)",
        "SINCRONIZACION_MAESTRA",
        "Portafolio STF GROUP",
        "Sincronización integral de las 5 hojas maestras (" + apps.length + " sistemas, " + tasksList.length + " tareas y " + obsList.length + " observaciones verificadas).",
        "ALTO · v3.5"
      );

      return createJsonResponse({
        status: "success",
        message: "Las 5 hojas maestras oficiales (USUARIOS, SISTEMAS_WEB, CONTROL_TAREAS, HISTORIAL_OBSERVACIONES, BITACORA_HISTORIAL) han sido estabilizadas y sincronizadas.",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 6: Registro General en Bitácora (Login, Nuevos Aplicativos, Config TI)
    // =========================================================================
    if (action === "log_update") {
      setupBitacoraSheet(ss);
      appendBitacoraRow(
        ss,
        dateStr,
        payload.developer || "Sistema STF",
        payload.eventType || "ACTUALIZACION",
        payload.appName || "Global",
        payload.description || "Cambio operativo registrado",
        (payload.impact || "INFO") + " · " + (payload.version || "v3.5")
      );

      return createJsonResponse({
        status: "success",
        message: "Evento registrado en BITACORA_HISTORIAL",
        date: dateStr
      });
    }

    // =========================================================================
    // ACCIÓN 7: Registrar Solicitud de Soporte / Actualización (SOLICITUDES_SOPORTE)
    // =========================================================================
    if (action === "log_support_ticket") {
      var sSoporte = getMasterSheet(ss, "SOPORTE");
      ensureExactHeaders(sSoporte, HEADERS.SOPORTE);

      var ticketCode = payload.ticketCode || payload.ticketId || ("STF-SUP-" + Math.floor(1000 + Math.random() * 9000));
      var tipoTxt = payload.type === 'actualizacion' ? 'Actualización' : 'Soporte Técnico';
      var reqDate = payload.createdAt ? Utilities.formatDate(new Date(payload.createdAt), "America/Bogota", "yyyy-MM-dd HH:mm:ss") : dateStr;

      // Auto-asignación garantizada por aplicativo si viene genérico o vacío
      var resolvedDev = payload.devName || '';
      var aNorm = String((payload.appName || '') + ' ' + (payload.appCode || '')).toLowerCase();
      if (!resolvedDev || resolvedDev === 'Desarrollador Oficial' || resolvedDev === 'Sistema STF') {
        if (aNorm.indexOf('calidad') !== -1) resolvedDev = 'Juan David';
        else if (aNorm.indexOf('tinto') !== -1) resolvedDev = 'Jhon Eyder (Mocho)';
        else if (aNorm.indexOf('esteban') !== -1) resolvedDev = 'Esteban Escobar';
        else resolvedDev = 'Jose Guzman';
      }

      // Estructura Oficial: 16 Columnas A:P (Blindada contra inyección de fórmulas)
      var rowData = [
        sanitizeSheetInput(ticketCode),
        reqDate,
        tipoTxt,
        sanitizeSheetInput(payload.appName || ''),
        sanitizeSheetInput(payload.appCode || ''),
        sanitizeSheetInput(payload.requesterName || 'Operario de Planta'),
        sanitizeSheetInput(payload.requesterArea || 'Planta STF'),
        sanitizeSheetInput(payload.title || ''),
        sanitizeSheetInput(payload.description || ''),
        sanitizeSheetInput(resolvedDev),
        'Pendiente',
        '', // Fecha_Respuesta
        '', // Observacion_Desarrollador
        '', // Tiempo_Estimado_ETA
        '',  // Resuelto_Por
        sanitizeSheetInput(payload.requesterEmail || '')
      ];

      try {
        sSoporte.appendRow(rowData);
      } catch (eApp) {
        try {
          sSoporte.appendRow(rowData.slice(0, 15));
          var newR = sSoporte.getLastRow();
          if (payload.requesterEmail) sSoporte.getRange(newR, 16).setValue(payload.requesterEmail);
        } catch (eFallback) {
          Logger.log("Row append fallback: " + eFallback.toString());
        }
      }

      // =======================================================================
      // AUTOMATIZACIÓN 1: Enviar Correo de Confirmación al Operario y Alerta al Dev
      // =======================================================================
      var emailDispatch = sendSupportConfirmationEmail(ss, payload, ticketCode, tipoTxt);

      appendBitacoraRow(
        ss,
        dateStr,
        (payload.requesterName || "Planta") + " (" + (payload.appName || "Sistema") + ")",
        payload.type === 'actualizacion' ? "SOLICITUD_ACTUALIZACION" : "SOLICITUD_SOPORTE_TECNICO",
        payload.appName || "Planta",
        "[" + tipoTxt.toUpperCase() + "] " + (payload.title || '') + " -> Asignado a " + (payload.devName || 'Desarrollador') +
        (payload.requesterEmail ? " | Email: " + payload.requesterEmail : ""),
        "PLANTA · v1.0"
      );

      return createJsonResponse({
        status: "success",
        ticketCode: ticketCode,
        message: "Solicitud de planta registrada exitosamente en SOLICITUDES_SOPORTE",
        emailResult: emailDispatch,
        date: dateStr
      });
    }

    // ACCIÓN 10: Eliminar Columna Telefono_SMS
    if (action === "delete_sms_column") {
      if (!isAuthorizedRequest(payload, e)) {
        return createJsonResponse({
          status: "unauthorized",
          authorized: false,
          message: "Acceso denegado: Modificación estructural de columnas requiere clave de autorización (authKey)."
        });
      }
      eliminarColumnaTelefonoSMS();
      return createJsonResponse({
        status: "success",
        message: "Columna Telefono_SMS procesada exitosamente"
      });
    }

    // =========================================================================
    // ACCIÓN 8: Oficializar Dictamen de Soporte (Aceptar / Rechazar con Observación & Foto)
    // =========================================================================
    if (action === "resolve_support_ticket") {
      var sSoporte = getMasterSheet(ss, "SOPORTE");
      ensureExactHeaders(sSoporte, HEADERS.SOPORTE);

      var targetCode = String(payload.ticketCode || payload.ticketId || '').trim();
      var lastRow = sSoporte.getLastRow();
      var foundRow = -1;

      if (lastRow > 1) {
        var ids = sSoporte.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var r = 0; r < ids.length; r++) {
          if (String(ids[r][0]).trim().toUpperCase() === targetCode.toUpperCase()) {
            foundRow = r + 2;
            break;
          }
        }
      }

      var decisionText = payload.decision === 'aceptada' ? 'Aceptada' : 'Rechazada';
      var resDate = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

      // Procesar y decodificar evidencia fotográfica si fue adjuntada
      var imageBlob = null;
      var imageUrl = "";
      if (payload.evidenceImage && String(payload.evidenceImage).indexOf('data:image') !== -1) {
        try {
          var parts = payload.evidenceImage.split(',');
          var meta = parts[0];
          var base64Data = parts[1];
          var contentType = "image/jpeg";
          if (meta.indexOf("image/png") !== -1) contentType = "image/png";
          else if (meta.indexOf("image/webp") !== -1) contentType = "image/webp";

          var decoded = Utilities.base64Decode(base64Data);
          var fileName = payload.evidenceImageName || ("evidencia_" + targetCode + "_" + (payload.decision || "rechazo") + ".jpg");
          imageBlob = Utilities.newBlob(decoded, contentType, fileName);

          // Intentar almacenar la imagen en la carpeta oficial designada de Google Drive
          try {
            var folder = getOfficialDriveEvidenceFolder();
            var driveFile = folder.createFile(imageBlob);
            // 🔒 SEGURIDAD: Restringir acceso al dominio de la organización en lugar de público abierto
            try {
              driveFile.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
            } catch (eShare) {
              Logger.log("Restricción de acceso en Drive aplicada: " + eShare.toString());
            }
            imageUrl = driveFile.getUrl();
          } catch (eDrive) {
            Logger.log("Drive folder/file error (continuando con Blob directo): " + eDrive.toString());
          }
        } catch (eImg) {
          Logger.log("Image decode error: " + eImg.toString());
        }
      }

      // Obtener o consolidar correo del solicitante
      var reqEmail = String(payload.requesterEmail || (foundRow > 0 ? sSoporte.getRange(foundRow, 16).getValue() : '') || '').trim();

      if (foundRow > 0) {
        // Col K(11): Estado, Col L(12): Fecha_Respuesta, Col M(13): Observacion, Col N(14): ETA, Col O(15): Resuelto_Por
        sSoporte.getRange(foundRow, 11).setValue(decisionText);
        sSoporte.getRange(foundRow, 12).setValue(resDate);
        sSoporte.getRange(foundRow, 13).setValue(sanitizeSheetInput(payload.observation || ''));
        sSoporte.getRange(foundRow, 14).setValue(payload.etaHours || '');
        sSoporte.getRange(foundRow, 15).setValue(sanitizeSheetInput(payload.resolvedBy || 'Desarrollador'));
        if (reqEmail) {
          sSoporte.getRange(foundRow, 16).setValue(sanitizeSheetInput(reqEmail));
        }
        if (imageUrl || imageBlob) {
          sSoporte.getRange(foundRow, 17).setValue(imageUrl || "Foto Adjunta en Correo");
        }
      } else {
        sSoporte.appendRow([
          targetCode || ("STF-SUP-" + Math.floor(1000 + Math.random() * 9000)),
          payload.createdAt || resDate,
          payload.type === 'actualizacion' ? 'Actualización' : 'Soporte Técnico',
          payload.appName || '',
          payload.appCode || '',
          payload.requesterName || 'Operario de Planta',
          payload.requesterArea || 'Planta STF',
          payload.title || '',
          payload.description || '',
          payload.devName || 'Desarrollador Oficial',
          decisionText,
          resDate,
          payload.observation || '',
          payload.etaHours || '',
          payload.resolvedBy || 'Desarrollador',
          reqEmail,
          imageUrl || (imageBlob ? "Foto Adjunta en Correo" : "")
        ]);
      }

      // Enviar correo automático formal al solicitante con dictamen y foto adjunta
      var emailResult = { sent: false };
      if (reqEmail && reqEmail.indexOf("@") !== -1) {
        emailResult = sendSupportResolutionEmail(ss, payload, targetCode, decisionText, resDate, imageBlob, imageUrl, reqEmail);
      }

      appendBitacoraRow(
        ss,
        dateStr,
        payload.resolvedBy || "Desarrollador",
        payload.decision === 'aceptada' ? "SOPORTE_ACEPTADO" : "SOPORTE_RECHAZADO",
        payload.appName || "Soporte",
        "Ticket " + targetCode + " marcado como " + decisionText + ": " + (payload.observation || '') +
        (reqEmail ? " · Notificado por correo a: " + reqEmail : "") +
        (imageBlob ? " [Con Evidencia Fotográfica Adjunta]" : ""),
        "SOPORTE · v1.5"
      );

      return createJsonResponse({
        status: "success",
        ticketCode: targetCode,
        decision: decisionText,
        emailSent: emailResult.sent,
        recipient: reqEmail,
        hasPhoto: !!imageBlob,
        driveUrl: imageUrl,
        message: "Dictamen de soporte y correo procesados exitosamente",
        date: dateStr
      });
    }

    // ACCIÓN 9: Limpiar Solicitudes de Soporte de Prueba (Dejar en 0)
    if (action === "clear_support_tickets") {
      if (!isAuthorizedRequest(payload, e)) {
        return createJsonResponse({
          status: "unauthorized",
          authorized: false,
          message: "Acceso denegado: El vaciado masivo de solicitudes de soporte requiere clave de autorización (authKey)."
        });
      }
      var sSup = getMasterSheet(ss, "SOPORTE");
      var deleted = 0;
      if (sSup && sSup.getLastRow() > 1) {
        deleted = sSup.getLastRow() - 1;
        sSup.deleteRows(2, deleted);
      }
      return createJsonResponse({
        status: "success",
        deleted: deleted,
        message: "Hoja SOLICITUDES_SOPORTE restablecida en 0 registros exitosamente"
      });
    }

    return createJsonResponse({ status: "error", message: "Acción '" + action + "' desconocida" });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Función auxiliar para buscar el correo y enviar notificación HTML
 */
