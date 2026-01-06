const reportStore = require("../services/reportStore");

function handleReport(req, res) {
  const report = {
    timestamp: new Date().toISOString(),
    path: req.path,
    platform: req.params.platform || null,
    version: req.params.version || null,
    userAgent: req.get("User-Agent"),
    report: req.body,
  };

  console.log("\n========== CSP Violation Received ==========");
  console.log(JSON.stringify(report, null, 2));
  console.log("=============================================\n");

  try {
    reportStore.saveReport(report);
  } catch (error) {
    console.error("Error saving report:", error);
  }

  res.status(204).end();
}

function getReports(req, res) {
  try {
    const reports = reportStore.getReports();
    res.json({
      count: reports.length,
      reports: reports,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to read reports" });
  }
}

function clearReports(req, res) {
  reportStore.clearReports();
  console.log("All reports cleared");
  res.json({ message: "Reports cleared" });
}

module.exports = {
  handleReport,
  getReports,
  clearReports,
};
