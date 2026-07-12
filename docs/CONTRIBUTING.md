# Panduan Kontribusi — Quzzzz

Dokumen ini mengatur alur kontribusi kode untuk proyek Quzzzz. Seluruh
kontributor — manusia maupun AI coding agent — **wajib** mengikuti aturan ini.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§24, §25, §28.

---

## 1. Struktur Branch

| Branch | Tujuan | Boleh push langsung? |
| --- | --- | --- |
| `main` | Kode siap production | ❌ Hanya melalui merge dari `develop` |
| `develop` | Integrasi fitur terbaru | ❌ Hanya melalui pull request |
| `feature/*` | Pengerjaan fitur / perbaikan | ✅ Pemilik branch |

### Aturan

- Branch fitur dibuat dari `develop`:
  `git checkout -b feature/nama-fitur develop`
- Setelah selesai, buat pull request ke `develop`.
- Merge ke `main` hanya dilakukan saat release, setelah seluruh checklist
  release terpenuhi. Lihat
  [RELEASE-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/RELEASE-CHECKLIST.md).

---

## 2. Pesan Commit

Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <deskripsi singkat>
```

### Tipe yang Diizinkan

| Tipe | Kapan Dipakai |
| --- | --- |
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `docs` | Perubahan dokumentasi saja |
| `style` | Formatting, tanpa perubahan logika |
| `refactor` | Perubahan kode tanpa mengubah perilaku |
| `test` | Menambah atau memperbaiki tes |
| `chore` | Build, CI, konfigurasi tool |
| `perf` | Peningkatan performa |

### Contoh

```
feat(game): add PAUSED state transition
fix(socket): prevent duplicate answer submission
docs(env): document REDIS_URL variable
test(scoring): add edge case for zero remaining time
```

### Larangan

- Jangan gunakan pesan generik seperti `update`, `fix bug`, atau `wip`.
- Jangan gabungkan beberapa fitur/fix dalam satu commit.
- Jangan masukkan credential atau secret dalam pesan commit.

---

## 3. Pull Request

### Sebelum Membuat PR

1. Pastikan branch Anda sudah rebase dari `develop` terbaru.
2. Jalankan seluruh pemeriksaan otomatis yang berlaku:
   - Linting
   - Type checking (TypeScript)
   - Unit test
   - Integration test (jika ada perubahan flow)
3. Periksa [QA-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/QA-CHECKLIST.md).

### Format PR

```
## Ringkasan

Jelaskan apa yang berubah dan mengapa.

## Tipe Perubahan

- [ ] Fitur baru
- [ ] Perbaikan bug
- [ ] Refactoring
- [ ] Dokumentasi
- [ ] Lainnya: ___

## Checklist

- [ ] Kode lolos lint dan type check
- [ ] Unit test ditambahkan/diperbarui
- [ ] Tidak ada data sensitif yang terekspos
- [ ] Dokumentasi diperbarui jika perlu
- [ ] Screenshot/recording untuk perubahan UI (jika ada)

## Referensi

Link ke issue, ADR, atau dokumen terkait.
```

### Aturan Review

- Minimal **1 reviewer** harus menyetujui sebelum merge.
- Reviewer memeriksa: kebenaran logika, keamanan, kesesuaian dengan PRD/ADR,
  kualitas tes, dan keterbacaan kode.
- Jangan merge jika CI gagal.

---

## 4. File dan Data yang Dilarang Masuk Repository

| Dilarang | Alasan |
| --- | --- |
| `.env`, `.env.*` | Berisi credential dan secret |
| `node_modules/` | Dependency yang diunduh |
| File upload pengguna | Data runtime, bukan kode |
| Token, password, API key | Keamanan |
| Build artifact (`dist/`, `build/`) | Hasil kompilasi |

Pastikan `.gitignore` mencakup semua item di atas.

---

## 5. Standar Sebelum Merge

Kode dianggap siap merge jika memenuhi **Definition of Done** dari PRD §28:

- [x] Kode lolos test (unit dan integration yang relevan).
- [x] Tidak ada error TypeScript.
- [x] Lulus code review.
- [x] Aman dari kebocoran data (jawaban benar, token, password).
- [x] Didokumentasikan dengan baik (komentar kode dan/atau docs update).

Lihat [CODING-STANDARDS.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/CODING-STANDARDS.md)
untuk standar penulisan kode.

---

## 6. Aturan untuk AI Coding Agent

- **Baca** dokumen di `docs/` dan PRD sebelum mengambil keputusan arsitektur.
- **Jangan** membuat keputusan yang bertentangan dengan
  [DECISIONS.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md).
- **Jangan** mengimplementasikan fitur di luar MVP tanpa persetujuan maintainer.
- **Tandai** asumsi yang diambil dengan komentar `// ASSUMPTION:` agar mudah
  ditemukan saat review.
- **Ikuti** format commit, PR, dan coding standards yang sama dengan kontributor
  manusia.
