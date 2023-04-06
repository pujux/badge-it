function getContext(req) {
  return { ...req.params, options: req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "" };
}

module.exports = getContext;
