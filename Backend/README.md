# Coworking Space Manager - Backend API

This is the backend API for the Coworking Space Manager application, a system for booking and managing office resources like desks, rooms, and offices in real-time. It is built with .NET 9 and follows a clean, layered architecture.

## Features

- **Authentication**: Secure user authentication using JWT (Access Tokens + Refresh Tokens).
- **Role-Based Access Control (RBAC)**: Pre-configured roles (Admin, Manager, User) to restrict access to certain operations.
- **Resource Management**: Full CRUD (Create, Read, Update, Delete) operations for managing resources, restricted to Admins.
- **Advanced Booking System**: Create, view, and cancel bookings with server-side validation to prevent scheduling conflicts.
- **Resource Filtering**: A flexible endpoint to filter resources by type, status, capacity, and price.
- **User-Specific Data**: A dedicated `/api/bookings/my` endpoint for users to view their own booking history.
- **Database Seeding**: The database is automatically seeded with initial data (roles, users, resources) on startup.
- **Containerized Environment**: Full Docker and Docker Compose support for a consistent and easy-to-set-up development environment.

## Technologies Used

- **Framework**: .NET 9 / ASP.NET Core
- **Database**: MS SQL Server & Entity Framework Core
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt.Net-Next
- **Containerization**: Docker / Docker Compose

---

## Getting Started

You can get the project running in two ways: using Docker (recommended for ease of use) or setting it up locally.

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for the Docker approach)
- A code editor like VS Code or Visual Studio

---

### 1. Running with Docker (Recommended)

This is the simplest way to get started.

1.  **Clone the repository.**

2.  **Configure the Database Password**:
    Open the `docker-compose.yml` file and change the default password for the `SA_PASSWORD` and the backend's connection string.
    ```yaml
    services:
      db:
        environment:
          - SA_PASSWORD=Password123! # <-- CHANGE THIS
      backend:
        environment:
          - ConnectionStrings__DefaultConnection=Server=db;...;Password=yourStrong(!)Password123; # <-- AND CHANGE THIS
    ```

3.  **Build and Run the Containers**:
    Open a terminal in the project's root directory (`/Backend`) and run:
    ```sh
    docker-compose up --build
    ```
    This command will build the backend image, start the SQL Server container, and run the application. The database will be created, migrated, and seeded automatically.

4.  **Access the API**:
    The API will be available at `http://localhost:8080`. The Swagger UI for testing endpoints can be accessed at `http://localhost:8080/swagger`.

---

### 2. Running Locally (Without Docker)

1.  **Clone the repository.**

2.  **Configure `appsettings.Development.json`**:
    Create an `appsettings.Development.json` file in the project root and add your database connection string and a JWT secret.
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=TnaiDb;User Id=sa;Password=yourStrong(!)Password123;Trusted_Connection=False;Encrypt=False;"
      },
      "JWT_SECRET": "a_very_long_and_secure_secret_key_that_is_at_least_32_characters_long"
    }
    ```

3.  **Install Dependencies**:
    Open a terminal and run `dotnet restore` to install the required NuGet packages.

4.  **Apply Database Migrations**:
    The application is configured to apply migrations on startup. Alternatively, you can run them manually:
    ```sh
    dotnet ef database update
    ```

5.  **Run the Application**:
    ```sh
    dotnet run
    ```
    The API will be running on the ports specified in `Properties/launchSettings.json` (e.g., `https://localhost:7123`).

---

## API Endpoints

All endpoints (except `login` and `register`) require an `Authorization: Bearer <TOKEN>` header.

### Auth Controller (`/api/auth`)

- `POST /register`: Register a new user.
- `POST /login`: Authenticate a user and receive an access token and refresh token.
- `POST /refresh`: Obtain a new access/refresh token pair using a valid refresh token.

### Resources Controller (`/api/resources`)

- `GET /`: Get a list of all resources.
  - **Query Parameters for Filtering**:
    - `type` (e.g., `Desk`, `Room`)
    - `status` (e.g., `Available`)
    - `minCapacity` (integer)
    - `maxPrice` (decimal)
- `GET /{id}`: Get a single resource by its ID.
- `POST /` (**Admin only**): Create a new resource.
- `PUT /{id}` (**Admin only**): Update an existing resource.
- `DELETE /{id}` (**Admin only**): Delete a resource.

### Bookings Controller (`/api/bookings`)

- `GET /my`: Get a list of bookings for the currently authenticated user.
- `GET /{id}`: Get a single booking by its ID.
- `POST /`: Create a new booking.
- `DELETE /{id}`: Cancel a booking.
- `PATCH /{id}/status` (**Admin/Manager only**): Update the status of a booking.

### Users Controller (`/api/users`)

- `GET /` (**Admin only**): Get a list of all users.
- `GET /{id}` (**Admin only**): Get a single user by ID.

---

## Project Structure

- **/Controllers**: API endpoints that handle HTTP requests.
- **/Services**: Contains the business logic of the application.
- **/Data**: `AppDbContext` (Entity Framework Core) and database seeder.
- **/Models**: C# classes representing the database tables.
- **/DTOs**: Data Transfer Objects used for clean API communication.
- **/Helpers**: Enums and other utility classes.
- **Dockerfile**: Instructions for building the backend Docker image.
- **docker-compose.yml**: Defines the services, networks, and volumes for the containerized environment.
```