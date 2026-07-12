# Roadmap Implementasi Bertahap — Quzzzz

**Lokasi Proyek:** `/home/syzhaa/projects/aplikasi-kuis-interaktif`

Dokumen ini adalah urutan resmi untuk membangun MVP Quzzzz. Pengerjaan
dilakukan **satu tahap demi satu tahap** agar setiap fitur dapat diuji secara
manual sebelum fondasi berikutnya dibangun.

**Aturan utama:** Setelah implementasi suatu tahap selesai, agent harus
berhenti. User menjalankan checklist tes manual pada tahap tersebut dan memberi
konfirmasi hasilnya. Tahap berikutnya **tidak boleh dimulai** sampai user
menyatakan tahap sebelumnya lulus atau memberi instruksi perbaikan.

**Acuan utama:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§6–§13, §22–§29.

---

## Cara Menggunakan Roadmap

Setiap tahap mengikuti siklus ini:

```text
Implementasi tahap → Automated check → Tes manual oleh user →
Catat hasil → User menyetujui → Tahap berikutnya
```

### Aturan Gate

1. Kerjakan **hanya** scope pada tahap aktif.
2. Jalankan lint, type check, dan tes otomatis yang relevan.
3. Berikan langkah tes manual yang jelas kepada user.
4. User menandai checklist dan melaporkan hasilnya.
5. Jika semua item lulus, user mengirim: `Tahap N lulus, lanjut Tahap N+1`.
6. Jika ada kegagalan, perbaiki **hanya** kegagalan tersebut dan ulangi tes
   tahap yang sama.
7. Jangan membuat fitur tahap selanjutnya tanpa konfirmasi user.

### Status Roadmap

| Tahap | Status | Bukti / Catatan |
| --- | --- | --- |
| 0. Fondasi Proyek | ✅ Lulus | Implementasi oleh AI pada 2026-07-13 |
| 1. Autentikasi Admin | ⬜ Belum dimulai | — |
| 2. Dashboard dan Editor Kuis | ⬜ Belum dimulai | — |
| 3. Media dan Preview Kuis | ⬜ Belum dimulai | — |
| 4. Game Session dan Lobby | ⬜ Belum dimulai | — |
| 5. Pertanyaan, Jawaban, dan Skor | ⬜ Belum dimulai | — |
| 6. Hasil, Leaderboard, dan Podium | ⬜ Belum dimulai | — |
| 7. Reliability dan Keamanan Runtime | ⬜ Belum dimulai | — |
| 8. History dan Export CSV | ⬜ Belum dimulai | — |
| 9. QA, Performa, dan Kesiapan Rilis | ⬜ Belum dimulai | — |

Legenda: ⬜ belum dimulai · 🔄 sedang dikerjakan · ✅ lulus · ❌ perlu perbaikan

---

# Tahap 0 — Fondasi Proyek

## Tujuan

Membangun kerangka aplikasi yang dapat dijalankan lokal: frontend React,
backend Express + Socket.IO, konfigurasi TypeScript, koneksi MongoDB dan Redis,
serta konfigurasi environment. Belum ada halaman produk atau aturan game.

## Prasyarat

- MongoDB berjalan pada `mongodb://localhost:27017/quzzzz`.
- Redis lokal berjalan atau disediakan sebelum backend dijalankan.
- Semua kontributor membaca:
  - [DECISIONS.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md)
  - [CODING-STANDARDS.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/CODING-STANDARDS.md)
  - [ENVIRONMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ENVIRONMENT.md)

## Scope Implementasi

### Infrastruktur dan Repository

- [ ] Inisialisasi struktur repository. Monorepo atau multi-repo lokal harus
      dikonfirmasi saat implementasi karena PRD hanya merekomendasikan monorepo.
- [ ] Konfigurasi package manager, TypeScript strict mode, lint, formatter, dan
      scripts untuk dev/build/type-check/test.
- [ ] Tambahkan `.gitignore`, `.env.example`, serta larangan `.env` di Git.
- [ ] Buat konfigurasi Docker Compose untuk MongoDB dan Redis jika tooling
      Docker dipilih (`TBD`; MongoDB Docker sudah tersedia lokal).

