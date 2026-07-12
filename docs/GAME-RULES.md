# Aturan Permainan — Quzzzz

Dokumen ini mendefinisikan aturan permainan kuis secara lengkap untuk MVP.
Semua aturan bersumber dari
[PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md). Aturan yang
belum dirinci PRD ditandai `TBD`.

**Backend adalah satu-satunya sumber kebenaran.** Frontend hanya menampilkan
data dan menerima input. Lihat
[DECISIONS.md ADR-001](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md).

---

## 1. Konsep Umum

Quzzzz adalah aplikasi kuis pilihan ganda berbasis web dan real-time. Host
menampilkan pertanyaan melalui layar utama (komputer, TV, proyektor). Player
menjawab melalui perangkat masing-masing (smartphone, tablet, laptop).

---

## 2. Peran dalam Permainan

| Peran | Keterangan |
| --- | --- |
| Admin | Membuat dan mengelola kuis. Bisa menjadi Host. |
| Host | Admin yang sedang menjalankan sesi permainan. Mengontrol alur game. |
| Player | Peserta kuis. Tidak perlu membuat akun. |

Lihat [PERMISSIONS.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/PERMISSIONS.md)
untuk matriks hak akses.

---

## 3. Alur Permainan

### 3.1 Persiapan (Admin)

1. Admin membuat kuis dengan satu atau lebih pertanyaan.
2. Setiap pertanyaan memiliki:
   - Teks pertanyaan.
   - 2–4 pilihan jawaban.
   - Satu jawaban benar (`correctChoiceId`).
   - Durasi menjawab (dalam detik).
   - Gambar opsional (JPEG/PNG/WebP).
3. Admin mengklik "Mulai Main" → sistem membuat Game Session dengan PIN 6
   digit unik.

### 3.2 Lobby

1. Host masuk ke halaman Lobby dan menampilkan PIN.
2. Player memasukkan PIN → sistem memvalidasi PIN → Player memasukkan
   nickname → bergabung ke Lobby.
3. Host melihat daftar Player yang bergabung secara real-time.
4. Host dapat:
   - Mengunci/membuka lobby.
   - Menghapus (kick) Player dari lobby.
5. Host memulai permainan → status berubah ke `QUESTION_ACTIVE`.

### 3.3 Pertanyaan Aktif

1. Server mengirim pertanyaan ke semua client. **Jawaban benar tidak dikirim
   ke Player** selama pertanyaan aktif (PRD §11.5).
2. Player melihat pertanyaan dan pilihan jawaban di perangkat masing-masing.
3. Countdown dimulai berdasarkan `startedAt` dan `endsAt` dari server.
   Timer client dihitung lokal tetapi server yang menentukan deadline
   (PRD §11.6).
4. Player memilih jawaban (sekali per soal).
5. Setelah deadline habis atau semua Player menjawab → pertanyaan ditutup.

### 3.4 Hasil Pertanyaan

1. Server menghitung skor dan mengirim hasil ke setiap Player:
   - Jawaban benar atau salah.
   - Skor yang didapat.
2. Host menampilkan statistik jawaban.

### 3.5 Leaderboard

1. Setelah hasil pertanyaan, Host menampilkan leaderboard.
2. Leaderboard menunjukkan peringkat dan perubahan posisi (PRD §11.10).

### 3.6 Pertanyaan Berikutnya

1. Host melanjutkan ke pertanyaan berikutnya → kembali ke langkah 3.3.
2. Proses berulang sampai seluruh pertanyaan selesai.

### 3.7 Podium Akhir

1. Setelah pertanyaan terakhir → status berubah ke `FINISHED`.
2. Server menampilkan podium akhir (peringkat final).
3. Hasil permainan disimpan ke database.

---

## 4. Scoring

### Formula (PRD §11.9)

```
Jika jawaban benar:
  skor = round(500 + 500 × (remainingTime / duration))

Jika jawaban salah:
  skor = 0
```

| Kondisi | Skor |
| --- | --- |
| Jawaban benar, menjawab langsung (remainingTime = duration) | 1000 |
| Jawaban benar, di detik terakhir (remainingTime ≈ 0) | 500 |
| Jawaban salah | 0 |
| Tidak menjawab (timeout) | 0 |

### Aturan

