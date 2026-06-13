import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Cash", "Bank", "E-Wallet", "Other"],
      default: "Cash",
    },
    balance: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#10B981", // default green
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

const Account = mongoose.model("Account", accountSchema);

export default Account;
