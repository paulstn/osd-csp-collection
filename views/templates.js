/**
 * HTML template functions for the dashboard
 */

function renderPageHeader() {
  return `<h1>CSP Report Collector</h1>`;
}

function renderReportCount(count) {
  return `<p>Reports collected: ${count}</p>`;
}

function renderSourceMapLookupForm() {
  return `
    <h2>Manual Source Map Lookup</h2>
    <p><em>Enter bundle information to resolve the original source location</em></p>
    <form id="resolveForm">
      <table cellpadding="4" cellspacing="0">
        <tr>
          <td><label for="bundleName">Bundle Name:</label></td>
          <td><input type="text" id="bundleName" name="bundleName" placeholder="e.g., home.plugin.js" size="40" required></td>
        </tr>
        <tr>
          <td><label for="line">Line Number:</label></td>
          <td><input type="number" id="line" name="line" min="1" placeholder="1-based" required></td>
        </tr>
        <tr>
          <td><label for="column">Column Number:</label></td>
          <td><input type="number" id="column" name="column" min="0" placeholder="0-based" required></td>
        </tr>
        <tr>
          <td></td>
          <td><button type="submit">Resolve Location</button></td>
        </tr>
      </table>
    </form>
    <div id="resolveResult" style="margin-top: 16px;"></div>
  `;
}

function renderDirectiveTable(directiveData) {
  const rows = directiveData
    .map(
      ([directive, count]) => `<tr><td>${count}</td><td>${directive}</td></tr>`
    )
    .join("");

  return `
    <h2>Violations by Directive</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>Count</th><th>Directive</th></tr>
      ${rows || "<tr><td colspan='2'>No reports yet</td></tr>"}
    </table>
  `;
}

function renderLocationTable(locationData) {
  const rows = locationData
    .map(([key, count]) => {
      const [directive, line, column, sourceFile, originalSource] = key.split("|");
      return `<tr><td>${count}</td><td>${directive}</td><td>${line}</td><td>${column}</td><td>${sourceFile}</td><td>${originalSource}</td></tr>`;
    })
    .join("");

  return `
    <h2>Violations by Location</h2>
    <p><em>Original source resolved using source maps in <code>source-maps/</code> directory</em></p>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>Count</th><th>Directive</th><th>Line</th><th>Column</th><th>Received Source File</th><th>Original Source</th></tr>
      ${rows || "<tr><td colspan='6'>No reports yet</td></tr>"}
    </table>
  `;
}

function renderFooterLinks() {
  return `
    <br>
    <ul>
      <li><a href="/reports">View Reports (JSON)</a></li>
      <li>POST to <code>/csp-report</code> to submit reports</li>
    </ul>
  `;
}

function renderScripts() {
  return `<script src="/js/resolve.js"></script>`;
}

function renderPage({ reportCount, directiveData, locationData }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>CSP Report Collector</title>
    </head>
    <body>
      ${renderPageHeader()}
      ${renderReportCount(reportCount)}
      ${renderSourceMapLookupForm()}
      ${renderDirectiveTable(directiveData)}
      ${renderLocationTable(locationData)}
      ${renderFooterLinks()}
      ${renderScripts()}
    </body>
    </html>
  `;
}

module.exports = {
  renderPageHeader,
  renderReportCount,
  renderSourceMapLookupForm,
  renderDirectiveTable,
  renderLocationTable,
  renderFooterLinks,
  renderScripts,
  renderPage,
};
