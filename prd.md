PRODUCT REQUIREMENTS DOCUMENT

Aplikasi Kuis Interaktif Real-Time Multiplayer

Nama Proyek: Aplikasi Kuis Interaktif
Versi: 1.0 Final
Tanggal: Juli 2026
Status: Siap Pengembangan
Platform: Web Application
Target Pengguna: Admin, Host, dan Player

1. Ringkasan Produk

Aplikasi Kuis Interaktif adalah platform kuis berbasis web yang memungkinkan Admin atau Host menjalankan permainan kuis secara real-time. Host menampilkan pertanyaan melalui layar utama, komputer, televisi, atau proyektor. Player bergabung menggunakan perangkat masing-masing, seperti smartphone, tablet, atau laptop, dengan memasukkan PIN permainan dan nickname.

Aplikasi memiliki konsep serupa dengan Kahoot, namun dibangun dengan identitas visual Modern Minimalist (Narito UI) (border tebal, warna primer cerah kontras tinggi, bayangan asimetris solid, dan tipografi tebal) untuk memberikan kesan modern, berani, dan menyenangkan (fun).

Fokus utama aplikasi:

Interaksi real-time.

Tampilan responsif bergaya Modern Minimalist (Narito UI).

Penggunaan yang sederhana.

Sinkronisasi permainan tanpa reload halaman.

Perhitungan skor berdasarkan ketepatan dan kecepatan.

Kemampuan menangani ratusan Player secara bersamaan.

Kemampuan Player untuk kembali ke permainan setelah koneksi terputus.

2. Latar Belakang

Pelaksanaan kuis secara manual sering mengalami beberapa kendala, seperti:

Penghitungan nilai yang lambat.

Sulit mengetahui siapa yang menjawab paling cepat.

Peserta harus menggunakan kertas atau perangkat khusus.

Hasil permainan tidak langsung tersedia.

Interaksi peserta terasa kurang menarik.

Sulit mengelola banyak peserta secara bersamaan.

Aplikasi ini dibuat untuk mengatasi kendala tersebut dengan menggunakan komunikasi real-time antara server, Host, dan Player.

3. Tujuan Produk

Tujuan utama aplikasi adalah:

Memungkinkan Admin membuat dan mengelola kuis.

Memungkinkan Host menjalankan kuis secara langsung.

Memungkinkan Player bergabung tanpa membuat akun.

Mengirim perubahan permainan secara real-time.

Menghitung skor secara otomatis.

Menampilkan leaderboard dan podium.

Menyimpan hasil permainan.

Menangani koneksi Player yang terputus.

Mencegah jawaban ganda dan manipulasi skor.

Menyediakan fondasi yang dapat dikembangkan untuk kebutuhan lebih besar.

4. Ruang Lingkup MVP

4.1 Fitur yang Termasuk

MVP mencakup:

Register dan login Admin.

Dashboard Admin.

CRUD kuis.

Editor pertanyaan (dengan gaya Modern Minimalist (Narito UI)).

Pertanyaan pilihan ganda (2-4 pilihan jawaban).

Gambar pada pertanyaan.

Pengaturan durasi setiap pertanyaan.

Penentuan jawaban benar.

Pembuatan sesi permainan dan PIN permainan.

Lobby real-time.

Player bergabung menggunakan PIN dan nickname.

Kontrol permainan oleh Host (Mulai, Lanjut, Jeda, Selesai).

Pengiriman pertanyaan secara real-time.

Countdown pertanyaan (waktu mundur).

Pengiriman jawaban dan perhitungan skor.

Hasil benar atau salah.

Leaderboard setiap pertanyaan & Podium akhir.

Riwayat permainan dan detail hasil Player.

Reconnect Player.

Export hasil permainan ke CSV.

Upload gambar pertanyaan.

Rate limiting dasar & Logging aktivitas/error.

4.2 Fitur di Luar MVP

Fitur berikut belum termasuk dalam MVP:

Aplikasi Android atau iOS native.

Sistem pembayaran / berlangganan.

Marketplace kuis atau AI pembuat soal.

Pertanyaan esai atau video dalam pertanyaan.

Turnamen lintas room.

Integrasi LMS (Google Classroom, dll).

Mode kuis offline & Sistem chat antar-Player.

Custom branding untuk setiap Admin.

5. Peran Pengguna

