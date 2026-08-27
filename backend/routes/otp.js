import express from "express";
import User from "../models/User.js";
import OtpCode from "../models/OtpCode.js";
import { sendOtpEmail } from "../config/mailer.js";

const router = express.Router();

// Helper: Generate clean 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Step 1: Validate registration info & Send Signup OTP
// @route   POST /api/otp/send-signup-otp
// @access  Public
router.post("/send-signup-otp", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah terdaftar. Silakan login atau gunakan email lain." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    const otp = generateOtp();

    // Remove any previous active signup OTP for this email
    await OtpCode.deleteMany({ email: cleanEmail, type: "signup" });

    // Store new OTP with 5-minute TTL
    await OtpCode.create({
      email: cleanEmail,
      otp,
      type: "signup",
    });

    // Send email via Nodemailer
    await sendOtpEmail({
      toEmail: cleanEmail,
      otpCode: otp,
      userName: username.trim(),
      type: "signup",
    });

    res.json({
      success: true,
      message: `Kode OTP verifikasi telah dikirim ke ${cleanEmail}`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error("send-signup-otp error:", error);
    res.status(500).json({ message: error.message || "Gagal mengirim email verifikasi" });
  }
});

// @desc    Step 2: Verify Signup OTP before committing registration
// @route   POST /api/otp/verify-signup-otp
// @access  Public
router.post("/verify-signup-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email dan kode OTP wajib diisi" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await OtpCode.findOne({
      email: cleanEmail,
      type: "signup",
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "Kode OTP telah kadaluarsa atau tidak ditemukan. Silakan kirim ulang kode." });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ message: "Kode OTP tidak cocok. Silakan periksa kembali." });
    }

    // OTP matched! Delete record so it cannot be reused
    await OtpCode.deleteMany({ email: cleanEmail, type: "signup" });

    res.json({
      success: true,
      message: "Verifikasi email berhasil!",
    });
  } catch (error) {
    console.error("verify-signup-otp error:", error);
    res.status(500).json({ message: error.message || "Gagal memverifikasi kode OTP" });
  }
});

// @desc    Step 3: Mark User Document as emailVerified: true
// @route   POST /api/otp/mark-verified
// @access  Public / Private
router.post("/mark-verified", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    await User.findOneAndUpdate(
      { email: cleanEmail },
      { emailVerified: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Email berhasil ditandai terverifikasi",
    });
  } catch (error) {
    console.error("mark-verified error:", error);
    res.status(500).json({ message: error.message || "Gagal memperbarui status verifikasi" });
  }
});

// @desc    Forgot Password Step 1: Send Reset Password OTP
// @route   POST /api/otp/send-forgot-otp
// @access  Public
router.post("/send-forgot-otp", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "Tidak ditemukan akun dengan email tersebut." });
    }

    const otp = generateOtp();

    // Remove any previous active forgot OTP for this email
    await OtpCode.deleteMany({ email: cleanEmail, type: "forgot_password" });

    // Store new OTP with 5-minute TTL
    await OtpCode.create({
      email: cleanEmail,
      otp,
      type: "forgot_password",
    });

    // Send email via Nodemailer
    await sendOtpEmail({
      toEmail: cleanEmail,
      otpCode: otp,
      userName: user.username || "Sahabat SALDO",
      type: "forgot_password",
    });

    res.json({
      success: true,
      message: `Kode reset password telah dikirim ke ${cleanEmail}`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error("send-forgot-otp error:", error);
    res.status(500).json({ message: error.message || "Gagal mengirim email reset password" });
  }
});

// @desc    Forgot Password Step 2: Verify OTP & Apply New Password
// @route   POST /api/otp/verify-reset-password
// @access  Public
router.post("/verify-reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, kode OTP, dan password baru wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password baru minimal 6 karakter" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await OtpCode.findOne({
      email: cleanEmail,
      type: "forgot_password",
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "Kode reset telah kadaluarsa atau tidak ditemukan. Silakan kirim ulang kode." });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ message: "Kode OTP salah. Silakan periksa kembali email Anda." });
    }

    // Find user and update password
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "Akun pengguna tidak ditemukan" });
    }

    user.password = newPassword;
    await user.save();

    // Delete OTP record
    await OtpCode.deleteMany({ email: cleanEmail, type: "forgot_password" });

    res.json({
      success: true,
      message: "Password berhasil diatur ulang! Silakan login dengan password baru Anda.",
    });
  } catch (error) {
    console.error("verify-reset-password error:", error);
    res.status(500).json({ message: error.message || "Gagal mereset password" });
  }
});

export default router;
