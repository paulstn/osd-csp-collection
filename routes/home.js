const reportStore = require("../services/reportStore");
const {
  aggregateByDirective,
  aggregateByOriginalLocation,
} = require("../utils/aggregations");
const sourceMapResolver = require("../services/sourceMapResolver");

async function renderDashboard(req, res) {
  const reports = reportStore.getReports();

  const directiveData = aggregateByDirective(reports);
  const directiveRows = directiveData
    .map(
      ([directive, count]) => `<tr><td>${count}</td><td>${directive}</td></tr>`
    )
    .join("");

  // Resolve original locations using source maps
  const locationData = await aggregateByOriginalLocation(
    reports,
    sourceMapResolver
  );
  const locationRows = locationData
    .map(([key, count]) => {
      const [directive, line, column, sourceFile, originalSource] = key.split("|");
      return `<tr><td>${count}</td><td>${directive}</td><td>${line}</td><td>${column}</td><td>${sourceFile}</td><td>${originalSource}</td></tr>`;
    })
    .join("");

  res.send(`
    <h1>CSP Report Collector</h1>
    <p>Reports collected: ${reports.length}</p>
    <h2>Violations by Directive</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>Count</th><th>Directive</th></tr>
      ${directiveRows || "<tr><td colspan='2'>No reports yet</td></tr>"}
    </table>
    <h2>Violations by Location</h2>
    <p><em>Original source resolved using source maps in <code>source-maps/</code> directory</em></p>
    <table border="1" cellpadding="8" cellspacing="0">
      <tr><th>Count</th><th>Directive</th><th>Line</th><th>Column</th><th>Received Source File</th><th>Original Source</th></tr>
      ${locationRows || "<tr><td colspan='6'>No reports yet</td></tr>"}
    </table>
    <br>
    <ul>
      <li><a href="/reports">View Reports (JSON)</a></li>
      <li>POST to <code>/csp-report</code> to submit reports</li>
    </ul>
  `);
}

module.exports = {
  renderDashboard,
};
