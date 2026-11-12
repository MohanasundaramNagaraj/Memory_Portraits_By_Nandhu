/**
 * Photography Inquiry Wizard - Google Apps Script
 *
 * Setup:
 * 1. Create a Google Sheet and copy its spreadsheet ID.
 * 2. Open Extensions > Apps Script.
 * 3. Paste this code into Code.gs.
 * 4. Replace the two configuration values below.
 * 5. Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 6. Copy the Web app URL into GOOGLE_SCRIPT_URL in your HTML.
 */

const SPREADSHEET_ID = '1bsBo95lNWXvgQydBLpbUafa9iDmFAiHdTKdgV0yoM3E';
const SHEET_NAME = 'Inquiries';
const ADMIN_EMAIL = 'memoryportraits21@gmail.com';
function doGet() {
  return ContentService
    .createTextOutput(
      'Photography Inquiry API is running successfully!'
    )
    .setMimeType(ContentService.MimeType.TEXT);
}
function doPost(e) {
  try {
  try {
    if (!e || !e.parameter || !e.parameter.payload) {
      throw new Error(
        'Missing inquiry payload. Submit through the website form.'
      );
    }

    const data = JSON.parse(e.parameter.payload);

    // Continue with your existing processing code...

  } catch (error) {
    console.error(error);
    throw error;
  }

    const data = JSON.parse(e.parameter.payload);

    // Basic server-side validation. Never rely only on browser validation.
    const required = ['event_type', 'event_date', 'budget', 'full_name', 'email', 'phone'];
    required.forEach(function (key) {
      if (!data[key] || String(data[key]).trim() === '') {
        throw new Error('Missing required field: ' + key);
      }
    });

    const email = String(data.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid customer email address.');
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submitted At',
        'Event Type',
        'Event Date',
        'Budget',
        'Full Name',
        'Email',
        'Phone'
      ]);
      sheet.setFrozenRows(1);
    }

    const submittedAt = data.submitted_at
      ? new Date(data.submitted_at)
      : new Date();

    // Prevent spreadsheet formula injection from user-entered values.
    function safeCell(value) {
      const text = String(value == null ? '' : value).trim();
      return /^[=+\-@]/.test(text) ? "'" + text : text;
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        submittedAt,
        safeCell(data.event_type),
        safeCell(data.event_date),
        safeCell(data.budget),
        safeCell(data.full_name),
        email,
        safeCell(data.phone)
      ]);
    } finally {
      lock.releaseLock();
    }

    const customerName = escapeHtml_(data.full_name);
    const eventType = escapeHtml_(data.event_type);
    const eventDate = escapeHtml_(data.event_date);
    const budget = escapeHtml_(data.budget);
    const phone = escapeHtml_(data.phone);

    // Confirmation email to the address entered by the customer.
    /* MailApp.sendEmail({
      to: email,
      subject: 'We received your photography inquiry',
      body:
        'Hi ' + data.full_name + ',\n\n' +
        'Thank you for contacting Memory Portraits By Nandhu. We have received your inquiry.\n\n' +
        'Event: ' + data.event_type + '\n' +
        'Event date: ' + data.event_date + '\n' +
        'Budget: ' + data.budget + '\n\n' +
        'Our team will contact you shortly.\n\n' +
        'Memory Portraits By Nandhu',
      htmlBody:
        '<p>Hi ' + customerName + ',</p>' +
        '<p>Thank you for contacting <strong>Memory Portraits By Nandhu</strong>. We have received your inquiry.</p>' +
        '<p><strong>Event:</strong> ' + eventType + '<br>' +
        '<strong>Event date:</strong> ' + eventDate + '<br>' +
        '<strong>Budget:</strong> ' + budget + '</p>' +
        '<p>Our team will contact you shortly.</p>' +
        '<p>Memory Portraits By Nandhu</p>'
    });*/

    // Internal notification to the business owner.
    if (ADMIN_EMAIL && ADMIN_EMAIL.indexOf('@') > 0) {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New photography inquiry - ' + String(data.full_name),
        body:
          'A new photography inquiry was submitted.\n\n' +
          'Name: ' + data.full_name + '\n\n' +
          'Email: ' + email + '\n\n' +
          'Phone: ' + data.phone + '\n\n' +
          'Event: ' + data.event_type + '\n\n' +
          'Event date: ' + data.event_date + '\n\n' +
          'Budget: ' + data.budget
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: String(error.message || error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeHtml_(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}
