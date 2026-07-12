# Game State Machine — Quzzzz

Dokumen ini mendefinisikan status permainan, transisi yang diizinkan, event
pemicu, dan event yang harus ditolak. Semua transisi state dilakukan oleh
**server** — client tidak boleh mengubah state secara langsung.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§10, §11, §13.

---

## 1. Daftar Status

| Status | Keterangan |
| --- | --- |
| `CREATED` | Game session baru dibuat, belum ada lobby. |
| `LOBBY` | Lobby aktif, Player bisa bergabung. |
| `QUESTION_ACTIVE` | Pertanyaan sedang ditampilkan, Player bisa menjawab. |
| `QUESTION_RESULT` | Hasil pertanyaan ditampilkan. |
| `LEADERBOARD` | Leaderboard setelah pertanyaan ditampilkan. |
| `PAUSED` | Permainan dijeda oleh Host. |
| `FINISHED` | Semua pertanyaan selesai atau Host mengakhiri. Podium ditampilkan. |
| `CLOSED` | Game session ditutup. Tidak ada interaksi lagi. |

---

## 2. Diagram Transisi

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    ▼                                             │
CREATED ──► LOBBY ──► QUESTION_ACTIVE ──► QUESTION_RESULT ──► LEADERBOARD
                          │       ▲             │                  │
                          │       │             │                  │
                          │       └─────────────┘                  │
                          │       (show_result/                    │
                          │        next_question)                  │
                          │                                        │
                          ▼                                        ▼
                       PAUSED ◄───────────────────────────── (dari QUESTION_ACTIVE,
                          │                                   QUESTION_RESULT,
                          │                                   atau LEADERBOARD)
                          │
                          └──► (kembali ke state sebelum pause)

                    FINISHED ──► CLOSED

                    (LOBBY, QUESTION_ACTIVE, QUESTION_RESULT,
                     LEADERBOARD, PAUSED) ──► FINISHED
