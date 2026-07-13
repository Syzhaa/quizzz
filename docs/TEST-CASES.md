# Skenario Test — Quzzzz

Dokumen ini berisi daftar skenario pengujian manual yang dapat dilacak per
fitur. Setiap skenario harus dicek sebelum fitur dianggap selesai.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§23, §27, §28.

---

## 1. Authentication

### TC-AUTH-001: Register Admin
- **Langkah:** Kirim `POST /api/v1/auth/register` dengan name, email, password valid.
- **Hasil:** 201 Created. Admin terdaftar. Password tersimpan sebagai hash.

### TC-AUTH-002: Register dengan Email Duplikat
- **Langkah:** Register dengan email yang sudah terdaftar.
- **Hasil:** Error `AUTH_EMAIL_EXISTS`.

### TC-AUTH-003: Login Admin
- **Langkah:** Kirim `POST /api/v1/auth/login` dengan email dan password valid.
- **Hasil:** 200 OK. Menerima access token dan refresh token.

### TC-AUTH-004: Login dengan Password Salah
- **Langkah:** Login dengan password yang salah.
- **Hasil:** Error `AUTH_INVALID_CREDENTIALS`.

### TC-AUTH-005: Refresh Token
- **Langkah:** Kirim `POST /api/v1/auth/refresh` dengan refresh token valid.
- **Hasil:** 200 OK. Menerima access token baru.

### TC-AUTH-006: Akses Endpoint Tanpa Token
- **Langkah:** Kirim request ke endpoint yang dilindungi tanpa Authorization header.
- **Hasil:** Error `AUTH_REQUIRED` (401).

### TC-AUTH-007: Logout
- **Langkah:** Kirim `POST /api/v1/auth/logout` dengan token valid.
- **Hasil:** 200 OK. Token tidak lagi valid.

---

## 2. CRUD Kuis

### TC-QUIZ-001: Buat Kuis Baru
- **Langkah:** `POST /api/v1/quizzes` dengan title dan questions valid.
- **Hasil:** 201 Created. Kuis tersimpan dengan `ownerId` = Admin yang login.

### TC-QUIZ-002: Lihat Daftar Kuis
- **Langkah:** `GET /api/v1/quizzes` sebagai Admin.
- **Hasil:** Hanya kuis milik Admin yang login yang muncul.

### TC-QUIZ-003: Edit Kuis
- **Langkah:** `PATCH /api/v1/quizzes/:quizId` dengan data baru.
- **Hasil:** 200 OK. Kuis terperbarui.

### TC-QUIZ-004: Edit Kuis Milik Admin Lain
- **Langkah:** `PATCH /api/v1/quizzes/:quizId` di mana kuis milik Admin lain.
- **Hasil:** Error `NOT_OWNER` atau `QUIZ_NOT_FOUND` (403/404).

### TC-QUIZ-005: Hapus Kuis
- **Langkah:** `DELETE /api/v1/quizzes/:quizId`.
- **Hasil:** 200 OK. Kuis terhapus.

### TC-QUIZ-006: Duplikasi Kuis
- **Langkah:** `POST /api/v1/quizzes/:quizId/duplicate`.
- **Hasil:** 201 Created. Kuis baru tercipta dengan data yang sama.

### TC-QUIZ-007: Pertanyaan dengan 2 Pilihan (Minimum)
- **Langkah:** Buat pertanyaan dengan tepat 2 pilihan jawaban.
- **Hasil:** Berhasil tersimpan.

### TC-QUIZ-008: Pertanyaan dengan 5 Pilihan (Melebihi Batas)
- **Langkah:** Buat pertanyaan dengan 5 pilihan jawaban.
- **Hasil:** Error `VALIDATION_ERROR`.

---

## 3. Media / Upload

### TC-MEDIA-001: Upload Gambar JPEG
- **Langkah:** `POST /api/v1/media` dengan file JPEG valid.
- **Hasil:** 201 Created. URL gambar dikembalikan.

### TC-MEDIA-002: Upload File Tipe Tidak Didukung
- **Langkah:** Upload file `.pdf` atau `.exe`.
- **Hasil:** Error `UNSUPPORTED_FILE_TYPE`.

### TC-MEDIA-003: Upload File Terlalu Besar
- **Langkah:** Upload gambar yang melebihi `MAX_FILE_SIZE`.
- **Hasil:** Error `FILE_TOO_LARGE`.