### Backend

- [ ] Buat aplikasi Node.js + Express + TypeScript.
- [ ] Pasang Socket.IO server dengan namespace kosong `/host` dan `/player`.
- [ ] Muat dan validasi environment configuration saat startup.
- [ ] Buat koneksi MongoDB dan Redis; aplikasi gagal startup secara jelas jika
      koneksi wajib gagal.
- [ ] Tambahkan endpoint `GET /api/v1/health` untuk mengecek API, MongoDB, dan
      Redis tanpa membocorkan secret.
- [ ] Tambahkan global error handler dengan envelope REST yang konsisten.

### Frontend

- [ ] Buat React + TypeScript + Tailwind CSS + React Router.
- [ ] Tambahkan app shell Neobrutalisme minimal dan halaman status development.
- [ ] Buat HTTP client base URL dari environment dan socket client yang belum
      mengirim event produk.
- [ ] Pastikan halaman dapat dibuka pada viewport minimum 320px.

## Route / Endpoint Tahap Ini

| Jenis | Path | Keterangan |
| --- | --- | --- |
| Frontend | `/` | Halaman status development / placeholder yang bermakna. |
| Backend | `GET /api/v1/health` | Status API dan dependensi wajib. |
| Socket.IO | `/host`, `/player` | Namespace tersedia; belum ada event bisnis. |

## Tidak Termasuk

- Register/login atau JWT.
- Model koleksi bisnis (Admin, Quiz, GameSession, Player, Answer).
- CRUD kuis, upload media, dan game logic.
- Redis key game atau rate limiting bisnis.

## Kriteria Selesai

- [ ] Frontend dan backend dapat dijalankan dengan satu set environment lokal.
- [ ] `GET /api/v1/health` mengembalikan respons sukses saat MongoDB dan Redis
      tersedia.
- [ ] Backend terhubung ke MongoDB dan Redis tanpa credential hardcode.
- [ ] Namespace `/host` dan `/player` dapat menerima koneksi Socket.IO.
- [ ] Tidak ada error TypeScript dan lint pada kode tahap ini.
- [ ] `.env` tidak terlacak Git; `.env.example` tanpa secret tersedia.

## Tes Manual User

> Selesaikan checklist ini sebelum meminta Tahap 1.

- [ ] Jalankan MongoDB, lalu verifikasi:

  ```bash
  docker exec quzzzz-mongo mongosh --eval "db.runCommand({ ping: 1 })"
  ```

  **Hasil harapan:** `{ ok: 1 }`.

- [ ] Jalankan Redis dan verifikasi `redis-cli ping`.

  **Hasil harapan:** `PONG`.

- [ ] Jalankan backend dengan perintah development yang disediakan.

  **Hasil harapan:** Startup sukses serta log koneksi MongoDB dan Redis sukses;
  tidak ada secret di log.

- [ ] Buka `GET /api/v1/health`.

  **Hasil harapan:** HTTP 200 serta status API, MongoDB, dan Redis sehat tanpa
  mengembalikan connection string atau secret.

- [ ] Jalankan frontend dan buka `/` pada browser desktop dan viewport 320px.

  **Hasil harapan:** Halaman tampil, tidak overflow horizontal, dan tanpa full
  reload.

- [ ] Buka browser devtools Network lalu koneksikan namespace Socket.IO
  `/host` dan `/player`.

  **Hasil harapan:** Kedua koneksi berhasil tanpa event error.

## Referensi QA

- [QA-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/QA-CHECKLIST.md)
  §1 dan §6.
- [LOCAL-DEVELOPMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/LOCAL-DEVELOPMENT.md).

---

# Tahap 1 — Autentikasi Admin

## Tujuan

Menyediakan register, login, refresh session, logout, dan proteksi route untuk
Admin. Player belum membutuhkan akun.

## Prasyarat

- Tahap 0 telah berstatus ✅ dan user menyetujuinya.

## Scope Implementasi

### Backend

