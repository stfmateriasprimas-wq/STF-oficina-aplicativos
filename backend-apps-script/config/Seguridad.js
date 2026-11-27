/**
 * ============================================================================
 * STF GROUP · SEGURIDAD, SANITIZACIÓN Y VALIDACIÓN (APPSEC)
 * ============================================================================
 */

function sanitizeSheetInput(val) {
  if (val === null || val === undefined) return "";
  var str = String(val);
  if (str.length === 0) return "";
  var firstChar = str.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
    return "'" + str;
  }
  return str;
}

function getExpectedAuthKey() {
  try {
    var customKey = PropertiesService.getScriptProperties().getProperty("STF_APP_AUTH_KEY");
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  } catch (err) { }
  return "STF_SEC_AUTH_KEY_2026_TI_PLATFORM_V3";
}

function isAuthorizedRequest(payload, e) {
  var expected = getExpectedAuthKey();
  var provided = (payload && (payload.authKey || payload.token || payload.apiKey)) ||
    (e && e.parameter && (e.parameter.authKey || e.parameter.token || e.parameter.apiKey)) ||
    "";
  return String(provided).trim() === expected;
}

function maskEmailAddress(email) {
  if (!email || typeof email !== "string" || email.indexOf("@") === -1) {
    return "usuario@studiof.com.co";
  }
  var parts = email.split("@");
  var user = parts[0];
  var domain = parts[1];
  if (user.length <= 2) {
    return user.charAt(0) + "***@" + domain;
  }
  return user.charAt(0) + "***" + user.charAt(user.length - 1) + "@" + domain;
}
