const colorQueryRegex = /&{0,1}color=[^&]+/;

function getContext(req) {
  const context = { ...req.params, color: "brightgreen" };

  // get options from the url
  context.options = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";

  if (colorQueryRegex.test(context.options)) {
    context.color = context.options.match(colorQueryRegex)[0].split("=")[1];
    context.options = context.options.replace(colorQueryRegex, "");
  }

  return context;
}

module.exports = getContext;
