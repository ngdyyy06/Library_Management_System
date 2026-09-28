# Library Management System

A web-based Library Management System designed to support library staff and administrators in managing books, book copies, readers, borrowing, returning, library cards, payments, and user accounts.

## 1. Introduction

The Library Management System is developed to digitalize and simplify common library management operations.

The system provides separate access permissions for **Admin** and **Staff** users. Administrators can manage the system and access management information, while Staff users focus on day-to-day library operations.

The system consists of a **Spring Boot backend**, **Next.js frontend**, and **MySQL database**.

---

## 2. Features

### Authentication & Authorization

* User login
* User registration
* JWT-based authentication
* Role-based authorization
* Password encryption using BCrypt
* Separate permissions for Admin and Staff

### User Management

* Create users
* View users
* Update users
* Manage user roles
* Activate/deactivate user accounts
* Manage account status

### Reader Management

* Create readers
* View reader information
* Update reader information
* Search and manage readers
* Manage reader status
* Validate duplicate reader codes

### Book Management

* Manage books
* Manage book information
* Manage book copies
* Track book copy status
* Manage book inventory

### Book Shelf Management

* Manage library shelves
* Assign books to shelves
* Manage shelf categories
* Check shelf capacity

### Borrowing Management

* Create borrowing records
* Manage borrowed books
* Track borrowing status
* Renew borrowing periods
* Return books
* Handle partially returned borrowings
* Calculate overdue fines

### Library Card Management

* Create and manage library cards
* Manage library card status
* Track card information
* Manage card-related payments

### Payment Management

* Record library card payments
* Manage payment information
* Track payment history
* Calculate applicable fees

### Revenue Management

* View library revenue information
* View revenue generated from applicable payments

Revenue information is available to authorized Admin users and is not displayed to Staff users.

---

## 3. User Roles

The system currently provides two main roles:

| Role    | Description                                                                                   |
| ------- | --------------------------------------------------------------------------------------------- |
| `ADMIN` | Manages the system and has access to administrative functions, including revenue information. |
| `STAFF` | Handles daily library operations but does not have access to revenue information.             |

Access to APIs and frontend pages is controlled based on the authenticated user's role.

---

## 4. Business Rules

The system implements several important library business rules:

* A reader can borrow a maximum of **5 book copies** at a time.
* Only available book copies can be borrowed.
* When a book copy is returned, its status is changed back to `AVAILABLE`.
* The available quantity of a book is updated when copies are borrowed or returned.
* Borrowing records can be renewed.
* A borrowing can be fully or partially returned.
* Overdue books generate a fine based on the number of overdue days.
* The overdue fine is calculated at **5,000 VND per overdue day**.
* Reader codes must be unique.
* User roles determine access to protected resources.
* Staff users cannot access revenue information.

---

## 5. Technologies

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* Maven
* BCrypt Password Encoder

### Frontend

* Next.js
* React
* TypeScript
* CSS

### Database

* MySQL

### Development & Testing Tools

* IntelliJ IDEA
* Visual Studio Code
* MySQL / XAMPP
* Postman
* Git
* GitHub

---

## 6. System Architecture

The application follows a client-server architecture.

```text
┌─────────────────────────────┐
│          Frontend           │
│       Next.js / React       │
└──────────────┬──────────────┘
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│          Backend            │
│       Spring Boot           │
│                             │
│ Controller                  │
│ Service                     │
│ Repository                  │
│ Security / JWT              │
│ Exception Handling          │
└──────────────┬──────────────┘
               │ JPA / Hibernate
               ▼
┌─────────────────────────────┐
│          Database           │
│           MySQL             │
└─────────────────────────────┘
```

---

## 7. Project Structure

### Backend

The backend is organized following a layered architecture:

```text
src/
└── main/
    ├── java/
    │   └── com/
    │       └── library/
    │           └── management/
    │               ├── controller/
    │               ├── dto/
    │               ├── entity/
    │               ├── exception/
    │               ├── repository/
    │               ├── security/
    │               ├── service/
    │               └── ...
    │
    └── resources/
        └── application.properties
```

### Main packages

| Package      | Responsibility                                                        |
| ------------ | --------------------------------------------------------------------- |
| `controller` | Handles HTTP requests and exposes REST APIs.                          |
| `service`    | Contains application and business logic.                              |
| `repository` | Provides database access using Spring Data JPA.                       |
| `entity`     | Defines database entities and their relationships.                    |
| `dto`        | Defines objects used to transfer data between the client and server.  |
| `security`   | Handles authentication, JWT processing, and authorization.            |
| `exception`  | Handles application errors and provides standardized error responses. |

---

## 8. Main Entities

The system contains several entities representing the main library operations:

* User
* Reader
* Book
* Book Copy
* Book Shelf
* Borrowing
* Library Card
* Library Card Payment