```

---

## 3. Tabel Transisi

| Dari | Ke | Pemicu | Siapa |
| --- | --- | --- | --- |
| `CREATED` | `LOBBY` | Host membuka lobby (`create_room`) | Host/Server |
| `LOBBY` | `QUESTION_ACTIVE` | Host memulai permainan (`start_game`) | Host |
| `QUESTION_ACTIVE` | `QUESTION_RESULT` | Deadline habis **atau** semua Player menjawab | Server |
| `QUESTION_RESULT` | `LEADERBOARD` | Host menampilkan leaderboard (`show_leaderboard`) | Host |
| `LEADERBOARD` | `QUESTION_ACTIVE` | Host lanjut pertanyaan berikutnya (`next_question`) | Host |
| `QUESTION_ACTIVE` | `PAUSED` | Host menjeda (`pause_game`) | Host |
| `QUESTION_RESULT` | `PAUSED` | Host menjeda (`pause_game`) | Host |
| `LEADERBOARD` | `PAUSED` | Host menjeda (`pause_game`) | Host |
| `PAUSED` | *(state sebelumnya)* | Host melanjutkan (`resume_game`) | Host |
| `LEADERBOARD` | `FINISHED` | Pertanyaan terakhir selesai, Host lanjut | Host/Server |
| `LOBBY` | `FINISHED` | Host mengakhiri lebih awal (`end_game`) | Host |
| `QUESTION_ACTIVE` | `FINISHED` | Host mengakhiri lebih awal (`end_game`) | Host |
| `QUESTION_RESULT` | `FINISHED` | Host mengakhiri lebih awal (`end_game`) | Host |
| `LEADERBOARD` | `FINISHED` | Host mengakhiri lebih awal (`end_game`) | Host |
| `PAUSED` | `FINISHED` | Host mengakhiri lebih awal (`end_game`) | Host |
| `FINISHED` | `CLOSED` | Cleanup oleh server (setelah timeout atau manual) | Server |

---

## 4. Aturan per Status

### CREATED

- Tidak ada Player yang bisa bergabung.
- Menunggu Host untuk membuka lobby.

### LOBBY

- Player bisa bergabung dengan PIN dan nickname.
- Host bisa lock/unlock lobby, kick Player.
- Player **tidak bisa** menjawab pertanyaan (belum ada pertanyaan).
- Host bisa memulai permainan jika minimal ada satu Player (`TBD` — minimum
  Player belum ditetapkan PRD).

### QUESTION_ACTIVE

- Server mengirim pertanyaan ke semua client.
- **Jawaban benar tidak dikirim ke Player** (PRD §11.5).
- Player bisa mengirim jawaban (sekali per pertanyaan).
- Countdown berjalan berdasarkan `startedAt` dan `endsAt`.
- Jawaban yang masuk setelah `endsAt` **ditolak** (PRD §10).
- Player baru **tidak bisa** bergabung saat ini (`TBD` — late join).

### QUESTION_RESULT

- Server mengirim hasil (benar/salah) dan skor ke setiap Player.
- Host menampilkan statistik jawaban di layar utama.
- Player **tidak bisa** mengirim jawaban.
- Player bisa melihat apakah jawaban mereka benar atau salah, beserta skor
  tambahan.

### LEADERBOARD

- Server mengirim peringkat dan perubahan posisi.
- Player melihat posisi mereka.
- Player **tidak bisa** mengirim jawaban.

### PAUSED

- Permainan dijeda. Server menyimpan state yang harus di-resume.
- Player **tidak bisa** mengirim jawaban.
- Perilaku countdown saat pause: `TBD` (apakah sisa waktu dibekukan atau
  pertanyaan di-reset).
- Host bisa melanjutkan (resume) atau mengakhiri permainan.

### FINISHED

- Podium akhir ditampilkan.
- Hasil permainan disimpan ke database.
- Player **tidak bisa** mengirim jawaban.
- Tidak ada pertanyaan baru.
- Game session bisa ditutup oleh server.

### CLOSED

- Game session selesai sepenuhnya.
- Tidak ada interaksi real-time.
- Data hasil tetap tersedia melalui REST API history.
- PIN bisa dipakai ulang oleh session baru.

---

## 5. Event yang Ditolak per Status

Server **wajib** menolak event yang tidak sesuai game state (PRD §10).

| Event | Ditolak pada Status |
| --- | --- |
| `join_room` | `QUESTION_ACTIVE`, `QUESTION_RESULT`, `LEADERBOARD`, `FINISHED`, `CLOSED` |
| `submit_answer` | `CREATED`, `LOBBY`, `QUESTION_RESULT`, `LEADERBOARD`, `PAUSED`, `FINISHED`, `CLOSED` |
| `start_game` | Semua kecuali `LOBBY` |
| `next_question` | Semua kecuali `LEADERBOARD` |
| `pause_game` | `CREATED`, `LOBBY`, `PAUSED`, `FINISHED`, `CLOSED` |
| `resume_game` | Semua kecuali `PAUSED` |
| `end_game` | `CREATED`, `FINISHED`, `CLOSED` |

---

## 6. Reconnect dan State

Ketika Player reconnect (via `resume_session`):

1. Server memvalidasi `sessionToken`.
2. Server menentukan game state saat ini.
3. Server mengirim snapshot:
   - Status permainan saat ini.
   - Pertanyaan aktif (jika `QUESTION_ACTIVE`, tanpa jawaban benar).
   - Skor Player saat ini.
   - Status jawaban Player untuk pertanyaan aktif (sudah/belum menjawab).
4. Player melanjutkan dari posisi terakhir tanpa kehilangan data.

---

## 7. Implementasi

- Backend menyimpan `status` di model `GameSession`.
- Setiap handler Socket.IO dan controller REST **wajib** memeriksa `status`
  sebelum memproses event/request.
- Gunakan guard/middleware yang memvalidasi status transisi.
- Transisi tidak valid harus menghasilkan error dengan kode yang terdaftar di
  [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md).
