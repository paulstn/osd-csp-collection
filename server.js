const express = require("express");
const { PORT } = require("./config");
const corsMiddleware = require("./middleware/cors");
const { initStore } = require("./services/reportStore");
const registerRoutes = require("./routes");

const app = express();

// Initialize report storage
initStore();

// Parse CSP report content types
app.use(express.json({ type: "application/csp-report" }));
app.use(express.json({ type: "application/json" }));

// CORS middleware
app.use(corsMiddleware);

// Register routes
registerRoutes(app);

app.listen(PORT, () => {
  console.log(`\n🛡️  CSP Report Collector running at http://localhost:${PORT}`);
  console.log(`   POST /csp-report                  - Receive CSP violations`);
  console.log(`   POST /csp-report/:platform        - With platform`);
  console.log(`   POST /csp-report/:platform/:ver   - With platform & version`);
  console.log(
    `   GET  /reports                     - View all collected reports`
  );
  console.log(`   DELETE /reports                   - Clear all reports\n`);
});