5.1 Admin

Admin merupakan pengguna yang memiliki akun dan telah login. Admin dapat:

Membuat, mengubah, menghapus, dan menduplikasi kuis.

Menambahkan pertanyaan, menentukan jawaban benar, durasi, dan gambar.

Menjalankan kuis sebagai Host.

Melihat riwayat permainan, hasil Player, dan mengunduh hasil (CSV).

5.2 Host

Host adalah Admin yang sedang menjalankan sesi permainan. Host dapat:

Membuat room permainan dan mendapatkan PIN.

Melihat Player yang bergabung, mengunci/membuka lobby, atau menghapus Player.

Memulai permainan, menampilkan pertanyaan/hasil/leaderboard.

Melanjutkan ke pertanyaan berikutnya, menjeda, atau mengakhiri permainan.

5.3 Player

Player merupakan peserta kuis dan tidak wajib membuat akun. Player dapat:

Memasukkan PIN permainan dan nickname.

Bergabung ke lobby dan menunggu permainan dimulai.

Memilih jawaban (1x per soal).

Melihat hasil benar/salah, tambahan skor, dan skor akhir.

Melakukan reconnect apabila koneksi terputus.

6. Alur Pengguna

6.1 Alur Admin dan Host

Register/Login → Dashboard → Membuat/memilih kuis → Klik Mulai Main → Sistem membuat sesi permainan & PIN → Host masuk ke Lobby → Player bergabung → Host mengunci Lobby → Host memulai permainan → Pertanyaan pertama dimulai → Player menjawab → Waktu berakhir → Hasil pertanyaan ditampilkan → Leaderboard ditampilkan → Host melanjutkan pertanyaan → Seluruh pertanyaan selesai → Podium akhir ditampilkan → Hasil permainan disimpan.

6.2 Alur Player

Membuka aplikasi → Memasukkan PIN → Sistem memvalidasi PIN → Memasukkan Nickname → Bergabung ke Lobby → Menunggu Host memulai → Pertanyaan dimulai → Memilih jawaban → Jawaban dikonfirmasi server → Melihat hasil benar/salah dan skor tambahan → Menunggu pertanyaan berikutnya → Melihat skor dan peringkat akhir.

7. Sitemap

7.1 Halaman Admin

/admin/register

/admin/login

/admin/dashboard

/admin/quiz/create

/admin/quiz/:quizId/edit

/admin/quiz/:quizId/preview

/admin/history

/admin/history/:gameSessionId

7.2 Halaman Host

/host/:gameSessionId/lobby

/host/:gameSessionId/game

/host/:gameSessionId/result

/host/:gameSessionId/leaderboard

/host/:gameSessionId/podium

7.3 Halaman Player

/ (Input PIN)

/join (Input Nickname)

/player/:gameSessionId/waiting

/player/:gameSessionId/game

/player/:gameSessionId/result

/player/:gameSessionId/final

Catatan: Perpindahan halaman atau status permainan harus dilakukan tanpa reload penuh.

8. Teknologi Pengembangan

8.1 Frontend

Teknologi:

React.js.

TypeScript.

Tailwind CSS (Untuk mempermudah implementasi gaya Modern Minimalist (Narito UI)).

React Router.

Socket.IO Client.

State management ringan (Zustand/Context).

Pedoman UI/UX (Modern Minimalist (Narito UI)):

Menggunakan garis batas (border) tebal berwarna hitam tegas (misal: border-4 border-black).

Menggunakan bayangan solid (hard shadows) tanpa efek blur (misal: shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]).

Warna latar belakang dan elemen menggunakan warna cerah/mencolok kontras tinggi (Kuning, Pink, Cyan, Hijau Neon).

Tipografi menggunakan font sans-serif tebal (Black/ExtraBold) untuk judul dan elemen penting.

Animasi transisi klik yang tegas (tombol bergeser menekan bayangan).

Frontend bertanggung jawab atas UI, komunikasi REST/Socket, namun tidak boleh menentukan skor/jawaban benar (semua dari server).

8.2 API dan Backend Logic

Teknologi:

Node.js & Express.js.

TypeScript.

Socket.IO.

Schema validation (Zod/Joi).

Backend bertanggung jawab atas Authentication, CRUD Kuis, Game State, Perhitungan Skor, Leaderboard, Reconnect, Storage Logic, dan Keamanan Data.

