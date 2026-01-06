const { handleReport, getReports, clearReports } = require("./reports");
const { renderDashboard } = require("./home");

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
}

module.exports = registerRoutes;
