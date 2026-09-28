Library Management System

A full-stack web application for managing library operations, including books, readers, borrowing and returning, import receipts, users, publishers, categories, authors, and operational revenue.

Overview

The Library Management System is designed to support day-to-day library management through separate access levels for Admin and Librarian/Staff.

The system provides a web-based interface for managing library resources and circulation workflows while using a Spring Boot REST API as the backend and a Next.js application as the frontend.

Main objectives

Manage books and their inventory quantities.

Manage authors, categories, publishers, and book shelves.

Manage library readers and their borrowing eligibility.

Create and manage borrowing records.

Support partial book returns.

Calculate overdue, damage, and lost-book fines.

Support borrowing renewal and renewal payments.

Manage book import receipts.

Manage administrator and librarian accounts.

Provide operational statistics and revenue information for authorized users.

Separate Admin and Staff/Librarian permissions.

Technology Stack

Backend

Technology

Purpose

Java 21

Programming language

Spring Boot 4.1.1

Backend framework

Spring Web

REST API

Spring Data JPA

Database access

Hibernate

ORM

Spring Security

Authentication and authorization

JWT

Token-based authentication

BCrypt

Password hashing

Maven

Dependency and build management

MySQL

Relational database

XAMPP

Local MySQL environment

Frontend

Technology

Purpose

Next.js

Frontend framework

React

UI development

TypeScript

Type-safe frontend development

Tailwind CSS

Styling

Fetch API

Communication with backend REST APIs

System Architecture

The application follows a layered architecture on the backend:

Frontend (Next.js)
        |
        | HTTP / REST API
        v
Controller
        |
        v
Service
        |
        v
Repository
        |
        v
MySQL Database

Backend layers

Controller: Receives HTTP requests and returns API responses.

Service: Contains business logic and validation.

Repository: Handles database operations through Spring Data JPA.

Entity: Represents database tables and relationships.

DTO: Defines request and response data structures.

Config: Contains security and application configuration.

Exception: Handles application and validation errors.

Project Structure

Backend

library-management/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── library/
│   │   │           └── management/
│   │   │               ├── config/
│   │   │               ├── controller/
│   │   │               ├── dto/
│   │   │               ├── entity/
│   │   │               ├── exception/
│   │   │               ├── repository/
│   │   │               ├── service/
│   │   │               └── LibraryManagementApplication.java
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
└── README.md

Frontend

The frontend is implemented as a Next.js application using the App Router.

frontend/
├── app/
│   ├── admin/
│   ├── staff/
│   ├── login/
│   ├── components/
│   └── lib/
│
├── public/
├── package.json
├── tsconfig.json
└── ...

Main Features

1. Authentication and Authorization

The system uses JWT-based authentication.

Supported system roles:

ADMIN

LIBRARIAN

Authentication flow:

Login
  |
  v
Username + Password
  |
  v
Backend authentication
  |
  v
JWT token
  |
  v
Frontend stores token
  |
  v
Authenticated API requests

Passwords are stored using BCrypt hashing.

Role-based access control is applied to protected API endpoints and frontend pages.

2. User Management

Administrators can manage system accounts for:

Administrators

Librarians/Staff

User account information includes:

Username

Password

Full name

Email

Role

Status

Reader accounts are managed separately through the Reader Management module.

3. Reader Management

The Reader Management module manages library patrons.

Main operations:

Create reader

View reader list

View reader details

Update reader

Activate reader

Deactivate reader

Search readers

Filter readers by status

Check borrowing eligibility

Reader information includes:

Reader code

Full name

Email

Phone

Address

Date of birth

Status

Example reader code:

R001
R002
R003

4. Book Management

The Book module manages the library catalog and inventory.

Main information:

Title

ISBN

Publisher

Publication year

Price

Description

Total quantity

Available quantity

Status

Authors

Categories

The system uses quantity-based inventory management.

Instead of creating a separate database record for every physical copy, the number of copies is represented by:

totalQuantity
availableQuantity

This simplifies inventory management while still supporting partial returns.

5. Author Management

The system supports management of book authors.

Main operations:

Add author

View authors

Edit author

Search authors

Associate authors with books

A book can have multiple authors.

Relationship:

Book * -------- * Author

6. Category Management