- [ ] Model `Admin` dengan email unik dan `passwordHash`.
- [ ] Hash password; plaintext password tidak boleh disimpan/log.
- [ ] Endpoint:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- [ ] JWT access token dan refresh token dari environment.
- [ ] Middleware autentikasi dan validasi request.
- [ ] Rate limiting login menggunakan Redis.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/admin/register` | Register Admin | Form name, email, password dan validasi error. |
| `/admin/login` | Login Admin | Form email/password dan error yang aman. |
| `/admin/dashboard` | Dashboard kosong | Protected route; tampilkan profil Admin. |

- [ ] Redirect guest dari `/admin/dashboard` ke `/admin/login`.
- [ ] Redirect Admin login dari login/register ke dashboard.
- [ ] UI mengikuti Neobrutalisme dan usable pada 320px.

## Tidak Termasuk

- Dashboard dengan daftar kuis.
- Role selain Admin dan autentikasi Player.
- OAuth, reset password, email verification, atau MFA.

## Kriteria Selesai

- [ ] Register Admin valid menghasilkan akun dengan password hash.
- [ ] Email duplikat ditolak.
- [ ] Login valid memberi session; kredensial salah tidak mengungkap detail.
- [ ] Refresh, logout, dan `GET /auth/me` bekerja.
- [ ] Route dashboard terlindungi.
- [ ] Error memakai kode dari
      [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md).

## Tes Manual User

- [ ] Register melalui `/admin/register` dengan data valid.

  **Hasil harapan:** Berpindah ke dashboard; password tidak terlihat di UI/log.

- [ ] Coba register email yang sama.

  **Hasil harapan:** Pesan `AUTH_EMAIL_EXISTS` yang ramah pengguna.

- [ ] Logout, lalu login valid melalui `/admin/login`.

  **Hasil harapan:** Kembali ke dashboard dengan sesi aktif.

- [ ] Login dengan password salah.

  **Hasil harapan:** `AUTH_INVALID_CREDENTIALS`; tidak ada stack trace.

- [ ] Akses `/admin/dashboard` pada browser/private window tanpa login.

  **Hasil harapan:** Redirect ke `/admin/login`.

- [ ] Refresh halaman dashboard.

  **Hasil harapan:** Session tetap valid atau dipulihkan melalui refresh sesuai
  kebijakan token yang diimplementasikan.

## Referensi Test

`TC-AUTH-001` s.d. `TC-AUTH-007` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 2 — Dashboard dan Editor Kuis

## Tujuan

Memungkinkan Admin mengelola kuis miliknya dengan CRUD lengkap dan editor
pertanyaan pilihan ganda bergaya Neobrutalisme.

## Prasyarat

- Tahap 1 telah berstatus ✅ dan user menyetujuinya.

## Scope Implementasi

### Backend

- [ ] Model `Quiz` dengan `ownerId`, title, dan `questions[]`.
- [ ] Endpoint:
  - `GET /api/v1/quizzes`
  - `POST /api/v1/quizzes`
  - `GET /api/v1/quizzes/:quizId`
  - `PATCH /api/v1/quizzes/:quizId`
  - `DELETE /api/v1/quizzes/:quizId`
  - `POST /api/v1/quizzes/:quizId/duplicate`
- [ ] Semua query Admin menyertakan `ownerId`.
- [ ] Validasi question: 2–4 pilihan dan satu `correctChoiceId` valid.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/admin/dashboard` | Dashboard | Daftar kuis milik Admin, empty/loading/error state. |
| `/admin/quiz/create` | Buat kuis | Form title dan editor pertanyaan. |
| `/admin/quiz/:quizId/edit` | Edit kuis | Edit title, pertanyaan, pilihan, durasi, jawaban benar. |

- [ ] Tombol create, edit, delete, dan duplicate.
- [ ] Form menampilkan error validasi dari server.

## Tidak Termasuk

- Upload gambar pertanyaan dan preview visual (Tahap 3).
- Membuka atau menjalankan game session.

## Kriteria Selesai

- [ ] Admin melihat hanya kuis miliknya.
- [ ] CRUD dan duplicate bekerja tanpa menembus ownership.
- [ ] Pertanyaan hanya menerima 2–4 pilihan dan tepat satu jawaban benar.
- [ ] Editor dapat dipakai pada 320px dan memiliki loading/error/empty state.

