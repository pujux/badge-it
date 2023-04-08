function getContext(req) {
  const context = { ...req.params };

  // get options from the url
  context.options = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";

  return context;
}

module.exports = getContext;
