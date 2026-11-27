/**
 * ============================================================================
 * STF GROUP · SERVICIO DE NOTIFICACIONES POR CORREO ELECTRÓNICO (GMAIL)
 * ============================================================================
 */

function sendTaskAssignmentEmail(ss, payload) {
  var devName = payload.developer || "Desarrollador";
  var targetEmail = (payload.email || "").trim();

  if (!targetEmail) {
    var sUsers = getMasterSheet(ss, "USUARIOS");
    var uValues = sUsers.getDataRange().getValues();
    var search = devName.toLowerCase().trim();

    for (var u = 1; u < uValues.length; u++) {
      var rUser = String(uValues[u][1] || "").toLowerCase().trim();
      var rEmail = String(uValues[u][3] || "").trim();
      var rName = String(uValues[u][4] || "").toLowerCase().trim();

      if (rName.indexOf(search) !== -1 || search.indexOf(rName) !== -1 ||
        rUser.indexOf(search) !== -1 || search.indexOf(rUser) !== -1 ||
        (search.indexOf("jose") !== -1 && rUser.indexOf("jose") !== -1)) {
        if (rEmail && rEmail.indexOf("@") !== -1) {
          targetEmail = rEmail;
          break;
        }
      }
    }
  }

  if (!targetEmail) {
    var sLower = devName.toLowerCase();
    if (sLower.indexOf("jose") !== -1 || sLower.indexOf("guzman") !== -1) targetEmail = "joseoneiber711@gmail.com";
    else if (sLower.indexOf("juan") !== -1) targetEmail = "juan.david@studiof.com.co";
    else if (sLower.indexOf("esteban") !== -1) targetEmail = "esteban.escobar@studiof.com.co";
    else if (sLower.indexOf("mocho") !== -1 || sLower.indexOf("jhon") !== -1) targetEmail = "jhon.eyder@studiof.com.co";
  }

  if (targetEmail && targetEmail.indexOf("@") !== -1) {
    try {
      var subject = "⚡ Nueva Tarea Asignada: " + (payload.taskName || "Módulo") + " · STF GROUP";
      var html = "" +
        "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);\">" +
        "<div style=\"background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 24px; color: #FFFFFF; text-align: left;\">" +
        "<div style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 8px;\">STF GROUP · CONTROL TI</div>" +
        "<h2 style=\"margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF;\">Nueva Tarea / Integración Asignada</h2>" +
        "<p style=\"margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;\">El Administrador te ha cargado una nueva responsabilidad en planta.</p>" +
        "</div>" +
        "<div style=\"padding: 24px;\">" +
        "<p style=\"font-size: 15px; color: #1E293B; margin-top: 0;\">Hola <strong>" + devName + "</strong>,</p>" +
        "<p style=\"font-size: 13.5px; color: #475569; line-height: 1.5;\">Se te ha asignado una nueva integración en la plataforma:</p>" +
        "<div style=\"background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;\">" +
        "<div style=\"font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;\">Nombre de la Tarea</div>" +
        "<div style=\"font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 14px;\">" + (payload.taskName || "Módulo") + "</div>" +
        "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">" +
        "<tr><td style=\"padding: 6px 0; color: #64748B;\">📁 <strong>Aplicativo:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #1E293B;\">" + (payload.appName || "Sistema") + "</td></tr>" +
        "<tr><td style=\"padding: 6px 0; color: #64748B;\">⚖️ <strong>Ponderación:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #4E65FF;\">+" + (payload.weight || 15) + "% al avance del sistema</td></tr>" +
        "<tr><td style=\"padding: 6px 0; color: #64748B;\">📅 <strong>Fecha Límite:</strong></td><td style=\"padding: 6px 0; font-weight: 700; color: #EF4444;\">" + (payload.deadline || "Próximamente") + "</td></tr>" +
        "</table>" +
        "</div>" +
        "<div style=\"text-align: center; margin: 24px 0;\">" +
        "<a href=\"https://stf-oficina-aplicativos.vercel.app\" style=\"display: inline-block; background: #4E65FF; color: #FFFFFF; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 14px rgba(78, 101, 255, 0.35);\">Ingresar a la Plataforma STF</a>" +
        "</div>" +
        "<p style=\"font-size: 12px; color: #94A3B8; text-align: center; margin: 0;\">Este es un correo automático generado por el Sistema de Supervisión STF GROUP.</p>" +
        "</div>" +
        "</div>";

      MailApp.sendEmail({
        to: targetEmail,
        subject: subject,
        htmlBody: html
      });
      return { sent: true, recipient: targetEmail };
    } catch (e) {
      return { sent: false, error: e.toString() };
    }
  }
  return { sent: false, reason: "Sin correo válido" };
}

