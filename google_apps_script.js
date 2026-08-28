function jsonResponse(e, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

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

      if (isReconciled || hasFee) {
        status = 'Approved';
      } else if (!name || name.toString().trim() === '') {
        status = 'Available';
      } else {
        status = 'Pending';
      }

      results.push({
        rowIndex: i + 2,
        name: name || '',
        date: date ? date.toString() : '',
        schedule: schedule || '',
        fee: fee || 0,
        note: note || '',
        status: status
      });
    }
    return jsonResponse(e, { data: results });
  } catch (err) {
    return jsonResponse(e, { error: err.toString() });
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var row = payload.row;
    var sheetName = payload.mes;

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
                "<p style='font-size: 12px; color: #64748b; margin-top: 30px;'>Normas: Ducha previa obligatoria. Volumen moderado. Prohibido papelillo. No sentarse en barandas ni jardineras.</p>" +
              "</div>" +
            "</div>";

          MailApp.sendEmail({
            to: contactInfo,
            subject: subject,
            htmlBody: htmlMessage
          });
          emailSent = true;
        } catch(e) {
          emailError = e.toString();
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
      var fee = payload.fee || 60;
      sheet.getRange(row, 3).setValue(fee);
      sheet.getRange(row, 1, 1, 6).setBackground('#fff2cc'); 
      return jsonResponse(e, { success: true, message: 'Approved' });

    } else if (action === 'reject') {
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
    }

    return jsonResponse(e, { success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse(e, { success: false, error: err.toString() });
  }
}