document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resolveForm");
  const resultDiv = document.getElementById("resolveResult");

  if (!form || !resultDiv) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const bundleName = document.getElementById("bundleName").value;
    const line = document.getElementById("line").value;
    const column = document.getElementById("column").value;

    resultDiv.innerHTML = "<p><em>Resolving...</em></p>";

    try {
      const response = await fetch("/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleName, line, column }),
      });

      const data = await response.json();

      if (!response.ok) {
        resultDiv.innerHTML = renderError(data.error || "Unknown error");
        return;
      }

      if (data.success) {
        resultDiv.innerHTML = renderSuccess(data.result);
      } else {
        resultDiv.innerHTML = renderWarning(data.message);
      }
    } catch (err) {
      resultDiv.innerHTML = renderError(err.message);
    }
  });

  function renderSuccess(result) {
    let html =
      '<table border="1" cellpadding="8" cellspacing="0">' +
      '<tr><th colspan="2">Resolved Location</th></tr>' +
      "<tr><td>Original Source</td><td>" + escapeHtml(result.source) + "</td></tr>" +
      "<tr><td>Line</td><td>" + result.line + "</td></tr>" +
      "<tr><td>Column</td><td>" + result.column + "</td></tr>";

    if (result.name) {
      html += "<tr><td>Name</td><td>" + escapeHtml(result.name) + "</td></tr>";
    }

    html += "</table>";
    return html;
  }

  function renderError(message) {
    return '<p style="color: red;">Error: ' + escapeHtml(message) + "</p>";
  }

  function renderWarning(message) {
    return '<p style="color: orange;">' + escapeHtml(message) + "</p>";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