8.3 Database

Database utama menggunakan MongoDB. Menyimpan data: Admin, Kuis, Pertanyaan, Pilihan Jawaban, Game Session, Player, Jawaban, Skor, Hasil, dan Audit Log.

8.4 File Storage

Menyimpan Gambar pertanyaan/thumbnail. Database hanya menyimpan URL file, nama file, ukuran, tipe MIME. File gambar tidak dikirim melalui Socket.IO.

8.5 Cache dan Temporary State

Menggunakan Redis untuk data sementara/cepat: PIN aktif, Room aktif, Session Player, Countdown, Leaderboard sementara, dan Rate Limiting.

9. Arsitektur Sistem

Admin React App ─────┐
                     │
Host React App ──────┼── REST API dan WebSocket
                     │
Player React App ────┘
                              │
                              ▼
                 Node.js + Express + Socket.IO
                    │          │          │
                    │          │          └── File Storage
                    │          └───────────── Redis
                    └──────────────────────── MongoDB


Server menjadi satu-satunya sumber kebenaran (source of truth) untuk seluruh permainan.

10. Game State Management

Status permainan: CREATED, LOBBY, QUESTION_ACTIVE, QUESTION_RESULT, LEADERBOARD, PAUSED, FINISHED, CLOSED.

Aturan utama: Player hanya bisa menjawab saat QUESTION_ACTIVE. Jawaban yang masuk setelah deadline ditolak. Event yang tidak sesuai game state ditolak server.

11. Functional Requirements

11.1 Auth Admin: Register, Login, Refresh Session, Hash Password.

11.2 Pengelolaan Kuis: Admin bisa CRUD Kuis, set durasi, poin, dan jawaban benar.

11.3 Room Permainan: Server membuat PIN 6 digit unik.

11.4 Lobby: Sanitasi nickname (2-20 karakter, tanpa script HTML).

11.5 Pertanyaan: Server tidak mengirim jawaban benar ke Player saat QUESTION_ACTIVE.

11.6 Countdown: Dihitung lokal di Frontend berdasarkan startedAt dan endsAt dari server.

11.7 Jawaban Player: Mengirim questionId, choiceId, dan attemptId.

11.8 Validasi: Server memvalidasi waktu, room, state, dan mencegah double submit.

11.9 Scoring: Skor = round(500 + 500 * (remainingTime / duration)). Max 1000, Min 500 (jika benar). Salah = 0.

11.10 Leaderboard: Menampilkan peringkat dan perubahan posisi.

11.11 Reconnect: Menggunakan sessionToken (bukan socket.id). Server mengirim snapshot state permainan (skor dan status menjawab tetap ada).

12. REST API (Versi v1)

12.1 Authentication

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

GET /api/v1/auth/me

12.2 Quiz

GET /api/v1/quizzes

POST /api/v1/quizzes

GET /api/v1/quizzes/:quizId

PATCH /api/v1/quizzes/:quizId

DELETE /api/v1/quizzes/:quizId

POST /api/v1/quizzes/:quizId/duplicate

12.3 Media

POST /api/v1/media

DELETE /api/v1/media/:mediaId

12.4 Game Session

POST /api/v1/game-sessions

GET /api/v1/game-sessions/:gameSessionId

POST /api/v1/game-sessions/check-pin

POST /api/v1/game-sessions/join

GET /api/v1/game-sessions/:gameSessionId/results

12.5 History

GET /api/v1/history

GET /api/v1/history/:gameSessionId

GET /api/v1/history/:gameSessionId/export

13. WebSocket Events

Namespace terpisah untuk /host dan /player.

Host ke Server: create_room, start_game, next_question, show_result, kick_player, dll.

Player ke Server: join_room, submit_answer, resume_session.

Server ke Host: Update jumlah player di lobby, jumlah jawaban masuk, leaderboard, status game.

Server ke Player: Kirim soal, tolak/terima jawaban (dengan acknowledgement), kirim skor personal, status game.

14. Struktur Data (MongoDB)

Admin: _id, name, email, passwordHash.

Quiz: _id, ownerId, title, questions[].

Question: text, choices[], correctChoiceId, durationSeconds.

Game Session: _id, pin, status, currentQuestionIndex.

Player: _id, gameSessionId, nickname, sessionTokenHash, score.

