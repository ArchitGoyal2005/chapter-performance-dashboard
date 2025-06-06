# Chapter Performance Dashboard API

A comprehensive RESTful API built to simulate a real-world dashboard backend for managing and analyzing chapter performance data. This project demonstrates advanced backend development concepts including caching, rate limiting, authentication, and data management.

## 🚀 Live API

**Base URL:** `https://mathongo.manantechnosurge.tech`

## 📚 Documentation

- **Postman Collection:** [View Documentation](https://documenter.getpostman.com/view/45603720/2sB2x2KEg8)
- [<img src="https://run.pstmn.io/button.svg" alt="Run in Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/45603720-531b8776-5553-4701-9d16-e43dd6127be2?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D45603720-531b8776-5553-4701-9d16-e43dd6127be2%26entityType%3Dcollection%26workspaceId%3D1b089c4f-d8eb-46fc-85b0-ccb85da2050b)

## ✨ Features

- **RESTful API Design** - Clean and intuitive endpoint structure
- **Advanced Filtering** - Filter chapters by class, subject, unit, status, and weak chapters
- **Pagination Support** - Efficient data retrieval with customizable page size
- **Redis Caching** - High-performance caching with 1-hour TTL
- **Rate Limiting** - IP-based rate limiting (30 requests/minute)
- **Admin Authentication** - Secure chapter upload restricted to admin users
- **Flexible Data Upload** - Support for JSON body and file uploads
- **Cache Invalidation** - Smart cache invalidation on data mutations

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Caching:** Redis
- **File Upload:** Multer (multipart/form-data)
- **Rate Limiting:** Redis-based implementation
- **Continerization:** Docker
- **CI/CD:** GitHub Actions
- **Deployment:** AWS EC2 Instance

## 📋 API Endpoints

### 1. Get All Chapters

**Endpoint:** `GET /api/v1/chapters`

**Description:** Retrieve all chapters with optional filtering and pagination.

**Query Parameters:**

- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `class` (string, optional) - Filter by class
- `subject` (string, optional) - Filter by subject
- `unit` (string, optional) - Filter by unit
- `status` (string, optional) - Filter by status
- `weakChapters` (boolean, optional) - Filter weak chapters

**Example Request:**

```bash
GET /api/v1/chapters?page=1&limit=5&class=10&subject=Mathematics&status=active
```

### 2. Get Chapter by ID

**Endpoint:** `GET /api/v1/chapters/:id`

**Description:** Retrieve a specific chapter by its MongoDB ObjectId.

**Path Parameters:**

- `id` (string, required) - MongoDB ObjectId of the chapter

**Example Request:**

```bash
GET /api/v1/chapters/60d5ec49f1b2c8b1f8e4e1a1
```


### 3. Upload Chapters (Admin Only)

**Endpoint:** `POST /api/v1/chapters`

**Description:** Upload chapters via JSON body or file upload. Restricted to admin users only.

**Authentication:** Query parameter `user` required as only admin can access this route.

**Content Types Supported:**

- `application/json` - JSON array in request body
- `multipart/form-data` - File upload

#### Option 1: JSON Body Upload

**Example Request:**

```bash
POST /api/v1/chapters?user=admin
Content-Type: application/json
```

#### Option 2: File Upload

**Example Request:**

```bash
POST /api/v1/chapters?user=admin
Content-Type: multipart/form-data

Form Data:
- file: chapters.json (containing JSON array)
```

## 🔧 Redis Implementation

### Caching Strategy

- **Cache Key Pattern:** `chapters:query:{hash}`
- **TTL:** 1 hour (3600 seconds)
- **Cache Hit:** Returns cached data with `"cached": true`
- **Cache Miss:** Fetches from database and caches result

### Cache Invalidation

Cache is automatically invalidated when:

- New chapters are uploaded (POST requests)
- Data mutations occur
- Manual cache clearing (if implemented)

### Rate Limiting

- **Limit:** 30 requests per minute per IP address
- **Implementation:** Redis-based sliding window
- **Response:** HTTP 429 (Too Many Requests) when limit exceeded

## Run the Application

To run the project locally using Docker and Docker Compose:

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine  
- [Docker Compose](https://docs.docker.com/compose/) (usually included with Docker Desktop)

---

### Steps to Run

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ArchitGoyal2005/chapter-performance-dashboard
   cd chapter-performance-dashboard
   ```

2. **Create a `.env` file** (if applicable):

   If your project requires environment variables, copy the example file (if present) or create a `.env` file manually.

   ```bash
   cp .env.sample .env
   ```

3. **Start the containers:**

   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Docker image(s)  
   - Start all defined services (e.g., backend, database, Redis, etc.)

4. **Access the app:**

   Once the containers are running, open your browser and visit:

   ```
   http://localhost:3000
   ```

   (or whatever port is exposed in your `docker-compose.yml`)

---

### Stopping the Project

To stop the running containers:

```bash
docker-compose down
```