## Tes Manual User

- [ ] Buat kuis dengan satu pertanyaan dan 2 pilihan.

  **Hasil harapan:** Kuis tersimpan dan muncul di dashboard.

- [ ] Edit judul, durasi, pilihan, serta jawaban benar.

  **Hasil harapan:** Perubahan tetap ada setelah refresh.

- [ ] Coba simpan pertanyaan dengan 1 dan 5 pilihan.

  **Hasil harapan:** Validasi gagal; kuis tidak tersimpan dengan data invalid.

- [ ] Duplikasi kuis lalu hapus salinan.

  **Hasil harapan:** Kuis asli tetap ada; hanya salinan terhapus.

- [ ] Login sebagai Admin lain lalu coba akses URL edit kuis Admin pertama.

  **Hasil harapan:** Akses ditolak tanpa membocorkan data kuis.

## Referensi Test

`TC-QUIZ-001` s.d. `TC-QUIZ-008` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 3 — Media dan Preview Kuis

## Tujuan

Menambahkan upload gambar pertanyaan yang aman dan halaman preview kuis tanpa
menjalankan game real-time.

## Prasyarat

- Tahap 2 telah berstatus ✅ dan user menyetujuinya.

## Scope Implementasi

### Backend

- [ ] Endpoint `POST /api/v1/media` dan `DELETE /api/v1/media/:mediaId`.
- [ ] Hanya menerima JPEG, PNG, WebP; server mengganti nama file.
- [ ] Validasi MIME type dan batas ukuran dari environment.
- [ ] Ownership media diverifikasi pada delete.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/admin/quiz/:quizId/edit` | Editor kuis | Upload, preview, ganti, hapus gambar pertanyaan. |
| `/admin/quiz/:quizId/preview` | Preview kuis | Menampilkan pertanyaan, gambar, pilihan, dan durasi tanpa game session. |

## Tidak Termasuk

- Gambar melalui Socket.IO.
- Video, audio, PDF, atau file executable.
- Provider cloud storage (`TBD`; local storage cukup untuk development).

## Kriteria Selesai

- [ ] JPEG, PNG, WebP valid dapat diupload dan URL tersimpan pada pertanyaan.
- [ ] Tipe file lain dan file terlalu besar ditolak dengan kode error benar.
- [ ] Hanya pemilik media dapat menghapus media.
- [ ] Preview tidak mengungkap data ke Admin lain.

## Tes Manual User

- [ ] Upload JPEG/PNG/WebP pada satu pertanyaan.

  **Hasil harapan:** Gambar tampil di editor dan preview setelah refresh.

- [ ] Upload PDF atau executable.

  **Hasil harapan:** `UNSUPPORTED_FILE_TYPE` dan file tidak tersimpan.

- [ ] Upload gambar di atas batas `MAX_FILE_SIZE`.

  **Hasil harapan:** `FILE_TOO_LARGE`.

- [ ] Hapus gambar yang diupload.

  **Hasil harapan:** Gambar hilang dari pertanyaan dan tidak lagi dapat diakses
  melalui UI.

## Referensi Test

`TC-MEDIA-001` s.d. `TC-MEDIA-004` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 4 — Game Session dan Lobby

## Tujuan

Memungkinkan Admin membuat game session, menjadi Host, dan menerima Player ke
lobby secara real-time menggunakan PIN dan nickname.

## Prasyarat

- Tahap 3 telah berstatus ✅ dan user menyetujuinya.
- Kuis valid dengan setidaknya satu pertanyaan tersedia.

## Scope Implementasi

### Backend dan Socket.IO

- [ ] Model `GameSession` dan `Player`.
- [ ] Endpoint:
  - `POST /api/v1/game-sessions`
  - `GET /api/v1/game-sessions/:gameSessionId`
  - `POST /api/v1/game-sessions/check-pin`
  - `POST /api/v1/game-sessions/join` (jika tetap diperlukan selain socket).
- [ ] PIN 6 digit unik untuk game session aktif.
- [ ] Namespace `/host` dan `/player`; event `create_room`, `join_room`,
      `kick_player`, `lock_lobby`, `unlock_lobby`.
- [ ] Validasi nickname: 2–20 karakter, sanitasi HTML, unik per room.
- [ ] Simpan PIN/session sementara di Redis sesuai keputusan yang berlaku.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/` | Input PIN | Cek PIN dan arahkan ke join. |
| `/join` | Input nickname | Join room dengan PIN yang tervalidasi. |
| `/host/:gameSessionId/lobby` | Host Lobby | PIN, daftar Player, lock/unlock, kick, tombol start (belum aktif final). |
| `/player/:gameSessionId/waiting` | Player Waiting | Status berhasil masuk dan menunggu Host. |

