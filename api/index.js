const app = require("../server/app");

module.exports = function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const rewrittenPath = url.searchParams.get("path");

  if (rewrittenPath) {
    url.searchParams.delete("path");
    const query = url.searchParams.toString();
    req.url = `/api/${rewrittenPath}${query ? `?${query}` : ""}`;
  }

  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
  }

  return app(req, res);
};
