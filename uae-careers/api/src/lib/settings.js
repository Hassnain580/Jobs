const prisma = require('./prisma');

const getSetting = async (key) => {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? setting.value : null;
};

const setSetting = async (key, value) => {
  return prisma.setting.upsert({
    where: { key },
    update: { value: String(value) },
    create: { key, value: String(value) },
  });
};

const getSettings = async (group) => {
  const settings = await prisma.setting.findMany({ where: { group } });
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
};

const getAllSettings = async () => {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
};

module.exports = { getSetting, setSetting, getSettings, getAllSettings };