/**
 * AUTOMATIZACIÓN 1: Enviar Correo de Confirmación de Ticket al Solicitante y Alerta al Dev
 */
function sendSupportConfirmationEmail(ss, payload, ticketCode, tipoTxt) {
  var results = { requesterSent: false, devSent: false };
  var reqEmail = (payload.requesterEmail || "").trim();
  var appName = payload.appName || "Sistema Industrial";
  var devName = payload.devName || "Jose Guzman";

  // 1. Correo Formal al Solicitante de Planta
  if (reqEmail && reqEmail.indexOf("@") !== -1) {
    try {
      var subjectReq = "🎟️ Radicado Oficial: " + ticketCode + " · " + tipoTxt + " en " + appName + " (STF GROUP)";
      var htmlReq = "" +
        "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; overflow: hidden; color: #FFFFFF;\">" +
        "<div style=\"background: linear-gradient(135deg, #07090e 0%, #1e1b4b 100%); padding: 26px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center;\">" +
        "<div style=\"font-size: 11px; font-weight: 800; color: #fbbf24; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px;\">● STF GROUP · TERMINAL DE SOPORTE PLANTA</div>" +
        "<h2 style=\"margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em;\">¡Solicitud Radicada con Éxito!</h2>" +
        "<p style=\"margin: 8px 0 0 0; font-size: 13px; color: #94A3B8;\">Tu requerimiento ha sido registrado en tiempo real en la hoja oficial de ingeniería.</p>" +
        "</div>" +
        "<div style=\"padding: 24px;\">" +
        "<div style=\"background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 18px; margin-bottom: 20px;\">" +
        "<table style=\"width: 100%; border-collapse: collapse; font-size: 13.5px; color: #FFFFFF;\">" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">📋 <strong>Radicado Oficial:</strong></td><td style=\"padding: 7px 0; font-weight: 800; color: #fbbf24; font-family: monospace; font-size: 15px;\">" + ticketCode + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">⚙️ <strong>Tipo:</strong></td><td style=\"padding: 7px 0; font-weight: 700;\">" + tipoTxt + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">🏢 <strong>Aplicativo:</strong></td><td style=\"padding: 7px 0; font-weight: 700;\">" + appName + " (" + (payload.appCode || '') + ")</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">👤 <strong>Solicitante:</strong></td><td style=\"padding: 7px 0;\">" + (payload.requesterName || '') + " · " + (payload.requesterArea || '') + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">💻 <strong>Desarrollador Asignado:</strong></td><td style=\"padding: 7px 0; font-weight: 700; color: #38bdf8;\">" + devName + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">📌 <strong>Título:</strong></td><td style=\"padding: 7px 0; font-weight: 600;\">" + (payload.title || '') + "</td></tr>" +
        "<tr><td style=\"padding: 7px 0; color: #94A3B8;\">⏳ <strong>Estado Actual:</strong></td><td style=\"padding: 7px 0; font-weight: 700; color: #fbbf24;\">Pendiente de Dictamen</td></tr>" +
        "</table>" +
        "</div>" +
        "<p style=\"font-size: 12.5px; color: #94A3B8; line-height: 1.5; margin: 0 0 16px 0;\">Tan pronto el programador revise el caso y determine la solución, recibirás la respuesta formal directamente a este correo.</p>" +
        "<div style=\"text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;\">" +
        "<p style=\"font-size: 11px; color: #64748B; margin: 0;\">STF GROUP S.A. · Dirección de Tecnologías de Información & Desarrollo de Software</p>" +
        "</div>" +
        "</div>" +
        "</div>";

      MailApp.sendEmail({
        to: reqEmail,
        subject: subjectReq,
        htmlBody: htmlReq
      });
      results.requesterSent = true;
    } catch (errReq) {
      results.requesterError = errReq.toString();
    }
  }

  // 2. Alerta Inmediata al Desarrollador Responsable
  try {
    var devEmail = "";
    var sLower = devName.toLowerCase();
    if (sLower.indexOf("jose") !== -1 || sLower.indexOf("guzman") !== -1) devEmail = "joseoneiber711@gmail.com";
    else if (sLower.indexOf("juan") !== -1) devEmail = "juan.david@studiof.com.co";
    else if (sLower.indexOf("mocho") !== -1 || sLower.indexOf("jhon") !== -1) devEmail = "jhon.eyder@studiof.com.co";

    if (devEmail) {
      var subjectDev = "🚨 [PLANTA] Nueva Solicitud " + ticketCode + " en " + appName + " (" + (payload.title || 'Novedad') + ")";
      var htmlDev = "" +
        "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px;\">" +
        "<div style=\"border-bottom: 2px solid #F59E0B; padding-bottom: 12px; margin-bottom: 16px;\">" +
        "<span style=\"background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;\">NOVEDAD DE PLANTA</span>" +
        "<h3 style=\"margin: 8px 0 0 0; color: #0F172A;\">" + (payload.title || 'Solicitud de Planta') + "</h3>" +
        "</div>" +
        "<p>Hola <strong>" + devName + "</strong>, se ha radicado una nueva solicitud para tu aplicativo:</p>" +
        "<ul>" +
        "<li><strong>Radicado:</strong> " + ticketCode + "</li>" +
        "<li><strong>Sistema:</strong> " + appName + "</li>" +
        "<li><strong>Tipo:</strong> " + tipoTxt + "</li>" +
        "<li><strong>Solicitante:</strong> " + (payload.requesterName || '') + " (" + (payload.requesterArea || '') + ")</li>" +
        (reqEmail ? "<li><strong>Correo Solicitante:</strong> " + reqEmail + "</li>" : "") +
        (payload.requesterPhone ? "<li><strong>Celular / SMS:</strong> " + payload.requesterPhone + "</li>" : "") +
        "<li><strong>Descripción:</strong> " + (payload.description || '') + "</li>" +
        "</ul>" +
        "<p style=\"text-align: center; margin-top: 20px;\">" +
        "<a href=\"https://stf-oficina-aplicativos.vercel.app\" style=\"background: #4F46E5; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Abrir Bandeja de Soporte</a>" +
        "</p>" +
        "</div>";

      MailApp.sendEmail({
        to: devEmail,
        subject: subjectDev,
        htmlBody: htmlDev
      });
      results.devSent = true;
    }
  } catch (errDev) {
    results.devError = errDev.toString();
  }

  return results;
}

