# Learn Vibe Coding - Backend API

[English](README_EN.md) | [Bahasa Indonesia](README.md)

A simple backend application for user management (Registration, Login, User Profile, and Logout) using **ElysiaJS**, **Drizzle ORM**, and the **Bun** runtime. This document is intended to help junior developers and AI agents understand the structure, technology stack, and how to run this application.

---

## 🚀 Technology Stack & Libraries

This application is built using a modern stack for development speed and performance:
1.  **Runtime**: [Bun](https://bun.sh/) - A fast, all-in-one JavaScript & TypeScript runtime with a built-in compiler, package manager, and test runner.
2.  **Web Framework**: [ElysiaJS](https://elysiajs.com/) - A high-performance web framework for Bun with strict data validation support.
3.  **ORM (Object-Relational Mapping)**: [Drizzle ORM](https://orm.drizzle.team/) - A lightweight and fast TypeScript ORM for interacting with databases.
4.  **Database**: [MySQL / MariaDB](https://www.mysql.com/) - A relational database (usually run locally using **XAMPP**).

### Additional Libraries
*   `mysql2`: MySQL driver for database connectivity.
*   `drizzle-kit`: CLI tool for Drizzle to synchronize database schemas.

---

## 📂 Folder Structure & Code Architecture

This application follows the Separation of Concerns pattern. The main source code is located in the `src/` directory.

```text
├── src/
│   ├── db/
│   │   ├── index.ts          # Database connection setup to MySQL/MariaDB
│   │   └── schema.ts         # Database table definitions (Drizzle schema)
│   ├── routes/
│   │   └── users-routes.ts   # Endpoint definitions (Elysia routing)
│   ├── services/
│   │   └── users-services.ts # Business logic & database operations
│   └── index.ts              # Application entry point
├── tests/
│   ├── setup.ts              # Global teardown to clean DB before unit tests run
│   └── users.test.ts         # Unit tests for all user endpoints
├── bunfig.toml               # Bun configuration file (used to preload test setup)
├── drizzle.config.ts         # Drizzle ORM config for Drizzle-Kit
├── package.json              # Project dependencies and npm scripts
└── .env                      # Environment Variables (DB credentials)
```

### File Naming Convention
*   **Routing**: Route files are located in `src/routes/` and named `[feature]-routes.ts` (e.g., `users-routes.ts`).
*   **Business Logic**: Services are located in `src/services/` and named `[feature]-services.ts` (e.g., `users-services.ts`).

---

## 🗄️ Database Schema

The database consists of two tables:

### 1. `users` Table
Stores registered user accounts.
*   `id` (INT): Primary Key, Auto Increment.
*   `name` (VARCHAR 255): Name of the user. Cannot be empty.
*   `email` (VARCHAR 255): User's email. Must be unique and cannot be empty.
*   `password` (VARCHAR 255): Encrypted user password (hashed using bcrypt). Cannot be empty.
*   `created_at` (TIMESTAMP): Time of registration (auto-generated).

### 2. `sessions` Table
Manages active authentication tokens for logged-in users.
*   `id` (INT): Primary Key, Auto Increment.
*   `token` (VARCHAR 255): Unique authentication token (UUID format). Cannot be empty.
*   `user_id` (INT): Foreign Key referencing `id` in the `users` table.
*   `created_at` (TIMESTAMP): Time of session creation.

---

## 🔌 API Endpoint Documentation

All routes are prefixed with `/api`.

### 1. Register a New Account
Registers a new user account.
*   **Endpoint**: `POST /api/users`
*   **Request Body (JSON)**:
    ```json
    {
      "name": "User Name (max 255 chars)",
      "email": "user@example.com",
      "password": "secretPassword"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "data": "OK"
    }
    ```
*   **Error Response**:
    *   `400 Bad Request`: Email already registered.
    *   `422 Unprocessable Content`: Validation failed (e.g., name > 255 characters).

### 2. Login User
Authenticates user and returns a session token.
*   **Endpoint**: `POST /api/users/login`
*   **Request Body (JSON)**:
    ```json
    {
      "name": "User Name",
      "email": "user@example.com",
      "password": "secretPassword"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "data": {
        "token": "e44d5678-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
    ```
*   **Error Response**:
    *   `401 Unauthorized`: Email or password is incorrect.
    *   `422 Unprocessable Content`: Validation failed.

### 3. Get Current User Profile
Retrieves profile data of the authenticated user.
*   **Endpoint**: `GET /api/users/current`
*   **Headers**:
    *   `Authorization: Bearer <auth_token>`
*   **Success Response (200 OK)**:
    ```json
    {
      "data": {
        "id": 1,
        "name": "User Name",
        "email": "user@example.com",
        "created_at": "2026-07-16T12:00:00Z"
      }
    }
    ```
*   **Error Response**:
    *   `401 Unauthorized`: Token is missing or invalid.

### 4. Logout User
Ends the user session and deletes the token from database.
*   **Endpoint**: `DELETE /api/users/logout`
*   **Headers**:
    *   `Authorization: Bearer <auth_token>`
*   **Success Response (200 OK)**:
    ```json
    {
      "data": "OK"
    }
    ```
*   **Error Response**:
    *   `401 Unauthorized`: Token is invalid or the session has already expired.

---

## 🛠️ Project Setup Instructions

Follow these steps to set up the project on your local machine:

### 1. Prerequisites
*   Make sure **Bun** is installed. If not, open your Terminal or PowerShell and run:
    ```bash
    powershell -c "irm bun.sh/install.ps1 | iex"
    ```
*   Make sure your **MySQL / MariaDB** server is running (e.g., click *Start* next to MySQL in the XAMPP Control Panel).

### 2. Install Dependencies
Run this in the root directory:
```bash
bun install
```

### 3. Configure Environment Variables
Create a file named `.env` in the project root directory and set the variables:
```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=belajar_vibe_coding
```
*(Note: Leave `DB_PASSWORD` blank if you are using XAMPP default settings).*

### 4. Create Database & Push Schema
*   Open MySQL CLI or phpMyAdmin and create a new database named `belajar_vibe_coding`:
    ```sql
    CREATE DATABASE belajar_vibe_coding;
    ```
*   Sync the schema to your database:
    ```bash
    bun run drizzle-kit push
    ```

---

## 🏃 Running the Application

To start the server in watch/development mode (auto-reloads when code changes):
```bash
bun run dev
```
The server will be available at: `http://localhost:3000`

---

## 🧪 Running Unit Tests

Automated testing is powered by the Bun Test runner. The test setup deletes all entries in the `users` and `sessions` tables before each test case to guarantee consistent test results.

To run the test suite:
```bash
bun test
```
This runs all test files in the `tests/` directory and outputs a detailed pass/fail report in the terminal.
