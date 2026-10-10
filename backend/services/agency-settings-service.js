import AgencySettings from "../models/agency-settings.js";

const SETTINGS_KEY = "agency";

const formatSettings = (settings) => ({
  id: String(settings._id),
  name: settings.name,
  email: settings.email ?? null,
  phone: settings.phone ?? null,
  address: settings.address ?? null,
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

const getOrCreateSettings = async () => {
  const existing = await AgencySettings.findOne({ key: SETTINGS_KEY });
  if (existing) {
    return existing;
  }

  try {
    return await AgencySettings.create({ key: SETTINGS_KEY });
  } catch (error) {
    if (error?.code === 11000) {
      const raced = await AgencySettings.findOne({ key: SETTINGS_KEY });
      if (raced) {
        return raced;
      }
    }
    throw error;
  }
};

export const getAgencySettings = async () => {
  const settings = await getOrCreateSettings();
  return formatSettings(settings);
};

export const updateAgencySettings = async (payload) => {
  await getOrCreateSettings();

  const settings = await AgencySettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: payload },
    { new: true, runValidators: true },
  );

  return formatSettings(settings);
};
