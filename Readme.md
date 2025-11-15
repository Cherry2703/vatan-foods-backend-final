# Vatan Foods Backend

A **Node.js + Express.js** backend for managing the end-to-end operations of a food production and distribution system. The backend supports **user authentication, raw material management, cleaning, packing, dispatch, orders, and reporting**. Data is stored in **MongoDB**, and APIs are designed for integration with dashboards and frontend applications.

---

## **Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [License](#license)

---

## **Features**

- **User Management**
  - Role-based access (Admin, Manager, Worker)
  - JWT-based authentication
  - Password hashing with bcrypt

- **Incoming Materials**
  - Track raw materials from vendors
  - Store batch ID, vendor details, quantity, vehicle info, remarks
  - CRUD operations

- **Cleaning Records**
  - Track cleaning operations per batch
  - Record input/output quantities, wastage, operator, and cycle info
  - Maintain history

- **Packing Records**
  - Track packing stages for each batch
  - Store output quantities, bag details, shifts, and workers involved
  - CRUD operations

- **Dispatch Records**
  - Manage outgoing shipments
  - Store product details, destination, dispatcher, vehicle, status
  - Track update history

- **Orders**
  - Manage customer orders
  - Track items, quantities, batch IDs used
  - CRUD operations

- **Reports**
  - Fetch all production and employee data
  - Generate analytics dashboards for management
  - Filter by date ranges (last 7 days, 15 days, 30 days, months, custom)

- **Utilities**
  - Error handling and proper API responses
  - CORS for frontend integration
  - JSON parsing for REST API
  - UUIDs for unique identification

---

## **Tech Stack**

- **Node.js** - JavaScript runtime
- **Express.js** - Backend framework
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **UUID** - Unique identifiers
- **Nodemon** - Development server reloads

---

## **Installation**

1. Clone the repository:

```bash
git clone https://github.com/Cherry2703/vatan-foods-backend.git
cd vatan-foods-backend
