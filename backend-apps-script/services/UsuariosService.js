/**
 * ============================================================================
 * STF GROUP · SERVICIO DE USUARIOS Y GESTIÓN DE ACCESOS
 * ============================================================================
 */

function setupUsuariosSheet(ss) {
  var s = getOrCreateSheetByName(ss, TABS.USUARIOS, ["Usuarios"]);
  ensureExactHeaders(s, HEADERS.USUARIOS);

  var OFFICIAL_MASTER_PASSWORDS = {
    "jose@guzman": "159",
    "juan@david": "2222",
    "esteban@escobar": "1111",
    "jhon@eyder": "4444",
    "ediaz": "Admin"
  };

  if (s.getLastRow() <= 1) {
    var defaultUsers = [
      ["159", "jose@guzman", "desarrollador", "joseoneiber711@gmail.com", "Jose Guzman", "ACTIVO", ""],
      ["2222", "juan@david", "desarrollador", "juan.david@studiof.com.co", "Juan David", "ACTIVO", ""],
      ["1111", "esteban@escobar", "desarrollador", "esteban.escobar@studiof.com.co", "Esteban Escobar", "ACTIVO", ""],
      ["4444", "jhon@eyder", "desarrollador", "jhon.eyder@studiof.com.co", "Jhon Eyder (Mocho)", "ACTIVO", ""],
      ["Admin", "ediaz", "Admin & Desarrollo", "edwin.diaz@studiof.com.co", "Edwin Diaz", "ADMIN", ""]
    ];
    s.getRange(2, 1, defaultUsers.length, 7).setValues(defaultUsers);
  } else {
    // Blindaje y fijación de contraseñas oficiales en Columna A (ID)
    var rows = s.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var uLog = String(rows[r][1] || "").toLowerCase().trim();
      var currentIdPass = String(rows[r][0] || "").trim();

      // Si la contraseña fue alterada por un prefijo "dev_" o está vacía, restaurar la contraseña fija oficial
      if (OFFICIAL_MASTER_PASSWORDS[uLog] && (currentIdPass.indexOf("dev_") === 0 || !currentIdPass)) {
        s.getRange(r + 1, 1).setValue(OFFICIAL_MASTER_PASSWORDS[uLog]);
      }

      var role = String(rows[r][2] || "desarrollador").trim();
      var name = String(rows[r][4] || "").trim();
      var state = String(rows[r][5] || "").trim();

      if (!name) {
        if (uLog.indexOf("jose") !== -1) name = "Jose Guzman";
        else if (uLog.indexOf("juan") !== -1) name = "Juan David";
        else if (uLog.indexOf("esteban") !== -1) name = "Esteban Escobar";
        else if (uLog.indexOf("jhon") !== -1 || uLog.indexOf("mocho") !== -1) name = "Jhon Eyder (Mocho)";
        else if (uLog.indexOf("ediaz") !== -1) name = "Edwin Diaz";
        else name = uLog;
        s.getRange(r + 1, 5).setValue(name);
      }
      if (!state) {
        s.getRange(r + 1, 6).setValue(role.toLowerCase() === "admin" ? "ADMIN" : "ACTIVO");
      }
    }
  }
  formatCorporateSheet(s, "#0F172A", [120, 160, 130, 240, 180, 100, 240]);
}

/**
 * 2. Configurar y Estabilizar Hoja SISTEMAS_WEB (4 Columnas A:D)
 * Corrige "Columna 1..4" en Fila 1, elimina encabezados duplicados en Fila 2
 * y sincroniza el estado real de los 7 sistemas.
 */

function findUserInSheet(sUsers, identifier) {
  if (!sUsers || !identifier) return null;
  var rawTerm = String(identifier).trim();
  var term = rawTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  var rows = sUsers.getDataRange().getValues();
  if (rows.length <= 1) return null;

  var hRow = rows[0].map(function (h) {
    return String(h || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  });
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

  for (var r = 1; r < rows.length; r++) {
    var rPass = String(rows[r][idxPass] || "").trim();
    var rUser = String(rows[r][idxUser] || "").trim().toLowerCase();
    var rEmail = String(rows[r][idxEmail] || "").trim().toLowerCase();
    var rName = (idxName < rows[r].length) ? String(rows[r][idxName] || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    var matchUser = (rUser === term || (rUser.indexOf("@") !== -1 && rUser.split("@")[0] === term));
    var matchEmail = (rEmail === term || (rEmail.indexOf("@") !== -1 && rEmail.split("@")[0] === term));
    var matchName = (rName === term || (rName && (rName.indexOf(term) !== -1 || term.indexOf(rName) !== -1)));
    var matchPass = (rPass.toLowerCase() === term && term.length > 2);

    if (matchUser || matchEmail || matchName || matchPass) {
      return {
        rowIndex: r + 1, // 1-based row index para getRange
        id: rPass,
        username: String(rows[r][idxUser] || "").trim(),
        role: String(rows[r][idxRole] || "desarrollador").trim(),
        email: String(rows[r][idxEmail] || "").trim(),
        name: (idxName < rows[r].length && rows[r][idxName]) ? String(rows[r][idxName]).trim() : String(rows[r][idxUser]).trim(),
        avatar: (idxAvatar !== -1 && idxAvatar < rows[r].length) ? String(rows[r][idxAvatar] || "").trim() : "",
        idxPassCol: idxPass + 1
      };
    }
  }
  return null;
}

/**
 * Gestiona el envío de alertas de seguridad cuando un usuario es bloqueado por intentos fallidos
 */
