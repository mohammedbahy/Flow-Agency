import * as brandService from "../services/brand-service.js";
import {
  validateCreateBrandPayload,
  validateListBrandsQuery,
} from "../validators/brand-validator.js";

export const createBrand = async (req, res) => {
  const payload = validateCreateBrandPayload(req.body);
  const brand = await brandService.createBrand(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: brand,
  });
};

export const listBrands = async (req, res) => {
  const query = validateListBrandsQuery(req.query);
  const { items, pagination } = await brandService.listBrands(query, req.user);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const getBrandWorkflow = async (req, res) => {
  const data = await brandService.getBrandWorkflow(req.params.brandId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};

export const getBrandMetrics = async (req, res) => {
  const data = await brandService.getBrandMetrics(req.params.brandId, req.user);

  res.status(200).json({
    success: true,
    data,
  });
};
