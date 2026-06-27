# 💸 Anti Boncos

**Anti Boncos** (sebelumnya bernama Money Planner) adalah aplikasi manajemen keuangan dan *budgeting* personal yang dibangun menggunakan React Native (Expo) dan TypeScript. 

Aplikasi ini didesain khusus dengan pendekatan gaya bahasa kasual/informal Indonesia khas Gen-Z dan pekerja kantoran (*"Atur gajian biar gak cuma lewat"*), bikin pengalaman *budgeting* lo jadi lebih santai dan *relatable*.

---

## ✨ Fitur Utama

*   **📅 Plan Bulanan (Monthly Planner)**: Plot gaji lo buat kebutuhan sebulan ke depan. Dilengkapi dengan fitur **Cicilan Otomatis**, jadi lo gak perlu nginput ulang cicilan tiap ganti bulan. Ada juga fitur **Mesin Waktu** buat liat *history* bulan sebelumnya atau *plan* bulan depan.
*   **🗓️ Plan Mingguan (Weekly Planner)**: Biar jajan dan pengeluaran harian lo lebih kekontrol, pecah *budget* lo jadi siklus mingguan (per 7 hari).
*   **⚡ Sandbox Simulator**: Tempat khusus buat ngotak-ngatik (*trial & error*) alokasi gaji tanpa takut ngubah data asli lo. Cocok banget kalo lo lagi dapet bonus dan bingung mau dialokasiin ke mana aja.
*   **🎯 Target Nabung (Savings Goals)**: Set target buat beli barang idaman atau dana darurat lengkap dengan *progress bar* dan hitung mundur sisa hari (*deadline*).
*   **💡 Insight Keuangan (Financial Health Insights)**: Sistem otomatis ngebaca pola *budget* lo dan ngasih peringatan santai kalo lo terlalu boros (hedon), atau ngasih pujian kalo porsi nabung lo udah mantap.
*   **📊 Roadmap Keuangan**: Kalender dan ringkasan seluruh siklus plan bulanan, mingguan, dan target lo di satu tempat.
*   **💾 Backup & Restore**: Tenang aja, data lo aman di HP sendiri (Local Storage). Lo bisa *export* data lo jadi teks JSON dan nge-*restore* kapan aja lo butuh.

---

## 🛠️ Tech Stack

Aplikasi ini dibuat *from scratch* dengan tumpukan teknologi berikut:
*   **Framework**: [React Native](https://reactnative.dev/) via [Expo](https://expo.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Local Storage**: `@react-native-async-storage/async-storage`
*   **Navigation**: React Navigation (Bottom Tabs & Stack)
*   **Date Utility**: `dayjs`

---

## 🚀 Cara Menjalankan Project (Local Development)

Buat lo yang mau *clone* dan ngembangin proyek ini secara lokal, ikutin langkah-langkah di bawah ini:

### Prasyarat
Pastikan lo udah *install*:
*   [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
*   [Git](https://git-scm.com/)

### Langkah Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone <url-repo-ini>
   cd react-native-budget-planner
   ```

2. **Install semua dependensi:**
   Menggunakan `npm` (atau `yarn` / `pnpm` sesuai preferensi lo):
   ```bash
   npm install
   ```

3. **Jalankan *Development Server*:**
   ```bash
   npm start
   ```
   *Atau bisa juga menggunakan `npx expo start`.*

4. **Buka di Emulator / *Device* Fisik:**
   *   Tekan `a` untuk membuka di Android Emulator.
   *   Tekan `i` untuk membuka di iOS Simulator (khusus macOS).
   *   Atau *scan* QR code yang muncul di terminal menggunakan aplikasi **Expo Go** (buat Android) atau aplikasi kamera (buat iOS) di HP lo.

---

## 🏗️ Build APK / AAB (Untuk Android)

Proyek ini sudah dikonfigurasi untuk menggunakan layanan [EAS Build](https://expo.dev/eas) dari Expo. Jika lo mau bikin *build* buat *device* lo:

1. Install EAS CLI (jika belum):
   ```bash
   npm install -g eas-cli
   ```
2. Login ke akun Expo lo:
   ```bash
   eas login
   ```
3. Mulai proses *build* untuk Android:
   ```bash
   eas build --platform android --profile preview
   ```
   *(Tunggu sampai proses selesai dan *download file APK-nya* dari tautan yang diberikan)*

---

## 🤝 Berkontribusi
Kalo lo nemu *bug* atau punya ide fitur baru yang keren, jangan ragu buat bikin *Issue* atau ngirim *Pull Request*.

## 📜 Lisensi
Aplikasi ini ditujukan untuk *personal tracking* dan pembelajaran. Silakan *fork* dan *customize* sesuai kebutuhan lo!
