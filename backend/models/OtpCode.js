import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP code is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["signup", "forgot_password"],
      required: [true, "OTP type is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Document automatically removed by MongoDB after 300 seconds (5 minutes)
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup
otpCodeSchema.index({ email: 1, type: 1 });

const OtpCode = mongoose.model("OtpCode", otpCodeSchema);

export default OtpCode;
