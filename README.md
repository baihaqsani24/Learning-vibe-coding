# Belajar Vibe Coding - Backend API

[English](README_EN.md) | [Bahasa Indonesia](README.md)

Aplikasi backend sederhana untuk manajemen pengguna (Registrasi, Login, Profil Pengguna, dan Logout) menggunakan **ElysiaJS**, **Drizzle ORM**, dan runtime **Bun**. Dokumen ini ditujukan untuk membantu programmer pemula (junior) maupun agen AI memahami struktur, teknologi, serta cara menjalankan aplikasi ini.

---

## 🚀 Technology Stack & Libraries

Aplikasi ini dibangun menggunakan teknologi modern untuk kecepatan dan efisiensi pengembangan:
1.  **Runtime**: [Bun](https://bun.sh/) - Runtime JavaScript & TypeScript yang sangat cepat dan memiliki fitur *built-in compiler*, *package manager*, serta *test runner*.
2.  **Web Framework**: [ElysiaJS](https://elysiajs.com/) - Web framework berkinerja tinggi untuk Bun yang mendukung validasi tipe data secara ketat.
3.  **ORM (Object-Relational Mapping)**: [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript yang ringan dan cepat untuk berinteraksi dengan database.
4.  **Database**: [MySQL / MariaDB](https://www.mysql.com/) - Database relational lokal (biasanya dijalankan menggunakan **XAMPP**).

### Library Tambahan
*   `mysql2`: Driver MySQL untuk koneksi database.
*   `drizzle-kit`: CLI tool pendukung Drizzle untuk sinkronisasi skema database.

---

## 📂 Struktur Folder & Arsitektur Kode

Aplikasi ini menggunakan pola arsitektur pemisahan tanggung jawab (*Separation of Concerns*). Kode sumber utama berada di dalam folder `src/`.

```text
├── src/
│   ├── db/
│   │   ├── index.ts          # Setup koneksi database ke MySQL/MariaDB
│   │   └── schema.ts         # Definisi struktur tabel database (Drizzle)
│   ├── routes/
│   │   └── users-routes.ts   # Berisi definisi endpoint API (Routing Elysia)
│   ├── services/
│   │   └── users-services.ts # Berisi logika bisnis (Business Logic & Query Database)
│   └── index.ts              # Entry point utama aplikasi
├── tests/
│   ├── setup.ts              # Teardown global sebelum unit test berjalan (Pembersihan DB)
│   └── users.test.ts         # Berisi unit test untuk seluruh endpoint user
├── bunfig.toml               # File konfigurasi Bun (digunakan untuk preload testing)
├── drizzle.config.ts         # Konfigurasi Drizzle ORM & koneksi Drizzle-Kit
├── package.json              # File manifest dependencies & script commands
└── .env                      # Konfigurasi Environment Variables (Kredensial DB)
```

### Aturan Penamaan File
*   **Routing**: File routing diletakkan di `src/routes/` menggunakan format `[fitur]-routes.ts` (contoh: `users-routes.ts`).
*   **Business Logic**: File logika diletakkan di `src/services/` menggunakan format `[fitur]-services.ts` (contoh: `users-services.ts`).

---

## 🗄️ Skema Database

Terdapat 2 tabel yang digunakan dalam aplikasi ini:

### 1. Tabel `users`
Digunakan untuk menyimpan informasi akun pengguna yang telah terdaftar.
*   `id` (INT): Primary Key, Auto Increment.
*   `name` (VARCHAR 255): Nama pengguna. Tidak boleh kosong.
*   `email` (VARCHAR 255): Email pengguna. Harus unik dan tidak boleh kosong.
*   `password` (VARCHAR 255): Hash kata sandi pengguna (dihash menggunakan bcrypt). Tidak boleh kosong.
*   `created_at` (TIMESTAMP): Waktu akun dibuat (otomatis terisi).

### 2. Tabel `sessions`
Digunakan untuk mengelola token aktif pengguna yang sedang login.
*   `id` (INT): Primary Key, Auto Increment.
*   `token` (VARCHAR 255): Token autentikasi unik berbentuk UUID. Tidak boleh kosong.
*   `user_id` (INT): Foreign Key yang menghubungkan ke kolom `id` pada tabel `users`.
*   `created_at` (TIMESTAMP): Waktu sesi dibuat.

---

## 🔌 Dokumentasi Endpoint API

Semua rute API diawali dengan prefix `/api`.

### 1. Registrasi Akun Baru
Mendaftarkan akun baru ke sistem.
*   **Endpoint**: `POST /api/users`
*   **Request Body (JSON)**:
    ```json
    {
      "name": "Nama User (max 255 char)",
      "email": "user@example.com",
      "password": "kataSandiRahasia"
    }
    ```
*   **Response Sukses (200 OK)**:
    ```json
    {
      "data": "OK"
    }
    ```
*   **Response Gagal**:
    *   `400 Bad Request`: Email sudah terdaftar sebelumnya.
    *   `422 Unprocessable Content`: Masukan tidak lolos validasi (misal nama > 255 karakter).

### 2. Login User
Melakukan login untuk mendapatkan token autentikasi.
*   **Endpoint**: `POST /api/users/login`
*   **Request Body (JSON)**:
    ```json
    {
      "name": "Nama User",
      "email": "user@example.com",
      "password": "kataSandiRahasia"
    }
    ```
*   **Response Sukses (200 OK)**:
    ```json
    {
      "data": {
        "token": "e44d5678-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
    ```
*   **Response Gagal**:
    *   `401 Unauthorized`: Email atau password salah.
    *   `422 Unprocessable Content`: Kesalahan tipe/panjang karakter input.

### 3. Get Current User Profile
Mengambil data profil pengguna yang sedang login.
*   **Endpoint**: `GET /api/users/current`
*   **Headers**:
    *   `Authorization: Bearer <token_dari_login>`
*   **Response Sukses (200 OK)**:
    ```json
    {
      "data": {
        "id": 1,
        "name": "Nama User",
        "email": "user@example.com",
        "created_at": "2026-07-16T12:00:00Z"
      }
    }
    ```
*   **Response Gagal**:
    *   `401 Unauthorized`: Token kosong, tidak berformat Bearer, atau token tidak valid.

### 4. Logout User
Menghapus sesi login aktif pengguna dari sistem.
*   **Endpoint**: `DELETE /api/users/logout`
*   **Headers**:
    *   `Authorization: Bearer <token_dari_login>`
*   **Response Sukses (200 OK)**:
    ```json
    {
      "data": "OK"
    }
    ```
*   **Response Gagal**:
    *   `401 Unauthorized`: Token tidak valid atau sesi sudah tidak ada di database.

---

## 🛠️ Langkah-Langkah Setup Project

Ikuti langkah berikut untuk memasang project di komputer lokal Anda:

### 1. Prasyarat (Prerequisites)
*   Pastikan **Bun** sudah terinstal di komputer Anda. Jika belum, instal dengan membuka Terminal/PowerShell lalu jalankan:
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```
*   Pastikan server **MySQL / MariaDB** Anda menyala (buka XAMPP Control Panel, lalu klik *Start* pada modul Apache & MySQL).

### 2. Menginstal Dependencies
Di direktori root project, jalankan:
```bash
bun install
```

### 3. Mengatur Environment Variables
Buat sebuah file bernama `.env` di direktori root project dan sesuaikan nilainya:
```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=belajar_vibe_coding
```
*(Catatan: `DB_PASSWORD` biarkan kosong jika Anda menggunakan konfigurasi default dari XAMPP).*

### 4. Membuat Database & Sinkronisasi Tabel
*   Buka MySQL CLI atau phpMyAdmin dan buat database baru bernama `belajar_vibe_coding`:
    ```sql
    CREATE DATABASE belajar_vibe_coding;
    ```
*   Lakukan push skema tabel ke database menggunakan perintah:
    ```bash
    bun run drizzle-kit push
    ```

---

## 🏃 Menjalankan Aplikasi

Untuk menjalankan server dalam mode pengembangan (*development mode* dengan fitur auto-reload ketika kode berubah):
```bash
bun run dev
```
Server akan aktif di alamat: `http://localhost:3000`

---

## 🧪 Cara Menjalankan Unit Test

Pengujian otomatis dilakukan menggunakan Bun Test Runner. Pengujian akan menghapus seluruh data tabel `users` dan `sessions` sebelum menjalankan setiap skenario test untuk menjamin konsistensi hasil.

Untuk menjalankan seluruh rangkaian pengujian:
```bash
bun test
```
Bun akan menjalankan seluruh file yang berada di dalam folder `tests/` dan menampilkan laporan hasil pengujian sukses/gagal di terminal.