### TC-MEDIA-004: Hapus Gambar
- **Langkah:** `DELETE /api/v1/media/:mediaId`.
- **Hasil:** 200 OK. File terhapus.

---

## 4. Lobby dan Join

### TC-LOBBY-001: Buat Game Session dan Dapatkan PIN
- **Langkah:** `POST /api/v1/game-sessions` dengan quizId valid.
- **Hasil:** 201 Created. PIN 6 digit dikembalikan.

### TC-LOBBY-002: Player Join dengan PIN Valid
- **Langkah:** Player memasukkan PIN dan nickname valid via Socket.IO `join_room`.
- **Hasil:** Player masuk lobby. Host melihat Player baru.

### TC-LOBBY-003: Join dengan PIN Tidak Valid
- **Langkah:** Player memasukkan PIN yang salah.
- **Hasil:** Error `INVALID_PIN`.

### TC-LOBBY-004: Join dengan Nickname Duplikat
- **Langkah:** Dua Player join dengan nickname yang sama (case-insensitive).
- **Hasil:** Player kedua mendapat error `DUPLICATE_NICKNAME`.

### TC-LOBBY-005: Join dengan Nickname Terlalu Pendek
- **Langkah:** Player join dengan nickname 1 karakter.
- **Hasil:** Error `INVALID_NICKNAME`.

### TC-LOBBY-006: Host Kick Player
- **Langkah:** Host mengirim `kick_player` untuk Player tertentu.
- **Hasil:** Player dikeluarkan dari lobby.

### TC-LOBBY-007: Join Saat Lobby Dikunci
- **Langkah:** Host lock lobby, lalu Player baru mencoba join.
- **Hasil:** Error `ROOM_LOCKED`.

---

## 5. Game State dan Flow

### TC-GAME-001: Host Mulai Permainan
- **Langkah:** Host kirim `start_game` saat status `LOBBY`.
- **Hasil:** Status berubah ke `QUESTION_ACTIVE`. Pertanyaan pertama dikirim.

### TC-GAME-002: Start Game Saat Bukan LOBBY
- **Langkah:** Host kirim `start_game` saat status `QUESTION_ACTIVE`.
- **Hasil:** Error `INVALID_STATE_TRANSITION`.

### TC-GAME-003: Host Lanjut Pertanyaan
- **Langkah:** Host kirim `next_question` saat status `LEADERBOARD`.
- **Hasil:** Status berubah ke `QUESTION_ACTIVE`. Pertanyaan berikutnya dikirim.

### TC-GAME-004: Host Jeda Permainan
- **Langkah:** Host kirim `pause_game` saat `QUESTION_ACTIVE`.
- **Hasil:** Status berubah ke `PAUSED`.

### TC-GAME-005: Host Lanjut dari Jeda
- **Langkah:** Host kirim `resume_game` saat `PAUSED`.
- **Hasil:** Status kembali ke state sebelum pause.

### TC-GAME-006: Host Akhiri Permainan Lebih Awal
- **Langkah:** Host kirim `end_game` saat permainan berlangsung.
- **Hasil:** Status berubah ke `FINISHED`. Podium ditampilkan.

### TC-GAME-007: Pertanyaan Terakhir Selesai
- **Langkah:** Pertanyaan terakhir selesai, Host klik lanjut dari leaderboard.
- **Hasil:** Status berubah ke `FINISHED`. Podium akhir.

---

## 6. Scoring

### TC-SCORE-001: Jawaban Benar Cepat
- **Langkah:** Player menjawab benar di awal (remainingTime ≈ duration).
- **Hasil:** Skor mendekati 1000.

### TC-SCORE-002: Jawaban Benar Lambat
- **Langkah:** Player menjawab benar di detik terakhir (remainingTime ≈ 0).
- **Hasil:** Skor mendekati 500.

### TC-SCORE-003: Jawaban Salah
- **Langkah:** Player menjawab salah.
- **Hasil:** Skor = 0.

### TC-SCORE-004: Tidak Menjawab (Timeout)
- **Langkah:** Player tidak menjawab sampai deadline.
- **Hasil:** Skor = 0 untuk pertanyaan itu.

### TC-SCORE-005: Skor Akumulatif
- **Langkah:** Player menjawab beberapa pertanyaan.
- **Hasil:** Total skor = jumlah skor semua pertanyaan.

---

## 7. Double Submit dan Idempotency

