import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: [true, "Category type is required"],
    },
    icon: {
      type: String,
      default: "tag", // Default fallback icon
    },
    color: {
      type: String,
      default: "#6B7280", // Default gray
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate categories with the same name and type for the same user
categorySchema.index({ name: 1, type: 1, createdBy: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
