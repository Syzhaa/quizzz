# Matriks Hak Akses — Quzzzz

Dokumen ini mendefinisikan hak akses untuk setiap peran (Admin, Host, Player)
terhadap semua tindakan dan resource dalam aplikasi.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§5, §16, §17.

---

## 1. Peran

| Peran | Keterangan | Akun Diperlukan |
| --- | --- | --- |
| **Admin** | Pengguna terdaftar yang mengelola kuis. | Ya |
| **Host** | Admin yang sedang menjalankan sesi permainan. | Ya (sama dengan Admin) |
| **Player** | Peserta kuis yang bergabung via PIN dan nickname. | Tidak |
| **Guest** (tidak login) | Pengunjung yang belum login. | Tidak |

> **Catatan:** Host adalah peran kontekstual — seorang Admin menjadi Host
> ketika menjalankan game session. Hak Host hanya berlaku untuk session yang
> ia jalankan.

---

## 2. Matriks Akses — Authentication

| Tindakan | Guest | Admin | Host | Player |
| --- | --- | --- | --- | --- |
| Register | ✅ | — | — | — |
| Login | ✅ | — | — | — |
| Refresh token | — | ✅ | ✅ | — |
| Logout | — | ✅ | ✅ | — |
| Lihat profil (`GET /auth/me`) | — | ✅ | ✅ | — |

---

## 3. Matriks Akses — Kuis

| Tindakan | Guest | Admin | Host | Player |
| --- | --- | --- | --- | --- |
| Buat kuis | — | ✅ (miliknya) | — | — |
| Lihat daftar kuis | — | ✅ (miliknya) | — | — |
| Lihat detail kuis | — | ✅ (miliknya) | — | — |
| Edit kuis | — | ✅ (miliknya) | — | — |
| Hapus kuis | — | ✅ (miliknya) | — | — |
| Duplikasi kuis | — | ✅ (miliknya) | — | — |
| Preview kuis | — | ✅ (miliknya) | — | — |

### Proteksi Row-Level (PRD §17)

Setiap query data kuis **wajib** menyertakan `ownerId` dari Admin yang login:

```
findOne({ _id: quizId, ownerId: authenticatedAdmin.id })
```

Admin **tidak bisa** mengakses kuis milik Admin lain melalui manipulasi
`quizId`.

---

## 4. Matriks Akses — Media

| Tindakan | Guest | Admin | Host | Player |
| --- | --- | --- | --- | --- |
| Upload gambar | — | ✅ | — | — |
| Hapus gambar | — | ✅ (miliknya) | — | — |
| Lihat gambar (URL publik) | ✅ | ✅ | ✅ | ✅ |

---

## 5. Matriks Akses — Game Session

| Tindakan | Guest | Admin | Host | Player |
| --- | --- | --- | --- | --- |
| Buat game session | — | ✅ | — | — |
| Lihat detail session | — | ✅ (miliknya) | ✅ (miliknya) | — |
| Check PIN | ✅ | ✅ | ✅ | ✅ |
| Join room (dengan PIN + nickname) | — | — | — | ✅ |
| Lihat hasil session | — | ✅ (miliknya) | ✅ (miliknya) | — |

---

## 6. Matriks Akses — Kontrol Permainan (Socket.IO)

| Tindakan | Host | Player |
| --- | --- | --- |
| `create_room` | ✅ | ❌ |
| `start_game` | ✅ | ❌ |
| `next_question` | ✅ | ❌ |
| `show_result` | ✅ | ❌ |
| `pause_game` | ✅ | ❌ |
| `resume_game` | ✅ | ❌ |
| `end_game` | ✅ | ❌ |
| `kick_player` | ✅ | ❌ |
| `lock_lobby` / `unlock_lobby` | ✅ | ❌ |
| `join_room` | ❌ | ✅ |
| `submit_answer` | ❌ | ✅ |
| `resume_session` | ❌ | ✅ |

---

## 7. Matriks Akses — Data Permainan

| Data | Host Bisa Lihat | Player Bisa Lihat |
| --- | --- | --- |
| Daftar Player di lobby | ✅ | ✅ (daftar nama) |
| Pertanyaan (teks + pilihan) | ✅ (termasuk jawaban benar) | ✅ (tanpa jawaban benar saat `QUESTION_ACTIVE`) |
| Jawaban benar saat `QUESTION_ACTIVE` | ✅ | ❌ (PRD §11.5) |
| Jawaban benar saat `QUESTION_RESULT` | ✅ | ✅ |
| Skor Player | ✅ (semua Player) | ✅ (skor sendiri) |
| Leaderboard | ✅ (semua) | ✅ (semua) |
| Podium akhir | ✅ | ✅ |
| Statistik jawaban per pertanyaan | ✅ | ❌ (`TBD`) |

---

## 8. Matriks Akses — History dan Export

| Tindakan | Guest | Admin | Host | Player |
| --- | --- | --- | --- | --- |
| Lihat daftar history | — | ✅ (miliknya) | — | — |
| Lihat detail history | — | ✅ (miliknya) | — | — |
| Export hasil ke CSV | — | ✅ (miliknya) | — | — |

---

## 9. Aturan Keamanan Tambahan

### Larangan Keras

| Aturan | Sumber |
| --- | --- |
| Player tidak boleh melihat jawaban benar selama pertanyaan aktif. | PRD §11.5 |
| Player tidak boleh mengirim skor dari frontend. | PRD §8.2, ADR-001 |
| Player tidak boleh memanipulasi skor. | PRD §22 |
| Admin hanya mengakses data miliknya (ownership). | PRD §17 |
| Session token mentah tidak boleh di-log atau disimpan plaintext. | PRD §21, ADR-007 |

### Rate Limiting (PRD §18)

Endpoint dan event berikut harus di-rate-limit:

| Target | Keterangan |
| --- | --- |
| Login (`POST /auth/login`) | Mencegah brute force. |
| Join room | Mencegah spam join. |
| Submit jawaban | Mencegah flood answer. |

Ambang rate limit: `TBD` — lihat
[ENVIRONMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ENVIRONMENT.md).

---

## 10. Implementasi

- Middleware autentikasi (JWT) harus dipasang pada semua route Admin/Host.
- Middleware otorisasi harus memeriksa:
  1. Peran pengguna.
  2. Ownership resource (`ownerId`).
  3. Keanggotaan room (untuk Player).
  4. Game state (lihat
     [STATE-MACHINE.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/STATE-MACHINE.md)).
- Socket.IO handler harus memvalidasi identitas dan peran dari handshake/auth
  sebelum memproses event.
