# Standar Penulisan Kode — Quzzzz

Standar ini berlaku untuk seluruh kode frontend dan backend proyek Quzzzz.
Tujuannya adalah menjaga konsistensi, keterbacaan, dan keamanan agar setiap
kontributor — manusia maupun AI coding agent — menghasilkan kode yang seragam.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§8, §11, §16–§21, §28.

---

## 1. TypeScript

### Aturan Umum

- Gunakan `strict: true` pada `tsconfig.json`.
- Jangan gunakan `any`; gunakan `unknown` jika tipe belum diketahui, lalu
  lakukan narrowing.
- Definisikan interface/type untuk semua payload API, event socket, dan model
  data.
- Export type dan interface dari file terpisah atau barrel file agar dapat
  dipakai bersama.

### Penamaan

| Jenis | Konvensi | Contoh |
| --- | --- | --- |
| Variable, function, parameter | camelCase | `calculateScore`, `sessionToken` |
| Constant (nilai tetap) | UPPER_SNAKE_CASE | `MAX_CHOICES`, `PIN_LENGTH` |
| Type, Interface, Enum | PascalCase | `GameSession`, `PlayerRole` |
| File komponen React | PascalCase | `LobbyPage.tsx`, `AnswerButton.tsx` |
| File lainnya | kebab-case | `game-service.ts`, `auth-middleware.ts` |
| Folder | kebab-case | `game-session/`, `rate-limit/` |

---

## 2. React dan Frontend

### Komponen

- Gunakan **function component** dengan TypeScript.
- Definisikan props melalui interface/type; jangan gunakan `React.FC` tanpa
  alasan khusus.
- Pisahkan komponen besar (>200 baris) menjadi sub-komponen.
- Letakkan hooks custom di folder `hooks/`.
- Jangan menggunakan `index.tsx` sebagai nama komponen utama dalam folder;
  beri nama sesuai fitur.

### State Management

- Server state (data dari API/socket) dan client state (UI lokal) harus
  dipisahkan secara konseptual. Lihat PRD §8.1.
- Gunakan Zustand atau Context sesuai keputusan yang ditetapkan saat
  inisialisasi frontend (lihat
  [DECISIONS.md ADR-002](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md)).
- Jangan menyimpan skor, jawaban benar, atau state game authoritative di
  client state.

### Styling

- Gunakan Tailwind CSS dengan pola Neobrutalisme:
  - Border hitam tebal (`border-4 border-black`).
  - Hard shadow tanpa blur (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
  - Warna cerah kontras tinggi (kuning, pink, cyan, hijau neon).
  - Tipografi sans-serif tebal (Black/ExtraBold) untuk judul.
- Jangan menggunakan inline style kecuali untuk nilai dinamis.
- Animasi transisi klik yang tegas (tombol bergeser menekan bayangan).

### Navigasi

- Gunakan React Router. Perpindahan halaman **tidak boleh** menyebabkan full
  reload (PRD §22).
- Lindungi route Admin/Host dengan guard autentikasi.

---

## 3. Express dan Backend

### Struktur Layer

```
Route → Controller → Service → Repository/Model
```

- **Route**: Hanya mendefinisikan path, method, dan middleware.
- **Controller**: Menerima request, memanggil service, mengembalikan response.
- **Service**: Business logic. **Semua aturan permainan** ada di sini.
- **Repository/Model**: Akses database dan query.

### Aturan Service Layer

- Setiap query data milik Admin **wajib** menyertakan `ownerId`
  (PRD §17).
- Skor dihitung oleh server, bukan diterima dari client (PRD §11.9).
- Jawaban benar tidak dikirim ke Player selama `QUESTION_ACTIVE` (PRD §11.5).

### Middleware

- Validasi input (schema validation) sebelum controller.
- Autentikasi sebelum route yang dilindungi.
- Rate limiting pada login, join room, dan submit jawaban (PRD §18).
- Error handler global di akhir chain middleware.

---

## 4. Socket.IO

- Pisahkan namespace `/host` dan `/player` (PRD §13).
- Validasi semua payload socket dengan schema yang sama seperti REST.
- Setiap handler socket harus memeriksa game state sebelum memproses event
  (lihat [STATE-MACHINE.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/STATE-MACHINE.md)).
- Gunakan acknowledgement callback untuk konfirmasi penerimaan event.
- Jangan mengirim gambar melalui socket; kirim URL saja.

---

## 5. Error Handling

### REST API

```json
{
  "success": false,
  "code": "INVALID_PIN",
  "message": "PIN permainan tidak valid atau sudah kadaluarsa."
}
```

### Socket.IO

```json
{
  "code": "QUESTION_CLOSED",
  "message": "Waktu menjawab sudah habis.",
  "retryable": false
}
```

### Aturan

- Jangan mengirim stack trace ke client di production (PRD §20).
- Gunakan kode error yang terdaftar di
  [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md).
- Tangkap error di level controller/handler; jangan biarkan error tidak
  tertangani crash proses.
- Log error di server dengan konteks yang cukup untuk debugging, **tanpa**
  data sensitif (PRD §21).

---

## 6. Validasi Input

- Semua input dari client — REST body, query, params, dan payload socket —
  harus divalidasi sebelum masuk ke business logic.
- Gunakan library schema validation (Zod atau Joi) secara konsisten.
- Aturan validasi spesifik ada di
  [VALIDATION-RULES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/VALIDATION-RULES.md).
- Sanitasi nickname dari HTML/script injection (PRD §11.4).

---

## 7. Keamanan Kode

- Jangan hardcode credential, token, atau secret di kode.
- Jangan log password, session token mentah, atau data sensitif lainnya.
- Nama file upload diganti oleh server; jangan percaya nama dari client
  (PRD §19).
- Validasi MIME type file upload di server (JPEG, PNG, WebP saja).
- Gunakan parameterized query/method MongoDB; jangan menyusun query dari
  string concatenation.

---

## 8. Komentar dan Dokumentasi

- Tambahkan JSDoc/TSDoc pada fungsi publik dan service method.
- Komentari **mengapa** bukan **apa** — kode yang jelas tidak perlu komentar
  `// increment counter`.
- Tandai asumsi dengan `// ASSUMPTION:` agar mudah ditemukan saat review.
- Tandai pekerjaan yang ditunda dengan `// TODO:` disertai konteks singkat.
- Jangan menghapus komentar/docstring yang ada kecuali komentar tersebut
  memang salah atau terkait kode yang dihapus.

---

## 9. Testing

- Tulis unit test untuk scoring, state transition, dan validasi.
- Tulis integration test untuk flow lengkap (login → kuis → podium).
- Tulis test real-time untuk socket disconnect dan double submit.
- Lihat [TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md)
  untuk daftar skenario.
- Jangan merge kode tanpa test yang relevan (PRD §28).
