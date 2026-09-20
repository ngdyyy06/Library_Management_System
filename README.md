# Library Management System

A backend REST API application for managing library operations, including books, book copies, readers, borrowing, returning, renewing, reservations, fines, and user access control.

## 1. Project Overview

**Library Management System** is a Java-based backend application designed to manage the core operations of a library.

The system is developed using **Spring Boot** and provides RESTful APIs for managing library resources and handling business processes.

The project focuses on implementing real-world library business logic rather than only basic CRUD operations.

### Main objectives

* Manage books and physical book copies
* Manage library readers
* Manage borrowing and returning processes
* Support book renewal
* Calculate overdue fines
* Manage book reservations
* Authenticate users
* Authorize users based on roles
* Validate input data
* Handle exceptions consistently
* Provide RESTful APIs for client applications

---

# 2. Features

The system consists of the following main functional modules:

### 1. Book Management

Manage information about books available in the library.

* Create a book
* View all books
* View book details
* Update book information
* Delete a book
* Search and lookup books
* Manage ISBN
* Track book quantity

### 2. Book Copy Management

A `Book` represents a book title, while a `BookCopy` represents an individual physical copy.

Example:

```text
Clean Code
│
├── COPY-001 → AVAILABLE
├── COPY-002 → BORROWED
├── COPY-003 → LOST
└── COPY-004 → AVAILABLE
```

Functions:

* Manage individual book copies
* View copies belonging to a book
* Track copy status
* Update copy status
* Track available quantity
* Handle lost copies

### 3. Reader Management

Manage readers who use the library.

Functions:

* Create reader
* View all readers
* View reader details
* Update reader information
* Manage reader status
* Check reader borrowing information

Reader information includes:

* Reader code
* Full name
* Email
* Phone
* Address
* Date of birth
* Status

### 4. Borrowing Management

Manage the process of borrowing books.

Functions:

* Create borrowing records
* Check book availability
* Check reader eligibility
* Select available book copies
* Set due date
* Update book copy status
* Enforce borrowing limits

A reader can borrow a maximum of:

```text
5 book copies
```

### 5. Returning Management

Manage the process of returning books.

Functions:

* Return borrowed books
* Record return date
* Update borrowing status
* Update book copy status
* Update available quantity
* Detect overdue books
* Calculate fines

Borrowing statuses include:

```text
BORROWED
PARTIALLY_RETURNED
RETURNED
```

### 6. Fine Management

The system calculates fines when books are returned after the due date.

Fine calculation:

```text
Fine = Overdue Days × 5,000 VND
```

Example:

```text
Overdue Days = 3

Fine = 3 × 5,000
     = 15,000 VND
```

### 7. Book Renewal

Readers can renew active borrowing records.

Example:

```text
Original Due Date: 20/09/2026

Renewal:
+4 days

New Due Date: 24/09/2026
```

The system supports repeated renewals according to the defined business rules.

Endpoint example:

```http
PATCH /api/borrowings/{id}/renew
```

### 8. Book Reservation

Readers can reserve books that are currently unavailable.

Example:

```text
Clean Code
│
├── COPY-001 → BORROWED
├── COPY-002 → BORROWED
└── COPY-003 → BORROWED

Reservation Queue:
1. Reader A
2. Reader B
3. Reader C
```

Functions:

* Create reservation
* View reservations
* Cancel reservation
* Manage reservation status
* Process reservations when books become available

### 9. Book Search & Lookup

The system provides book lookup capabilities.

Users can search for books based on available book information such as:

* Title
* ISBN
* Author
* Category
* Availability

The system can also display the current status and available quantity of book copies.

### 10. Authentication & Authorization

The system provides authentication and role-based authorization.

User information includes:

* Username
* Password
* Full name
* Email
* Role
* Status

The system uses role-based access control to restrict administrative operations.

Example:

```text
ADMIN
│
├── Manage Users
├── Manage Books
├── Manage Book Copies
├── Manage Readers
└── Manage Library Operations
```

