/**
 * ============================================================================
 * STF GROUP · SERVICIO DE SEGURIDAD, BLOQUEOS Y RESTABLECIMIENTO OTP
 * ============================================================================
 */

function handleSecurityLockoutAlert(ss, params) {
  var username = String(params.username || "").trim();
  var directEmail = String(params.email || "").trim();
  var directName = String(params.name || "").trim();
  var attempts = parseInt(params.attempts, 10) || 3;
  var lockMinutes = parseInt(params.lockMinutes, 10) || (attempts >= 8 ? 15 : 5);

  var deviceInfo = {};
  if (typeof params.deviceInfo === "string") {
    try { deviceInfo = JSON.parse(params.deviceInfo); } catch (e) { deviceInfo = { raw: params.deviceInfo }; }
  } else if (params.deviceInfo && typeof params.deviceInfo === "object") {
    deviceInfo = params.deviceInfo;
  }

  // Fallbacks de parámetros directos (en caso de llamada GET directa)
  if (params.deviceId && !deviceInfo.deviceId) deviceInfo.deviceId = String(params.deviceId);
  if (params.deviceType && !deviceInfo.deviceType) deviceInfo.deviceType = String(params.deviceType);
  if (params.gpu && !deviceInfo.gpu) deviceInfo.gpu = String(params.gpu);
  if (params.os && !deviceInfo.os) deviceInfo.os = String(params.os);
  if (params.browser && !deviceInfo.browser) deviceInfo.browser = String(params.browser);

  var timestamp = params.timestamp || Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

  var sUsers = getMasterSheet(ss, "USUARIOS");
  var userObj = findUserInSheet(sUsers, username || directEmail || directName);

  // Prioridad absoluta al correo del desarrollador correspondiente
  var targetEmail = (directEmail && directEmail.indexOf("@") !== -1)
    ? directEmail
    : ((userObj && userObj.email) ? userObj.email : "joseoneiber711@gmail.com");

  var targetName = (userObj && userObj.name)
    ? userObj.name
    : (directName || username || "Usuario STF");

  var targetUser = (userObj && userObj.username)
    ? userObj.username
    : (username || "Desconocido");

  // Registrar el bloqueo en la hoja BITACORA_HISTORIAL
  try {
    var sB = getMasterSheet(ss, "BITACORA");
    if (sB) {
      sB.appendRow([
        new Date().getTime(),
        timestamp,
        targetName,
        "SEGURIDAD_BLOQUEO",
        "SISTEMA_LOGIN",
        "Bloqueo de seguridad (" + lockMinutes + " min) tras " + attempts + " intentos fallidos. Equipo: " + (deviceInfo.deviceType || "PC") + " (" + (deviceInfo.deviceId || "STF-DEV") + ") / " + (deviceInfo.os || "Desconocido"),
        "v2.7"
      ]);
    }
  } catch (errBit) {
    Logger.log("Error registrando bloqueo en bitácora: " + errBit.toString());
  }

  // Enviar correo de alerta de seguridad al usuario
  var mailResult = sendSecurityLockoutEmail(targetEmail, targetName, targetUser, attempts, lockMinutes, deviceInfo, timestamp);

  return createJsonResponse({
    status: "success",
    message: "Alerta de bloqueo enviada correctamente",
    attempts: attempts,
    lockMinutes: lockMinutes,
    emailSent: mailResult.sent,
    recipient: targetEmail,
    maskedEmail: maskEmailAddress(targetEmail)
  });
}

/**
 * Genera y envía un código OTP de 6 dígitos para restablecer la contraseña
 */
