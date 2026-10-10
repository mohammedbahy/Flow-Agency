import * as agencySettingsService from "../services/agency-settings-service.js";
import { validateUpdateAgencySettingsPayload } from "../validators/agency-settings-validator.js";

export const getAgencySettings = async (req, res, next) => {
  try {
    const data = await agencySettingsService.getAgencySettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAgencySettings = async (req, res, next) => {
  try {
    const payload = validateUpdateAgencySettingsPayload(req.body);
    const data = await agencySettingsService.updateAgencySettings(payload);
    res.status(200).json({
      success: true,
      message: "Agency settings updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
