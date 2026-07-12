# Release Checklist — Quzzzz

Checklist ini harus dipenuhi sebelum deploy ke **staging** dan **production**.
Setiap item harus dicek dan ditandai oleh penanggung jawab release.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§25, §27, §28, §29.

---

## 1. Pre-Release — Kode

- [ ] Semua fitur yang dijadwalkan sudah di-merge ke `develop`.
- [ ] Tidak ada pull request yang tertunda untuk release ini.
- [ ] Semua item di
      [QA-CHECKLIST.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/QA-CHECKLIST.md)
      sudah dipenuhi.
- [ ] CI pipeline pass: lint, type check, unit test, integration test.
- [ ] Build production berhasil di frontend dan backend.

---

## 2. Pre-Release — Environment

- [ ] Semua environment variable untuk target environment sudah dikonfigurasi.
      Lihat
      [ENVIRONMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ENVIRONMENT.md).
- [ ] `NODE_ENV` diset ke `staging` atau `production` sesuai target.
- [ ] Secret (JWT_SECRET, JWT_REFRESH_SECRET) menggunakan nilai kuat, bukan
      default development.
- [ ] CORS_ORIGIN diset ke domain yang benar.
- [ ] `LOG_LEVEL` sesuai environment (bukan `debug` di production).

---

## 3. Pre-Release — Database dan Cache

- [ ] MongoDB accessible dari server target.
- [ ] Index database sudah dibuat sesuai PRD §15:
  - [ ] `Admin.email` (unique)
  - [ ] `Quiz.ownerId`
  - [ ] `GameSession.pin` (unique untuk PIN aktif)
  - [ ] `Player.gameSessionId + normalizedNickname` (unique compound)
  - [ ] `Answer.attemptId` (unique)
- [ ] Redis accessible dari server target.
- [ ] Backup database terbaru sudah ada (production).

---

## 4. Pre-Release — Keamanan

- [ ] File `.env` tidak ada di repository.
- [ ] Stack trace tidak terekspos di response error.
- [ ] Rate limiting aktif dan dikonfigurasi.
- [ ] HTTPS aktif (staging dan production).
- [ ] File upload hanya menerima JPEG, PNG, WebP.
- [ ] CORS terbatas pada origin yang diizinkan.

---

## 5. Deploy ke Staging

- [ ] Deploy backend ke server staging.
- [ ] Deploy frontend ke server staging.
- [ ] Verifikasi backend health check: `GET /api/v1/health` (`TBD`).
- [ ] Verifikasi frontend bisa diakses.
- [ ] Verifikasi koneksi MongoDB dari staging.
- [ ] Verifikasi koneksi Redis dari staging.
- [ ] Verifikasi Socket.IO berfungsi (join room, submit answer).

---

## 6. Smoke Test di Staging

- [ ] Register Admin baru → berhasil.
- [ ] Login → berhasil.
- [ ] Buat kuis dengan pertanyaan → berhasil.
- [ ] Mulai game session → PIN ditampilkan.
- [ ] Player join via PIN dan nickname → masuk lobby.
- [ ] Host mulai permainan → pertanyaan muncul.
- [ ] Player menjawab → skor dihitung benar.
- [ ] Leaderboard ditampilkan.
- [ ] Podium akhir ditampilkan.
- [ ] History dan export CSV → berhasil.
- [ ] Reconnect Player → skor tetap.
- [ ] Tampilan responsive 320px → berfungsi.

---

## 7. Deploy ke Production

- [ ] Semua smoke test staging pass.
- [ ] Backup database production terbaru sudah ada.
- [ ] Deploy backend ke production.
- [ ] Deploy frontend ke production.
- [ ] Verifikasi health check production.
- [ ] Ulangi smoke test ringkas di production.

---

## 8. Post-Deploy

- [ ] Monitor log untuk error yang tidak terduga.
- [ ] Monitor latency dan resource usage.
- [ ] Pastikan tidak ada error spike.
- [ ] Konfirmasi Socket.IO berfungsi normal di production.
- [ ] Siapkan prosedur rollback jika ditemukan masalah kritis.

---

## 9. Rollback Plan

Jika ditemukan masalah kritis setelah deploy:

1. **Frontend:** Deploy ulang versi sebelumnya.
2. **Backend:** Deploy ulang versi sebelumnya.
3. **Database:** Jika ada migration, jalankan rollback script (`TBD`).
4. **Redis:** Flush key yang bermasalah jika diperlukan.
5. **Komunikasi:** Informasikan tim tentang rollback dan alasannya.

> **Catatan:** Detail prosedur rollback, backup, dan incident response akan
> didokumentasikan di file terpisah setelah infrastruktur deployment disiapkan
> (PRD §29).

---

## 10. Catatan

- Checklist ini akan diperbarui seiring perkembangan infrastruktur deployment.
- Item yang belum relevan (misalnya, load balancer, monitoring detail) ditandai
  `TBD` dan akan ditambahkan pada tahap deployment PRD §29.
- Setiap release harus memiliki salinan checklist ini yang ditandai dan
  disimpan sebagai catatan.
