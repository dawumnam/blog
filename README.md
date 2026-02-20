# Simple Blog (Server-Side Rendering)

A basic blog application demonstrating server-side rendering using Node.js, Express, and MongoDB.

## Features

*   Create, Read, Update, Delete (CRUD) articles
*   Markdown support for article content with HTML sanitization
*   Slug generation for article URLs

## Prerequisites

*   [Node.js](https://nodejs.org/) (version specified in `.nvmrc` or `package.json`, e.g., v14.x or later LTS)
*   [MongoDB](https://www.mongodb.com/) (can be run locally or via Docker)
*   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for using the provided `docker-compose.yml` setup)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
```

Then, customize the variables in your `.env` file as needed:

*   `PORT`: The port the application will run on (default: `5000`).
*   `MONGODB_URI`: The MongoDB connection string.
    *   For local MongoDB: `mongodb://localhost:27017/blog_dev`
    *   When using `docker-compose.yml`: `mongodb://mongo:27017/blog_dev` (for development)
*   `MONGODB_URI_TEST`: MongoDB connection string for the test database (default: `mongodb://mongo:27017/blog_test` or `mongodb://localhost:27017/blog_test`).
*   `NODE_ENV`: Set to `development`, `production`, or `test`. This affects logging levels, database names (as per `config/config.js`), and Morgan's log format.

Refer to `config/config.js` for how these variables are used and for default values if not set.

## Running the Application

### Development Mode

This mode uses `nodemon` for automatic server restarts on file changes.

```bash
npm run devStart
```
The application will typically be available at `http://localhost:5000`.

### Production Mode

This mode runs the application using `node server.js`. Ensure `NODE_ENV` is set to `production` in your `.env` file or system environment.

```bash
npm start
```

## Running Tests

Tests are run using Mocha. Ensure your test database is accessible (as per `MONGODB_URI_TEST`).

```bash
npm test
```

## Using Docker

The provided `docker-compose.yml` can be used to run the application and a MongoDB instance in Docker containers.

1.  **Build and start containers (detached mode):**
    ```bash
    docker-compose up --build -d
    ```

2.  **View logs:**
    ```bash
    docker-compose logs -f dawumnam  # For the application
    docker-compose logs -f mongo     # For MongoDB
    ```

3.  **Stop and remove containers:**
    ```bash
    docker-compose down
    ```

When using Docker Compose, the application will be available at `http://localhost:5000` (due to port mapping) and will connect to the MongoDB container using the hostname `mongo`.

## Code Structure

*   `server.js`: Main application entry point.
*   `models/`: Mongoose models (e.g., `article.js`).
*   `routes/`: Express route definitions (e.g., `articles.js`).
*   `views/`: EJS view templates.
*   `public/`: (If you add static assets like CSS, JS for client-side) - *Currently not present but a common addition.*
*   `config/`: Application configuration files (`config.js`, `logger.js`).
*   `utils/`: Utility helper functions (e.g., `asyncHandler.js`).
*   `test/`: Test files.
*   `Dockerfile`: For building the application's Docker image.
*   `docker-compose.yml`: For defining and running multi-container Docker applications.
*   `.env.example`: Example environment variable file.

## Key Production-Ready Features Implemented

*   Centralized configuration management (`config/config.js`).
*   Environment variable support for sensitive and environment-specific settings.
*   Robust error handling (global error handler, async route wrapper).
*   Comprehensive logging (request logging with Morgan, application logging with Winston).
*   Security enhancements (Helmet for security headers, input sanitization with DOMPurify).
*   Updated dependencies.
*   Production-optimized Dockerfile (non-root user, `npm ci`, specific CMD).
*   Basic testing setup (unit and integration tests).
*   Improved documentation (this README).