- Skor **hanya dihitung oleh server**. Frontend tidak mengirim skor.
- `remainingTime` dihitung oleh server berdasarkan waktu penerimaan jawaban.
- Skor minimum untuk jawaban benar adalah 500.
- Skor maksimum untuk jawaban benar adalah 1000.

---

## 5. Jawaban

### Payload Jawaban Player

Player mengirim: `questionId`, `choiceId`, `attemptId`.

### Validasi Server

Server memvalidasi sebelum menerima jawaban (PRD §11.7, §11.8):

| Pemeriksaan | Aksi jika gagal |
| --- | --- |
| Game state bukan `QUESTION_ACTIVE` | Tolak jawaban |
| Pertanyaan sudah melewati deadline | Tolak jawaban |
| Player sudah menjawab pertanyaan ini | Tolak jawaban (duplikat) |
| `attemptId` sudah pernah diterima | Tolak jawaban (duplikat) |
| Player bukan anggota room ini | Tolak jawaban |
| `choiceId` tidak valid untuk pertanyaan ini | Tolak jawaban |

### Larangan Jawaban Ganda

- Satu Player hanya boleh menjawab **satu kali per pertanyaan** (PRD §22).
- `attemptId` digunakan untuk mencegah duplikasi akibat retry network.
- Jawaban kedua dari Player yang sama untuk pertanyaan yang sama **ditolak**.

---

## 6. PIN Permainan

- PIN terdiri dari **6 digit** (PRD §11.3).
- PIN harus unik untuk game session yang aktif.
- PIN disimpan di Redis dengan TTL (`TBD`).
- Setelah game session selesai/ditutup, PIN dapat dipakai kembali oleh session
  baru.

---

## 7. Nickname

- Panjang: 2–20 karakter (PRD §11.4).
- Disanitasi dari HTML/script injection.
- Harus unik dalam satu room (case-insensitive, dinormalisasi).
- Dua Player dalam room yang sama tidak boleh memiliki nickname yang sama
  setelah normalisasi.

---

## 8. Reconnect

- Player yang terputus dapat kembali menggunakan `sessionToken` (PRD §11.11).
- `sessionToken` disimpan sebagai hash di database, bukan plaintext.
- Setelah reconnect:
  - Skor Player **tetap ada** (PRD §22).
  - Status jawaban (sudah/belum menjawab pertanyaan aktif) tetap ada.
  - Server mengirim snapshot state permainan terkini.
- Refresh halaman **tidak membuat Player baru** (PRD §22).

---

## 9. Kontrol Host

| Aksi Host | Keterangan |
| --- | --- |
| Mulai permainan | Memulai pertanyaan pertama |
| Lanjut (next) | Pindah ke pertanyaan berikutnya |
| Jeda (pause) | Menjeda permainan (`PAUSED`) |
| Lanjutkan dari jeda | Melanjutkan dari `PAUSED` |
| Selesai (finish) | Mengakhiri permainan lebih awal |
| Kick Player | Menghapus Player dari lobby |
| Kunci/buka lobby | Mengontrol apakah Player baru bisa bergabung |

---

## 10. Kondisi Game Selesai

Permainan berakhir (`FINISHED`) ketika:

1. Seluruh pertanyaan telah ditampilkan dan hasil terakhir selesai, **atau**
2. Host memilih untuk mengakhiri permainan lebih awal.

Setelah `FINISHED`, tidak ada pertanyaan baru yang bisa dimulai.

---

## 11. Hal yang Belum Ditentukan (`TBD`)

Berikut aturan yang belum dirinci dalam PRD dan perlu diputuskan:

| Topik | Status |
| --- | --- |
| Tie-breaker (skor sama) | `TBD` — Belum ada aturan urutan jika skor identik. |
| Late join (setelah permainan dimulai) | `TBD` — Belum ditentukan apakah Player bisa join setelah pertanyaan pertama. |
| Batas maksimal Player per room | `TBD` — PRD menyebut target 300 Player, tapi belum ada hard limit. |
| Durasi PIN aktif (TTL) | `TBD` — Berapa lama PIN valid sebelum kadaluarsa. |
| Perilaku saat pause | `TBD` — Apakah countdown berhenti, Player bisa disconnect, dll. |
| Skor jika Player reconnect saat pertanyaan aktif | `TBD` — Apakah Player masih bisa menjawab setelah reconnect. |

Jangan mengimplementasikan asumsi untuk item `TBD`. Diskusikan dan putuskan
terlebih dahulu, lalu perbarui dokumen ini.
