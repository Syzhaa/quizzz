# QA Checklist — Quzzzz

Checklist ini harus dipenuhi sebelum fitur dianggap siap untuk merge ke
`develop` atau release. Gunakan sebagai gate review untuk setiap pull request.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§22, §27, §28.

---

## 1. Kode dan Build

- [ ] Tidak ada error TypeScript (`npx tsc --noEmit` pass).
- [ ] Linting pass tanpa warning yang belum di-suppress secara sengaja.
- [ ] Build production berhasil tanpa error (`npm run build`).
- [ ] Tidak ada dependency baru yang belum disetujui.

---

## 2. Testing

- [ ] Unit test baru/updated untuk perubahan yang dibuat.
- [ ] Semua unit test pass.
- [ ] Integration test pass (jika ada perubahan flow).
- [ ] Test real-time pass (jika ada perubahan Socket.IO/game state).
- [ ] Skenario relevan dari
      [TEST-CASES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/TEST-CASES.md)
      sudah dicek.

---

## 3. Keamanan dan Data

- [ ] Tidak ada credential, token, atau secret yang hardcoded.
- [ ] Tidak ada data sensitif yang masuk log (password, session token mentah).
- [ ] Jawaban benar **tidak** dikirim ke Player saat `QUESTION_ACTIVE`.
- [ ] Skor dihitung oleh server, bukan diterima dari client.
- [ ] Query data Admin menyertakan `ownerId` (row-level protection).
- [ ] Input user divalidasi di server sebelum business logic.
- [ ] Upload file divalidasi MIME type di server.
- [ ] Rate limiting aktif pada login, join room, submit jawaban.

---

## 4. Game Logic

- [ ] State transition sesuai
      [STATE-MACHINE.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/STATE-MACHINE.md).
- [ ] Event yang tidak sesuai game state ditolak server.
- [ ] Jawaban setelah deadline ditolak.
- [ ] Double submit dicegah (`attemptId` dan pengecekan jawaban per pertanyaan).
- [ ] Reconnect tidak membuat Player baru dan tidak menghilangkan skor.
- [ ] Formula skor sesuai PRD §11.9.

---

## 5. Frontend dan UI

- [ ] Tampilan berfungsi pada viewport minimum 320px.
- [ ] Tidak ada full page reload saat perpindahan state/halaman.
- [ ] Elemen UI mengikuti gaya Neobrutalisme:
  - [ ] Border hitam tebal.
  - [ ] Hard shadow tanpa blur.
  - [ ] Warna cerah kontras tinggi.
  - [ ] Tipografi sans-serif tebal untuk judul.
  - [ ] Animasi transisi klik yang tegas.
- [ ] Loading state ditampilkan saat menunggu data.
- [ ] Error state ditampilkan dengan pesan yang ramah pengguna.
- [ ] Empty state ditampilkan jika tidak ada data.

---

## 6. Socket.IO dan Real-Time

- [ ] Event diterima oleh semua client yang seharusnya (broadcast).
- [ ] Acknowledgement callback berfungsi untuk event yang memerlukannya.
- [ ] Payload socket kecil (tidak mengirim gambar melalui socket).
- [ ] Namespace `/host` dan `/player` terpisah.
- [ ] Handler socket memvalidasi game state sebelum memproses.

---

## 7. API Contract

- [ ] Response format sesuai kontrak (`success`, `code`, `message` untuk
      error).
- [ ] Kode error sesuai
      [ERROR-CODES.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ERROR-CODES.md).
- [ ] Stack trace tidak terekspos ke client di production.
- [ ] Endpoint REST sesuai versi `/api/v1`.

---

## 8. Dokumentasi

- [ ] Kode memiliki komentar/docstring pada fungsi publik.
- [ ] Dokumentasi di `docs/` diperbarui jika ada perubahan kontrak, state,
      error code, atau aturan validasi.
- [ ] README atau panduan terkait diperbarui jika ada perubahan setup.

---

## 9. Performance (jika relevan)

- [ ] Tidak ada query N+1 yang terlihat.
- [ ] Index database sesuai kebutuhan query.
- [ ] Redis key memiliki TTL yang sesuai.
- [ ] Tidak ada memory leak yang terlihat di Socket.IO handler.

---

## 10. Review

- [ ] Minimal 1 reviewer menyetujui.
- [ ] Semua komentar review telah ditanggapi.
- [ ] CI pipeline pass (lint, type check, test).