These entities are connected through relationships that represent the actual operations of a library.

---

## 9. Database

The project uses **MySQL** as the database management system.

Database name:

```text
library_management
```

The database stores information related to:

* Users
* Readers
* Books
* Book copies
* Book shelves
* Borrowings
* Library cards
* Payments

---

## 10. Backend Configuration

Database connection settings are configured in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_management
spring.datasource.username=root
spring.datasource.password=your_password
```

Replace the database username and password with the credentials configured on the local development environment.

---

## 11. Requirements

Before running the project, install the following:

* JDK 21 or later
* Maven
* MySQL
* Node.js
* npm
* Git

Recommended development tools:

* IntelliJ IDEA
* Visual Studio Code
* Postman
* XAMPP

---

## 12. Installation

### Step 1: Clone the repository

```bash
git clone <repository-url>
```

### Step 2: Open the backend project

Open the backend project using IntelliJ IDEA or another Java IDE.

### Step 3: Create the database

Create a MySQL database:

```sql
CREATE DATABASE library_management;
```

### Step 4: Configure the database

Update the database connection information in:

```text
application.properties
```

### Step 5: Install frontend dependencies

Open the frontend project directory and run:

```bash
npm install
```

---

## 13. Running the Backend

From the backend project directory, run:

```bash
mvn spring-boot:run
```

Alternatively, run the main Spring Boot application from IntelliJ IDEA.

The backend API is available at:

```text
http://localhost:8080
```

---

## 14. Running the Frontend

From the frontend project directory:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

The frontend application is available at:

```text
http://localhost:3000
```

---

## 15. API Overview

The backend provides REST APIs for the main system modules.

### Authentication

```text
POST /api/auth/login
POST /api/auth/register
```

### Users

```text
/api/users/**
```

User APIs are protected and require appropriate authorization.

### Readers

```text
GET    /api/readers
POST   /api/readers
GET    /api/readers/{id}
PUT    /api/readers/{id}
```

### Borrowings

The borrowing module provides APIs for:

* Creating borrowings
* Viewing borrowing records
* Renewing borrowings
* Returning books
* Managing borrowing status

Example renewal endpoint:

```text
PATCH /api/borrowings/{id}/renew
```

---

## 16. Authentication & Security

The application uses **Spring Security** for authentication and authorization.

JWT is used to authenticate API requests after login.

The authentication flow is:

```text
User
  │
  ▼
Login
  │
  ▼
Spring Security
  │
  ▼
Validate username/password
  │
  ▼
Generate JWT
  │
  ▼
Client stores JWT
  │
  ▼
JWT sent with subsequent requests
  │
  ▼
JWT Filter validates token
  │
  ▼
Authorize request based on role
```

Passwords are encrypted using `BCryptPasswordEncoder`.

Protected endpoints require an authenticated user and may require a specific role.

---

## 17. Error Handling

The backend provides centralized exception handling using Spring's `@RestControllerAdvice`.

Validation errors and application exceptions are returned using a standardized error response.

Example structure:

```json
{
    "status": 400,
    "message": "Reader code already exists"
}
```

This allows the frontend to display meaningful error messages to users.

---

## 18. Testing

The REST APIs can be tested using **Postman**.

Testing covers major system operations such as:

* Login
* User management
* Reader management
* Book management
* Book copy management
* Borrowing
* Book renewal
* Returning books
* Library card management
* Payment management
* Authorization

Example reader API test:

```text
POST /api/readers
```

The system validates business rules such as duplicate reader codes and returns an appropriate HTTP status and error message when validation fails.

---

## 19. Frontend

The frontend provides a web interface for library administrators and staff.

Main interface areas include:

* Login
* Dashboard
* User Management
* Reader Management
* Book Management
* Book Shelf Management
* Borrowing Management
* Library Card Management
* Payment Management

The interface displays different functions according to the authenticated user's role.

For example, revenue information is available to Admin users but is not displayed to Staff users.

---

## 20. Project Workflow

A typical library borrowing workflow is:

```text
Reader
  │
  ▼
Select Book
  │
  ▼
Check Book Availability
  │
  ▼
Create Borrowing
  │
  ▼
Book Copy → BORROWED
  │
  ▼
Reader keeps the book
  │
  ├── Renew
  │
  └── Return
        │
        ▼
   Book Copy → AVAILABLE
        │
        ▼
Calculate overdue fine if applicable
```

---

## 21. Development Purpose

This project is developed for educational purposes to apply knowledge of:

* Java programming
* Spring Boot
* REST API development
* Spring Security
* JWT authentication
* Database design
* MySQL
* JPA / Hibernate
* Frontend development
* Role-based authorization
* Software testing
* Git and GitHub

---

## 22. License

This project is developed for educational purposes.