/**
 * AUTOMATIZACIÓN 2: Enviar Notificación de Dictamen Oficial al Solicitante (Aceptada / Rechazada)
 * Incluye la causa técnica, tiempo de atención u observación y la fotografía de evidencia adjunta.
 */
function sendSupportResolutionEmail(ss, payload, ticketCode, decisionText, resDate, imageBlob, imageUrl, explicitEmail) {
  var targetEmail = (explicitEmail || payload.requesterEmail || "").trim();
  if (!targetEmail || targetEmail.indexOf("@") === -1) {
    return { sent: false, reason: "Sin correo válido del solicitante" };
  }

  var isRejected = (payload.decision === 'rechazada' || decisionText.toLowerCase().indexOf('rechaz') !== -1);
  var appName = payload.appName || "Sistema Industrial STF";
  var reqName = payload.requesterName || "Solicitante de Planta";
  var reqArea = payload.requesterArea || "Planta STF";
  var devName = payload.resolvedBy || "Desarrollador Oficial";
  var title = payload.title || "Solicitud de Soporte / Novedad Técnica";
  var observation = payload.observation || (isRejected ? "Solicitud evaluada y rechazada según parametrización técnica." : "Solicitud aceptada para atención.");
  var etaHours = payload.etaHours || "";

  var statusColor = isRejected ? "#DC2626" : "#059669";
  var statusBg = isRejected ? "#FEF2F2" : "#ECFDF5";
  var statusBorder = isRejected ? "#F87171" : "#34D399";
  var statusBadgeText = isRejected ? "✕ RECHAZADA (SOLUCIÓN VALIDADA / NO PROCEDE)" : "✓ ACEPTADA (EN ATENCIÓN TÉCNICA)";

  var subject = (isRejected ? "🔴 [STF SOPORTE] Dictamen Oficial: " : "🟢 [STF SOPORTE] Dictamen Oficial: ") +
    ticketCode + " · " + (isRejected ? "Rechazada" : "Aceptada") + " en " + appName;

  var html = "" +
    "<div style=\"font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08);\">" +
    // Cabecera Institucional
    "<div style=\"background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%); padding: 26px 24px; color: #FFFFFF; text-align: left;\">" +
    "<div style=\"display: inline-block; background: " + (isRejected ? "#EF4444" : "#10B981") + "; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.6px; margin-bottom: 8px; text-transform: uppercase;\">" +
    "STF GROUP · BANDEJA DE SOPORTE PLANTA" +
    "</div>" +
    "<h2 style=\"margin: 0; font-size: 21px; font-weight: 800; color: #FFFFFF;\">Respuesta a Solicitud de Soporte Técnico</h2>" +
    "<p style=\"margin: 6px 0 0 0; font-size: 13px; color: #94A3B8;\">El programador a cargo ha emitido el dictamen técnico formal para tu requerimiento.</p>" +
    "</div>" +

    // Cuerpo
    "<div style=\"padding: 24px;\">" +
    "<p style=\"font-size: 14.5px; color: #1E293B; margin-top: 0;\">Hola <strong>" + reqName + "</strong> (" + reqArea + "),</p>" +
    "<p style=\"font-size: 13.5px; color: #475569; line-height: 1.5;\">Te notificamos la respuesta oficial al ticket radicado en planta:</p>" +

    // Estado Destacado
    "<div style=\"background: " + statusBg + "; border: 1.5px solid " + statusBorder + "; border-radius: 12px; padding: 14px 18px; margin: 16px 0; display: flex; align-items: center; justify-content: space-between;\">" +
    "<div>" +
    "<span style=\"font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; display: block; margin-bottom: 2px;\">Estado del Requerimiento</span>" +
    "<strong style=\"font-size: 15px; color: " + statusColor + "; font-weight: 800;\">" + statusBadgeText + "</strong>" +
    "</div>" +
    "<div style=\"text-align: right;\">" +
    "<span style=\"font-size: 11px; font-weight: 700; color: #64748B; display: block;\">Radicado</span>" +
    "<span style=\"font-family: monospace; font-weight: 800; font-size: 14px; color: #0F172A;\">" + ticketCode + "</span>" +
    "</div>" +
    "</div>" +

    // Observación / Respuesta del Desarrollador (Causa del rechazo o solución)
    "<div style=\"background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 16px 18px; margin: 18px 0;\">" +
    "<div style=\"font-size: 11.5px; font-weight: 800; color: #B45309; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;\">" +
    "📝 Observación / Causa Técnica del Desarrollador:" +
    "</div>" +
    "<div style=\"font-size: 14px; color: #1E293B; font-weight: 600; line-height: 1.6;\">" +
    "\"" + observation + "\"" +
    "</div>" +
    (etaHours ? "<div style=\"font-size: 12px; color: #78350F; margin-top: 8px; font-weight: 600;\">⏱️ Tiempo estimado: " + etaHours + "</div>" : "") +
    "</div>" +

    // Evidencia Fotográfica (Incrustada y como Archivo Adjunto)
    (imageBlob || imageUrl ? (
      "<div style=\"background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; margin: 20px 0;\">" +
      "<div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;\">" +
      "<div style=\"font-size: 13px; font-weight: 800; color: #0F172A;\">📷 Evidencia Fotográfica / Captura de Validación:</div>" +
      "<span style=\"font-size: 11px; background: #EEF2FF; color: #4F46E5; padding: 2px 8px; border-radius: 6px; font-weight: 700;\">Adjunto en el correo</span>" +
      "</div>" +
      "<p style=\"font-size: 12px; color: #64748B; margin: 0 0 12px 0;\">El desarrollador adjuntó la siguiente fotografía para certificar que el aplicativo ya opera correctamente o sustentar el motivo de rechazo:</p>" +
      "<div style=\"text-align: center; background: #0F172A; border-radius: 10px; padding: 10px; overflow: hidden;\">" +
      (imageBlob ? "<img src=\"cid:evidenciaFoto\" style=\"max-width: 100%; height: auto; max-height: 460px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.3);\" alt=\"Evidencia Fotográfica de Soporte\">" : "") +
      "</div>" +
      (imageUrl ? ("<div style=\"text-align: center; margin-top: 10px;\"><a href=\"" + imageUrl + "\" target=\"_blank\" style=\"font-size: 12px; color: #4F46E5; font-weight: 700; text-decoration: underline;\">Ver fotografía en resolución completa en Google Drive ↗</a></div>") : "") +
      "</div>"
    ) : "") +

    // Tabla de Detalle
    "<div style=\"background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin: 18px 0;\">" +
    "<table style=\"width: 100%; border-collapse: collapse; font-size: 13px;\">" +
    "<tr><td style=\"padding: 5px 0; color: #64748B;\">🏢 <strong>Sistema:</strong></td><td style=\"padding: 5px 0; font-weight: 700; color: #0F172A;\">" + appName + " (" + (payload.appCode || '') + ")</td></tr>" +
    "<tr><td style=\"padding: 5px 0; color: #64748B;\">📌 <strong>Título Novedad:</strong></td><td style=\"padding: 5px 0; font-weight: 600; color: #1E293B;\">" + title + "</td></tr>" +
    "<tr><td style=\"padding: 5px 0; color: #64748B;\">💻 <strong>Desarrollador Responsable:</strong></td><td style=\"padding: 5px 0; font-weight: 700; color: #4F46E5;\">" + devName + "</td></tr>" +
    "<tr><td style=\"padding: 5px 0; color: #64748B;\">📅 <strong>Fecha de Respuesta:</strong></td><td style=\"padding: 5px 0; color: #475569;\">" + resDate + "</td></tr>" +
    "</table>" +
    "</div>" +

    // Pie de página
    "<div style=\"border-top: 1px solid #E2E8F0; padding-top: 16px; text-align: center;\">" +
    "<p style=\"font-size: 11.5px; color: #94A3B8; margin: 0;\">Este es un dictamen oficial generado automáticamente por la Dirección de Tecnología STF GROUP.</p>" +
    "</div>" +
    "</div>" +
    "</div>";

  try {
    var mailOptions = {
      to: targetEmail,
      subject: subject,
      htmlBody: html
    };

    if (imageBlob) {
      mailOptions.inlineImages = {
        evidenciaFoto: imageBlob
      };
      mailOptions.attachments = [imageBlob.copyBlob().setName(payload.evidenceImageName || ("evidencia_" + ticketCode + ".jpg"))];
    }

    MailApp.sendEmail(mailOptions);
    return { sent: true, recipient: targetEmail, hasPhoto: !!imageBlob };
  } catch (errMail) {
    return { sent: false, error: errMail.toString() };
  }
}

/**
 * Función de Prueba Directa de Notificación de Rechazo con Foto
 */
