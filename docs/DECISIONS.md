# Architecture Decision Record — Quzzzz

Dokumen ini adalah catatan keputusan arsitektur yang telah ditetapkan oleh
[PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md). Jika sebuah
keputusan belum ada di PRD, dokumen ini menyatakannya sebagai `TBD`; jangan
menganggapnya keputusan final atau mengimplementasikannya sendiri.

## Cara Menggunakan

- Buat entri baru sebelum mengubah fondasi arsitektur, kontrak API, model
  otorisasi, atau sumber kebenaran game.
- Jangan mengubah keputusan berstatus **Accepted** tanpa usulan yang disetujui
  maintainer dan pembaruan PRD/ADR terkait.
- Keputusan implementasi kecil yang hanya bersifat internal boleh dicatat pada
  pull request, selama tidak mengubah kontrak ini.

## Register Keputusan

| ID | Status | Keputusan | Ringkasan |
| --- | --- | --- | --- |
| ADR-001 | Accepted | Server authoritative | Server adalah satu-satunya sumber kebenaran permainan. |
| ADR-002 | Accepted | Stack frontend | React, TypeScript, Tailwind CSS, React Router, Socket.IO Client. |
| ADR-003 | Accepted | Stack backend | Node.js, Express, TypeScript, Socket.IO, dan schema validation. |
| ADR-004 | Accepted | Penyimpanan utama | MongoDB menyimpan data persisten aplikasi dan hasil permainan. |
| ADR-005 | Accepted | State sementara | Redis menyimpan state cepat/temporer dan rate limiting. |
| ADR-006 | Accepted | Komunikasi | REST API ber-versi `/api/v1` dan Socket.IO namespace `/host`, `/player`. |
| ADR-007 | Accepted | Identitas reconnect | Player direkonsiliasi dengan `sessionToken`, bukan `socket.id`. |
| ADR-008 | Proposed | Bentuk repository | Monorepo direkomendasikan PRD; layout dan tooling belum diputuskan. |

---

## ADR-001 — Server Authoritative Game State

**Status:** Accepted  
**Sumber:** PRD §8.2, §9, §11, §16

### Keputusan

Backend menghitung skor, menentukan kebenaran jawaban, memvalidasi deadline,
mengelola transisi state, leaderboard, reconnect, dan akses data. Frontend
hanya merender UI serta mengirim intent pengguna melalui REST atau Socket.IO.

### Konsekuensi

- Client **tidak boleh** mengirim `isCorrect`, `scoreAwarded`, atau state game
  otoritatif sebagai sumber data.
- Server menolak event yang datang pada state salah, setelah deadline, atau
  berasal dari peran yang tidak berhak.
- Countdown client dihitung dari `startedAt` dan `endsAt` yang dikeluarkan
  server; timer client bukan bukti tenggat jawaban.
- Semua query/command bisnis game ditempatkan di backend. Lihat
  [GAME-RULES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/GAME-RULES.md)
  dan [STATE-MACHINE.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/STATE-MACHINE.md).

---

## ADR-002 — Frontend Type-Safe dan Neobrutalism

**Status:** Accepted  
**Sumber:** PRD §8.1, §22

### Keputusan

Frontend menggunakan React dan TypeScript, React Router untuk navigasi,
Socket.IO Client untuk real-time, serta Tailwind CSS untuk menerapkan desain
Neobrutalisme.

### Konsekuensi

- UI memakai border hitam tebal, hard shadow tanpa blur, warna kontras tinggi,
  tipografi tebal, serta feedback tekan yang tegas.
- Perpindahan route atau state permainan tidak boleh menyebabkan full reload.
- Tampilan Player harus dapat digunakan pada viewport minimal 320px.
- State management memakai Zustand atau Context; pilihan tepatnya `TBD` sampai
  aplikasi frontend diinisialisasi.

---

## ADR-003 — Backend Express, Socket.IO, dan Schema Validation

**Status:** Accepted  
**Sumber:** PRD §8.2, §12, §13

### Keputusan

REST API disediakan dengan Node.js, Express, dan TypeScript. Interaksi
multiplayer memakai Socket.IO. Semua input API dan socket divalidasi dengan
schema validation (Zod atau Joi).

