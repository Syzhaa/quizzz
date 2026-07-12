# Kode Error — Quzzzz

Dokumen ini mendefinisikan seluruh kode error yang digunakan oleh REST API dan
Socket.IO. Frontend dan backend **wajib** menggunakan kode error yang sama agar
kontrak konsisten.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§20.

---

## 1. Format Error

### REST API

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Deskripsi error yang bisa dibaca manusia."
}
```

### Socket.IO

```json
{
  "code": "ERROR_CODE",
  "message": "Deskripsi error.",
  "retryable": true
}
```

### Aturan

- Kode error menggunakan `UPPER_SNAKE_CASE`.
- Pesan error harus informatif tetapi **tidak boleh** mengekspos detail teknis
  internal.
- Stack trace **tidak dikirim** ke client di production (PRD §20).
- Field `retryable` pada socket error menunjukkan apakah client boleh mengirim
  ulang event yang sama.

---

## 2. Kategori Error

### 2.1 Authentication

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `AUTH_REQUIRED` | 401 | — | Token tidak disertakan atau kadaluarsa. |
| `AUTH_INVALID_CREDENTIALS` | 401 | — | Email atau password salah. |
| `AUTH_TOKEN_EXPIRED` | 401 | — | Access token sudah kadaluarsa. Gunakan refresh. |
| `AUTH_REFRESH_FAILED` | 401 | — | Refresh token tidak valid atau kadaluarsa. |
| `AUTH_EMAIL_EXISTS` | 409 | — | Email sudah terdaftar. |

### 2.2 Authorization

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `FORBIDDEN` | 403 | — | Akses ditolak. Peran pengguna tidak memiliki izin. |
| `NOT_OWNER` | 403 | — | Resource bukan milik Admin yang login. |
| `HOST_ONLY` | 403 | No | Hanya Host yang boleh melakukan aksi ini. |
| `PLAYER_ONLY` | 403 | No | Hanya Player yang boleh melakukan aksi ini. |

### 2.3 Validation

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `VALIDATION_ERROR` | 400 | — | Input tidak memenuhi aturan validasi. |
| `INVALID_PIN` | 400 | No | PIN permainan tidak valid atau tidak ditemukan. |
| `INVALID_NICKNAME` | 400 | No | Nickname tidak memenuhi aturan (panjang/format). |
| `INVALID_CHOICE` | 400 | No | `choiceId` tidak valid untuk pertanyaan ini. |
| `INVALID_PAYLOAD` | 400 | No | Payload Socket.IO tidak sesuai schema. |
| `MISSING_FIELD` | 400 | — | Field wajib tidak disertakan. |

### 2.4 Game State

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `INVALID_STATE_TRANSITION` | 409 | No | Transisi state tidak diizinkan. |
| `QUESTION_CLOSED` | 409 | No | Waktu menjawab sudah habis. |
| `ALREADY_ANSWERED` | 409 | No | Player sudah menjawab pertanyaan ini. |
| `DUPLICATE_ATTEMPT` | 409 | No | `attemptId` sudah pernah diterima. |
| `GAME_NOT_STARTED` | 409 | No | Permainan belum dimulai. |
| `GAME_ALREADY_FINISHED` | 409 | No | Permainan sudah selesai. |
| `NO_MORE_QUESTIONS` | 409 | No | Tidak ada pertanyaan berikutnya. |

### 2.5 Room dan Lobby

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `ROOM_FULL` | 409 | No | Room sudah penuh (jika ada batas). |
| `ROOM_LOCKED` | 403 | No | Lobby sudah dikunci oleh Host. |
| `ROOM_NOT_FOUND` | 404 | No | Room dengan PIN tersebut tidak ditemukan. |
| `DUPLICATE_NICKNAME` | 409 | No | Nickname sudah dipakai Player lain di room ini. |
| `PLAYER_NOT_IN_ROOM` | 403 | No | Player bukan anggota room ini. |
| `PLAYER_KICKED` | 403 | No | Player telah dikeluarkan dari room. |

### 2.6 Resource (CRUD)

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `NOT_FOUND` | 404 | — | Resource tidak ditemukan. |
| `QUIZ_NOT_FOUND` | 404 | — | Kuis tidak ditemukan atau bukan milik Admin. |
| `SESSION_NOT_FOUND` | 404 | — | Game session tidak ditemukan. |

### 2.7 Media / Upload

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `UNSUPPORTED_FILE_TYPE` | 415 | — | Tipe file tidak didukung (hanya JPEG, PNG, WebP). |
| `FILE_TOO_LARGE` | 413 | — | File melebihi batas ukuran maksimal. |
| `UPLOAD_FAILED` | 500 | Yes | Gagal menyimpan file. Client boleh coba lagi. |

### 2.8 Rate Limiting

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `RATE_LIMITED` | 429 | Yes | Terlalu banyak request. Coba lagi setelah periode tertentu. |

### 2.9 Server

| Kode | HTTP | Retryable | Deskripsi |
| --- | --- | --- | --- |
| `INTERNAL_ERROR` | 500 | Yes | Error internal server. Detail tidak diekspos. |
| `SERVICE_UNAVAILABLE` | 503 | Yes | Service sedang tidak tersedia. |

---

## 3. Panduan Implementasi

### Backend

- Gunakan konstanta atau enum untuk kode error; jangan hardcode string di
  setiap handler.
- Error handler global harus menangkap exception yang tidak tertangani dan
  mengembalikan `INTERNAL_ERROR` tanpa stack trace di production.
- Log error lengkap di server (dengan konteks) tetapi kirim pesan generik
  ke client.

### Frontend

- Tangani kode error spesifik untuk menampilkan pesan yang sesuai ke pengguna.
- Untuk error `retryable: true`, implementasikan retry dengan backoff.
- Untuk error `retryable: false`, tampilkan pesan error dan jangan retry
  otomatis.
- Jangan menampilkan kode error mentah ke pengguna akhir; map ke pesan yang
  ramah pengguna.

### Socket.IO

- Kirim error melalui acknowledgement callback untuk event yang mendukungnya.
- Untuk error broadcast (misalnya, Player di-kick), kirim event khusus ke
  Player yang bersangkutan.

---

## 4. Menambah Kode Error Baru

1. Tambahkan entri ke tabel kategori yang sesuai di dokumen ini.
2. Tambahkan konstanta di file error codes backend.
3. Pastikan frontend menangani kode baru atau setidaknya menampilkan fallback.
4. Update test yang relevan.