## Tidak Termasuk

- Pertanyaan aktif, jawaban, skor, leaderboard.
- Late join setelah game dimulai (`TBD`).

## Kriteria Selesai

- [ ] Host dapat membuat session dari kuis miliknya dan memperoleh PIN 6 digit.
- [ ] Player dapat join dengan PIN/nickname valid tanpa akun.
- [ ] Host melihat perubahan jumlah/daftar Player tanpa reload.
- [ ] Nickname duplikat, PIN invalid, lobby terkunci, dan kick ditangani benar.
- [ ] Player tidak bisa mengakses/mengontrol channel Host.

## Tes Manual User

- [ ] Buat game session dari kuis valid.

  **Hasil harapan:** Host masuk lobby dan PIN enam digit muncul.

- [ ] Dari dua browser/device berbeda, join dengan PIN dan nickname unik.

  **Hasil harapan:** Keduanya masuk waiting page; daftar Player Host terupdate
  real-time tanpa reload.

- [ ] Join menggunakan PIN yang salah, nickname 1 karakter, dan nickname sama.

  **Hasil harapan:** Masing-masing menghasilkan error valid sesuai kasus.

- [ ] Host mengunci lobby lalu Player ketiga mencoba join.

  **Hasil harapan:** Ditolak dengan `ROOM_LOCKED`.

- [ ] Host kick satu Player.

  **Hasil harapan:** Player tersebut menerima status dikeluarkan dan tidak
  muncul lagi dalam daftar lobby.

## Referensi Test

`TC-LOBBY-001` s.d. `TC-LOBBY-007` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 5 — Pertanyaan, Jawaban, dan Skor

## Tujuan

Membangun gameplay inti: Host memulai game, server mengirim pertanyaan, Player
menjawab sekali sebelum deadline, dan server menghitung skor.

## Prasyarat

- Tahap 4 telah berstatus ✅ dan user menyetujuinya.
- Aturan `TBD` berikut harus diputuskan sebelum implementasi: minimum Player
  untuk mulai, late join, dan perilaku timer ketika pause.

## Scope Implementasi

### Backend dan Socket.IO

- [ ] Implementasi state `LOBBY`, `QUESTION_ACTIVE`, `QUESTION_RESULT`, dan
      validasi transisi awal.
- [ ] Event Host: `start_game`, `show_result`, `next_question`.
- [ ] Event Player: `submit_answer` dengan `questionId`, `choiceId`,
      `attemptId` dan acknowledgement.
- [ ] Model `Answer` dengan pencegahan duplicate `attemptId`.
- [ ] Server menentukan deadline dari `startedAt`/`endsAt`.
- [ ] Server menerapkan formula:

  ```text
  benar: round(500 + 500 × (remainingTime / duration))
  salah atau timeout: 0
  ```

