# Task: Pembuatan Unit Test untuk Semua Endpoint API

Dokumen ini berisi panduan untuk mengimplementasikan unit test pada seluruh API yang tersedia di project ini. Silakan implementasikan test menggunakan `bun test` dan letakkan semua file test di dalam folder `tests/`.

## Persyaratan Umum (Setup & Teardown)

Agar hasil pengujian selalu konsisten dan tidak dipengaruhi oleh sisa data dari pengujian sebelumnya:
- **Wajib melakukan pembersihan data** (menghapus isi tabel `users` dan `sessions`) **sebelum setiap skenario tes dijalankan**.

## Skenario Pengujian per API

Berikut adalah daftar endpoint API yang perlu dites, beserta skenario utama yang harus dipastikan kelancarannya. Silakan implementasikan detail teknis dan *assertion*-nya sesuai dengan kerangka kerja `bun test` dan `Elysia`.

### 1. Registrasi User (`POST /api/users`)
- **Skenario Sukses**: Mengirimkan data registrasi yang valid (name, email, password) harus berhasil (HTTP 200 OK).
- **Skenario Gagal (Duplikasi)**: Mengirimkan email yang sudah terdaftar sebelumnya harus gagal (HTTP 400 Bad Request).
- **Skenario Gagal (Validasi Panjang Karakter)**: Mengirimkan field `name` atau `email` dengan panjang lebih dari 255 karakter harus digagalkan oleh sistem validasi payload (HTTP 422 Unprocessable Content).

### 2. Login User (`POST /api/users/login`)
- **Skenario Sukses**: Mengirimkan data kredensial login (email & password) yang benar harus berhasil (HTTP 200 OK) dan mengembalikan respons yang sesuai.
- **Skenario Gagal (Kredensial Salah)**: Mengirimkan password yang salah atau email yang tidak terdaftar harus ditolak (HTTP 401 Unauthorized).
- **Skenario Gagal (Validasi Panjang Karakter)**: Mengirimkan payload yang melebihi batas 255 karakter harus gagal di tingkat validasi (HTTP 422 Unprocessable Content).

### 3. Get Current User (`GET /api/users/current`)
- **Skenario Sukses**: Mengirimkan request dengan Header `Authorization: Bearer <token>` yang valid (token aktif di tabel sesi) harus berhasil mengambil data profil user (HTTP 200 OK).
- **Skenario Gagal (Tanpa Token)**: Mengirimkan request tanpa menyertakan Header Authorization sama sekali harus ditolak (HTTP 401 Unauthorized).
- **Skenario Gagal (Token Tidak Valid)**: Mengirimkan request dengan Bearer token yang salah, kadaluarsa, atau sudah tidak ada di database harus ditolak (HTTP 401 Unauthorized).

### 4. Logout User (`DELETE /api/users/logout`)
- **Skenario Sukses**: Mengirimkan request logout dengan Header `Authorization: Bearer <token>` yang valid harus berhasil menghapus sesi dari database (HTTP 200 OK).
- **Skenario Gagal (Tanpa Token)**: Mencoba logout tanpa memberikan Header Authorization harus ditolak (HTTP 401 Unauthorized).
- **Skenario Gagal (Token Tidak Valid/Sudah Logout)**: Mencoba logout menggunakan token yang salah atau token yang sudah dihapus sebelumnya harus ditolak (HTTP 401 Unauthorized).
