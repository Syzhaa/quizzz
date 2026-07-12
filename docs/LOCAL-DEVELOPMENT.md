# Panduan Pengembangan Lokal — Quzzzz

Dokumen ini menjelaskan cara menjalankan proyek Quzzzz di mesin lokal dari
awal. Ikuti langkah-langkah di bawah secara berurutan.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§8, §24.

---

## 1. Prasyarat

Pastikan software berikut sudah terinstal:

| Software | Versi Minimum | Keterangan |
| --- | --- | --- |
| Node.js | 18 LTS | Runtime backend dan build frontend |
| npm / pnpm / yarn | Sesuai keputusan repo | `TBD` — akan dikunci saat inisialisasi repo |
| MongoDB | 6.0 | Database utama |
| Redis | 7.0 | Cache dan state sementara |
| Git | 2.30 | Version control |

> **Catatan:** Package manager yang dipakai proyek belum ditetapkan. Lihat
> [DECISIONS.md ADR-008](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md)
> untuk status keputusan monorepo dan tooling.

---

## 2. Clone Repository

```bash
git clone <repository-url>
cd quzzzz
```

---

## 3. Konfigurasi Environment

1. Salin file contoh environment:

```bash
cp .env.example .env
```

2. Edit `.env` dan isi nilai yang sesuai untuk development lokal. Lihat
   [ENVIRONMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ENVIRONMENT.md)
   untuk penjelasan setiap variabel.

3. Pastikan `.env` **tidak** masuk ke repository (sudah tercantum di
   `.gitignore`).

---

## 4. Menjalankan MongoDB

### Opsi A — MongoDB Lokal

```bash
# Jalankan MongoDB
mongod --dbpath /path/to/data/db
```

### Opsi B — MongoDB via Docker

```bash
docker run -d --name quzzzz-mongo \
  -p 27017:27017 \
  mongo:6
```

### Verifikasi

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## 5. Menjalankan Redis

### Opsi A — Redis Lokal

```bash
redis-server
```

### Opsi B — Redis via Docker

```bash
docker run -d --name quzzzz-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Verifikasi

```bash
redis-cli ping
# Output: PONG
```

---

## 6. Menjalankan Backend

```bash
# Masuk ke direktori backend (path TBD sesuai struktur repo)
cd backend  # atau packages/backend, apps/backend, dll.

# Install dependencies
npm install  # sesuaikan dengan package manager yang dipakai

# Jalankan development server
npm run dev
```

Backend seharusnya berjalan di port yang dikonfigurasi pada `.env`
(default: `http://localhost:3001` — `TBD`).

### Verifikasi

```bash
curl http://localhost:3001/api/v1/auth/me
# Harus mengembalikan response JSON (meskipun 401 Unauthorized)
```

---

## 7. Menjalankan Frontend

```bash
# Masuk ke direktori frontend (path TBD sesuai struktur repo)
cd frontend  # atau packages/frontend, apps/frontend, dll.

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend seharusnya berjalan di `http://localhost:5173` (Vite default) atau
port lain yang dikonfigurasi. `TBD` sampai frontend diinisialisasi.

---

## 8. Urutan Startup yang Benar

```
1. MongoDB  →  2. Redis  →  3. Backend  →  4. Frontend
```

Backend membutuhkan koneksi MongoDB dan Redis saat startup. Frontend
membutuhkan backend untuk REST dan Socket.IO.

---

## 9. Troubleshooting Umum

### MongoDB gagal start

- Periksa apakah port 27017 sudah digunakan:
  `lsof -i :27017` atau `ss -tlnp | grep 27017`
- Pastikan `dbpath` memiliki izin tulis.

### Redis gagal start

- Periksa apakah port 6379 sudah digunakan.
- Jika memakai Docker, pastikan container sebelumnya sudah dihentikan:
  `docker rm -f quzzzz-redis`

### Backend gagal konek ke database

- Pastikan `MONGODB_URI` dan `REDIS_URL` di `.env` sesuai dengan service yang
  berjalan.
- Periksa apakah MongoDB dan Redis sudah aktif sebelum menjalankan backend.

### Frontend tidak bisa konek ke backend

- Pastikan backend sudah berjalan.
- Periksa konfigurasi CORS dan proxy pada file konfigurasi frontend.
- Pastikan URL API di environment frontend menunjuk ke backend lokal.

### Port konflik

- Ubah port melalui variabel environment. Lihat
  [ENVIRONMENT.md](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/ENVIRONMENT.md).

### TypeScript error saat build

- Jalankan `npx tsc --noEmit` untuk melihat error detail.
- Pastikan versi TypeScript konsisten di semua package.

---

## 10. Perintah Berguna

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm run lint` | Jalankan linter |
| `npm run test` | Jalankan unit test |
| `npm run test:integration` | Jalankan integration test (`TBD`) |

> **Catatan:** Nama perintah di atas bersifat konvensional dan akan dikonfirmasi
> setelah `package.json` proyek dibuat.
