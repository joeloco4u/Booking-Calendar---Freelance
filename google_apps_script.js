function jsonResponse(e, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doGet(e) {
  try {
    var sheetName = e.parameter.mes;
    if (!sheetName) {
      return jsonResponse(e, { error: 'Missing required parameter: mes' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse(e, { error: 'Sheet not found: ' + sheetName });
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return jsonResponse(e, { data: [] });
    }

    var range = sheet.getRange(2, 1, lastRow - 1, 6);
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

      if (!name || name.toString().trim() === '') {
        status = 'Available';
      } else if (conciliado === true || conciliado === 'TRUE' || conciliado === 'true') {
        status = 'Approved';
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

    if (!sheetName) {
      return jsonResponse(e, { success: false, error: 'Missing required field: mes' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse(e, { success: false, error: 'Sheet not found: ' + sheetName });
    }

    if (action === 'book') {
      var name = payload.name;
      var fee = payload.fee || 60;
      var note = payload.note || '';

      if (!row || !name) {
        return jsonResponse(e, { success: false, error: 'Missing required fields: row, name' });
      }

      sheet.getRange(row, 1).setValue(name);
      sheet.getRange(row, 3).setValue(fee);
      sheet.getRange(row, 5).setValue(note);

      return jsonResponse(e, { success: true, message: 'Booking written to row ' + row });

    } else if (action === 'approve') {
      if (!row) {
        return jsonResponse(e, { success: false, error: 'Missing required field: row' });
      }

      sheet.getRange(row, 6).setValue(true);

      return jsonResponse(e, { success: true, message: 'Row ' + row + ' approved (CONCILIADO = true)' });

    } else if (action === 'reject') {
      if (!row) {
        return jsonResponse(e, { success: false, error: 'Missing required field: row' });
      }

      sheet.getRange(row, 1, 1, 6).setBackground('#f4cccc');

      return jsonResponse(e, { success: true, message: 'Row ' + row + ' marked as rejected' });

    } else {
      return jsonResponse(e, { success: false, error: 'Unknown action: ' + action });
    }

  } catch (err) {
    return jsonResponse(e, { success: false, error: err.toString() });
  }
}
