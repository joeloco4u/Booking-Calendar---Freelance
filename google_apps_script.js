/** ============================================================
 *  Google Apps Script Backend — Pool & Facilities Booking
 *  Routes: doGet (read month) + doPost (book/approve/reject/
 *  cancel/clear/lock/unlock/login)
 *  ============================================================ */

var MAINTENANCE_NAME = "MANTENIMIENTO";

/**
 * Parses a day number and canonical month number from a localized date string
 * (e.g. "Saturday, September 5, 2026" or "sábado, 5 de septiembre de 2026").
 * targetDate is expected as "YYYY-MM-DD".
 */
function dateMatches(storedDate, targetDate) {
  if (!storedDate || !targetDate) return false;
  var tParts = String(targetDate).split('-');
  var tYear = parseInt(tParts[0], 10);
  var tMonth = parseInt(tParts[1], 10);
  var tDay = parseInt(tParts[2], 10);

  // If Google Sheets returns a native Date object
  if (Object.prototype.toString.call(storedDate) === '[object Date]') {
    return (storedDate.getDate() === tDay && (storedDate.getMonth() + 1) === tMonth && storedDate.getFullYear() === tYear);
  }

  // Fallback if it's stored as plain text
  var s = String(storedDate).trim().toLowerCase();
  var dm = s.match(/(?:^|\s|\/)(\d{1,2})(?:\s|,|\/|$)/);
  if (!dm) return false;
  var day = parseInt(dm[1], 10);
  
  var monthNames = {jan:1,january:1,ene:1,enero:1,feb:2,february:2,febrero:2,mar:3,march:3,marzo:3,apr:4,april:4,abr:4,abril:4,may:5,mayo:5,jun:6,june:6,junio:6,jul:7,july:7,julio:7,aug:8,august:8,ago:8,agosto:8,sep:9,september:9,septiembre:9,oct:10,october:10,octubre:10,nov:11,november:11,noviembre:11,dec:12,december:12,dic:12,diciembre:12};
  var month = null;
  var mm = s.match(/[a-zà-ÿ]+/g);
  if (mm) {
    for (var i=0; i<mm.length; i++) {
      if (monthNames[mm[i]]) { month = monthNames[mm[i]]; break; }
    }
  }
  var ym = s.match(/\b(20\d{2})\b/);
  var year = ym ? parseInt(ym[1], 10) : tYear;

  return (day === tDay && month === tMonth && (year === tYear || !ym));
}

/**
 * Builds a JSON ContentService response.
 */
function jsonResponse(e, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function isMaintenanceName(name) {
  var n = String(name || '').trim().toUpperCase();
  return (n === '🔧 MANTENIMIENTO' || n === 'MANTENIMIENTO');
}

/**
 * doGet — reads all rows from the monthly sheet and returns them with a
 * computed status. Fully wrapped in try/catch.
 */
function doGet(e) {
  try {
    var sheetName = e.parameter.mes;
    if (!sheetName) return jsonResponse(e, { data: [] });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonResponse(e, { data: [] });

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return jsonResponse(e, { data: [] });

    var range = sheet.getRange(2, 1, lastRow - 1, 7);
    var values = range.getValues();
    var results = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var name = row[0];
      var date = row[1];
      var fee = row[2];
      var schedule = row[3];
      var note = row[4];
      var conciliado = row[5];
      var status;

      var rawConciliado = String(conciliado).trim().toUpperCase();
      var isReconciled = (conciliado === true || rawConciliado === 'TRUE' || rawConciliado === 'VERDADERO');
      var hasFee = (fee !== '' && fee !== 0 && fee != null);
      var cleanName = name ? String(name).trim() : '';

      if (isMaintenanceName(cleanName)) {
        status = 'Maintenance';
      } else if (isReconciled || hasFee) {
        status = 'Approved';
      } else if (cleanName === '') {
        status = 'Available';
      } else {
        status = 'Pending';
      }

      results.push({
        rowIndex: i + 2,
        name: name || '',
        date: date ? date.toString() : '',
        schedule: schedule || '',
        fee: status === 'Maintenance' ? 0 : (fee || 0),
        note: note || '',
        status: status
      });
    }
    return jsonResponse(e, { data: results });
  } catch (err) {
    return jsonResponse(e, { success: false, error: err.toString() });
  }
}