---

# 3. Business Rules

The system implements several important business rules.

## Maximum Borrowing Limit

A reader can borrow a maximum of:

```text
5 book copies
```

If the reader has already reached the limit, another borrowing request is rejected.

## Book Copy Availability

A book can only be borrowed when an available physical copy exists.

```text
Book
 ↓
BookCopy
 ↓
AVAILABLE
 ↓
Borrow
```

After borrowing:

```text
AVAILABLE
    ↓
BORROWED
```

After returning:

```text
BORROWED
    ↓
AVAILABLE
```

## Lost Book

A lost book copy is not considered available:

```text
LOST ≠ AVAILABLE
```

Therefore, it cannot be selected for borrowing.

## Partial Return

A borrowing record may contain multiple book copies.

If only some copies are returned:

```text
Borrowing
├── Copy 1 → RETURNED
├── Copy 2 → RETURNED
└── Copy 3 → BORROWED
```

The borrowing status becomes:

```text
PARTIALLY_RETURNED
```

When all copies are returned:

```text
RETURNED
```

## Fine Calculation

For overdue books:

```text
Fine = Overdue Days × 5,000 VND
```

The system calculates the overdue period based on the due date and actual return date.

---

# 4. Technology Stack

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| Java 21         | Programming language            |
| Spring Boot     | Backend framework               |
| Spring Web      | REST API development            |
| Spring Data JPA | Data access layer               |
| Hibernate       | ORM                             |
| MySQL           | Relational database             |
| Maven           | Build and dependency management |
| Postman         | API testing                     |
| IntelliJ IDEA   | Development environment         |

### Template Engine

```text
None
```

The application is implemented as a **REST API Backend** and does not use Thymeleaf, JSP, FreeMarker, or another server-side template engine.

---

# 5. Architecture

The application follows a layered architecture:

```text
Client / Postman
       │
       ▼
   Controller
       │
       ▼
     Service
       │
       ▼
   Repository
       │
       ▼
   JPA / Hibernate
       │
       ▼
     MySQL
```

## Controller Layer

Responsible for:

* Receiving HTTP requests
* Validating request parameters
* Calling service methods
* Returning HTTP responses

Example:

```text
BookController
ReaderController
BorrowingController
UserController
```

## Service Layer

Contains the main business logic.

Examples:

```text
BookService
ReaderService
BorrowingService
UserService
```

This layer handles rules such as:

* Maximum borrowing limit
* Book availability
* Return processing
* Fine calculation
* Renewal validation

## Repository Layer

Responsible for database access using Spring Data JPA.

Examples:

```text
BookRepository
ReaderRepository
BorrowingRepository
UserRepository
```

## Entity Layer

Contains JPA entities representing database tables.

Examples:

```text
User
Book
BookCopy
Reader
Borrowing
BorrowingDetail
Fine
Reservation
```

## DTO Layer

Data Transfer Objects are used to define request and response data between the client and backend.

## Exception Layer

The project uses centralized exception handling with:

```java
@RestControllerAdvice
```

This allows the application to return consistent error responses.

---

# 6. Project Structure

```text
library-management/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── library/
│   │   │           └── management/
│   │   │               ├── config/
│   │   │               ├── controller/
│   │   │               ├── service/
│   │   │               ├── repository/
│   │   │               ├── entity/
│   │   │               ├── dto/
│   │   │               ├── exception/
│   │   │               └── LibraryManagementApplication.java
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
└── README.md
```

---

# 7. Database

The application uses **MySQL** as the primary relational database.

The database is designed around the main library entities and their relationships.

Simplified relationship:

```text
User
 │
 └── Role

Book
 │
 └── BookCopy
       │
       └── BorrowingDetail
              │
              └── Borrowing
                    │
                    └── Reader

Reader
 │
 ├── Borrowing
 └── Reservation

Borrowing
 │
 └── Fine
```

The database design supports relationships between:

