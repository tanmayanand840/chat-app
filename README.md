# Real-Time Chat Application

A full-stack MERN real-time chat application with JWT authentication, Socket.IO messaging, MongoDB persistence, and Cloudinary image upload support.

## Features

- Real-time one-to-one messaging with Socket.IO
- User signup, login, and JWT-based authentication
- Online user status
- Image upload support using Cloudinary
- Persistent chat history with MongoDB
- React + Vite frontend
- Node.js + Express backend
- Dockerized frontend, backend, and MongoDB services
- Jenkins CI pipeline for building and pushing Docker images

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Socket.IO Client
- Tailwind CSS

### Backend

- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose
- JWT
- Cloudinary
- bcryptjs

### DevOps

- Docker
- Docker Compose
- Nginx for serving the frontend and proxying API traffic
- Jenkins Declarative Pipeline
- Docker Hub image publishing

## Project Structure

```text
chat-app/
├── client/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf
│   ├── package.json
│   └── src/
├── server/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env
│   ├── package.json
│   └── server.js
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

## Environment Variables

Create or update `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/chat-app
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

When running with Docker Compose, the backend uses `env_file` to load `server/.env`. The Compose file also overrides `MONGODB_URI` so the backend connects to the MongoDB container using the internal service name `mongodb`.

## Run With Docker Compose

Make sure Docker Desktop is running, then run from the project root:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Open the app:

```text
http://localhost:5173
```

Backend status endpoint:

```text
http://localhost:5000/api/status
```

Stop containers:

```bash
docker compose down
```

Rebuild from scratch:

```bash
docker compose build --no-cache
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

## Docker Services

### MongoDB

The `mongodb` service runs MongoDB 7 and stores data in a named Docker volume:

```text
mongodb_data
```

The database is exposed to the host on port `27018`, but containers communicate internally through:

```text
mongodb:27017
```

### Backend

The backend service builds from `server/Dockerfile`, runs the Express server on port `5000`, and connects to MongoDB using:

```text
mongodb://mongodb:27017/chat-app
```

Do not use `localhost` for MongoDB inside Docker containers. Inside a container, `localhost` means the same container, not another service.

### Frontend

The frontend service builds the Vite app and serves the production build with Nginx.

Nginx also proxies:

- `/api` requests to the backend container
- `/socket.io` traffic to the backend container

This allows the browser to use one frontend URL while Docker handles internal routing.

## Why Docker Compose Is Used

This application needs multiple services to run together:

- React frontend
- Express backend
- MongoDB database

Docker Compose starts all services with one command, creates a shared internal network, and allows containers to communicate by service name.

Example:

```text
backend -> mongodb:27017
frontend nginx -> backend:5000
```

## env_file vs environment

`env_file` loads variables from a file:

```yaml
env_file:
  - ./server/.env
```

`environment` defines or overrides variables directly in `docker-compose.yml`:

```yaml
environment:
  MONGODB_URI: mongodb://mongodb:27017/chat-app
```

In this project, `env_file` is used for application secrets and `environment` is used for Docker-specific runtime values.

## Local Development Without Docker

Start MongoDB locally or with Docker, then run:

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## API Endpoints

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/check`
- `PUT /api/auth/update-profile`

### Messages

- `GET /api/messages/users`
- `GET /api/messages/:id`
- `POST /api/messages/send/:id`
- `PUT /api/messages/mark/:id`

## Jenkins CI Pipeline

This repository includes a `Jenkinsfile` for a beginner-friendly production-style CI pipeline.

The pipeline:

1. Runs on a Jenkins agent labeled `dev`
2. Clones the GitHub repository
3. Builds the frontend Docker image
4. Builds the backend Docker image
5. Logs in to Docker Hub using Jenkins credentials
6. Pushes both images to Docker Hub
7. SSHs into the EC2 deployment server
8. Starts MongoDB on EC2 if it is not already running
9. Replaces the old frontend and backend containers with the latest images

Images pushed:

```text
tanmayanand24/chat-client:latest
tanmayanand24/chat-server:latest
```

Containers deployed on EC2:

```text
mongodb
chat-server
chat-client
```

MongoDB data is persisted in this Docker volume on EC2:

```text
chat-app-mongodb-data
```

## Jenkins Prerequisites

Before running the pipeline, configure:

- Jenkins agent with label `dev`
- Docker installed on the Jenkins agent
- Jenkins agent user allowed to run Docker without `sudo`
- SSH access from Jenkins to the EC2 deployment server
- Docker Hub credential in Jenkins:
  - Credential type: Username with password
  - Credential ID: `dockerhub`
  - Username: Docker Hub username
  - Password: Docker Hub access token or password
- SSH credential in Jenkins:
  - Credential ID: `agent-ssh`
  - Private key for the EC2 deployment user
- GitHub repository URL inside `Jenkinsfile`
- Docker Hub username inside `Jenkinsfile`
- EC2 public IP inside `Jenkinsfile`

Create this backend environment file on EC2:

```bash
sudo mkdir -p /opt/chat-app
sudo nano /opt/chat-app/server.env
```

Example:

```env
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The Jenkins deployment command sets this MongoDB URI automatically for the backend container:

```text
MONGODB_URI=mongodb://mongodb:27017/chat-app
```

The deployment stage also waits for MongoDB to respond before starting the backend. This prevents Mongoose errors such as:

```text
Operation `users.findOne()` buffering timed out after 10000ms
```

## How The Jenkins Pipeline Works

The Jenkins Master schedules the job, but the actual work runs on the Jenkins agent because the pipeline uses:

```groovy
agent {
    label 'dev'
}
```

Docker Hub credentials are injected securely with:

```groovy
withCredentials([usernamePassword(credentialsId: 'dockerhub', ...)])
```

The pipeline builds and pushes:

```bash
docker build -t tanmayanand24/chat-client:latest ./client
docker build -t tanmayanand24/chat-server:latest ./server
docker push tanmayanand24/chat-client:latest
docker push tanmayanand24/chat-server:latest
```

After the push, the deployment stage connects to EC2 with SSH, pulls the latest images, starts MongoDB if needed, and recreates the app containers.

## Common Docker Issues

### Docker daemon is not running

Start Docker Desktop, wait until the engine is running, then run:

```bash
docker compose up --build
```

### Port already in use

Change the host port in `docker-compose.yml`.

Example:

```yaml
ports:
  - "5174:80"
```

### Backend cannot connect to MongoDB

Use this inside Docker:

```text
mongodb://mongodb:27017/chat-app
```

Do not use:

```text
mongodb://localhost:27017/chat-app
```

On EC2, make sure the `mongodb` container is running:

```bash
docker ps
docker logs mongodb
```

### Socket.IO connection fails

Check that Nginx is proxying `/socket.io/` and that the backend container is running:

```bash
docker compose logs backend
docker compose logs frontend
```

### Cloudinary upload fails

Check the Cloudinary values in `server/.env`.

## Production Notes

- Frontend is served by Nginx instead of Vite dev server.
- Backend runs with `NODE_ENV=production`.
- MongoDB data is persisted in a Docker volume.
- Backend container runs as a non-root user.
- Docker build contexts ignore `node_modules` and generated files.
- Jenkins uses Docker Hub credentials securely instead of hardcoding passwords.