### Konsekuensi

- Endpoint REST diberi awalan `/api/v1`.
- Channel real-time dipisahkan setidaknya ke namespace `/host` dan `/player`.
- Payload tidak tervalidasi tidak boleh mencapai business logic.
- Implementasi schema library (`Zod` atau `Joi`) adalah `TBD`; pilih satu dan
  gunakan konsisten setelah bootstrap backend.

---

## ADR-004 — MongoDB sebagai Data Persisten

**Status:** Accepted  
**Sumber:** PRD §8.3, §14, §15, §17

### Keputusan

MongoDB adalah database utama untuk Admin, Quiz, Question, pilihan jawaban,
Game Session, Player, Answer, skor, hasil, dan audit log.

### Konsekuensi

- Index minimum: `Admin.email`, `Quiz.ownerId`, `GameSession.pin`, kombinasi
  `Player.gameSessionId + normalizedNickname`, serta `Answer.attemptId`.
- Constraint domain: email unik, PIN aktif unik, nickname unik per room, dan
  `attemptId` tidak boleh ganda pada konteks jawaban yang sama.
- Service layer **wajib** memasukkan `ownerId` untuk query data milik Admin.
- Strategi migrasi/schema versioning belum ditentukan; statusnya `TBD`.

---

## ADR-005 — Redis untuk State Cepat dan Pengamanan Traffic

**Status:** Accepted  
**Sumber:** PRD §8.5, §18

### Keputusan

Redis digunakan untuk PIN aktif, room aktif, session Player, countdown,
leaderboard sementara, dan rate limiting.

### Konsekuensi

- Redis bukan sumber kebenaran permanen hasil kuis; hasil penting dipersistenkan
  ke MongoDB oleh server.
- API login, join room, dan submit jawaban harus memiliki rate limiting yang
  menggunakan Redis.
- Penamaan key, TTL, mode locking, serta ambang limit masih `TBD` dan harus
  disepakati sebelum fitur terkait dirilis.

---

## ADR-006 — Kontrak Transport

**Status:** Accepted  
**Sumber:** PRD §12, §13, §20

### Keputusan

CRUD dan pembacaan administratif menggunakan REST API v1. Sinkronisasi game
menggunakan Socket.IO. REST error memakai `{ success, code, message }`,
sedangkan socket error memakai `{ code, message, retryable }`.

### Konsekuensi

- Kontrak endpoint tercatat di PRD §12.
- Event host dan player tidak boleh digabung tanpa otorisasi yang jelas.
- Payload Socket.IO harus kecil; gambar dikirim sebagai URL dari file storage,
  bukan blob lewat socket.
- Daftar kode error dipelihara di
  [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md).

---

## ADR-007 — Reconnect Berdasarkan Session Token

**Status:** Accepted  
**Sumber:** PRD §11.11, §22

### Keputusan

Player mendapatkan identitas reconnect melalui `sessionToken`; `socket.id`
hanya mengidentifikasi koneksi sementara.

### Konsekuensi

- Refresh atau reconnect tidak boleh membuat Player baru atau menghapus skor.
- Token mentah tidak disimpan/log secara terbuka; model data menyimpan hash
  token.
- Setelah resume, server mengirim snapshot state termasuk skor dan status
  jawaban Player.

---

## ADR-008 — Monorepo

**Status:** Proposed  
**Sumber:** PRD §24

### Keputusan

PRD merekomendasikan monorepo dengan branch `main`, `develop`, dan `feature/*`.
Keputusan untuk mengadopsi monorepo perlu dikonfirmasi saat inisialisasi repo.

### Konsekuensi Jika Diterima

Struktur package, workspace manager, shared types, dan perintah lint/test
harus ditambahkan ke dokumentasi lokal. Jangan mengasumsikan npm, pnpm, Yarn,
Turbo, atau Nx sebelum keputusan tersebut dibuat.

## Template Entri Baru

```md
## ADR-NNN — Judul

**Status:** Proposed | Accepted | Superseded | Rejected  
**Tanggal:** YYYY-MM-DD  
**Pemilik:** nama/tim

### Konteks

### Keputusan

### Konsekuensi

### Referensi
```