Books can belong to multiple categories.

Main operations:

Add category

Edit category

View categories

Search/filter categories

Associate categories with books

A primary category can also be specified for a book.

Relationship:

Book * -------- * Category

7. Publisher Management

Publishers can be managed separately and associated with books and import receipts.

Typical publisher information includes:

Publisher name

Contact information

Status

8. Book Shelf Management

The system supports book shelf management.

Shelves can be associated with a primary category to help organize books according to the library's physical arrangement.

Example:

Shelf
 ├── Shelf Code
 ├── Name
 └── Primary Category

9. Import Receipt Management

Import receipts are used to record books received by the library.

An import receipt contains:

Publisher

Import date

Imported books

Quantity

Unit price

Total value

The system supports importing:

Existing books

New books

When a new book is imported, information such as the following can be provided:

Title

ISBN

Publication year

Description

Price

Authors

Categories

Primary category

The imported quantity is added to the book inventory.

10. Borrowing Management

The Borrowing module manages the circulation of books.

A borrowing record contains:

Reader

Borrowed date

Due date

Status

Renewal count

Deposit amount

Borrowing details

A borrowing can contain multiple books.

Example:

Borrowing
    |
    +-- Book A × 2
    |
    +-- Book B × 1
    |
    +-- Book C × 1

The system limits the maximum number of borrowed books according to the configured business rule.

The current borrowing workflow uses a default borrowing period of 7 days.

11. Deposit Management

When books are borrowed, the system calculates a deposit based on the book price and borrowed quantity.

Formula:

Deposit = Σ (Book Price × Borrowed Quantity)

Example:

Book A: 100,000 × 2 = 200,000
Book B: 150,000 × 1 = 150,000

Total Deposit = 350,000 VND

The deposit is stored with the borrowing record.

12. Partial Return

The system supports returning only part of a borrowing record.

For each borrowed quantity, the returned books can be classified as:

Good

Damaged

Lost

Example:

Borrowed:
Book A × 3

Returned:
Good     = 1
Damaged  = 1
Lost     = 1

The system stores aggregate quantities in the borrowing detail:

goodQuantity
damagedQuantity
lostQuantity

This allows multiple return operations for the same borrowing.

Borrowing statuses include:

BORROWING
PARTIALLY_RETURNED
RETURNED
OVERDUE

A partially returned borrowing can still be renewed while it remains eligible for renewal.

13. Fine Calculation

The system supports several types of fines.

Overdue fine

Current rule:

Overdue Fine = Overdue Days × 5,000 VND

Damage fine

Current rule:

Damage Fine = Damaged Books × 50,000 VND

Lost-book fine

Current rule:

Lost Fine = Book Price × Lost Quantity

The applicable fines are used when calculating the amount returned to the reader from the deposit.

14. Borrowing Renewal

A borrowing can be renewed when it is eligible.

Current rules:

Renewal period: 3–30 days

Maximum renewals: 2 times

Renewal requires payment confirmation

Renewal fee: 1,000 VND/day

Returned borrowings cannot be renewed.

Overdue borrowings cannot be renewed.

Partially returned active borrowings can be renewed.

Formula:

Renewal Fee = Number of Renewal Days × 1,000 VND

Each renewal payment is stored in the database.

15. Return History

Each return operation creates a return history record.

The history records:

Borrowing

Borrowing detail

Book

Good quantity

Damaged quantity

Lost quantity

Overdue fine

Damage fine

Return time

Return status

This allows staff to review previous return transactions.

16. Dashboard

The Admin dashboard provides operational statistics.

Examples include:

Total books

Total readers

Borrowing statistics

Returned books

Fine revenue

Renewal revenue

Daily revenue

Monthly revenue

Revenue can include:

Fine Revenue
+
Renewal Revenue
=
Operational Revenue

Access to financial/revenue information is restricted according to the user's role.

17. Role Separation

The system separates Admin and Staff/Librarian responsibilities.

Admin

Admin can access administrative functions such as:

Dashboard

User management

Library management

Reader management

Book management

Borrowing management

Revenue/statistical information

Librarian / Staff

Staff can perform operational library tasks such as:

Reader management

Book management

Borrowing

Returning

Renewal

Import receipt management

Financial information is restricted from Staff where required by the system's role design.

