const reportStore = require("../services/reportStore");
const {
  aggregateByDirective,
  aggregateByOriginalLocation,
} = require("../utils/aggregations");
const sourceMapResolver = require("../services/sourceMapResolver");
const { renderPage } = require("../views/templates");

async function renderDashboard(req, res) {
  const reports = reportStore.getReports();
  const directiveData = aggregateByDirective(reports);
  const locationData = await aggregateByOriginalLocation(
    reports,
    sourceMapResolver
  );

  res.send(
    renderPage({
      reportCount: reports.length,
      directiveData,
      locationData,
    })
  );
}

module.exports = {
  renderDashboard,
};
