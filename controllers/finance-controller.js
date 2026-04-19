const mongoose = require("mongoose");
const FinanceSheet = require("../models/finance-model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const badRequest = (res, errors, message = "Validation failed") =>
  res.status(400).json({ message, errors });

const notFound = (res) => res.status(404).json({ message: "Financial sheet not found" });

const validateCostLine = (item, path) => {
  const errors = [];
  if (!item || typeof item !== "object") {
    errors.push(`${path} must be an object`);
    return errors;
  }
  if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
    errors.push(`${path}.id must be a non-empty string`);
  }
  if (item.name !== undefined && typeof item.name !== "string") {
    errors.push(`${path}.name must be a string when provided`);
  }
  if (item.unit !== undefined && typeof item.unit !== "string") {
    errors.push(`${path}.unit must be a string when provided`);
  }
  if (item.quantity !== undefined && (typeof item.quantity !== "number" || Number.isNaN(item.quantity))) {
    errors.push(`${path}.quantity must be a number when provided`);
  }
  if (item.unitPrice !== undefined && (typeof item.unitPrice !== "number" || Number.isNaN(item.unitPrice))) {
    errors.push(`${path}.unitPrice must be a number when provided`);
  }
  return errors;
};

const validateFixedCost = (item, path) => {
  const errors = validateCostLine(item, path);
  if (!item || typeof item !== "object") return errors;
  if (item.periodOfUse !== undefined && (typeof item.periodOfUse !== "number" || Number.isNaN(item.periodOfUse))) {
    errors.push(`${path}.periodOfUse must be a number when provided`);
  }
  if (item.resaleValue !== undefined && (typeof item.resaleValue !== "number" || Number.isNaN(item.resaleValue))) {
    errors.push(`${path}.resaleValue must be a number when provided`);
  }
  return errors;
};

const validateRevenueItem = (item, path) => validateCostLine(item, path);

const validateCostLineArray = (arr, path, validator) => {
  const errors = [];
  if (!Array.isArray(arr)) {
    errors.push(`${path} must be an array`);
    return errors;
  }
  arr.forEach((item, i) => {
    errors.push(...validator(item, `${path}[${i}]`));
  });
  return errors;
};

const validateVariableCosts = (vc, pathPrefix = "variableCosts") => {
  const errors = [];
  if (vc === undefined) return errors;
  if (!vc || typeof vc !== "object") {
    errors.push(`${pathPrefix} must be an object`);
    return errors;
  }
  const inputs = Array.isArray(vc.inputsServices) ? vc.inputsServices : [];
  const labour = Array.isArray(vc.labour) ? vc.labour : [];
  errors.push(...validateCostLineArray(inputs, `${pathPrefix}.inputsServices`, validateCostLine));
  errors.push(...validateCostLineArray(labour, `${pathPrefix}.labour`, validateCostLine));
  return errors;
};

const validateCreatePayload = (body) => {
  const errors = [];

  if (!body.ventureId || !isValidObjectId(body.ventureId)) {
    errors.push("ventureId is required and must be a valid ObjectId");
  }

  if (body.currency === undefined || typeof body.currency !== "string" || body.currency.trim() === "") {
    errors.push("currency is required and must be a non-empty string");
  } else if (body.currency.trim().length > 5) {
    errors.push("currency must be at most 5 characters");
  }

  if (body.exchangeRate === undefined || typeof body.exchangeRate !== "number" || Number.isNaN(body.exchangeRate)) {
    errors.push("exchangeRate is required and must be a number");
  } else if (body.exchangeRate < 0) {
    errors.push("exchangeRate must be >= 0");
  }

  if (body.fixedCosts !== undefined) {
    errors.push(...validateCostLineArray(body.fixedCosts, "fixedCosts", validateFixedCost));
  }

  if (body.variableCosts !== undefined) {
    errors.push(...validateVariableCosts(body.variableCosts));
  }

  if (body.revenueItems !== undefined) {
    errors.push(...validateCostLineArray(body.revenueItems, "revenueItems", validateRevenueItem));
    body.revenueItems.forEach((item, i) => {
      if (item && (item.type === undefined || item.type === null || item.type === "")) {
        errors.push(`revenueItems[${i}].type is required`);
      }
    });
  }

  return errors;
};