### TC-SUBMIT-001: Jawaban Ganda Pertanyaan Sama
- **Langkah:** Player mengirim jawaban kedua untuk pertanyaan yang sama.
- **Hasil:** Error `ALREADY_ANSWERED`.

### TC-SUBMIT-002: attemptId Duplikat
- **Langkah:** Player mengirim jawaban dengan `attemptId` yang sudah diterima.
- **Hasil:** Error `DUPLICATE_ATTEMPT`.

### TC-SUBMIT-003: Jawaban Setelah Deadline
- **Langkah:** Player mengirim jawaban setelah waktu habis.
- **Hasil:** Error `QUESTION_CLOSED`.

### TC-SUBMIT-004: Jawaban Saat Bukan QUESTION_ACTIVE
- **Langkah:** Player mengirim jawaban saat status `LEADERBOARD`.
- **Hasil:** Error ditolak (state tidak valid).

---

## 8. Reconnect

### TC-RECONNECT-001: Player Reconnect Saat Game Berlangsung
- **Langkah:** Player disconnect, lalu kirim `resume_session` dengan sessionToken.
- **Hasil:** Player kembali ke permainan. Skor tetap ada.

### TC-RECONNECT-002: Player Refresh Halaman
- **Langkah:** Player refresh browser saat permainan berlangsung.
- **Hasil:** Player bisa kembali. Tidak membuat Player baru. Skor tetap.

### TC-RECONNECT-003: Reconnect dengan Token Tidak Valid
- **Langkah:** Player kirim `resume_session` dengan token palsu.
- **Hasil:** Error. Player tidak bisa masuk kembali.

---

## 9. History dan Export

### TC-HISTORY-001: Lihat Daftar History
- **Langkah:** `GET /api/v1/history` sebagai Admin.
- **Hasil:** Daftar game session milik Admin.

### TC-HISTORY-002: Lihat Detail History
- **Langkah:** `GET /api/v1/history/:gameSessionId`.
- **Hasil:** Detail game session termasuk hasil Player.

### TC-HISTORY-003: Export CSV
- **Langkah:** `GET /api/v1/history/:gameSessionId/export`.
- **Hasil:** File CSV terunduh dengan hasil permainan.

---

## 10. Authorization

### TC-AUTHZ-001: Admin Akses Kuis Admin Lain
- **Langkah:** Admin A mencoba `GET /api/v1/quizzes/:quizId` milik Admin B.
- **Hasil:** Error `QUIZ_NOT_FOUND` atau `FORBIDDEN`.

### TC-AUTHZ-002: Player Coba Aksi Host
- **Langkah:** Player mengirim `start_game` via Socket.IO.
- **Hasil:** Error `HOST_ONLY`.

### TC-AUTHZ-003: Guest Akses Endpoint Admin
- **Langkah:** Request tanpa token ke endpoint CRUD kuis.
- **Hasil:** Error `AUTH_REQUIRED`.

---

## 11. Rate Limiting

### TC-RATE-001: Flood Login
- **Langkah:** Kirim login berulang-ulang melebihi batas.
- **Hasil:** Error `RATE_LIMITED` (429).

### TC-RATE-002: Flood Join Room
- **Langkah:** Kirim join room berulang-ulang.
- **Hasil:** Error `RATE_LIMITED`.

---

## 12. Responsivitas UI

### TC-UI-001: Viewport 320px
- **Langkah:** Buka halaman Player pada viewport 320px.
- **Hasil:** Semua elemen terlihat dan dapat digunakan.

### TC-UI-002: Perpindahan Tanpa Reload
- **Langkah:** Jalankan permainan dari lobby sampai podium.
- **Hasil:** Tidak ada full page reload.

### TC-UI-003: Modern Minimalist (Narito UI)
- **Langkah:** Periksa elemen UI.
- **Hasil:** Border tebal hitam, hard shadow, warna cerah, tipografi tebal.

---

## 13. Socket.IO Real-Time

### TC-SOCKET-001: Pertanyaan Sampai ke Semua Player
- **Langkah:** Host mulai pertanyaan.
- **Hasil:** Semua Player yang terhubung menerima pertanyaan.

### TC-SOCKET-002: Jawaban Benar Terkonfirmasi Player
- **Langkah:** Player menjawab benar.
- **Hasil:** Player menerima acknowledgement dengan info benar dan skor.

### TC-SOCKET-003: Leaderboard Update
- **Langkah:** Setelah pertanyaan selesai, Host tampilkan leaderboard.
- **Hasil:** Semua client menerima data leaderboard.