function handleRequestPasswordReset(ss, params) {
  var userIdentifier = String(params.userIdentifier || "").trim();
  var deviceInfo = {};
  if (typeof params.deviceInfo === "string") {
    try { deviceInfo = JSON.parse(params.deviceInfo); } catch (e) { deviceInfo = { raw: params.deviceInfo }; }
  } else if (params.deviceInfo && typeof params.deviceInfo === "object") {
    deviceInfo = params.deviceInfo;
  }
  var timestamp = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

  if (!userIdentifier) {
    return createJsonResponse({ status: "error", message: "Por favor ingresa tu usuario o correo corporativo registrado." });
  }

  var sUsers = getMasterSheet(ss, "USUARIOS");
  var userObj = findUserInSheet(sUsers, userIdentifier);

  if (!userObj || !userObj.email) {
    return createJsonResponse({ status: "error", message: "No se encontró ningún usuario activo registrado con ese identificador." });
  }

  // Generar código numérico de 6 dígitos
  var otp = Math.floor(100000 + Math.random() * 900000).toString();
  var cacheKey = "STF_OTP_" + userObj.username.toLowerCase();
  var cacheMetaKey = "STF_OTP_META_" + userObj.username.toLowerCase();

  var cache = CacheService.getScriptCache();
  cache.put(cacheKey, otp, 900); // Válido por 15 minutos (900 seg)
  cache.put(cacheMetaKey, JSON.stringify({
    username: userObj.username,
    email: userObj.email,
    name: userObj.name,
    timestamp: timestamp
  }), 900);

  // Enviar correo con el código OTP
  var mailResult = sendPasswordResetOtpEmail(userObj.email, userObj.name, userObj.username, otp, deviceInfo, timestamp);

  // Registrar solicitud en BITACORA_HISTORIAL
  try {
    var sB = getMasterSheet(ss, "BITACORA");
    if (sB) {
      sB.appendRow([
        new Date().getTime(),
        timestamp,
        userObj.name,
        "SOLICITUD_CODIGO_RECUPERACION",
        "SISTEMA_LOGIN",
        "Código de restablecimiento de contraseña solicitado para " + userObj.username + " desde " + (deviceInfo.os || "Desconocido"),
        "v2.7"
      ]);
    }
  } catch (errBit) { }

  return createJsonResponse({
    status: "success",
    message: "Código de recuperación enviado exitosamente a tu correo corporativo.",
    maskedEmail: maskEmailAddress(userObj.email),
    username: userObj.username,
    name: userObj.name,
    emailSent: mailResult.sent
  });
}

/**
 * Valida el código OTP y actualiza la contraseña en la columna A (ID) de la hoja USUARIOS
 */
function handleResetPassword(ss, params) {
  var userIdentifier = String(params.userIdentifier || "").trim();
  var otpCode = String(params.otpCode || "").trim();
  var newPassword = String(params.newPassword || "").trim();
  var deviceInfo = {};
  if (typeof params.deviceInfo === "string") {
    try { deviceInfo = JSON.parse(params.deviceInfo); } catch (e) { deviceInfo = { raw: params.deviceInfo }; }
  } else if (params.deviceInfo && typeof params.deviceInfo === "object") {
    deviceInfo = params.deviceInfo;
  }
  var timestamp = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm:ss");

  if (!userIdentifier || !otpCode || !newPassword) {
    return createJsonResponse({ status: "error", message: "Todos los campos (usuario, código y nueva contraseña) son requeridos." });
  }

  if (newPassword.length < 3) {
    return createJsonResponse({ status: "error", message: "La nueva contraseña debe tener al menos 3 caracteres." });
  }

  var sUsers = getMasterSheet(ss, "USUARIOS");
  var userObj = findUserInSheet(sUsers, userIdentifier);

  if (!userObj) {
    return createJsonResponse({ status: "error", message: "Usuario no encontrado en la base de datos." });
  }

  var cacheKey = "STF_OTP_" + userObj.username.toLowerCase();
  var cache = CacheService.getScriptCache();
  var cachedOtp = cache.get(cacheKey);

  if (!cachedOtp || cachedOtp !== otpCode) {
    return createJsonResponse({ status: "error", message: "El código de verificación es inválido o ha expirado. Solicita un código nuevo." });
  }

  // Reemplazar la contraseña en la columna A (ID) de la hoja USUARIOS
  try {
    var passCol = userObj.idxPassCol || 1;
    sUsers.getRange(userObj.rowIndex, passCol).setValue(newPassword);

    // Limpiar caché del OTP
    cache.remove(cacheKey);
    cache.remove("STF_OTP_META_" + userObj.username.toLowerCase());

    // Registrar cambio en BITACORA_HISTORIAL
    try {
      var sB = getMasterSheet(ss, "BITACORA");
      if (sB) {
        sB.appendRow([
          new Date().getTime(),
          timestamp,
          userObj.name,
          "RESTABLECIMIENTO_CLAVE",
          "SISTEMA_LOGIN",
          "Contraseña actualizada y reemplazada en Google Sheets para el usuario " + userObj.username + " desde " + (deviceInfo.os || "Desconocido"),
          "v2.7"
        ]);
      }
    } catch (errBit) { }

    // Enviar confirmación por correo al usuario
    sendPasswordChangedSuccessEmail(userObj.email, userObj.name, userObj.username, deviceInfo, timestamp);

    return createJsonResponse({
      status: "success",
      message: "¡Contraseña actualizada exitosamente en Google Sheets!",
      username: userObj.username,
      name: userObj.name
    });
  } catch (errUpd) {
    return createJsonResponse({
      status: "error",
      message: "Error al guardar la contraseña en Sheets: " + errUpd.toString()
    });
  }
}

