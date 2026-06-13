import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Income", "Expense", "Transfer"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // Optional/nullable for transfer type transactions
      required: function () {
        return this.type !== "Transfer";
      },
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account is required"],
    },
    destinationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      // Required only when type is Transfer
      required: function () {
        return this.type === "Transfer";
      },
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

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
