# Environment Variables — Quzzzz

Dokumen ini menjelaskan seluruh environment variable yang digunakan oleh
backend dan frontend Quzzzz. Tidak boleh ada credential nyata dalam dokumen
ini; gunakan nilai contoh saja.

**Sumber acuan:** [PRD v1.0](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/prd.md)
§8, §18, §19, §21.

---

## 1. Aturan Umum

- File `.env` **tidak boleh** masuk ke repository. Pastikan `.gitignore`
  mencantumkannya.
- Setiap environment (development, test, staging, production) memiliki file
  `.env` sendiri.
- Sediakan `.env.example` di repository yang berisi semua key **tanpa** nilai
  sensitif.
- Jangan hardcode nilai environment di kode; selalu baca dari `process.env`.

---

## 2. Variabel Backend

### Server

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `NODE_ENV` | Mode aplikasi | `development` | Ya |
| `PORT` | Port HTTP server | `3001` | Ya |
| `HOST` | Bind address | `0.0.0.0` | Tidak |
| `LOG_LEVEL` | Level minimum log | `debug` | Tidak |

### Database (MongoDB)

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `MONGODB_URI` | Connection string MongoDB | `mongodb://localhost:27017/quzzzz` | Ya |
| `MONGODB_DB_NAME` | Nama database (jika tidak ada di URI) | `quzzzz` | Tidak |

### Cache (Redis)

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `REDIS_URL` | Connection string Redis | `redis://localhost:6379` | Ya |
| `REDIS_KEY_PREFIX` | Prefix untuk semua key Redis | `qz:` | Tidak |

### Autentikasi

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `JWT_SECRET` | Secret untuk signing JWT | `change-me-in-production` | Ya |
| `JWT_EXPIRES_IN` | Masa berlaku access token | `15m` | Ya |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token | `change-me-refresh` | Ya |
| `JWT_REFRESH_EXPIRES_IN` | Masa berlaku refresh token | `7d` | Ya |

### CORS

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `CORS_ORIGIN` | Origin yang diizinkan | `http://localhost:5173` | Ya |

### Media / File Storage

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `UPLOAD_DIR` | Direktori penyimpanan file upload | `./uploads` | Ya |
| `MAX_FILE_SIZE` | Ukuran maksimal file upload (bytes) | `5242880` (5 MB) | Ya |
| `ALLOWED_MIME_TYPES` | Tipe MIME yang diizinkan | `image/jpeg,image/png,image/webp` | Ya |

### Rate Limiting

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `RATE_LIMIT_LOGIN_MAX` | Maks request login per window | `TBD` | Ya |
| `RATE_LIMIT_LOGIN_WINDOW` | Window rate limit login (detik) | `TBD` | Ya |
| `RATE_LIMIT_JOIN_MAX` | Maks request join room per window | `TBD` | Ya |
| `RATE_LIMIT_SUBMIT_MAX` | Maks submit jawaban per window | `TBD` | Ya |

> **Catatan:** Nilai rate limit belum ditetapkan di PRD. Sesuaikan berdasarkan
> hasil load test. Lihat [DECISIONS.md ADR-005](file:///home/syzhaa/projects/aplikasi-kuis-interaktif/docs/DECISIONS.md).

---

## 3. Variabel Frontend

| Variabel | Fungsi | Contoh Nilai | Wajib |
| --- | --- | --- | --- |
| `VITE_API_URL` | Base URL REST API | `http://localhost:3001/api/v1` | Ya |
| `VITE_SOCKET_URL` | Base URL Socket.IO | `http://localhost:3001` | Ya |

> **Catatan:** Prefix `VITE_` diperlukan oleh Vite agar variabel tersedia di
> client. Jika menggunakan bundler lain, sesuaikan prefix-nya.

---

## 4. Perbedaan per Environment

| Variabel | Development | Test | Staging | Production |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `development` | `test` | `staging` | `production` |
| `LOG_LEVEL` | `debug` | `warn` | `info` | `warn` |
| `MONGODB_URI` | localhost | localhost (DB terpisah) | Server staging | Server production |
| `REDIS_URL` | localhost | localhost | Server staging | Server production |
| `CORS_ORIGIN` | `http://localhost:*` | `*` (test) | URL staging | URL production |
| `JWT_SECRET` | Nilai test | Nilai test | Secret staging | Secret kuat |

### Aturan per Environment

- **Development**: Boleh menggunakan credential lemah dan log level `debug`.
- **Test**: Gunakan database dan Redis terpisah agar data test terisolasi.
- **Staging**: Konfigurasi mendekati production, tetapi boleh menggunakan
  credential terpisah.
- **Production**: Secret harus kuat dan di-rotate berkala. Log level
  `warn` atau `error`. Jangan tampilkan stack trace di response client.

---

## 5. Contoh `.env.example`

```bash
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://localhost:27017/quzzzz

# Redis
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=qz:

# Auth
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-refresh
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Media
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting (TBD — sesuaikan setelah load test)
# RATE_LIMIT_LOGIN_MAX=
# RATE_LIMIT_LOGIN_WINDOW=
# RATE_LIMIT_JOIN_MAX=
# RATE_LIMIT_SUBMIT_MAX=
```