/**
 * doPost — routes every action. Fully wrapped in try/catch.
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var row = payload.row;
    var sheetName = payload.mes;

    if (action === 'login') {
      var password = payload.password;
      if (password === 'Freelance2026') {
        return jsonResponse(e, { success: true });
      } else {
        return jsonResponse(e, { success: false, error: 'Contraseña incorrecta' });
      }
    }

    if (!sheetName) return jsonResponse(e, { success: false, error: 'Missing field: mes' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonResponse(e, { success: false, error: 'Sheet not found' });

    if (action === 'book') {
      var name = payload.name;
      var note = payload.note || '';

      if (!row || !name) return jsonResponse(e, { success: false, error: 'Missing row or name' });

      // 1. Guardar datos básicos
      sheet.getRange(row, 1).setValue(name);
      sheet.getRange(row, 3).setValue('');
      sheet.getRange(row, 5).setValue(note);
      sheet.getRange(row, 1, 1, 6).setBackground(null);

      // 2. Lógica de Envío de Correo con Rastreo de Errores
      var contactInfo = payload.contact || '';
      var schedule = payload.schedule || 'Turno seleccionado';
      var dateStr = payload.date || 'Fecha seleccionada';

      var emailSent = false;
      var emailError = null;

      if (contactInfo.indexOf('@') !== -1) {
        try {
          var subject = "Solicitud de Reserva de Piscina - Freelance Latam";
          var htmlMessage =
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 8px; overflow: hidden;'>" +
              "<div style='background-color: #0f172a; padding: 20px; text-align: center;'>" +
                "<h2 style='color: #38bdf8; margin: 0;'>Freelance Latam</h2>" +
              "</div>" +
              "<div style='padding: 20px; background-color: #f8fafc; color: #334155;'>" +
                "<p style='font-size: 16px;'>Hola <strong>" + name + "</strong>,</p>" +
                "<p>Hemos recibido tu solicitud para reservar el Área de Piscina. Actualmente tu solicitud está <span style='color: #d97706; font-weight: bold;'>PENDIENTE</span> de revisión.</p>" +
                "<div style='background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;'>" +
                  "<h3 style='margin-top: 0; color: #0f172a;'>Detalles de tu solicitud:</h3>" +
                  "<ul style='list-style-type: none; padding: 0; margin: 0;'>" +
                    "<li style='margin-bottom: 8px;'>📅 <strong>Fecha:</strong> " + dateStr + "</li>" +
                    "<li style='margin-bottom: 8px;'>⏰ <strong>Horario:</strong> " + schedule + "</li>" +
                    "<li style='margin-bottom: 8px;'>💵 <strong>Costo total:</strong> $60.00 USD</li>" +
                  "</ul>" +
                "</div>" +
                "<div style='background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;'>" +
                  "<h4 style='color: #991b1b; margin-top: 0;'>⚠️ POLÍTICA DE CANCELACIÓN Y MULTA</h4>" +
                  "<p style='margin-bottom: 0; font-size: 14px; color: #7f1d1d;'>Las cancelaciones realizadas con menos de <strong>7 días de anticipación</strong> a la fecha del evento, o la inasistencia, generarán una multa automática de <strong>$10 USD descontados directamente de tu nómina</strong>.</p>" +
                "</div>" +
                "<div style='background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #38bdf8; padding: 15px; border-radius: 6px; margin: 20px 0;'>" +
                  "<h4 style='color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 15px;'>🏊 Normas del Área de Piscina</h4>" +
                  "<ul style='list-style-type: none; padding: 0; margin: 0; color: #334155; font-size: 14px;'>" +
                    "<li style='margin-bottom: 8px;'>🚿 Ducha previa obligatoria antes de ingresar.</li>" +
                    "<li style='margin-bottom: 8px;'>🔊 Mantener un volumen de música moderado.</li>" +
                    "<li style='margin-bottom: 8px;'>🚫 Estrictamente prohibido el uso de papelillo.</li>" +
                    "<li style='margin-bottom: 0;'>⚠️ No sentarse en las barandas ni en las jardineras.</li>" +
                  "</ul>" +
                "</div>" +
              "</div>" +
            "</div>";

          MailApp.sendEmail({
            to: contactInfo,
            subject: subject,
            htmlBody: htmlMessage
          });
          emailSent = true;
        } catch (emailErr) {
          emailError = emailErr.toString();
        }
      }

      return jsonResponse(e, {
        success: true,
        message: 'Booked',
        emailSent: emailSent,
        emailError: emailError,
        receivedContact: contactInfo
      });

    } else if (action === 'approve') {
      if (!row) return jsonResponse(e, { success: false, error: 'Missing required field: row' });
      var fee = payload.fee || 60;
      sheet.getRange(row, 3).setValue(fee);
      sheet.getRange(row, 1, 1, 6).setBackground('#fff2cc');
      return jsonResponse(e, { success: true, message: 'Approved' });

    } else if (action === 'reject') {
      if (!row) return jsonResponse(e, { success: false, error: 'Missing required field: row' });
      sheet.getRange(row, 1, 1, 6).setBackground('#f4cccc');
      return jsonResponse(e, { success: true, message: 'Rejected' });

    } else if (action === 'cancel' || action === 'clear') {
      if (!row) return jsonResponse(e, { success: false, error: 'Missing required field: row' });
      sheet.getRange(row, 1).setValue(''); // Clear name
      sheet.getRange(row, 3).setValue(''); // Clear fee
      sheet.getRange(row, 5).setValue(''); // Clear note
      sheet.getRange(row, 6).setValue(false); // Uncheck conciliado
      sheet.getRange(row, 1, 1, 6).setBackground(null); // Reset color
      return jsonResponse(e, { success: true, message: 'Booking cancelled and slot cleared' });

    } else if (action === 'lock' || action === 'unlock') {
      var targetDate = payload.date;
      var targetSchedule = payload.schedule;
      var force = payload.force === true;
      if (!targetDate) return jsonResponse(e, { success: false, error: 'Missing field: date' });

      var doLock = (action === 'lock');
      var lastRow = sheet.getLastRow();
      var dataRange = sheet.getRange(2, 1, Math.max(lastRow - 1, 0), 6);
      var rows = dataRange.getValues();

      var matchedRows = [];
      for (var i = 0; i < rows.length; i++) {
        var rDate = rows[i][1] ? String(rows[i][1]).trim() : '';
        if (!dateMatches(rDate, targetDate)) continue;
        // If a specific schedule was requested (not 'both'/empty), filter by it.
        if (targetSchedule && targetSchedule !== 'both' && targetSchedule !== '') {
          var rowSchedule = rows[i][3] ? String(rows[i][3]).trim() : '';
          if (rowSchedule !== targetSchedule) continue;
        }
        matchedRows.push(i + 2);
      }

      if (matchedRows.length === 0) {
        return jsonResponse(e, { success: false, error: 'No slot rows found for this date' });
      }

      // Conflict detection: any name (Pending/Approved) on the date being locked
      // is a conflict, unless force=true.
      if (doLock) {
        for (var j = 0; j < rows.length; j++) {
          if (matchedRows.indexOf(j + 2) === -1) continue;
          var cName = String(rows[j][0] || '').trim();
          var isMaint = isMaintenanceName(cName);
          var activeBooking = (!isMaint && cName !== '');
          if (activeBooking && !force) {
            return jsonResponse(e, { success: false, error: 'Day has active bookings. Set force=true to cancel them.', conflicts: true });
          }
        }
      }

      for (var k = 0; k < matchedRows.length; k++) {
        var r = matchedRows[k];
        if (doLock) {
          sheet.getRange(r, 1).setValue(MAINTENANCE_NAME);
          sheet.getRange(r, 3).setValue('');
          sheet.getRange(r, 5).setValue('Mantenimiento');
          sheet.getRange(r, 6).setValue(false);
          sheet.getRange(r, 1, 1, 6).setBackground('#fde68a');
        } else {
          sheet.getRange(r, 1).setValue('');
          sheet.getRange(r, 3).setValue('');
          sheet.getRange(r, 5).setValue('');
          sheet.getRange(r, 6).setValue(false);
          sheet.getRange(r, 1, 1, 6).setBackground(null);
        }
      }

      return jsonResponse(e, {
        success: true,
        message: doLock ? 'Day locked' : 'Day unlocked',
        rows: matchedRows
      });
    }

    return jsonResponse(e, { success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse(e, { success: false, error: err.toString() });
  }
}