Database

Database name:

library_management

Database engine:

MySQL

Local database environment:

XAMPP

The application uses JPA/Hibernate to map Java entities to MySQL tables.

Current Hibernate configuration:

spring.jpa.hibernate.ddl-auto=update

For production deployment, database migration tools such as Flyway or Liquibase should be considered instead of relying on automatic schema updates.

Configuration

Backend configuration is stored in:

src/main/resources/application.properties

Example local configuration:

spring.datasource.url=jdbc:mysql://localhost:3306/library_management
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

jwt.secret=library-management-secret-key-2026

For a real deployment, database credentials and JWT secrets should not be committed directly to source control.

Running the Project

Prerequisites

Install:

Java 21

Maven

MySQL

XAMPP

Node.js 20+

npm

Verify Java:

java -version

Verify Maven:

mvn -version

Verify Node.js:

node -v

Verify npm:

npm -v

1. Start MySQL

Open XAMPP and start:

Apache
MySQL

Create the database:

CREATE DATABASE library_management;

Make sure the database name matches:

spring.datasource.url=jdbc:mysql://localhost:3306/library_management

2. Run Backend

Open the backend project directory:

cd library-management

Run:

mvn spring-boot:run

The backend runs on:

http://localhost:8080

3. Run Frontend

Open the frontend project directory:

npm install

Then:

npm run dev

The frontend normally runs on:

http://localhost:3000

API

The backend exposes REST APIs for the main library modules.

Typical API groups include:

/api/auth
/api/users
/api/readers
/api/books
/api/authors
/api/categories
/api/publishers
/api/borrowings

Additional endpoints are available for:

Import receipts

Renewal payments

Return history

Dashboard statistics

Book shelves

Authentication-protected requests require a valid JWT token.

Example:

Authorization: Bearer <JWT_TOKEN>

Borrowing Workflow

Reader
   |
   v
Check reader status
   |
   v
Select available books
   |
   v
Calculate deposit
   |
   v
Create borrowing
   |
   v
Borrowing status = BORROWING
   |
   +----------------------+
   |                      |
   v                      v
Renew                  Return
   |                      |
   v                      v
Extend due date      Check condition
                          |
              +-----------+-----------+
              |           |           |
             Good      Damaged       Lost
              |           |           |
              +-----------+-----------+
                          |
                          v
                    Calculate fines
                          |
                          v
                    Update inventory
                          |
                          v
                PARTIALLY_RETURNED
                          |
                   all returned?
                      /       \
                    No         Yes
                    |           |
                    v           v
                Continue      RETURNED
                borrowing

Security

The application uses:

Spring Security

JWT authentication

BCrypt password hashing

Role-based authorization

Protected endpoints verify the user's authentication and role before processing requests.

Example roles:

ROLE_ADMIN
ROLE_LIBRARIAN

Error Handling

The backend provides centralized exception handling through:

@RestControllerAdvice

Validation errors are returned as structured API responses.

The frontend displays form-related validation and API errors inside the corresponding modal/form where applicable.

Development Notes

Inventory model

The project does not use a separate BookCopy entity.

Physical book quantities are represented by:

Book.totalQuantity
Book.availableQuantity

This design is intentionally used to keep inventory management simpler.

Partial returns

A borrowing detail can be returned multiple times until its entire quantity has been processed.

The system tracks:

goodQuantity
damagedQuantity
lostQuantity

Revenue

Revenue-related information is calculated from:

BorrowingDetail.fine
BorrowingDetail.damageFine
RenewalPayment.amount

and aggregated for daily/monthly dashboard statistics.

Future Improvements

Potential future improvements include:

Library membership card management

QR code generation and scanning

Email notifications

Automated overdue notifications

Advanced reporting

Export reports to Excel/PDF

Database migration with Flyway/Liquibase

Docker deployment

Production environment configuration

Automated unit and integration tests

Fine-grained permission management

Project Purpose

This project is developed as a practical library management application to demonstrate:

Java and Spring Boot development

RESTful API design

Spring Data JPA

MySQL database design

Authentication and authorization

React/Next.js frontend development

TypeScript

Role-based access control

Business logic implementation

Inventory and circulation management

License

This project is developed for educational and academic purposes.