/**
 * Envío de Correo: Alerta de Seguridad por Bloqueo Temporal
 */
function sendSecurityLockoutEmail(userEmail, userName, userLogin, attempts, lockMinutes, deviceInfo, timestamp) {
  var isCritical = (attempts >= 8);
  var subject = isCritical
    ? "🚨 [ALERTA CRÍTICA STF] Bloqueo extendido por " + attempts + " intentos fallidos en Terminal de Acceso"
    : "⚠️ [SEGURIDAD STF] Bloqueo temporal por " + attempts + " intentos fallidos de inicio de sesión";

  var alertColor = isCritical ? "#EF4444" : "#F59E0B";
  var alertBg = isCritical ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)";
  var alertTitle = isCritical ? "BLOQUEO DE SEGURIDAD EXTENDIDO (15 MINUTOS)" : "BLOQUEO PREVENTIVO TEMPORAL (5 MINUTOS)";

  var html = [
    '<div style="font-family: \'Plus Jakarta Sans\', Arial, Helvetica, sans-serif; background-color: #0A0D14; color: #FFFFFF; padding: 32px 20px; min-height: 100%;">',
    '  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #111622; border-radius: 20px; border: 1.5px solid rgba(255, 255, 255, 0.12); overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6);">',
    '    <!-- Header STF GROUP -->',
    '    <tr>',
    '      <td style="padding: 28px 32px 20px; background: linear-gradient(180deg, #161D2E 0%, #111622 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">',
    '        <div style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #FFFFFF; margin-bottom: 4px;">STF GROUP S.A.</div>',
    '        <div style="font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;">CENTRO DE CIBERSEGURIDAD & ACCESO CORPORATIVO</div>',
    '      </td>',
    '    </tr>',
    '    <!-- Badge de Estado de Alerta -->',
    '    <tr>',
    '      <td style="padding: 24px 32px 10px; text-align: center;">',
    '        <div style="display: inline-block; background-color: ' + alertBg + '; border: 1.5px solid ' + alertColor + '; color: ' + alertColor + '; padding: 8px 18px; border-radius: 24px; font-size: 12px; font-weight: 800; letter-spacing: 1px;">',
    '          ' + alertTitle,
    '        </div>',
    '        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 18px 0 8px 0; letter-spacing: 0.5px;">Alerta de Acceso Fallido</h2>',
    '        <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.6; margin: 0 0 16px 0;">',
    '          Estimado/a <strong>' + userName + '</strong>, hemos detectado <strong>' + attempts + ' intentos consecutivos fallidos</strong> para acceder a tu cuenta en la Terminal de Acceso Seguro de STF GROUP.',
    '        </p>',
    '      </td>',
    '    </tr>',
    '    <!-- Ficha de Auditoría del Equipo / Dispositivo -->',
    '    <tr>',
    '      <td style="padding: 10px 32px 24px;">',
    '        <div style="background-color: #0B0E17; border: 1px solid rgba(255, 255, 255, 0.10); border-radius: 14px; padding: 18px 20px;">',
    '          <div style="font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">',
    '            🖥️ Identificación del Ordenador / Dispositivo',
    '          </div>',
    '          <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 12.5px; color: #E2E8F0;">',
    '            <tr>',
    '              <td style="color: #94A3B8; width: 40%; padding: 6px 0;"><strong>Usuario Afectado:</strong></td>',
    '              <td style="color: #FFFFFF; font-weight: 600; padding: 6px 0;">' + userLogin + ' (' + userName + ')</td>',
    '            </tr>',
    '            <tr>',
    '              <td style="color: #94A3B8; padding: 6px 0;"><strong>Intentos Fallidos:</strong></td>',
    '              <td style="color: ' + alertColor + '; font-weight: 800; padding: 6px 0;">' + attempts + ' intentos registrados</td>',
    '            </tr>',
    '            <tr>',
    '              <td style="color: #94A3B8; padding: 6px 0;"><strong>Tiempo de Bloqueo:</strong></td>',
    '              <td style="color: #FFFFFF; font-weight: 700; padding: 6px 0;">' + lockMinutes + ' minutos de restricción</td>',
    '            </tr>',
    '            <tr>',
    '              <td style="color: #94A3B8; padding: 6px 0;"><strong>Fecha y Hora:</strong></td>',
    '              <td style="color: #FFFFFF; padding: 6px 0;">' + timestamp + ' (Hora Legal Colombia)</td>',
    '            </tr>',
    '            <tr>',
    '              <td style="color: #94A3B8; padding: 6px 0;"><strong>Tipo de Equipo:</strong></td>',
    '              <td style="color: #FFFFFF; font-weight: 700; padding: 6px 0;">' + (deviceInfo.deviceType || "Ordenador / PC") + '</td>',
    '            </tr>',
    '            <tr>',
    '              <td style="color: #94A3B8; padding: 6px 0;"><strong>Sistema Operativo:</strong></td>',
    '              <td style="color: #FFFFFF; font-weight: 600; padding: 6px 0;">' + (deviceInfo.os || "Desconocido") + '</td>',
    '            </tr>',
    '          </table>',
    '        </div>',
    '      </td>',
    '    </tr>',
    '    <!-- Instrucciones de Seguridad -->',
    '    <tr>',
    '      <td style="padding: 0 32px 28px;">',
    '        <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid ' + alertColor + '; border-radius: 6px; padding: 14px 16px; font-size: 12.5px; color: #CBD5E1; line-height: 1.5;">',
    '          <strong>¿Fuiste tú?</strong> Espera a que termine el temporizador en pantalla (' + lockMinutes + ' min) e ingresa con tu contraseña oficial, o restablece tu clave desde la opción <em>"¿Olvidaste o perdiste tu contraseña?"</em>.<br><br>',
    '          <strong>¿No fuiste tú?</strong> Alguien está intentando ingresar desde el equipo detallado anteriormente. Comunícate de inmediato con el Departamento de Sistemas y Tecnología STF.',
    '        </div>',
    '      </td>',
    '    </tr>',
    '    <!-- Footer -->',
    '    <tr>',
    '      <td style="padding: 16px 32px 20px; background-color: #090C12; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748B;">',
    '        SISTEMA DE CONTROL Y GESTIÓN DE APLICATIVOS · STF GROUP S.A. © 2026<br>',
    '        Notificación automática de seguridad generada por Google Apps Script TLS.',
    '      </td>',
    '    </tr>',
    '  </table>',
    '</div>'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: html
    });
    return { sent: true, recipient: userEmail };
  } catch (err) {
    Logger.log("Error enviando correo de bloqueo: " + err.toString());
    return { sent: false, error: err.toString() };
  }
}

