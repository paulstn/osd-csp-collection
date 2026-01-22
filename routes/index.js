const { handleReport, getReports, clearReports } = require("./reports");
const { renderDashboard } = require("./home");
const { resolveSourceMap } = require("./resolve");

function registerRoutes(app) {
  // CSP report endpoints
  app.post("/csp-report", handleReport);
  app.post("/csp-report/:platform", handleReport);
  app.post("/csp-report/:platform/:version", handleReport);

  // Reports API
  app.get("/reports", getReports);
  app.delete("/reports", clearReports);

  // Dashboard
  app.get("/", renderDashboard);

  // Source map resolution
  app.post("/resolve", resolveSourceMap);
}

module.exports = registerRoutes;