- [ ] Jawaban benar tidak pernah dikirim ke Player saat `QUESTION_ACTIVE`.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/host/:gameSessionId/game` | Host Game | Pertanyaan, timer, jumlah jawaban, kontrol show result/next. |
| `/player/:gameSessionId/game` | Player Game | Pertanyaan, pilihan jawaban, timer dari `startedAt`/`endsAt`, status jawaban terkirim. |
| `/host/:gameSessionId/result` | Host Result | Statistik pertanyaan saat ini. |
| `/player/:gameSessionId/result` | Player Result | Benar/salah dan skor tambahan personal. |

## Tidak Termasuk

- Leaderboard/podium (Tahap 6).
- Reconnect/runtime reliability lengkap (Tahap 7).
- Pause/resume sampai kebijakan `TBD` diputuskan.

## Kriteria Selesai

- [ ] Hanya Host session yang dapat memulai dan mengontrol flow.
- [ ] Player dapat menjawab sekali hanya saat `QUESTION_ACTIVE`.
- [ ] Server menolak jawaban setelah deadline, choice invalid, game state
      invalid, dan attempt duplikat.
- [ ] Skor server akurat: benar 500–1000; salah/timeout 0.
- [ ] Client tidak menerima jawaban benar sebelum result.

## Tes Manual User

- [ ] Dari lobby, Host klik mulai.

  **Hasil harapan:** Semua Player menerima pertanyaan dan timer tanpa reload;
  jawaban benar tidak tampak di browser Player.

- [ ] Player A menjawab benar di awal; Player B menjawab salah; Player C diam.

  **Hasil harapan:** Saat hasil: A mendapat 500–1000, B dan C mendapat 0.

- [ ] Player A menekan dua pilihan/jawab dua kali atau mengirim ulang koneksi.

  **Hasil harapan:** Hanya jawaban pertama yang dihitung; berikutnya ditolak.

- [ ] Tunggu timer habis lalu coba submit melalui UI/browser devtools.

  **Hasil harapan:** `QUESTION_CLOSED`; tidak ada skor tambahan.

- [ ] Coba `start_game`/`submit_answer` pada state yang tidak sesuai.

  **Hasil harapan:** Server menolak dengan kode state yang sesuai.

## Referensi Test

`TC-GAME-001`–`TC-GAME-003`, `TC-SCORE-001`–`TC-SCORE-005`, dan
`TC-SUBMIT-001`–`TC-SUBMIT-004` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 6 — Hasil, Leaderboard, dan Podium

## Tujuan

Menyelesaikan alur game dari hasil pertanyaan ke leaderboard setiap soal dan
podium akhir setelah seluruh pertanyaan selesai.

## Prasyarat

- Tahap 5 telah berstatus ✅ dan user menyetujuinya.
- Aturan tie-breaker telah diputuskan (`TBD` pada
  [GAME-RULES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/GAME-RULES.md)).

## Scope Implementasi

### Backend dan Socket.IO

- [ ] State `LEADERBOARD`, `FINISHED`, `CLOSED` sesuai
      [STATE-MACHINE.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/STATE-MACHINE.md).
- [ ] Akumulasi total skor dan perhitungan peringkat server-side.
- [ ] Kirim perubahan posisi pada leaderboard.
- [ ] Simpan hasil game ketika selesai.
- [ ] Event `show_leaderboard`, `next_question`, dan `end_game`.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/host/:gameSessionId/leaderboard` | Host Leaderboard | Peringkat seluruh Player setelah soal. |
| `/host/:gameSessionId/podium` | Host Podium | Podium akhir dan tombol selesai. |
| `/player/:gameSessionId/final` | Player Final | Peringkat/total skor akhir. |

- [ ] Halaman result Tahap 5 menautkan ke leaderboard.
- [ ] Transisi game berlangsung tanpa full reload.

## Tidak Termasuk

- Reconnect yang tahan refresh/disconnect selama semua state (Tahap 7).
- Riwayat Admin/export CSV (Tahap 8).

## Kriteria Selesai

- [ ] Leaderboard memperlihatkan total skor dan perubahan posisi setelah soal.
- [ ] Pertanyaan terakhir menghasilkan `FINISHED` dan podium akhir.
- [ ] Host dapat mengakhiri game lebih awal sesuai state machine.
- [ ] Hasil akhir tersimpan dan Player tidak dapat menjawab setelah selesai.

## Tes Manual User

- [ ] Jalankan kuis minimal tiga pertanyaan dengan beberapa Player dan skor
      berbeda.

  **Hasil harapan:** Setelah setiap soal, leaderboard punya total yang akurat
  dan urutan sesuai aturan tie-breaker yang disetujui.