/**
 * Envío de Correo: Código de Seguridad OTP para Restablecer Contraseña
 */
function sendPasswordResetOtpEmail(userEmail, userName, userLogin, otpCode, deviceInfo, timestamp) {
  var subject = "🔐 Código de Recuperación de Contraseña (" + otpCode + ") · STF GROUP";

  var html = [
    '<div style="font-family: \'Plus Jakarta Sans\', Arial, Helvetica, sans-serif; background-color: #0A0D14; color: #FFFFFF; padding: 32px 20px; min-height: 100%;">',
    '  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #111622; border-radius: 20px; border: 1.5px solid rgba(255, 255, 255, 0.12); overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6);">',
    '    <!-- Header STF GROUP -->',
    '    <tr>',
    '      <td style="padding: 28px 32px 20px; background: linear-gradient(180deg, #161D2E 0%, #111622 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">',
    '        <div style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #FFFFFF; margin-bottom: 4px;">STF GROUP S.A.</div>',
    '        <div style="font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;">RECUPERACIÓN SEGURA DE CREDENCIALES</div>',
    '      </td>',
    '    </tr>',
    '    <!-- Contenido Principal -->',
    '    <tr>',
    '      <td style="padding: 24px 32px 10px; text-align: center;">',
    '        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 10px 0; letter-spacing: 0.5px;">Código de Verificación</h2>',
    '        <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.6; margin: 0 0 20px 0;">',
    '          Hola <strong>' + userName + '</strong>, has solicitado restablecer tu contraseña para la Terminal de Acceso Seguro de la Oficina de Aplicativos (Usuario: <strong>' + userLogin + '</strong>).',
    '        </p>',
    '        <!-- Caja del Código OTP -->',
    '        <div style="background: rgba(255, 255, 255, 0.05); border: 2px dashed rgba(255, 255, 255, 0.35); border-radius: 16px; padding: 22px 24px; text-align: center; margin: 0 auto 20px auto; max-width: 380px;">',
    '          <div style="font-size: 11px; letter-spacing: 2px; color: #E2E8F0; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">TU CÓDIGO DE RECUPERACIÓN</div>',
    '          <div style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; font-family: monospace; text-shadow: 0 2px 12px rgba(255,255,255,0.4); margin: 6px 0 10px 0;">' + otpCode + '</div>',
    '          <div style="font-size: 12px; color: #94A3B8; font-weight: 500;">⏱️ Válido durante los próximos <strong>15 minutos</strong></div>',
    '        </div>',
    '        <p style="font-size: 12.5px; color: #94A3B8; line-height: 1.5; margin: 0 0 20px 0;">',
    '          Ingresa este código de 6 dígitos en la pantalla de recuperación e introduce tu nueva contraseña.',
    '        </p>',
    '      </td>',
    '    </tr>',
    '    <!-- Datos del Equipo Solicitante -->',
    '    <tr>',
    '      <td style="padding: 0 32px 24px;">',
    '        <div style="background-color: #0B0E17; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #94A3B8;">',
    '          <strong style="color: #FFFFFF;">Detalles de la solicitud:</strong><br>',
    '          • Fecha y Hora: ' + timestamp + ' (Hora Legal Colombia)<br>',
    '          • Equipo: ' + (deviceInfo.deviceType || "Ordenador / PC") + ' (' + (deviceInfo.os || "Desconocido") + ')<br><br>',
    '          <span style="color: #F87171;">⚠️ Si no solicitaste este código, ignora este mensaje. Tu contraseña actual seguirá siendo la misma.</span>',
    '        </div>',
    '      </td>',
    '    </tr>',
    '    <!-- Footer -->',
    '    <tr>',
    '      <td style="padding: 16px 32px 20px; background-color: #090C12; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748B;">',
    '        SISTEMA DE CONTROL Y GESTIÓN DE APLICATIVOS · STF GROUP S.A. © 2026<br>',
    '        Este es un mensaje automático de seguridad. Por favor no lo respondas.',
    '      </td>',
    '    </tr>',
    '  </table>',
    '</div>'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: html
    });
    return { sent: true, recipient: userEmail };
  } catch (err) {
    Logger.log("Error enviando código OTP: " + err.toString());
    return { sent: false, error: err.toString() };
  }
}

