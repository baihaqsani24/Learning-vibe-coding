# Project Setup Plan: Bun + ElysiaJS + Drizzle + MySQL

Dokumen ini berisi panduan tingkat tinggi (high-level planning) untuk menginisiasi dan mengonfigurasi proyek backend baru menggunakan runtime Bun, framework web ElysiaJS, ORM Drizzle, dan database MySQL.

---

## 1. Inisialisasi Proyek
*   Menginisialisasi proyek baru berbasis **Bun** di direktori ini.
*   Mengonfigurasi struktur folder dasar proyek (misal: memisahkan kode sumber di dalam folder `src/`).

## 2. Instalasi Dependensi
*   **Aplikasi & Routing**: Instal **ElysiaJS** sebagai framework web utama.
*   **Database ORM**: Instal **Drizzle ORM** dan library driver MySQL (seperti **mysql2**) untuk konektivitas database.
*   **Developer Tools**: Instal **Drizzle Kit** (sebagai dev dependency) untuk mengelola migrasi skema database, serta tipe data TypeScript pendukung.

## 3. Konfigurasi Koneksi & Skema Database
*   **Konfigurasi Drizzle**: Buat file konfigurasi Drizzle (`drizzle.config.ts`) untuk menentukan lokasi skema dan direktori output migrasi.
*   **Koneksi Database**: Buat file koneksi database menggunakan driver MySQL dan instance Drizzle ORM. Pastikan konfigurasi kredensial database dimuat melalui variabel lingkungan (`.env`).
*   **Definisi Skema**: Buat skema database sederhana (misalnya tabel `users` atau `todos`) menggunakan sintaks Drizzle ORM.

## 4. Manajemen Migrasi Database
*   Konfigurasi skrip di `package.json` untuk:
    *   Membangkitkan (generate) file migrasi SQL berdasarkan skema Drizzle.
    *   Menjalankan (push/migrate) migrasi tersebut ke server MySQL target.

## 5. Pembuatan Web Server dengan ElysiaJS
*   Inisialisasi web server ElysiaJS pada file entri utama (misal: `src/index.ts`).
*   Konfigurasi server untuk berjalan menggunakan runtime Bun pada port tertentu.
*   Buat route endpoint sederhana untuk pengujian:
    *   Endpoint dasar (seperti `GET /` untuk memeriksa status server).
    *   Endpoint interaksi database (seperti membaca data dari tabel yang telah dibuat di langkah skema) untuk memverifikasi integrasi Elysia + Drizzle + MySQL berjalan lancar.

## 6. Uji Coba & Verifikasi
*   Jalankan server menggunakan runtime Bun (`bun run dev`).
*   Pastikan migrasi berhasil diterapkan ke MySQL.
*   Lakukan request ke endpoint ElysiaJS dan pastikan respons sukses serta koneksi database berfungsi normal.
