const fs = require("fs");
const { REPORTS_FILE } = require("../config");

function initStore() {
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, "[]");
  }
}

function getReports() {
  return JSON.parse(fs.readFileSync(REPORTS_FILE, "utf8"));
}

function saveReport(report) {
  const reports = getReports();
  reports.push(report);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

function clearReports() {
  fs.writeFileSync(REPORTS_FILE, "[]");
}

module.exports = {
  initStore,
  getReports,
  saveReport,
  clearReports,
};