/**
 * Envío de Correo: Confirmación de Contraseña Actualizada Exitosamente
 */
function sendPasswordChangedSuccessEmail(userEmail, userName, userLogin, deviceInfo, timestamp) {
  var subject = "✅ Contraseña Actualizada Exitosamente · STF GROUP";

  var html = [
    '<div style="font-family: \'Plus Jakarta Sans\', Arial, Helvetica, sans-serif; background-color: #0A0D14; color: #FFFFFF; padding: 32px 20px; min-height: 100%;">',
    '  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #111622; border-radius: 20px; border: 1.5px solid rgba(255, 255, 255, 0.12); overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.6);">',
    '    <tr>',
    '      <td style="padding: 28px 32px 20px; background: linear-gradient(180deg, #161D2E 0%, #111622 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">',
    '        <div style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #FFFFFF; margin-bottom: 4px;">STF GROUP S.A.</div>',
    '        <div style="font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;">ACTUALIZACIÓN DE SEGURIDAD EXITOSA</div>',
    '      </td>',
    '    </tr>',
    '    <tr>',
    '      <td style="padding: 28px 32px; text-align: center;">',
    '        <div style="font-size: 48px; margin-bottom: 12px;">✅</div>',
    '        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 10px 0;">Contraseña Actualizada con Éxito</h2>',
    '        <p style="font-size: 13.5px; color: #CBD5E1; line-height: 1.6; margin: 0 0 20px 0;">',
    '          Estimado/a <strong>' + userName + '</strong>, te confirmamos que la contraseña para tu cuenta <strong>' + userLogin + '</strong> ha sido reemplazada y guardada exitosamente en la base de datos oficial de Google Sheets.',
    '        </p>',
    '        <div style="background-color: #0B0E17; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 18px; text-align: left; font-size: 12px; color: #94A3B8; margin-bottom: 24px;">',
    '          <strong style="color: #FFFFFF;">Registro de la operación:</strong><br>',
    '          • Fecha y Hora: ' + timestamp + '<br>',
    '          • Dispositivo: ' + (deviceInfo.deviceType || "Ordenador / PC") + ' (' + (deviceInfo.os || "Desconocido") + ')<br>',
    '          • Base de Datos: Hoja Oficial USUARIOS (Columna ID Actualizada)',
    '        </div>',
    '        <div>',
    '          <a href="https://stf-oficina-aplicativos.vercel.app/login.html" target="_blank" style="display: inline-block; background-color: #FFFFFF; color: #000000; padding: 12px 28px; border-radius: 30px; font-size: 13px; font-weight: 800; text-decoration: none; letter-spacing: 0.5px;">INGRESAR AL SISTEMA ➔</a>',
    '        </div>',
    '      </td>',
    '    </tr>',
    '    <tr>',
    '      <td style="padding: 16px 32px 20px; background-color: #090C12; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748B;">',
    '        SISTEMA DE CONTROL Y GESTIÓN DE APLICATIVOS · STF GROUP S.A. © 2026',
    '      </td>',
    '    </tr>',
    '  </table>',
    '</div>'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: html
    });
    return { sent: true, recipient: userEmail };
  } catch (err) {
    Logger.log("Error enviando confirmación de contraseña: " + err.toString());
    return { sent: false, error: err.toString() };
  }
}