* Users and roles
* Books and book copies
* Readers and borrowings
* Borrowings and book copies
* Readers and reservations
* Borrowings and fines

---

# 8. REST API

The application exposes RESTful endpoints under:

```text
/api
```

## Authentication

```http
POST /api/auth/login
```

## Users

```http
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

## Books

```http
GET    /api/books
GET    /api/books/{id}
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}
```

## Readers

```http
GET    /api/readers
GET    /api/readers/{id}
POST   /api/readers
PUT    /api/readers/{id}
```

## Borrowings

```http
GET    /api/borrowings
GET    /api/borrowings/{id}
POST   /api/borrowings
PATCH  /api/borrowings/{id}/renew
```

Additional endpoints are implemented for book copies, returning, reservations, and fines according to the corresponding business requirements.

---

# 9. Authentication & Security

The system protects API endpoints using authentication and role-based authorization.

Public endpoint:

```text
/api/auth/login
```

Administrative operations require an administrator role.

Example:

```text
ROLE_ADMIN
```

Passwords are stored using password hashing rather than plain-text storage.

---

# 10. Validation & Exception Handling

The project validates input data before processing business operations.

Examples:

* Required fields
* Duplicate reader codes
* Invalid book information
* Invalid borrowing requests
* Invalid user information
* Unauthorized access

Global exception handling is implemented using:

```java
@RestControllerAdvice
```

Example error response:

```json
{
  "status": 400,
  "message": "Reader code already exists"
}
```

---

# 11. API Testing

**Postman** is used to test the REST APIs.

Testing includes:

* Authentication
* Authorization
* CRUD operations
* Input validation
* Book management
* Reader management
* Borrowing
* Returning
* Renewing
* Fine calculation
* Reservation
* Exception handling

Example request:

```http
GET http://localhost:8080/api/books
```

---

# 12. Installation

## Requirements

Before running the project, install:

* Java 21
* Maven
* MySQL 8.x
* IntelliJ IDEA
* Postman

## Step 1: Clone the repository

```bash
git clone <repository-url>
cd library-management
```

## Step 2: Create the database

Open MySQL and create the database:

```sql
CREATE DATABASE library_management;
```

## Step 3: Configure database connection

Open:

```text
src/main/resources/application.properties
```

Configure:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_management
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Replace:

```text
your_password
```

with your MySQL password.

## Step 4: Install dependencies

Run:

```bash
mvn clean install
```

## Step 5: Run the application

Run:

```bash
mvn spring-boot:run
```

Or run:

```text
LibraryManagementApplication.java
```

from IntelliJ IDEA.

The application will normally start at:

```text
http://localhost:8080
```

---

# 13. Example Workflow

A typical borrowing workflow:

```text
Login
  │
  ▼
Reader
  │
  ▼
Search Book
  │
  ▼
Check Available BookCopy
  │
  ▼
Create Borrowing
  │
  ▼
BookCopy → BORROWED
  │
  ▼
Reader uses the book
  │
  ▼
Return Book
  │
  ├── On time → No fine
  │
  └── Overdue → Calculate fine
  │
  ▼
BookCopy → AVAILABLE
```

---

# 14. Project Goals

The project is developed for educational purposes with the following goals:

* Practice Java backend development
* Understand Spring Boot architecture
* Build RESTful APIs
* Apply Object-Oriented Programming
* Design relational databases
* Implement real-world business rules
* Practice JPA and Hibernate
* Implement authentication and authorization
* Improve API testing skills
* Develop a complete backend application

---

# 15. Future Improvements

Possible future improvements include:

* Frontend web application
* JWT-based authentication
* Advanced book search and filtering
* Library dashboard
* Borrowing statistics
* Revenue/fine reports
* Email notifications
* Reservation expiration
* Automated scheduled tasks
* Docker deployment
* API documentation with Swagger / OpenAPI

---

# 16. Author

**Duy Nguyen**

IT Student

---

# 17. License

This project is developed for educational and academic purposes.