const validatePartialPayload = (body) => {
  const errors = [];

  if (body.currency !== undefined) {
    if (typeof body.currency !== "string" || body.currency.trim() === "") {
      errors.push("currency must be a non-empty string when provided");
    } else if (body.currency.trim().length > 5) {
      errors.push("currency must be at most 5 characters");
    }
  }

  if (body.exchangeRate !== undefined) {
    if (typeof body.exchangeRate !== "number" || Number.isNaN(body.exchangeRate)) {
      errors.push("exchangeRate must be a number when provided");
    } else if (body.exchangeRate < 0) {
      errors.push("exchangeRate must be >= 0 when provided");
    }
  }

  if (body.fixedCosts !== undefined) {
    errors.push(...validateCostLineArray(body.fixedCosts, "fixedCosts", validateFixedCost));
  }

  if (body.variableCosts !== undefined) {
    errors.push(...validateVariableCosts(body.variableCosts));
  }

  if (body.revenueItems !== undefined) {
    errors.push(...validateCostLineArray(body.revenueItems, "revenueItems", validateRevenueItem));
    body.revenueItems.forEach((item, i) => {
      if (!item || item.type === undefined || item.type === null || item.type === "") {
        errors.push(`revenueItems[${i}].type is required`);
      } else if (!["product", "by-product"].includes(item.type)) {
        errors.push(`revenueItems[${i}].type must be "product" or "by-product"`);
      }
    });
  }

  return errors;
};

exports.getByVenture = async (req, res) => {
  try {
    const { ventureId } = req.query;
    if (!ventureId) {
      return badRequest(res, ["ventureId query parameter is required"]);
    }
    if (!isValidObjectId(ventureId)) {
      return res.status(200).json(null);
    }

    const sheet = await FinanceSheet.findOne({ userId: req.userId, ventureId });
    return res.status(200).json(sheet ?? null);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    delete body.userId;
    delete body._id;

    if (body.fixedCosts === undefined) body.fixedCosts = [];
    if (body.revenueItems === undefined) body.revenueItems = [];
    if (body.variableCosts == null || typeof body.variableCosts !== "object") {
      body.variableCosts = { inputsServices: [], labour: [] };
    } else {
      body.variableCosts = {
        inputsServices: Array.isArray(body.variableCosts.inputsServices)
          ? body.variableCosts.inputsServices
          : [],
        labour: Array.isArray(body.variableCosts.labour) ? body.variableCosts.labour : [],
      };
    }

    const errors = validateCreatePayload(body);
    if (errors.length) {
      return badRequest(res, errors);
    }

    const existing = await FinanceSheet.findOne({
      userId: req.userId,
      ventureId: body.ventureId,
    });
    if (existing) {
      return res.status(409).json({
        message: "A financial sheet already exists for this venture.",
        errors: ["Duplicate sheet for this userId and ventureId pair."],
      });
    }

    const doc = await FinanceSheet.create({
      userId: req.userId,
      ventureId: body.ventureId,
      currency: body.currency.trim(),
      exchangeRate: body.exchangeRate,
      fixedCosts: body.fixedCosts ?? [],
      variableCosts: body.variableCosts ?? { inputsServices: [], labour: [] },
      revenueItems: body.revenueItems ?? [],
    });

    return res.status(201).json(doc);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A financial sheet already exists for this venture.",
        errors: ["Duplicate sheet for this userId and ventureId pair."],
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const sheet = await FinanceSheet.findById(req.params.id);
    if (!sheet || sheet.userId.toString() !== req.userId.toString()) {
      return notFound(res);
    }

    const body = { ...req.body };
    delete body.userId;
    delete body._id;
    delete body.ventureId;

    const errors = validatePartialPayload(body);
    if (errors.length) {
      return badRequest(res, errors);
    }

    const update = {};
    if (body.currency !== undefined) update.currency = body.currency.trim();
    if (body.exchangeRate !== undefined) update.exchangeRate = body.exchangeRate;
    if (body.fixedCosts !== undefined) update.fixedCosts = body.fixedCosts;

    if (body.variableCosts !== undefined) {
      const existingVc = sheet.variableCosts?.toObject?.() || {
        inputsServices: [],
        labour: [],
      };
      update.variableCosts = {
        inputsServices:
          body.variableCosts.inputsServices !== undefined
            ? body.variableCosts.inputsServices
            : existingVc.inputsServices,
        labour:
          body.variableCosts.labour !== undefined ? body.variableCosts.labour : existingVc.labour,
      };
    }

    if (body.revenueItems !== undefined) update.revenueItems = body.revenueItems;

    const updated = await FinanceSheet.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return notFound(res);
    }

    const sheet = await FinanceSheet.findById(req.params.id);
    if (!sheet || sheet.userId.toString() !== req.userId.toString()) {
      return notFound(res);
    }

    await FinanceSheet.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
