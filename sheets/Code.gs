// Paste into Extensions > Apps Script in the supplied spreadsheet.
var SPREADSHEET_ID = '1k7wdWHJbV7jmlDH1cadgvVNpcYUN_5z1s1rzy7whj3s';
var WEBSITE_URL = 'https://dp-b-i-t-p-bu-i-3.vercel.app';
var RESULTS_TAB = 'Bài nộp học viên';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Bài nộp học viên')
    .addItem('Bật đồng bộ tự động', 'setup')
    .addItem('Đồng bộ ngay', 'syncNow').addToUi();
}

function setup() {
  // Verify the connection before installing a repeating trigger.
  if (!syncNow()) throw new Error('Chưa kết nối được website. Kiểm tra website đã cập nhật.');
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'syncNow') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('syncNow').timeBased().everyMinutes(1).create();
}

function doPost() {
  // Ignore caller-supplied rows. Only import acknowledged submissions from the website.
  var ok = false;
  try { ok = syncNow(); } catch (error) { ok = false; }
  return ContentService.createTextOutput(JSON.stringify({ok: ok}))
    .setMimeType(ContentService.MimeType.JSON);
}

function syncNow() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var response = UrlFetchApp.fetch(WEBSITE_URL + '/api/trainer/export', {
      method: 'post', contentType: 'application/json', headers: {Origin: WEBSITE_URL},
      payload: JSON.stringify({format: 'json'}), muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) throw new Error('Website chưa trả dữ liệu: ' + response.getResponseCode());
    var data = JSON.parse(response.getContentText());
    if (!Array.isArray(data.headers) || data.headers.length !== 12 || !Array.isArray(data.rows))
      throw new Error('Định dạng dữ liệu không hợp lệ.');
    var book = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = book.getSheetByName(RESULTS_TAB) || book.insertSheet(RESULTS_TAB);
    if (sheet.getLastRow() > 0) {
      var existingHeaders = sheet.getRange(1, 1, 1, data.headers.length).getValues()[0];
      if (JSON.stringify(existingHeaders) !== JSON.stringify(data.headers))
        throw new Error('Tab đã có nội dung khác. Đổi RESULTS_TAB sang tên tab trống.');
    } else {
      sheet.getRange(1, 1, 1, data.headers.length).setValues([data.headers])
        .setBackground('#C21870').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    // Index existing receipt IDs: retries and concurrent submissions never add duplicates.
    var existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, data.headers.length).getValues() : [];
    var index = {};
    existing.forEach(function(row, i) { index[String(row[0])] = i; });
    var changed = false;
    data.rows.forEach(function(row) {
      if (!Array.isArray(row) || row.length !== data.headers.length || !row[0])
        throw new Error('Dòng dữ liệu không hợp lệ.');
      // Prefix dangerous strings so free-text answers cannot execute Sheet formulas.
      var safe = row.map(function(value) {
        return typeof value === 'string' && /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
      });
      var id = String(row[0]);
      if (index[id] === undefined) {
        index[id] = existing.length;
        existing.push(safe);
        changed = true;
      } else if (JSON.stringify(existing[index[id]]) !== JSON.stringify(safe)) {
        existing[index[id]] = safe;
        changed = true;
      }
    });
    if (changed && existing.length) {
      var requiredRows = existing.length + 1;
      if (requiredRows > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
      var range = sheet.getRange(2, 1, existing.length, data.headers.length);
      range.setNumberFormat('@').setValues(existing).setWrap(true).setVerticalAlignment('top');
      sheet.getRange(2, 5, existing.length, 3).setNumberFormat('#,##0');
    }
    return true;
  } finally { lock.releaseLock(); }
}
