# Panduan Live Discussion & Demo — Interview Tahap 2 (Junior QA Engineer)

Panduan singkat ini disiapkan khusus agar kamu percaya diri mempresentasikan hasil QA ke audiens **non-teknis (HR/PM)** maupun **teknis (Lead QA/Developer)**.

---

## 1. Alur Presentasi 7–10 Menit

### Menit 1–2: Ringkasan Eksekutif (Untuk Audiens Non-Teknis & Teknis)
- **Kalimat pembuka:**  
  *"Saya sudah meng-clone repo `StarWarsApp`, menjalankan build/test/linter bawaan, menguji API StarWars secara live, serta melakukan audit manual menyeluruh pada 13 requirement across 5 pilar QA: Functional, Compatibility, Usability, Performance, dan Security."*
- **Kesimpulan utama:**  
  *"Aplikasi **belum siap rilis (Not Ready for Release)**. Dari 41 automated checks dan audit kode penuh, ditemukan **34 defect terverifikasi** — termasuk 2 blocker crash fatal di flow Login dan Notifikasi Grup, fitur upload foto galeri & peta GPS yang belum aktif, serta celah keamanan kritis seperti password tersimpan plain-text."*

### Menit 3–6: Live Demo (Share Screen Terminal & VS Code)
Jalankan 4 demo singkat secara berurutan:
1. **Jalankan test & linter bawaan `StarWarsApp`:**
   ```powershell
   cd D:\worlderPTLD\StarWarsApp
   node .yarn\releases\yarn-3.6.4.cjs test --watchAll=false
   node .yarn\releases\yarn-3.6.4.cjs lint
   ```
   *Jelaskan ke audiens:* Unit test bawaan gagal karena import path salah (`../App` padahal file ada di `src/App.js`), dan ESLint langsung menangkap 20 error termasuk variabel `Platform` yang lupa di-import.
2. **Tunjukkan bug blocker di kode (`LoginScreen` & `GroupHomeScreen`):**
   - Buka `src/screens/LoginScreen/index.js` baris 2 & 51 -> tunjukkan `Platform.OS` dipakai tanpa import `Platform`. Akibatnya login selalu gagal dengan error lokasi!
   - Buka `src/screens/GroupHomeScreen/index.js` baris 2 & 102 -> tunjukkan hal sama pada `sendPushNotification()`, jadi saat Darth Vader menerima notifikasi undangan grup, aplikasi crash!
3. **Demo Live API SWAPI bug (`03-swapi-live-api-checks.mjs`):**
   ```powershell
   cd D:\worlderPTLD\StarWarsApp-QA-Report
   npm run qa:swapi
   ```
   *Jelaskan dengan bahasa non-teknis:* "Saat user mencari 'vader' di pilihan karakter, API `swapi.info` mengabaikan kata kunci pencarian dan tetap mengirim seluruh 82 karakter dimulai dari Luke Skywalker, sehingga fitur pencarian tidak memfilter hasil."
4. **Jalankan ringkasan seluruh QA script:**
   ```powershell
   npm run qa:summary
   ```
   *Tunjukkan tabel summary:* `41 checks: 7 Pass, 34 Fail (Defects)` + jelaskan Action Plan jujur untuk pengujian fisik Android Emulator / iOS Xcode dan klarifikasi link Adobe XD.

### Menit 7–9: Rekomendasi Perbaikan & Strategi Lanjutan
- Sebutkan top 3 rekomendasi paling berdampak:
  1. **Fix Blocker (1 jam):** Import `Platform`, fix `fetchCurrentUserRequest`, normalize email `.trim().toLowerCase()`, client-side filter untuk `swapi.info`.
  2. **Fix Security (Prioritas Rilis):** Enkripsi MMKV + hash password/token auth, pindah ke HTTPS, hapus API key Google Maps dari git, dan sembunyikan koordinat GPS member sampai user benar-benar join grup.
  3. **UX & Compatibility:** Tambah `react-native-image-picker` (galeri), ganti `Dimensions` statis dengan `useWindowDimensions()`, dan aktifkan `MapView`.

---

## 2. Prediksi Pertanyaan Interview & Cara Menjawabnya

1. **Q: Kenapa di report ada status `BLOCKED` (Android Emulator / iOS / Adobe XD)? Bukankah tugasnya manual testing di HP?**  
   **A:** *"Saya bersikap transparan soal environment. Di workstation Windows ini tidak tersedia macOS/Xcode maupun Android SDK/device, dan tautan Adobe XD tidak terlampir di PDF. Sesuai instruksi tugas untuk proaktif mengklarifikasi requirement dan menyertakan Action Plan, saya memaksimalkan apa yang bisa diverifikasi secara nyata (dependency install, Jest, ESLint, live SWAPI API, audit kode native Android/iOS & JS), lalu menyusun jadwal 5-hari Action Plan yang jelas untuk melengkapi pengujian device dan visual diff XD."*

2. **Q: Dari semua temuan, mana bug yang paling berbahaya bagi bisnis/user?**  
   **A:** *"Ada dua kategori: secara fungsional adalah missing `Platform` import di `LoginScreen` dan `GroupHomeScreen` karena memblokir 100% user untuk login dan menerima notifikasi undangan. Secara keamanan/privasi adalah penyimpanan password plain-text di MMKV tanpa enkripsi (`BUG-SEC-01`) dan tereksposnya koordinat GPS seluruh anggota grup ke user yang **belum join** grup (`BUG-SEC-07`)."*

3. **Q: Apa bedanya I18n dan L10n pada temuanmu di aplikasi ini?**  
   **A:** *"I18n (Internationalization) adalah kesiapan arsitektur kode mendukung multi-bahasa — di sini bermasalah karena `i18n.js` meng-hardcode `lng: 'en'` sehingga detektor bahasa device tertimpa, dan masih ada string Inggris di-hardcode (alert Logout, tab bar). Sedangkan L10n (Localization) adalah adaptasi budaya/format lokal — di sini angka seperti `cost_in_credits` dan `cargo_capacity` belum memakai `Intl.NumberFormat` sesuai locale."*

4. **Q: Kenapa menyimpan foto sebagai base64 di MMKV dianggap masalah performa?**  
   **A:** *"Base64 memperbesar ukuran file sekitar ~33%. Di `StarWarsApp`, string base64 itu disimpan di `LIST_USER` lalu **diduplikasi lagi** di setiap objek member dalam `GROUPS`. Saat daftar grup di-render di `FlatList`, JS thread harus mem-parse JSON besar dari MMKV dan mendekode ulang string base64 besar — membuat scrolling patah-patah, boros RAM, dan lambat."*

5. **Q: Bagaimana kamu menentukan prioritas testing kalau waktu rilis sangat mepet?**  
   **A:** *"Memakai Risk-Based Testing: dahulukan alur kritis & berisiko tinggi (Auth/Login, crash blocker, keamanan data/privasi), lanjut ke core business journey (SWAPI picker, create/invite/join group), baru compatibility/UI polish. Setiap bug P0/P1 yang diperbaiki wajib diikuti regression test agar bug lama tidak muncul lagi."*
