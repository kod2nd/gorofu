export const toProperCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export const stripHtmlAndTruncate = (html, length = 50) => {
  if (!html) return '';
  // Replace HTML tags with a space, collapse multiple whitespace chars, and trim.
  const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};