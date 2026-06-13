import express from "express";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all categories for the logged-in user
// @route   GET /api/categories
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.user._id }).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
router.post("/", protect, async (req, res) => {
  const { name, type, icon, color } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: "Please provide a name and type (Income/Expense)" });
  }

  try {
    // Check for duplicate names for the same user and type
    const duplicate = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
      createdBy: req.user._id,
    });

    if (duplicate) {
      return res.status(400).json({ message: "Category with this name and type already exists" });
    }

    const category = new Category({
      name: name.trim(),
      type,
      icon: icon || "tag",
      color: color || "#6B7280",
      createdBy: req.user._id,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { name, type, icon, color } = req.body;

  try {
    const category = await Category.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found or unauthorized" });
    }

    // Check duplicate name if name is being changed
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        type: type || category.type,
        createdBy: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
    }

    category.name = name !== undefined ? name.trim() : category.name;
    category.type = type !== undefined ? type : category.type;
    category.icon = icon !== undefined ? icon : category.icon;
    category.color = color !== undefined ? color : category.color;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found or unauthorized" });
    }

    // Delete the category
    await Category.deleteOne({ _id: req.params.id });

    // Set category reference to null in any transactions using this category
    await Transaction.updateMany(
      { category: req.params.id, createdBy: req.user._id },
      { $unset: { category: "" } }
    );

    res.json({ message: "Category removed and referencing transactions updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