- [ ] Selesaikan pertanyaan terakhir lalu lanjut.

  **Hasil harapan:** Semua client berpindah ke podium/final tanpa reload;
  Player tidak dapat lagi mengirim jawaban.

- [ ] Mulai game lain dan gunakan tombol end game sebelum semua soal selesai.

  **Hasil harapan:** Game finis aman, podium muncul, hasil tersimpan.

## Referensi Test

`TC-GAME-007`, `TC-SOCKET-003`, dan skenario leaderboard/podium terkait di
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 7 — Reliability dan Keamanan Runtime

## Tujuan

Membuat gameplay tahan terhadap reconnect dan penyalahgunaan dasar, dengan
Redis untuk state sementara dan rate limiting.

## Prasyarat

- Tahap 6 telah berstatus ✅ dan user menyetujuinya.
- TTL PIN/session dan kebijakan reconnect saat pertanyaan aktif diputuskan
  terlebih dahulu (`TBD`).

## Scope Implementasi

### Backend dan Socket.IO

- [ ] Generate `sessionToken` untuk Player, simpan hanya hash-nya.
- [ ] Event `resume_session` mengirim snapshot state dan skor personal.
- [ ] Redis menyimpan PIN aktif, room aktif, session Player, countdown, serta
      leaderboard sementara dengan TTL yang disetujui.
- [ ] Rate limit Redis untuk login, join room, dan submit jawaban.
- [ ] Validasi namespace/peran Socket.IO dan log aktivitas krusial tanpa data
      sensitif.

### Frontend dan Halaman

- [ ] Deteksi status koneksi Socket.IO.
- [ ] Reconnect otomatis/terkendali memakai sessionToken.
- [ ] Tampilkan status koneksi, loading recovery, dan error yang ramah user.

## Tidak Termasuk

- Monitoring platform, backup production, load balancer (Tahap 9).
- Fitur di luar MVP seperti chat atau mode offline.

## Kriteria Selesai

- [ ] Refresh/disconnect tidak membuat Player baru atau menghilangkan skor.
- [ ] Snapshot hasil reconnect sesuai game state dan tidak membocorkan jawaban.
- [ ] Login/join/submit dibatasi rate limit.
- [ ] Token mentah/password tidak muncul dalam database plaintext atau log.

## Tes Manual User

- [ ] Saat game berjalan, refresh browser Player lalu reconnect.

  **Hasil harapan:** Player yang sama kembali dengan skor yang sama; tidak
  ada entry Player duplikat di Host.

- [ ] Disconnect network Player, tunggu, lalu sambungkan kembali.

  **Hasil harapan:** Snapshot game terbaru diterima; status jawab tetap benar.

- [ ] Amati browser/network pada `QUESTION_ACTIVE` setelah reconnect.

  **Hasil harapan:** Tidak ada jawaban benar yang bocor.

- [ ] Coba login/join/submit berulang hingga melewati limit yang disepakati.

  **Hasil harapan:** `RATE_LIMITED`; service tetap stabil.

## Referensi Test

`TC-RECONNECT-001`–`TC-RECONNECT-003`, `TC-RATE-001`, `TC-RATE-002` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 8 — History dan Export CSV

## Tujuan

Menyediakan riwayat game milik Admin, detail hasil Player, dan export CSV.

## Prasyarat

- Tahap 7 telah berstatus ✅ dan user menyetujuinya.

## Scope Implementasi

### Backend

- [ ] Endpoint:
  - `GET /api/v1/history`
  - `GET /api/v1/history/:gameSessionId`
  - `GET /api/v1/history/:gameSessionId/export`
- [ ] Setiap query history menyertakan ownership Admin.
- [ ] Generate CSV aman dari hasil game yang tersimpan.

### Frontend dan Halaman

| Route | Halaman | Fitur |
| --- | --- | --- |
| `/admin/history` | History | Daftar game session milik Admin. |
| `/admin/history/:gameSessionId` | Detail history | Hasil Player dan detail permainan. |

- [ ] Tombol export CSV pada detail history.
- [ ] Empty/loading/error state.

## Tidak Termasuk

