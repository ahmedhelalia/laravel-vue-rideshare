# RideShareApp

A full-stack ride-sharing application built with a Laravel backend API and a Vue.js single-page application (SPA) frontend. This project simulates the core functionalities of a modern ride-hailing service, including user and driver management, trip creation, and real-time location updates.

## Features

*   **User & Driver Authentication:** Secure login and registration for both passengers and drivers.
*   **Trip Management:** Users can request trips, and drivers can accept or decline them.
*   **Real-time Event Handling:** The application uses events to track the lifecycle of a trip:
    *   `TripCreated`
    *   `TripAccepted`
    *   `TripStarted`
    *   `TripLocationUpdated`
    *   `TripEnded`
*   **API-driven Backend:** A robust API built with Laravel to handle all business logic.
*   **Reactive Frontend:** A responsive and interactive user interface built with Vue.js.

## Technology Stack

*   **Backend:** PHP / Laravel
*   **Frontend:** JavaScript / Vue.js 3
*   **Database:** SQLite
*   **Real-time Communication:** Laravel Reverb
*   **Build Tools:** Vite, Composer, NPM

## Project Setup

### Prerequisites

*   PHP >= 8.2
*   Composer
*   Node.js & NPM
*   A local web server environment (e.g., Laragon, XAMPP, or Laravel Herd)

### Backend Setup (Laravel)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Set up your environment file:**
    ```bash
    cp .env.example .env
    ```

4.  **Generate an application key:**
    ```bash
    php artisan key:generate
    ```

5.  **Create the database file:**
    ```bash
    touch database/database.sqlite
    ```

6.  **Run database migrations:**
    ```bash
    php artisan migrate
    ```

7.  **Start the development server:**
    ```bash
    php artisan serve
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup (Vue.js)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running on the address shown in your terminal (usually `http://localhost:5173`).

---

This `README.md` provides a solid foundation for your project. You can enhance it further by adding screenshots, API documentation links, or a "To-Do" section for future features.
