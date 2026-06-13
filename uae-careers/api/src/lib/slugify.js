const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

const slugifyWithSuffix = (str, suffix = null) => {
  const base = slugify(str);
  if (suffix === null) return base;
  return `${base}-${suffix}`;
};

module.exports = { slugify, slugifyWithSuffix };