- Retensi data dan scheduled cleanup (`TBD`).
- Export selain CSV.

## Kriteria Selesai

- [ ] Admin hanya melihat history miliknya.
- [ ] Detail history memuat hasil game yang selesai secara benar.
- [ ] CSV terunduh dengan data yang benar dan aman.
- [ ] Admin lain tidak dapat membaca atau export history berdasarkan ID.

## Tes Manual User

- [ ] Selesaikan sebuah game, login sebagai Host/Admin, lalu buka history.

  **Hasil harapan:** Game yang baru selesai muncul dengan informasi benar.

- [ ] Buka detail dan unduh CSV.

  **Hasil harapan:** CSV terbuka serta total skor/peringkat Player sesuai podium.

- [ ] Login sebagai Admin lain dan coba akses URL detail/export Admin pertama.

  **Hasil harapan:** Akses ditolak; data tidak bocor.

## Referensi Test

`TC-HISTORY-001`–`TC-HISTORY-003` dan `TC-AUTHZ-001` pada
[TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).

---

# Tahap 9 — QA, Performa, dan Kesiapan Rilis

## Tujuan

Memvalidasi seluruh MVP terhadap acceptance criteria, memperbaiki temuan, dan
menyiapkan rilis staging/production.

## Prasyarat

- Tahap 8 telah berstatus ✅ dan user menyetujuinya.

## Scope Implementasi dan Validasi

- [ ] Jalankan seluruh test unit, integration, real-time, dan manual.
- [ ] Uji flow lengkap: lobby → pertanyaan → hasil → leaderboard → podium.
- [ ] Uji minimal target PRD: 300 Player per room dan 500 koneksi aktif
      menggunakan tooling load test yang dipilih (`TBD`).
- [ ] Ukur acknowledgement jawaban p95 < 250 ms dan propagasi pertanyaan ke
      mayoritas client < 500 ms pada jaringan normal.
- [ ] Periksa responsivitas 320px, keamanan, rate limiting, dan leakage data.
- [ ] Siapkan environment staging/production, HTTPS, backup, health check,
      logging, monitoring dasar, dan rollback plan.

## Tidak Termasuk

- Aplikasi native, pembayaran, marketplace, AI generator, esai/video,
  turnamen lintas room, LMS, offline mode, chat, dan custom branding.

## Kriteria Selesai

- [ ] Semua acceptance criteria PRD §27 lulus.
- [ ] Tidak ada error TypeScript, semua test relevan lulus, dan review selesai.
- [ ] Tidak ada jawaban ganda, manipulasi skor, atau kebocoran jawaban.
- [ ] Player reconnect tidak kehilangan poin.
- [ ] Release checklist dipenuhi.

## Tes Manual User

- [ ] Jalankan satu kuis lengkap dari lobby sampai podium tanpa reload.

  **Hasil harapan:** Semua langkah mulus; skor dan peringkat akurat.

- [ ] Ulangi reconnect Player di tengah game.

  **Hasil harapan:** Tidak hilang poin dan tidak muncul Player baru.

- [ ] Buka game pada lebar 320px dan desktop.

  **Hasil harapan:** Keduanya usable serta UI Neobrutalisme konsisten.

- [ ] Lengkapi
  [QA-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/QA-CHECKLIST.md)
  dan
  [RELEASE-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/RELEASE-CHECKLIST.md).

  **Hasil harapan:** Tidak ada item blocker tersisa.

## Referensi Test

- Semua skenario pada
  [TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md).
- PRD §22, §23, §27–§29.

---

# Log Hasil Tahap

Salin bagian ini untuk setiap tahap yang dikerjakan:

```md
## Tahap N — Nama Tahap

- Tanggal mulai:
- Tanggal selesai implementasi:
- Branch / commit / PR:
- Automated checks:
  - [ ] Lint
  - [ ] Type check
  - [ ] Unit test
  - [ ] Integration / real-time test (jika relevan)
- Tes manual user:
  - [ ] Semua checklist tahap lulus
- Temuan dan perbaikan:
- Keputusan user: Lulus / Perlu perbaikan
- Tanggal persetujuan user:
```
