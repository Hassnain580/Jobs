const sharp = require('sharp');

const PRESETS = {
  profile: { maxWidth: 800, maxHeight: 800, maxBytes: 100 * 1024 },
  logo:    { maxWidth: 400, maxHeight: 400, maxBytes: 150 * 1024 },
  banner:  { maxWidth: 1200, maxHeight: 400, maxBytes: 300 * 1024 },
};

const compressImage = async (buffer, options = {}) => {
  const { preset, maxWidth, maxHeight, maxBytes, quality = 80 } = options;

  const limits = preset && PRESETS[preset]
    ? PRESETS[preset]
    : { maxWidth: maxWidth || 1200, maxHeight: maxHeight || 1200, maxBytes: maxBytes || 300 * 1024 };

  let image = sharp(buffer).webp({ quality });

  const meta = await sharp(buffer).metadata();
  if (meta.width > limits.maxWidth || meta.height > limits.maxHeight) {
    image = sharp(buffer).resize(limits.maxWidth, limits.maxHeight, { fit: 'inside', withoutEnlargement: true }).webp({ quality });
  }

  let result = await image.toBuffer();

  if (result.length > limits.maxBytes) {
    const reducedQuality = Math.max(40, Math.floor(quality * 0.7));
    result = await sharp(buffer)
      .resize(limits.maxWidth, limits.maxHeight, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: reducedQuality })
      .toBuffer();
  }

  return result;
};

module.exports = { compressImage, PRESETS };
