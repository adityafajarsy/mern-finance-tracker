import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = () => {
  const user = (process.env.SMTP_USER || "adityafajar.sy90@gmail.com").replace(/["']/g, "").trim();
  const pass = (process.env.SMTP_PASS || "oyunpgrflzoamlda").replace(/["'\s]/g, "").trim();

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
};

/**
 * Send OTP Email with Dark Mode Modern SALDO HTML Template
 */
export const sendOtpEmail = async ({ toEmail, otpCode, userName = "Sahabat SALDO", type = "signup" }) => {
  const user = (process.env.SMTP_USER || "adityafajar.sy90@gmail.com").replace(/["']/g, "").trim();
  const fromAddress = `"SALDO App" <${user}>`;

  const isSignup = type === "signup";
  const subject = isSignup
    ? `🔐 Kode Verifikasi Registrasi SALDO: ${otpCode}`
    : `🔑 Kode Reset Password SALDO: ${otpCode}`;

  const headerTitle = isSignup ? "Verifikasi Akun Baru" : "Reset Password Akun";
  const descriptionText = isSignup
    ? "Terima kasih telah bergabung dengan SALDO. Gunakan 6-digit kode OTP di bawah ini untuk memverifikasi email dan menyelesaikan pendaftaran akun Anda:"
    : "Kami menerima permintaan untuk mengatur ulang password akun SALDO Anda. Gunakan 6-digit kode OTP di bawah ini untuk melanjutkan reset password:";

  // Always log OTP in terminal for instant dev verification
  console.log(`\n========================================`);
  console.log(`📧 [SALDO OTP DISPATCH] -> ${toEmail}`);
  console.log(`🔑 KODE OTP (${type.toUpperCase()}): [ ${otpCode} ]`);
  console.log(`⏱️ Berlaku 5 menit`);
  console.log(`========================================\n`);

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #061912;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #E8F5EE;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper {
        width: 100%;
        max-width: 540px;
        margin: 40px auto;
        background: linear-gradient(180deg, #09261E 0%, #051811 100%);
        border: 1px solid #14493A;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }
      .header {
        padding: 36px 32px 20px 32px;
        text-align: center;
        border-bottom: 1px solid rgba(209, 234, 222, 0.08);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 26px;
        font-weight: 900;
        letter-spacing: -0.5px;
        color: #FFFFFF;
        text-decoration: none;
      }
      .brand span.dot {
        color: #00A86B;
      }
      .content {
        padding: 32px;
        text-align: center;
      }
      .badge {
        display: inline-block;
        padding: 6px 14px;
        background-color: rgba(0, 168, 107, 0.15);
        border: 1px solid rgba(0, 168, 107, 0.3);
        border-radius: 100px;
        color: #00A86B;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin-bottom: 16px;
      }
      h1 {
        font-size: 22px;
        font-weight: 800;
        color: #FFFFFF;
        margin: 0 0 12px 0;
        line-height: 1.3;
      }
      p {
        font-size: 14px;
        line-height: 1.6;
        color: #A3D1BE;
        margin: 0 0 24px 0;
      }
      .otp-box {
        background: #061912;
        border: 2px dashed #00A86B;
        border-radius: 16px;
        padding: 24px 16px;
        margin: 28px 0;
        text-align: center;
      }
      .otp-code {
        font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 38px;
        font-weight: 900;
        letter-spacing: 10px;
        color: #00E592;
        margin: 0;
        padding-left: 10px;
      }
      .timer-info {
        font-size: 12px;
        color: #7AA896;
        margin-top: 12px;
        font-weight: 600;
      }
      .security-box {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        padding: 14px 18px;
        text-align: left;
        margin-top: 24px;
        border-left: 3px solid #00A86B;
      }
      .security-box p {
        font-size: 12px;
        color: #88BBA7;
        margin: 0;
      }
      .footer {
        padding: 24px 32px;
        text-align: center;
        border-top: 1px solid rgba(209, 234, 222, 0.08);
        background: rgba(0, 0, 0, 0.2);
      }
      .footer p {
        font-size: 11px;
        color: #557E6E;
        margin: 4px 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="brand">SALDO<span class="dot">.</span></div>
      </div>
      <div class="content">
        <div class="badge">${headerTitle}</div>
        <h1>Halo, ${userName}!</h1>
        <p>${descriptionText}</p>
        
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
          <div class="timer-info">⏱️ Berlaku selama 5 menit</div>
        </div>

        <div class="security-box">
          <p>⚠️ <strong>Peringatan Keamanan:</strong> Jangan berikan kode OTP ini kepada siapa pun, termasuk pihak yang mengaku dari SALDO.</p>
        </div>
      </div>
      <div class="footer">
        <p>Email otomatis ini dikirim oleh SALDO — Personal Finance Intelligent Companion.</p>
        <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const mailTransporter = getTransporter();
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: `Kode OTP SALDO Anda adalah: ${otpCode}. Kode ini berlaku selama 5 menit. Jangan bagikan kepada siapa pun.`,
      html: htmlContent,
    });
    return info;
  } catch (error) {
    console.error("Nodemailer dispatch error:", error.message);
    // In development mode or if SMTP is misconfigured, don't break the entire user flow
    // The OTP is already safely saved in MongoDB OtpCode collection and logged in the terminal
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ SMTP notice in dev: Using logged OTP to proceed.");
      return { messageId: "dev-mock-id" };
    }
    throw error;
  }
};
