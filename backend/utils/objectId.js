import mongoose from "mongoose";
import HttpError from "./http-error.js";

export const assertValidObjectId = (value, label) => {
  if (!mongoose.isObjectIdOrHexString(value)) {
    throw HttpError.badRequest(`Invalid ${label}`);
  }
};
