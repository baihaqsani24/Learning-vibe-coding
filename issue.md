# Fitur Registrasi User

Dokumen ini berisi detail perancangan dan langkah-langkah implementasi untuk fitur registrasi pengguna baru. Fitur ini dirancang sedemikian rupa agar mudah dipahami dan diimplementasikan.

## 1. Perubahan Skema Database

Perbarui file skema database (misal: `src/db/schema.ts`) untuk tabel `users` dengan struktur persis seperti berikut:
- `id`: integer, auto increment, primary key
- `name`: varchar(255), tidak boleh kosong (not null)
- `email`: varchar(255), tidak boleh kosong (not null), dan harus *unique* (unik)
- `password`: varchar(255), tidak boleh kosong (not null). **Perhatian:** Field ini harus diisi dengan hasil enkripsi/hashing dari bcrypt, bukan plain text.
- `created_at`: timestamp, default waktu saat ini (current_timestamp)

## 2. Struktur Folder & File Baru

Pisahkan kode agar lebih rapi dengan membuat struktur folder dan file berikut di dalam folder `src`:
- `src/services/users-services.ts`: Berisi *logic bisnis* aplikasi (misal: pengecekan ketersediaan email, proses hashing password, penyimpanan ke DB).
- `src/routes/users-routes.ts`: Berisi pendaftaran endpoint dan routing ElysiaJS khusus untuk entitas user.

## 3. Spesifikasi API Registrasi

Buat endpoint registrasi dengan spesifikasi berikut:

- **Metode & Endpoint**: `POST /api/users`
- **Request Body (JSON)**:
  ```json
  {
      "name": "Eko",
      "email": "baihaqsan@localhost",
      "password": "rahasia"
  }
  ```

- **Response Body (Sukses)**:
  ```json
  {
      "data": "OK"
  }
  ```

- **Response Body (Error - Jika Email Telah Digunakan)**:
  ```json
  {
      "error": "email sudah terdaftar"
  }
  ```

## 4. Tahapan Implementasi

Bagi yang akan mengimplementasikan fitur ini, silakan ikuti tahapan eksekusi secara berurutan:

### Tahap 1: Instalasi Library Hashing (Bcrypt)
- Instal modul hashing yang umum, misalnya menggunakan `bun add bcrypt` dan `bun add -d @types/bcrypt`. *(Atau jika lebih nyaman, bisa menggunakan library crypto bawaan Bun `bun:password` asalkan fungsinya sama).*

### Tahap 2: Pembaruan Skema Database
- Buka `src/db/schema.ts`.
- Ubah/perbarui tabel `users` menjadi sesuai dengan rincian di poin 1 di atas. Pastikan kolom email diset unik agar database mencegah duplikasi.
- Jika ada perubahan pada struktur Drizzle, lakukan migrasi database (misalnya dengan menjalankan script `bun run db:generate` dan `bun run db:migrate`).

### Tahap 3: Pembuatan Logic Bisnis (Service Layer)
- Buat file `src/services/users-services.ts`.
- Buat sebuah fungsi (contoh: `registerUser(data)`).
- Di dalam fungsi tersebut:
  1. Lakukan query ke database (Drizzle) untuk mencari apakah data user dengan `email` yang dikirim dari input sudah ada.
  2. Jika email sudah ada di database, *throw error* atau kembalikan response kegagalan.
  3. Jika email belum ada, hash nilai `password` menggunakan library bcrypt.
  4. Simpan data (name, email, password_yang_sudah_dihash) ke tabel `users` menggunakan Drizzle.
  5. Kembalikan balikan / sinyal sukses.

### Tahap 4: Pembuatan Endpoint (Route Layer)
- Buat file `src/routes/users-routes.ts`.
- Inisiasi instance Elysia baru dan buat handler untuk metode POST di endpoint `/api/users`.
- Ambil data (name, email, password) dari `body` request.
- Panggil fungsi service `registerUser(data)` dari Tahap 3.
- Tangkap hasil dari service tersebut:
  - Jika mendapatkan error bahwa email sudah ada, berikan nilai balik berupa JSON `{ "error": "email sudah terdaftar" }`.
  - Jika berhasil, berikan nilai balik berupa JSON `{ "data": "OK" }`.

### Tahap 5: Menyambungkan Routing ke Aplikasi Utama
- Buka file utama aplikasi, yaitu `src/index.ts`.
- Lakukan import file routing `users-routes.ts` yang baru saja dibuat.
- Daftarkan route tersebut ke instance utama Elysia menggunakan perintah `.use()`.

### Tahap 6: Pengujian Sistem
- Jalankan server (`bun run dev`).
- Uji endpoint menggunakan Postman, cURL, atau alat API client lainnya dengan cara menembak HTTP POST ke `http://localhost:3000/api/users` dengan membawa body JSON.
- Pastikan mendapat respons `{ "data": "OK" }` jika sukses, dan `{ "error": "email sudah terdaftar" }` jika mencoba menggunakan email yang sama untuk kedua kalinya.
