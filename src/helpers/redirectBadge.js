function encodeBadgeSegment(value) {
  return encodeURIComponent(String(value)).replace(/-/g, "--");
}

function redirectBadge(res, { label, message, color, options = "" }) {
  const url = `https://img.shields.io/badge/${encodeBadgeSegment(label)}-${encodeBadgeSegment(message)}-${color}${options}`;
  res.redirect(url);
}

module.exports = redirectBadge;
