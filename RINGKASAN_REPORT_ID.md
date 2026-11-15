# 📋 Ringkasan Santai Laporan QA — StarWarsApp
*(Panduan Cepat & Gampang Dibaca Buat Mas Bagas)*

Dokumen ini adalah versi **ringkas & to-the-point** dalam Bahasa Indonesia dari [QA_TEST_REPORT.md](./QA_TEST_REPORT.md). Dibuat supaya kamu bisa memahami seluruh kondisi aplikasi dalam 5 menit sebelum interview.

---

## 🎯 1. Kesimpulan Utama: Aplikasi Siap Rilis atau Tidak?
**JAWABAN:** **TIDAK SIAP RILIS (NOT READY FOR RELEASE)**.

Aplikasi punya banyak bug fatal. Dari **41 uji verifikasi otomatis** yang kita jalankan:
- ✅ **7 Uji Lolos** (Format email/password assignment valid, SWAPI host online, filter tab grup jalan).
- ❌ **34 Defect / Bug Terkonfirmasi** (Termasuk 2 bug blocker yang bikin aplikasi langsung crash atau gagal login 100%).

---

## 🚨 2. Top 5 Bug Paling Parah (Wajib Disebut Pas Interview)

| No | Nama Bug & Lokasi | Apa Dampaknya ke User? | Kenapa Bisa Terjadi? |
|---|---|---|---|
| 1 | **Login Selalu Gagal 100% (Blocker)**<br>`src/screens/LoginScreen/index.js` (L51) | User **tidak bisa login sama sekali**, selalu muncul error *"You must allow location permission on this app to login"*. | Developer memakai `Platform.OS === 'android'` tapi **lupa meng-import `Platform`** dari `react-native`. Kode langsung melempar error dan izin lokasi otomatis dianggap gagal. |
| 2 | **Aplikasi Crash Saat Terima Notifikasi (Critical)**<br>`src/screens/GroupHomeScreen/index.js` (L102) | Begitu Darth Vader login dan membuka Home setelah diundang ke grup, **aplikasi langsung force close / crash**. | Sama persis! Developer memanggil `Platform.OS === 'ios'` di fungsi notifikasi tapi **lupa meng-import `Platform`**. |
| 3 | **Password Disimpan Terang-terangan / Plaintext (Critical Security)**<br>`src/utils/Storages.js` & `apiServices.js` | Siapa pun yang bisa menyalin file database lokal HP bisa membaca **semua email dan password user secara telanjang** tanpa enkripsi. | Database `MMKV` dibuat polos tanpa password enkripsi (`new MMKV()`), dan data user disimpan apa adanya. Login juga cuma membandingkan string mentah `user.password === params.password`. |
| 4 | **Pencarian SWAPI Rusak (Major Functional)**<br>`src/screens/SwapiScreen/index.js` & Live API | User mengetik *"vader"* atau *"falcon"*, tapi yang muncul **tetap seluruh 82 karakter** dari awal (mulai dari Luke Skywalker). | Endpoint API yang dipakai (`swapi.info`) **mengabaikan parameter `?search=`**. Developer mengira API memfilter di server, padahal server mengirim semua data mentah. |
| 5 | **Fitur Peta GPS & Galeri Foto Tidak Ada (Missing Feature)**<br>`GroupDetailScreen` & `RegisterScreen` | - Peta GPS anggota grup di-comment out (`Paid Account API Key needed`), cuma muncul angka koordinat membingungkan.<br>- Saat daftar akun, **cuma ada tombol kamera**, tidak ada opsi pilih foto dari galeri HP (padahal disuruh di soal #2). | Developer belum pasang library galeri (`react-native-image-picker`) dan mematikan komponen `<MapView>`. |

---

## 🔍 3. Rangkuman Uji 5 Pilar QA

### 1. Functional Testing (Fungsionalitas 13 Syarat)
- **Registrasi & Login (Req 1, 3):** Rumus password & email valid untuk Luke (`m4y_th3_F0rc3_b3_w1th_u`) dan Vader (`1_4m_ur_F4th3r!`). Tapi kalau user mengetik email pakai huruf besar (misal `Luke@starwars.com`), registrasi sukses tapi pas login gagal karena case-sensitive.
- **Profil User & SWAPI (Req 4):** Berhasil menarik data tinggi, berat, tahun lahir, dan gender dari SWAPI, tapi nama lengkap user malah tidak ditampilkan di layar Profil.
- **Buat Grup & Undangan (Req 5, 6, 7):** Luke bisa bikin *"Rebel Alliance"* dan undang Vader, tapi teks error salah tertukar (*"Select group starship"* tertukar dengan placeholder *"You must select a starship."*). Jika kembali dari memilih pesawat tanpa memilih, anggota yang sudah diundang malah terhapus otomatis dari memori.
- **Peta Anggota Grup (Req 8):** Komponen Peta mati. Parahnya, **user yang belum join grup bisa melihat titik GPS seluruh anggota grup** (pelanggaran privasi / otorisasi).

### 2. Compatibility Testing (Kompatibilitas HP, Tablet & Rotasi)
- **Layar Miring / Landscape RUSAK:** Developer membekukan ukuran layar pakai `Object.freeze(Metrics)` di `GlobalConfig.js` saat aplikasi pertama kali dibuka. Saat HP diputar miring (Landscape), ukuran kamera, pie chart, dan tab bar **tidak mau menyesuaikan diri**.
- **Tombol Terpotong:** Halaman Login dan Profil tidak memakai `ScrollView`, jadi di HP berlayar kecil atau posisi landscape, tombol login terdorong ke bawah dan tidak bisa di-scroll.
- **Tablet (iPad):** Konfigurasi `Info.plist` belum mendaftarkan orientasi khusus iPad (`UISupportedInterfaceOrientations~ipad`).

### 3. Usability Testing (Kenyamanan UX)
- Foto profil yang sudah dijepret **tidak bisa diganti/diulang** (avatar tidak bisa diklik lagi).
- Di layar kamera tidak ada tombol "Batal / Kembali".
- Layar detail grup tidak punya tombol Back di bagian atas (pengguna iPhone bakal terjebak karena iPhone tidak punya tombol back fisik).
- Tombol ganti bahasa (EN/ID) hanya ada di Login dan Profil, hilang di 5 layar lainnya.

### 4. Performance & Battery Testing (Performa & Baterai)
- **Baterai Boros:** Setiap kali login dan daftar, aplikasi menyalakan chip GPS presisi tinggi (`enableHighAccuracy: true`) dengan batas waktu lama (20 detik).
- **Memori & HP Lemot:** Foto profil diubah jadi teks super panjang (base64) lalu diduplikasi berulang kali ke setiap data grup. Ini bikin aplikasi berat saat me-load daftar grup.
- **Looping Listener:** Di `App.js`, hook `useEffect` lupa diberi `[]`, akibatnya listener notifikasi iOS dipasang dan dicabut berulang-ulang di setiap render layar.

### 5. Security Testing (Keamanan & Privasi)
- **Password Plaintext** di database lokal MMKV.
- **API Key Google Maps Asli** tertinggal dan di-commit terang-terangan di `AndroidManifest.xml` dan `AppDelegate.mm`.
- **Koneksi HTTP Tidak Aman:** Backend diatur ke `http://localhost:3000` (bukan HTTPS) dan konfigurasi iOS mengizinkan insecure connection (`NSAllowsArbitraryLoads: true`).
- **Release APK Pakai Kunci Debug:** Di file build Android, versi rilis produksi masih disetting memakai `debug.keystore` dan proteksi kode (ProGuard) dimatikan.

---

## 🛠️ 4. Solusi / Patch Paling Cepat & Murah (Rekomendasi)
1. **Fix 5 Menit:** Tambahkan `Platform` di `import { ..., Platform } from 'react-native'` pada [LoginScreen/index.js](file:///D:/worlderPTLD/StarWarsApp/src/screens/LoginScreen/index.js) dan [GroupHomeScreen/index.js](file:///D:/worlderPTLD/StarWarsApp/src/screens/GroupHomeScreen/index.js). Login dan Notifikasi langsung hidup!
2. **Fix Input Email:** Tambahkan `.trim().toLowerCase()` pada fungsi simpan dan input email agar huruf besar/kecil tidak bikin gagal login.
3. **Fix SWAPI:** Download data karakter 1 kali saja di awal, lalu lakukan pencarian lokal (client-side filter) di aplikasi agar pencarian nama karakter berfungsi normal.
4. **Fix Keamanan:** Pasang enkripsi di MMKV (`new MMKV({ encryptionKey })`), hash password dengan algoritma aman (misal bcrypt/PBKDF2), dan simpan token login di Keychain/Keystore.
5. **Fix Rotasi:** Ganti `Metrics.SCREEN_WIDTH` dengan hook bawaan React Native `useWindowDimensions()` agar otomatis responsif saat HP diputar.

---

## 🎤 5. Cara Menjelaskannya ke Penguji (1 Menit Elevator Pitch)
> *"Halo tim, saya sudah menguji StarWarsApp secara menyeluruh terhadap 13 requirement. Kesimpulan utama saya: **aplikasi belum layak rilis**. Ditemukan 34 defect terverifikasi, di mana yang paling krusial adalah **login yang terblokir 100%** dan **crash saat notifikasi grup masuk** akibat `Platform` yang lupa di-import di React Native. Selain itu, ada celah keamanan penyimpanan password tanpa enkripsi, pencarian API SWAPI yang tidak memfilter, dan layout yang rusak saat layar diputar miring. Saya sudah mendokumentasikan seluruh test case, bukti kode, dan solusi perbaikannya secara lengkap di QA Report."*
