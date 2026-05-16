# MERN Real-Time Chat App

A production-style MERN chat application with real-time messaging, JWT authentication, image uploads, Docker containerization, and Jenkins CI/CD deployment to AWS EC2.

## Overview

This project is a full-stack chat application built with:

- React + Vite frontend
- Node.js + Express backend
- MongoDB database
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for image upload support
- Docker and Docker Compose for containerization
- Jenkins pipeline for CI/CD automation

The application can run locally with Docker Compose and can also be deployed automatically to an AWS EC2 instance using Jenkins.

## Features

- User signup and login
- JWT-protected API routes
- Real-time chat with Socket.IO
- Online user status
- Image sharing through Cloudinary
- Persistent message storage in MongoDB
- Dockerized frontend, backend, and database
- Jenkins CI/CD pipeline with Docker Hub image publishing
- Automated EC2 deployment using SSH

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Axios, Socket.IO Client, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Media Upload | Cloudinary |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |
| CI/CD | Jenkins Declarative Pipeline |
| Registry | Docker Hub |
| Deployment | AWS EC2 |

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

## Local Environment Variables

Create `server/.env` for local development:

```env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/chat-app
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not commit `.env` files. They are ignored by Git.

## Run Locally With Docker Compose

From the project root:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up --build -d
```

Open the frontend:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/status
```

Stop containers:

```bash
docker compose down
```

Rebuild without cache:

```bash
docker compose build --no-cache
docker compose up -d
```

View logs:

```bash
docker compose logs -f
```

## Docker Architecture

Docker Compose runs three services:

| Service | Container | Port |
| --- | --- | --- |
| Frontend | `chat-app-frontend` | `5173:5173` |
| Backend | `chat-app-backend` | `5000:5000` |
| MongoDB | `chat-app-mongodb` | `27018:27017` |

The backend connects to MongoDB inside Docker using:

```text
mongodb://mongodb:27017/chat-app
```

Inside Docker, never use `localhost` to connect from one container to another. `localhost` means the current container only. Docker Compose creates an internal network where services communicate using service names such as `mongodb` and `backend`.

## Frontend Container

The frontend Dockerfile uses a multi-stage build:

1. Node builds the Vite React app.
2. Nginx serves the production build.

Nginx listens on port `5173` and proxies:

- `/api` to the backend container
- `/socket.io` to the backend container

This keeps frontend, API, and Socket.IO traffic working under one browser origin.

## Backend Container

The backend container:

- runs Node.js in production mode
- exposes port `5000`
- loads secrets through environment variables
- connects to MongoDB through the Docker network

## API Routes

### Auth Routes

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/check
PUT  /api/auth/update-profile
```

### Message Routes

```text
GET  /api/messages/users
GET  /api/messages/:id
POST /api/messages/send/:id
PUT  /api/messages/mark/:id
```

## Jenkins CI/CD Pipeline

The project includes a production-style Jenkins Declarative Pipeline.

Pipeline flow:

```text
GitHub
  -> Jenkins Agent
  -> Build Docker Images
  -> Push Images to Docker Hub
  -> SSH into EC2
  -> Pull latest images
  -> Run MongoDB, backend, and frontend containers
```

## Jenkins Stages

The Jenkinsfile contains these stages:

1. Clone Repository
2. Build Client Image
3. Build Server Image
4. Docker Login
5. Push Client Image
6. Push Server Image
7. Deploy Application
8. Cleanup Docker

## Docker Images

Images pushed to Docker Hub:

```text
tanmayanand24/chat-client:latest
tanmayanand24/chat-server:latest
```

## EC2 Deployment Containers

The deployment stage runs these containers on EC2:

| Container | Image | Port |
| --- | --- | --- |
| `mongodb` | `mongo:7` | internal only |
| `chat-server` | `tanmayanand24/chat-server:latest` | `5000:5000` |
| `chat-client` | `tanmayanand24/chat-client:latest` | `5173:5173` |

MongoDB data is stored in a persistent Docker volume:

```text
chat-app-mongodb-data
```

This means deployments can replace the backend and frontend without deleting MongoDB data.

## EC2 Environment File

Create this file on the EC2 deployment server:

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

The Jenkins deployment stage injects the MongoDB URI automatically:

```text
MONGODB_URI=mongodb://mongodb:27017/chat-app
```

So do not use `127.0.0.1` or `localhost` for MongoDB in the cloud backend container.

## Jenkins Credentials

Create these credentials in Jenkins:

### Docker Hub

```text
Credential ID: dockerhub
Type: Username with password
Username: Docker Hub username
Password: Docker Hub access token or password
```

### EC2 SSH

```text
Credential ID: agent-ssh
Type: SSH username with private key
Username: ubuntu
Private Key: EC2 private key
```

## Jenkins Agent Requirements

The pipeline runs on an agent labeled:

```text
dev
```

The Jenkins agent must have:

- Docker installed
- permission to run Docker without `sudo`
- SSH access to the EC2 deployment server
- internet access to pull and push Docker images

## AWS Security Group Ports

Open these inbound ports on the EC2 security group:

| Port | Purpose |
| --- | --- |
| 22 | SSH from Jenkins |
| 5000 | Backend API |
| 5173 | Frontend app |

MongoDB does not need to be exposed publicly because backend and MongoDB communicate inside the Docker network.

## CI vs CD

CI means Continuous Integration. In this project, CI:

- clones the repository
- builds frontend and backend Docker images
- pushes images to Docker Hub

CD means Continuous Deployment. In this project, CD:

- SSHs into EC2
- pulls the latest Docker images
- starts MongoDB if needed
- replaces old frontend and backend containers
- runs the latest application version

## Useful EC2 Docker Commands

Check running containers:

```bash
docker ps
```

View backend logs:

```bash
docker logs chat-server
```

View frontend logs:

```bash
docker logs chat-client
```

View MongoDB logs:

```bash
docker logs mongodb
```

Check Docker network:

```bash
docker network inspect chat-app-network
```

Check MongoDB volume:

```bash
docker volume ls
```

## Common Issues And Fixes

### Operation `users.findOne()` buffering timed out

The backend cannot connect to MongoDB.

Check that MongoDB is running:

```bash
docker ps
docker logs mongodb
```

Make sure backend uses:

```text
mongodb://mongodb:27017/chat-app
```

Do not use:

```text
mongodb://127.0.0.1:27017
```

### Request failed with status code 401

This usually means the frontend has no valid JWT token or an old token is stored in browser localStorage.

Clear browser localStorage and log in again:

```js
localStorage.removeItem("token")
```

### Docker permission denied in Jenkins

Add the Jenkins user to the Docker group:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Then reconnect the Jenkins agent or restart the session.

### Port already in use

Check what is using the port:

```bash
sudo lsof -i :5173
sudo lsof -i :5000
```

Stop the old container if needed:

```bash
docker stop chat-client chat-server || true
docker rm chat-client chat-server || true
```

### Cloudinary upload fails

Check `/opt/chat-app/server.env` on EC2 or `server/.env` locally. Make sure Cloudinary credentials are correct.

## Security Notes

- Never commit `.env` files.
- Use Docker Hub access tokens instead of account passwords.
- Rotate secrets if they are accidentally exposed.
- Keep MongoDB private inside the Docker network.
- Restrict SSH access to trusted IP addresses.

## Author

GitHub: [tanmayanand840](https://github.com/tanmayanand840)

Docker Hub images:

```text
tanmayanand24/chat-client
tanmayanand24/chat-server
```
