# SALDO

> Catat keuangan pribadi lewat satu kalimat santai, tanpa ribet buka form panjang dan dropdown bertingkat.

[Live Demo](https://usesaldo.vercel.app) · [GitHub Repository](https://github.com/adityafajarsy/mern-finance-tracker)

---

## Tentang SALDO

Sebagian besar aplikasi pencatat keuangan ditinggalkan bukan karena fiturnya kurang, tapi karena proses inputnya melelahkan: harus pilih dompet, buka dropdown kategori, tentukan tanggal, lalu isi nominal secara manual setiap kali beli sesuatu.

**SALDO** dibuat untuk memangkas semua friksi itu. Cukup ketik atau ucapkan apa yang baru saja dibeli dalam bahasa sehari-hari (misal: *"tadi beli kopi 25rb pake gopay"* atau *"kemarin bayar token listrik 150rb via bca"*), sistem akan mengenali nominal, akun sumber, kategori, serta tanggalnya secara otomatis.

---

## Fitur Utama

### 1. Natural Language Financial Capture (Teks & Suara)
Ketik atau rekam suara transaksi dalam bahasa santai sehari-hari. Sistem terintegrasi dengan AI parser yang mengenali format angka khas Indonesia (*"25k"*, *"50rb"*, *"2.5jt"*), istilah transaksi (*beli, bayar, checkout, terima transfer*), serta tanggal relatif (*kemarin, 3 hari lalu, tadi*). Dilengkapi *Intent Guard* berlapis untuk memfilter obrolan non-finansial dan mencegah prompt injection.

### 2. Multi-Akun & Pemetaan Kategori Otomatis
Kelola berbagai dompet secara bersamaan (Tunai, Bank BCA, GoPay, OVO, ShopeePay, dll). Transaksi pengeluaran, pemasukan, maupun transfer antar-rekening pribadi langsung memperbarui saldo masing-masing dompet secara real-time dan terpetakan ke kategori yang sesuai.

### 3. Analisis Arus Kas & Prediksi Saldo Menjelang Gajian
Bukan sekadar daftar riwayat angka mentah. SALDO menghitung laju pengeluaran harian (*spending velocity*), rasio tabungan bulanan, perbandingan tren dari bulan sebelumnya, serta memproyeksikan estimasi sisa uang sebelum tanggal gajian berikutnya berdasarkan kebiasaan belanja nyata.

---

## Cara Kerja

```text
Ketik / Ucapkan Kalimat Transaksi
         ↓
Pengecekan Keamanan & Intent Guard (Penyaringan input non-finansial)
         ↓
Ekstraksi Data Terstruktur via AI (Nominal, Akun, Kategori, Tanggal)
         ↓
Pembaruan Saldo Akun & Rekonsiliasi Buku Kas Otomatis
         ↓
Wawasan Finansial & Proyeksi Saldo Diperbarui
```

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7
- **Backend**: Node.js, Express 5
- **Database**: MongoDB dengan Mongoose 9
- **AI & Parsing**: OpenRouter API (`openai/gpt-4o-mini`) dengan *heuristic intent guard*
- **Autentikasi & Keamanan**: JSON Web Tokens (JWT), bcryptjs, verifikasi OTP via email (Nodemailer)
- **Deployment**: Vercel (Frontend & Serverless API)

---

## Tampilan Aplikasi

<p align="center">
  <img src="frontend/src/assets/hp_hero.webp" alt="SALDO Mobile App Preview" width="340" />
</p>

---

## Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js (versi 18 ke atas disarankan)
- Akun MongoDB (MongoDB Atlas atau instance lokal)
- Kunci API OpenRouter (untuk fitur pencatatan otomatis via AI)

### 1. Clone Repository
```bash
git clone https://github.com/adityafajarsy/mern-finance-tracker.git
cd mern-finance-tracker
```

### 2. Konfigurasi Environment Variables
Buat file `.env` di direktori root proyek (atau di dalam folder `backend`):

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/saldo
PORT=5000
JWT_SECRET=rahasia_jwt_kamu_di_sini
NODE_ENV=development
OPENROUTER_API_KEY=kunci_api_openrouter_kamu

# Konfigurasi Email OTP (Opsional untuk registrasi & reset password)
SMTP_USER=email_kamu@gmail.com
SMTP_PASS=app_password_gmail_kamu
```

### 3. Jalankan Backend
```bash
cd backend
npm install
npm run dev
```
Backend akan berjalan di `http://localhost:5000`.

### 4. Jalankan Frontend
Buka terminal baru di folder proyek:
```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173` dan otomatis terhubung ke backend melalui proxy Vite.

---

## Status Proyek

Aplikasi sudah live dan aktif digunakan di [usesaldo.vercel.app](https://usesaldo.vercel.app).
