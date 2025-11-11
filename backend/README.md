# RideShareApp Backend

This is the backend service for the RideShareApp, a real-time ride-sharing application built with the Laravel framework.

## Features

*   **User Authentication:** Secure login and personal access token generation.
*   **Trip Management:**
    *   Create and broadcast new trip requests.
    *   Allow drivers to accept trips.
    *   Start and end trips.
*   **Event-Driven Architecture:** Utilizes Laravel Events for decoupled and scalable components.

## Technology Stack

*   **Backend:** PHP 8.2+, Laravel 11
*   **Real-time Communication:** Laravel Reverb (WebSocket Server)
*   **Database:** Compatible with MySQL, PostgreSQL, SQLite
*   **Dependency Management:** Composer (PHP), NPM (JavaScript)
*   **Testing:** PHPUnit

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
*   PHP (>= 8.2)
*   Composer
*   Node.js & NPM
*   A local database server (e.g., MySQL, PostgreSQL)

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd RideShareApp/backend
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment file:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Generate the application key:
        ```bash
        php artisan key:generate
        ```
    *   Open the `.env` file and configure your database connection details (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

5.  **Run database migrations:**
    ```bash
    php artisan migrate
    ```

6.  **Start the servers:**
    *   **Start the Laravel Reverb WebSocket server:**
        ```bash
        php artisan reverb:start
        ```
    *   **Start the development web server (in a new terminal):**
        ```bash
        php artisan serve
        ```
    *   **Start the Vite development server for frontend assets (in a new terminal):**
        ```bash
        npm run dev
        ```

## Running Tests

To run the automated test suite, execute the following command:

```bash
php artisan test
```
