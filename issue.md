# Issue: Implementasi Dokumentasi API Menggunakan Swagger di ElysiaJS

## 🎯 Deskripsi Masalah & Tujuan
Saat ini, proyek backend ini belum memiliki dokumentasi API interaktif. Pengembang lain (Frontend Engineer atau pengembang API lain) kesulitan untuk mencoba dan memahami rute-rute API yang ada karena harus membaca kode sumber secara manual.

Tujuan dari tugas ini adalah menambahkan fitur **Swagger UI** (OpenAPI) agar dokumentasi API terbuat secara otomatis dan dapat diakses dengan mudah melalui web browser di alamat `http://localhost:3000/swagger`.

---

## 🛠️ Langkah-Langkah Implementasi

Berikut adalah tahapan detail untuk mengimplementasikan fitur Swagger. Ikuti langkah demi langkah dengan teliti:

### Langkah 1: Instalasi Library Swagger untuk Elysia
Kita akan menggunakan plugin resmi dari ElysiaJS yaitu `@elysiajs/swagger`.
1. Buka terminal Anda pada direktori root proyek.
2. Jalankan perintah instalasi berikut menggunakan Bun:
   ```bash
   bun add @elysiajs/swagger
   ```

---

### Langkah 2: Registrasi Plugin Swagger di Aplikasi Utama
Kita perlu mengaktifkan plugin ini di berkas utama aplikasi agar rute `/swagger` bisa diakses.
1. Buka berkas `src/index.ts`.
2. Impor plugin swagger di bagian paling atas berkas:
   ```typescript
   import { swagger } from '@elysiajs/swagger';
   ```
3. Pasang plugin `.use(swagger(...))` pada inisialisasi aplikasi.
4. **Penting untuk Keamanan (Autentikasi Bearer)**: Agar rute-rute yang membutuhkan token login (seperti Get Current User dan Logout) dapat mengirimkan token dengan benar di halaman Swagger, kita perlu menambahkan konfigurasi skema keamanan (*Security Schemes*).

Berikut adalah contoh modifikasi inisialisasi aplikasi di `src/index.ts`:
```typescript
export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Belajar Vibe Coding API',
          version: '1.0.0',
          description: 'Dokumentasi interaktif untuk Backend API Manajemen Pengguna'
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'UUID' // Token kita bertipe UUID
            }
          }
        }
      }
    })
  )
  .get("/", () => "Hello Elysia")
  .use(usersRoutes)
  // ... rute lainnya
```

---

### Langkah 3: Menambahkan Dokumentasi Detail & Contoh Response pada Endpoint
ElysiaJS membaca skema rute untuk diubah menjadi dokumentasi Swagger. Kita bisa menambahkan informasi detail menggunakan properti `detail` dan mendefinisikan contoh response body menggunakan properti `response` di parameter pengujian skema Elysia.

Buka file `src/routes/users-routes.ts`, lalu tambahkan properti `detail` dan `response` di setiap endpoint:

#### A. Registrasi Pengguna (`POST /users`)
Tambahkan deskripsi singkat, tag kelompok rute, dan contoh respon:
```typescript
  .post("/users", async ({ body, set }) => {
    // ... logic registrasi
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Daftarkan akun pengguna baru',
      description: 'Menerima masukan name, email, dan password untuk membuat akun baru.'
    },
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String({ default: "OK" })
      }, { description: "Registrasi Berhasil" }),
      400: t.Object({
        error: t.String({ default: "email sudah terdaftar" })
      }, { description: "Email sudah digunakan" }),
      422: t.Object({
        error: t.String()
      }, { description: "Validasi Gagal (misal nama > 255 karakter)" })
    }
  })
```

#### B. Login Pengguna (`POST /users/login`)
```typescript
  .post("/users/login", async ({ body, set }) => {
    // ... logic login
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Masuk log (Login)',
      description: 'Verifikasi kredensial pengguna dan mengembalikan status berhasil.'
    },
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String({ default: "Berhasil" })
      }, { description: "Login Berhasil" }),
      401: t.Object({
        error: t.String({ default: "email atau password salah" })
      }, { description: "Kredensial salah" }),
      422: t.Object({
        error: t.String()
      }, { description: "Validasi Gagal" })
    }
  })
```

#### C. Get Current User Profil (`GET /users/current`)
Rute ini membutuhkan token Bearer. Kita wajib menambahkan properti `security` agar tombol "Authorize" muncul di Swagger UI untuk rute ini, beserta contoh profil data di respon 200.
```typescript
  .get("/users/current", async ({ headers, set }) => {
    // ... logic ambil profile
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Dapatkan profil pengguna saat ini',
      description: 'Mengambil data profil pengguna berdasarkan token aktif di header Authorization.',
      security: [{ BearerAuth: [] }] // Menghubungkan rute ini dengan keamanan Bearer
    },
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Numeric({ default: 1 }),
          name: t.String({ default: "Nama User" }),
          email: t.String({ default: "user@example.com" }),
          created_at: t.Union([t.Date(), t.Null()])
        })
      }, { description: "Data Profil Berhasil Diambil" }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" })
      }, { description: "Token Sesi Tidak Valid atau Kedaluwarsa" })
    }
  })
```

#### D. Logout Pengguna (`DELETE /users/logout`)
Rute ini juga membutuhkan token Bearer untuk menghapus sesi.
```typescript
  .delete("/users/logout", async ({ headers, set }) => {
    // ... logic logout
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Keluar log (Logout)',
      description: 'Menghapus sesi aktif pengguna berdasarkan token yang dikirimkan.',
      security: [{ BearerAuth: [] }] // Menghubungkan rute ini dengan keamanan Bearer
    },
    response: {
      200: t.Object({
        data: t.String({ default: "OK" })
      }, { description: "Logout Berhasil" }),
      401: t.Object({
        error: t.String({ default: "Unauthorized" })
      }, { description: "Token Sesi Tidak Valid" })
    }
  })
```

---

## 🧪 Cara Melakukan Verifikasi & Pengujian

Setelah semua kode di atas ditulis:
1. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   bun run dev
   ```
2. Buka web browser Anda, lalu kunjungi alamat:
   ```text
   http://localhost:3000/swagger
   ```
3. **Uji Coba Penggunaan**:
   * Halaman web Swagger UI akan menampilkan daftar rute yang telah kita buat.
   * Coba jalankan rute **Registrasi** dengan menekan tombol **"Try it out"**, isi datanya, lalu klik **"Execute"**. Pastikan berhasil (200 OK).
   * Coba lakukan **Login** untuk mendapatkan token sesi. Copy token sesi tersebut dari hasil response.
   * Klik tombol **"Authorize"** (ikon gembok) di kanan atas halaman Swagger, masukkan token sesi yang di-copy ke kolom yang disediakan, lalu klik **"Authorize"**.
   * Coba jalankan rute **Get Current User** atau **Logout** untuk memastikan autentikasi token Bearer di Swagger bekerja dengan lancar.
