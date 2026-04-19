const mongoose = require("mongoose");
const { BusinessModelCanvas, BMC_BLOCK_KEYS } = require("../models/bmc-model");

// ─── helpers ────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateBody = (body) => {
  const errors = [];

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      errors.push("title must be a non-empty string");
    } else if (body.title.trim().length > 200) {
      errors.push("title must be at most 200 characters");
    }
  }

  if (body.ventureId !== undefined && body.ventureId !== null && body.ventureId !== "") {
    if (!isValidObjectId(body.ventureId)) {
      errors.push("ventureId must be a valid ObjectId");
    }
  }

  if (body.status !== undefined && !["draft", "completed"].includes(body.status)) {
    errors.push('status must be "draft" or "completed"');
  }

  if (body.blocks !== undefined) {
    if (!Array.isArray(body.blocks)) {
      errors.push("blocks must be an array");
    } else {
      body.blocks.forEach((block, i) => {
        if (!block.id || typeof block.id !== "string") {
          errors.push(`blocks[${i}].id is required and must be a string`);
        }
        if (!block.key || !BMC_BLOCK_KEYS.includes(block.key)) {
          errors.push(`blocks[${i}].key must be one of: ${BMC_BLOCK_KEYS.join(", ")}`);
        }
        if (!block.title || typeof block.title !== "string") {
          errors.push(`blocks[${i}].title is required and must be a string`);
        }
      });
    }
  }

  return errors;
};

// ─── GET /api/bmc ────────────────────────────────────────────────────────────

exports.findAll = async (req, res) => {
  try {
    const filter = { userId: req.userId };

    if (req.query.ventureId) {
      if (!isValidObjectId(req.query.ventureId)) {
        return res.status(400).json({ message: "ventureId query param is not a valid ObjectId" });
      }
      filter.ventureId = req.query.ventureId;
    }

    const canvases = await BusinessModelCanvas.find(filter).sort({ updatedAt: -1 });
    return res.status(200).json(canvases);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/bmc/:id ────────────────────────────────────────────────────────

exports.getOne = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    const canvas = await BusinessModelCanvas.findById(req.params.id);

    if (!canvas) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (canvas.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(canvas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/bmc ───────────────────────────────────────────────────────────

exports.create = async (req, res) => {
  try {
    const { title, description, ventureId, status, blocks, strategySuggestions } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Validation failed", errors: ["title is required"] });
    }

    const errors = validateBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const canvasData = {
      userId: req.userId,
      title: title.trim(),
      description: description || "",
      status: status || "draft",
      blocks: blocks || [],
      strategySuggestions: strategySuggestions || [],
    };

    if (ventureId) {
      canvasData.ventureId = ventureId;
    }

    const canvas = await BusinessModelCanvas.create(canvasData);
    return res.status(201).json(canvas);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── PUT /api/bmc/:id ────────────────────────────────────────────────────────

exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    const canvas = await BusinessModelCanvas.findById(req.params.id);

    if (!canvas) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (canvas.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const errors = validateBody(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const allowedFields = ["title", "description", "ventureId", "status", "blocks", "strategySuggestions"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.title) {
      updateData.title = updateData.title.trim();
    }

    if (req.body.ventureId === null || req.body.ventureId === "") {
      updateData.ventureId = null;
    }

    const updated = await BusinessModelCanvas.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/bmc/:id ─────────────────────────────────────────────────────

exports.remove = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    const canvas = await BusinessModelCanvas.findById(req.params.id);

    if (!canvas) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (canvas.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await BusinessModelCanvas.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Canvas deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/bmc/:id/duplicate ─────────────────────────────────────────────

exports.duplicate = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    const original = await BusinessModelCanvas.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (original.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const copy = await BusinessModelCanvas.create({
      userId: req.userId,
      ventureId: original.ventureId || null,
      title: `Copy of ${original.title}`,
      description: original.description,
      status: "draft",
      blocks: original.blocks.map((b) => ({ ...b.toObject() })),
      strategySuggestions: original.strategySuggestions.map((s) => ({ ...s.toObject() })),
    });

    return res.status(201).json(copy);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
