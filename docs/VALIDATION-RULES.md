# Aturan Validasi — Quzzzz

Dokumen ini mendefinisikan aturan validasi untuk seluruh input yang diterima
oleh backend, baik melalui REST API maupun Socket.IO. Semua validasi dilakukan
di server menggunakan schema validation library (Zod atau Joi).

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§11, §14, §19.

---

## 1. Aturan Umum

- Semua input client harus divalidasi **sebelum** masuk ke business logic.
- Payload yang tidak lolos validasi menghasilkan error `VALIDATION_ERROR`
  atau kode spesifik (lihat
  [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md)).
- Gunakan satu library schema validation secara konsisten di seluruh backend.
- Field yang tidak dikenali dalam payload **harus** diabaikan (stripped),
  bukan menyebabkan error.

---

## 2. Authentication

### Register

| Field | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | Wajib. `TBD` — panjang minimum/maksimum belum ditetapkan PRD. |
| `email` | string | Wajib. Format email valid. Unik (case-insensitive). |
| `password` | string | Wajib. `TBD` — panjang minimum, kompleksitas belum ditetapkan PRD. |

### Login

| Field | Tipe | Aturan |
| --- | --- | --- |
| `email` | string | Wajib. Format email valid. |
| `password` | string | Wajib. Tidak boleh kosong. |

---

## 3. Quiz

### Create / Update Quiz

| Field | Tipe | Aturan |
| --- | --- | --- |
| `title` | string | Wajib. `TBD` — panjang minimum/maksimum. |

### Create / Update Question

| Field | Tipe | Aturan |
| --- | --- | --- |
| `text` | string | Wajib. `TBD` — panjang maksimum. |
| `choices` | array | Wajib. **2–4 item** (PRD §4.1). |
| `choices[].text` | string | Wajib. Tidak boleh kosong. `TBD` — panjang maks. |
| `correctChoiceId` | string | Wajib. Harus merujuk ke salah satu choice dalam pertanyaan. |
| `durationSeconds` | number | Wajib. Positif. `TBD` — nilai minimum dan maksimum. |
| `imageUrl` | string | Opsional. URL gambar yang sudah di-upload. |

### Aturan Pilihan Jawaban

- Minimal **2** pilihan, maksimal **4** pilihan per pertanyaan (PRD §4.1).
- Tepat **1** jawaban benar (`correctChoiceId`) per pertanyaan.
- `correctChoiceId` harus valid dan merujuk ke salah satu `choices` yang ada.

---

## 4. Game Session

### Check PIN

| Field | Tipe | Aturan |
| --- | --- | --- |
| `pin` | string | Wajib. Tepat **6 digit** numerik (PRD §11.3). |

### Join Room

| Field | Tipe | Aturan |
| --- | --- | --- |
| `pin` | string | Wajib. Tepat 6 digit numerik. |
| `nickname` | string | Wajib. **2–20 karakter** (PRD §11.4). |

### Aturan Nickname (PRD §11.4)

- Panjang: minimum 2 karakter, maksimum 20 karakter.
- Disanitasi dari tag HTML dan script injection.
- Dinormalisasi untuk pengecekan unik (case-insensitive, trim whitespace).
- Karakter yang diizinkan: `TBD` — apakah hanya alfanumerik, atau boleh emoji,
  spasi, dll.
- Dua Player dalam satu room tidak boleh memiliki nickname yang sama setelah
  normalisasi.

---

## 5. Jawaban Player

### Submit Answer (Socket.IO)

| Field | Tipe | Aturan |
| --- | --- | --- |
| `questionId` | string | Wajib. Harus merujuk ke pertanyaan aktif saat ini. |
| `choiceId` | string | Wajib. Harus merujuk ke salah satu choice dalam pertanyaan. |
| `attemptId` | string | Wajib. Unik per jawaban, untuk idempotency (PRD §11.7). |

### Aturan Tambahan

- Player hanya bisa menjawab **sekali** per pertanyaan.
- `attemptId` yang sudah pernah diterima akan ditolak (`DUPLICATE_ATTEMPT`).
- Jawaban setelah deadline ditolak (`QUESTION_CLOSED`).
- Jawaban saat game state bukan `QUESTION_ACTIVE` ditolak.

---

## 6. Media / Upload

### Upload File (PRD §19)

| Field | Aturan |
| --- | --- |
| File | Wajib. Tepat satu file per request. |
| MIME type | Hanya: `image/jpeg`, `image/png`, `image/webp`. |
| Ukuran | Maksimal `TBD` (disarankan 5 MB, tergantung konfigurasi `MAX_FILE_SIZE`). |
| Nama file | Diganti oleh server secara otomatis. Nama dari client diabaikan. |

### Aturan Keamanan Upload

- Validasi MIME type di server, bukan hanya ekstensi file.
- Tolak file executable atau tipe yang tidak didukung.
- Jangan percaya header `Content-Type` dari client sebagai satu-satunya
  sumber validasi — periksa magic bytes jika memungkinkan.

---

## 7. Socket.IO Payload Umum

### Aturan

- Semua payload Socket.IO harus divalidasi dengan schema yang sama seperti
  REST.
- Payload yang tidak valid menghasilkan error melalui acknowledgement callback.
- Field tidak dikenali di-strip (diabaikan).
- Payload harus kecil (PRD §22) — jangan kirim data besar melalui socket.

### Event Player

| Event | Payload | Validasi |
| --- | --- | --- |
| `join_room` | `{ pin, nickname }` | PIN 6 digit, nickname 2–20 karakter, sanitasi HTML. |
| `submit_answer` | `{ questionId, choiceId, attemptId }` | Semua field wajib string non-kosong. |
| `resume_session` | `{ sessionToken }` | Wajib string non-kosong. |

### Event Host

| Event | Payload | Validasi |
| --- | --- | --- |
| `create_room` | `{ quizId }` | Wajib string non-kosong, quiz harus ada dan milik Admin. |
| `start_game` | `{ gameSessionId }` | Wajib string non-kosong. |
| `next_question` | `{ gameSessionId }` | Wajib string non-kosong. |
| `kick_player` | `{ gameSessionId, playerId }` | Kedua field wajib string non-kosong. |
| `pause_game` | `{ gameSessionId }` | Wajib string non-kosong. |
| `resume_game` | `{ gameSessionId }` | Wajib string non-kosong. |
| `end_game` | `{ gameSessionId }` | Wajib string non-kosong. |

---

## 8. Nilai yang Belum Ditentukan (`TBD`)

| Aturan | Status |
| --- | --- |
| Panjang minimum/maksimum nama Admin | `TBD` |
| Panjang minimum password dan aturan kompleksitas | `TBD` |
| Panjang maksimum judul kuis | `TBD` |
| Panjang maksimum teks pertanyaan | `TBD` |
| Panjang maksimum teks pilihan jawaban | `TBD` |
| Durasi minimum dan maksimum pertanyaan (detik) | `TBD` |
| Ukuran maksimal file upload | `TBD` (disarankan 5 MB) |
| Karakter yang diizinkan dalam nickname | `TBD` |
| Panjang dan format `attemptId` | `TBD` |

Jangan mengasumsikan nilai untuk item `TBD`. Putuskan dan perbarui dokumen ini
sebelum implementasi.
