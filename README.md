# CSP Report Collector

A lightweight local Node.js/Express server that collects Content-Security-Policy (CSP) violation reports from browsers. Useful for debugging CSP policies during development.

## Quick Start

```bash
npm install
node server.js
# Server runs at http://localhost:3001
```

## What It Does

When you configure a CSP header with `report-uri`, browsers send violation reports to that URL. This server:

1. Receives CSP violation reports from browsers
2. Logs violations to the console
3. Persists all reports to `csp-reports.json`
4. Provides a dashboard with aggregated violation counts

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard with violation aggregations |
| POST | `/csp-report` | Receive CSP violations |
| POST | `/csp-report/:platform` | Receive with platform param |
| POST | `/csp-report/:platform/:version` | Receive with platform & version |
| GET | `/reports` | View all collected reports (JSON) |
| DELETE | `/reports` | Clear all reports |

## CSP Integration

Configure your application's CSP header to send violations here:

```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri http://localhost:3001/csp-report
```

## CSP Report Format

Browsers send POST requests with `Content-Type: application/csp-report` containing:

```json
{
  "csp-report": {
    "document-uri": "http://localhost:5601/app/home",
    "violated-directive": "style-src-elem",
    "effective-directive": "style-src-elem",
    "blocked-uri": "inline",
    "source-file": "http://localhost:5601/app/home",
    "line-number": 1,
    "column-number": 6974
  }
}
```

## Source Map Resolution

The dashboard can resolve minified/bundled violation locations back to original source code using source maps.

### Setup

1. Place your `.map` files in the `source-maps/` directory (subdirectories supported)
2. The server indexes all `.map` files recursively on first request

### How Matching Works

The resolver extracts the filename from the violation's `source-file` URL and looks for a matching source map:

```
source-file: "http://localhost:5601/bundles/plugin/home/home.plugin.js"
           → extracts: "home.plugin.js"
           → matches:  source-maps/plugin/home/home.plugin.js.map
```

**Requirements for matching:**
- The `source-file` URL must end with the JS filename (e.g., `/path/to/bundle.js`)
- A corresponding `.map` file must exist (e.g., `bundle.js.map`)

**What won't match:**
- HTML page URLs (e.g., `/app/home`) - these are inline violations
- JS files without source maps

### Directory Structure Example

```
source-maps/
├── entry/
│   └── core/
│       ├── core.chunk.0.js.map
│       └── core.entry.js.map
└── plugin/
    ├── home/
    │   └── home.plugin.js.map
    └── dashboard/
        └── dashboard.plugin.js.map
```

## File Structure

```
csp-collection/
├── server.js                  # Entry point
├── config.js                  # Configuration (PORT, file paths)
├── csp-reports.json           # Persisted reports
├── source-maps/               # Source map files (add your .map files here)
├── middleware/
│   └── cors.js                # CORS middleware
├── routes/
│   ├── index.js               # Route registration
│   ├── reports.js             # Report API handlers
│   └── home.js                # Dashboard rendering
├── services/
│   ├── reportStore.js         # File I/O for reports
│   └── sourceMapResolver.js   # Source map resolution
└── utils/
    └── aggregations.js        # Aggregation logic
```

## Dashboard

The home page (`/`) displays:

- **Violations by Directive**: Count of violations grouped by CSP directive (e.g., `style-src-elem`, `script-src`)
- **Violations by Location**: Count grouped by directive, line, column, received source file, and original source (resolved via source maps when available)

## Dependencies

- [Express 5](https://expressjs.com/) - Web framework
- [source-map](https://github.com/mozilla/source-map) - Mozilla's source map parsing library