Answer: _id, gameSessionId, playerId, choiceId, isCorrect, scoreAwarded.

15. Database Index

Minimum Index: Admin.email, Quiz.ownerId, GameSession.pin, Player.gameSessionId + normalizedNickname, Answer.attemptId.

Constraint: Email unik, PIN aktif unik, Nickname per room unik, attemptId tidak boleh dobel.

16. Authentication dan Authorization

Admin mengelola kuis miliknya saja (ownerId).

Host mengontrol sesi gamenya saja.

Player hanya bisa baca soal, tidak bisa baca jawaban benar sebelum waktunya, dan tidak bisa manipulasi skor.

17. Row-Level Data Protection

Di MongoDB, perlindungan data dilakukan di Service Layer (Backend). Setiap query data Admin wajib menyertakan ownerId (misal: findOne({ _id: quizId, ownerId: authenticatedAdmin.id })).

18. Rate Limiting

Diterapkan pada API Login, Join Room, dan Submit Jawaban menggunakan Redis untuk mencegah Spam/DDoS dari IP atau sesi tertentu.

19. Upload dan Media Security

Hanya format JPEG, PNG, WebP. Validasi MIME Type. Nama file diganti otomatis oleh server. File executable ditolak.

20. Error Handling

Format Error REST standard JSON (success, code, message).

Format Error Socket: code, message, retryable.

Kode Error: INVALID_PIN, ROOM_FULL, DUPLICATE_NICKNAME, QUESTION_CLOSED, dll. (Tanpa stack trace di production).

21. Logging dan Error Tracking

Mencatat aktivitas krusial (join, jawab, error) tanpa mencetak data sensitif seperti password atau session token mentah.

22. Non-Functional Requirements

Target awal pengembangan:

Mendukung minimal 300 Player dalam satu room.

Mendukung minimal 500 koneksi aktif pada tahap MVP.

Server dapat menerima jawaban serentak.

Latensi acknowledgement jawaban p95 di bawah 250 ms pada server.

Perubahan pertanyaan diterima mayoritas client dalam waktu kurang dari 500 ms pada jaringan normal.

Tidak ada jawaban ganda.

Tidak ada manipulasi skor dari frontend.

Refresh halaman tidak membuat Player baru.

Reconnect tidak menghilangkan skor.

Tampilan Player dapat digunakan pada lebar layar 320 piksel.

Aplikasi tidak melakukan reload ketika state permainan berubah.

Aplikasi merender elemen visual bergaya Modern Minimalist (Narito UI) dengan performa tinggi tanpa menyebabkan Cumulative Layout Shift (CLS) yang buruk.

Payload Socket.IO dijaga kecil.

23. Testing

Meliputi: Unit Test (Skor, State, Validasi), Integration Test (Flow lengkap dari login sampai selesai kuis), Real-Time Test (Socket disconnect, double submit), dan Load Test.

24. Version Control

Git (Monorepo direkomendasikan). Branch: main, develop, feature/*. File .env dilarang masuk repo.

25. Continuous Integration (CI)

Otomatisasi Linting, Type Checking, Unit & Integration Test sebelum merge PR.

26. Tahapan Pengembangan

Fondasi: Setup repo, database, dan Auth.

Editor Kuis: CRUD Kuis dan UI Editor Modern Minimalist (Narito UI).

Core Multiplayer: Socket.IO, Lobby, Game State, Skor.

Reliability: Reconnect, Redis, Rate Limiting.

Hasil: Podium, Export CSV.

QA: Testing & Optimasi Performa.

Deployment: Persiapan  & Server Production.

27. Acceptance Criteria MVP

Kuis bisa berjalan dari Lobby hingga Podium tanpa reload halaman.

Player reconnect tidak hilang poin.

Skor dihitung otomatis dan akurat oleh server.

UI berjalan mulus.

Tidak ada kebocoran jawaban.

28. Definition of Done

Kode lolos test, tidak ada error TypeScript, lulus review, aman dari bocor data, dan didokumentasikan dengan baik.

29. Annex Deployment

(Disiapkan pada tahap deployment) Mencakup , Nginx, SSL, Backup Strategy, Load Balancer (jika butuh scaling), Monitoring (CPU/RAM/Latency), dan Security Production (Firewall, SSH, Rotasi Credential).