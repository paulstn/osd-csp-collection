const fs = require("fs");
const path = require("path");
const { SourceMapConsumer } = require("source-map");

const SOURCE_MAPS_DIR = path.join(__dirname, "..", "source-maps");

// Cache for loaded source map consumers
const consumerCache = new Map();

// Index of source map files: filename (without .map) → full path
let sourceMapIndex = null;

/**
 * Recursively find all .map files in a directory
 */
function findMapFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMapFiles(fullPath, files);
    } else if (entry.name.endsWith(".map")) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Build an index of all source map files
 * Maps the JS filename (e.g., "core.chunk.0.js") to the full .map path
 */
function buildSourceMapIndex() {
  const index = new Map();
  const mapFiles = findMapFiles(SOURCE_MAPS_DIR);

  for (const mapPath of mapFiles) {
    // Get the JS filename by removing .map extension
    const mapFilename = path.basename(mapPath);
    const jsFilename = mapFilename.replace(/\.map$/, "");
    index.set(jsFilename, mapPath);
  }

  console.log(`📍 Indexed ${index.size} source maps`);
  return index;
}

/**
 * Get the source map index, building it if necessary
 */
function getIndex() {
  if (!sourceMapIndex) {
    sourceMapIndex = buildSourceMapIndex();
  }
  return sourceMapIndex;
}

/**
 * Rebuild the source map index (call when files change)
 */
function rebuildIndex() {
  sourceMapIndex = buildSourceMapIndex();
}

/**
 * Extract filename from a URL or file path
 * e.g., "https://example.com/static/bundle.js" → "bundle.js"
 */
function extractFilename(sourceFileUrl) {
  if (!sourceFileUrl) return null;
  try {
    // Try parsing as URL first
    const url = new URL(sourceFileUrl);
    const pathname = url.pathname;
    return path.basename(pathname);
  } catch {
    // Fall back to treating as file path
    return path.basename(sourceFileUrl);
  }
}

/**
 * Get the path to the source map file for a given source file URL
 * Searches the index for a matching filename
 * Returns null if no matching source map exists
 */
function getSourceMapPath(sourceFileUrl) {
  const filename = extractFilename(sourceFileUrl);
  if (!filename) return null;

  const index = getIndex();

  // Direct match: filename.js → filename.js.map
  if (index.has(filename)) {
    return index.get(filename);
  }

  return null;
}

// Track pending consumer creations to avoid race conditions
const pendingConsumers = new Map();

/**
 * Get or create a SourceMapConsumer for a given source map path
 * Uses a pending map to avoid creating duplicate consumers for the same path
 */
async function getConsumer(mapPath) {
  if (consumerCache.has(mapPath)) {
    return consumerCache.get(mapPath);
  }

  // If already creating this consumer, wait for it
  if (pendingConsumers.has(mapPath)) {
    return pendingConsumers.get(mapPath);
  }

  const promise = (async () => {
    try {
      const rawSourceMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
      const consumer = await new SourceMapConsumer(rawSourceMap);
      consumerCache.set(mapPath, consumer);
      return consumer;
    } catch (error) {
      console.error(`Error loading source map ${mapPath}:`, error.message);
      return null;
    } finally {
      pendingConsumers.delete(mapPath);
    }
  })();

  pendingConsumers.set(mapPath, promise);
  return promise;
}

/**
 * Resolve a minified location to its original source location
 *
 * @param {string} sourceFile - The URL or path of the minified file
 * @param {number} line - The line number in the minified file (1-based)
 * @param {number} column - The column number in the minified file (0-based)
 * @returns {Promise<{source: string|null, line: number|null, column: number|null, name: string|null}>}
 */
async function resolveLocation(sourceFile, line, column) {
  const result = {
    source: null,
    line: null,
    column: null,
    name: null,
  };

  if (!sourceFile || line == null || column == null) {
    return result;
  }

  const mapPath = getSourceMapPath(sourceFile);
  if (!mapPath) {
    return result;
  }

  const consumer = await getConsumer(mapPath);
  if (!consumer) {
    return result;
  }

  try {
    const originalPosition = consumer.originalPositionFor({
      line: line,
      column: column,
    });

    if (originalPosition.source) {
      result.source = originalPosition.source;
      result.line = originalPosition.line;
      result.column = originalPosition.column;
      result.name = originalPosition.name;
    }
  } catch (error) {
    console.error(`Error resolving position:`, error.message);
  }

  return result;
}

/**
 * Clear the consumer cache (useful for testing or when source maps are updated)
 */
function clearCache() {
  for (const consumer of consumerCache.values()) {
    consumer.destroy();
  }
  consumerCache.clear();
}

module.exports = {
  extractFilename,
  getSourceMapPath,
  resolveLocation,
  clearCache,
  rebuildIndex,
};
