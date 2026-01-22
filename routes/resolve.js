const sourceMapResolver = require("../services/sourceMapResolver");

/**
 * Handle source map resolution request
 * Takes bundle name, line number, and column number
 * Returns the original source location
 */
async function resolveSourceMap(req, res) {
  const { bundleName, line, column } = req.body;

  // Validate required parameters
  if (!bundleName) {
    return res.status(400).json({ error: "Bundle name is required" });
  }
  if (line == null || line === "") {
    return res.status(400).json({ error: "Line number is required" });
  }
  if (column == null || column === "") {
    return res.status(400).json({ error: "Column number is required" });
  }

  const lineNum = parseInt(line, 10);
  const columnNum = parseInt(column, 10);

  if (isNaN(lineNum) || lineNum < 1) {
    return res.status(400).json({ error: "Line number must be a positive integer" });
  }
  if (isNaN(columnNum) || columnNum < 0) {
    return res.status(400).json({ error: "Column number must be a non-negative integer" });
  }

  try {
    const result = await sourceMapResolver.resolveLocation(bundleName, lineNum, columnNum);

    if (result.source) {
      res.json({
        success: true,
        input: {
          bundleName,
          line: lineNum,
          column: columnNum,
        },
        result: {
          source: result.source,
          line: result.line,
          column: result.column,
          name: result.name,
        },
      });
    } else {
      res.json({
        success: false,
        input: {
          bundleName,
          line: lineNum,
          column: columnNum,
        },
        message: "Could not resolve location. Source map may not exist for this bundle.",
      });
    }
  } catch (error) {
    console.error("Error resolving source map:", error);
    res.status(500).json({ error: "Internal server error during source map resolution" });
  }
}

module.exports = {
  resolveSourceMap,
};
