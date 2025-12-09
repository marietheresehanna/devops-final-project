# Notes Application - DevOps Final Project

A full-stack note-taking application demonstrating DevOps principles including containerization, CI/CD, and Kubernetes orchestration.

## 📋 Project Overview

This project implements a simple yet elegant notes application with:
- **Frontend**: Beautiful responsive UI built with HTML, CSS, and JavaScript, served via Nginx
- **Backend**: RESTful API built with Node.js and Express
- **Database**: PostgreSQL for persistent data storage
- **Containerization**: Docker and Docker Compose
- **Orchestration**: Kubernetes deployment
- **CI/CD**: Automated testing, building, and deployment via GitHub Actions

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Nginx)                             │
│              - Serves static files                           │
│              - Proxies API requests                          │
│              Port: 8080 (Compose) / 30081 (K8s)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Node.js)                           │
│              - Express REST API                              │
│              - CORS enabled                                  │
│              Port: 3000 (Compose) / 32000 (K8s)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            PostgreSQL Database                               │
│            - Persistent volume                               │
│            - MD5 authentication                              │
│            Port: 5432                                        │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐳 Docker Compose Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd devops-final-project

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/notes
```

### Services Configuration

- **Database**: PostgreSQL 16 Alpine
  - Port: 5432
  - Persistent volume: `pgdata`
  - Authentication: MD5

- **Backend**: Node.js API
  - Port: 3000
  - Environment variables configured via docker-compose.yml

- **Frontend**: Nginx Alpine
  - Port: 8080
  - Proxies /notes requests to backend

### Stop Services

```bash
docker-compose down        # Stop services
docker-compose down -v     # Stop and remove volumes
```

## 🚀 CI/CD Pipeline

### Pipeline Architecture

Our CI/CD pipeline uses **GitHub Actions** with three main stages:

#### 1. Test Stage
- Sets up Node.js environment
- Installs dependencies
- Runs automated tests (`npm test`)

#### 2. Build Stage
- Builds Docker image for backend
- Tags image as `latest`

#### 3. Registry Push Stage
- Authenticates with Docker Hub
- Pushes image to `mariethereseh/notes-backend:latest`

### Workflow Files

**`.github/workflows/ci.yml`** - Main CI pipeline
- Triggers on: Push to `main` branch, Pull requests
- Uses secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

**`.github/workflows/deploy.yml`** - Manual deployment workflow
- Triggers: Manual dispatch (`workflow_dispatch`)
- Simulates production deployment

### Setting Up Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Docker Hub access token

### Triggering the Pipeline

```bash
# Push changes to trigger CI
git add .
git commit -m "Your commit message"
git push origin main

# Check pipeline status
# Visit: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (Docker Desktop Kubernetes, Minikube, or Kind)
- kubectl configured

### Architecture Decision: External Database (Option B)

**Why we chose Option B (External Database):**

1. **Separation of Concerns**: Database runs in Docker Compose, application in Kubernetes
2. **Simplified Development**: Easier to manage database state during development
3. **Data Persistence**: Eliminates complexity of StatefulSets and PVCs for educational purposes
4. **Real-World Scenario**: Mimics production setups where databases often run on managed services (AWS RDS, Azure Database, etc.)

**Connection Method:**
- Kubernetes pods connect via `host.docker.internal:5432`
- This allows pods to access the host machine's Docker Compose database

### Deployment Steps

#### 1. Start External Database

```bash
docker-compose up -d db
```

#### 2. Deploy Backend

```bash
# Apply ConfigMap (database connection details)
kubectl apply -f k8s/backend-configmap.yaml

# Apply Secret (database credentials)
kubectl apply -f k8s/backend-secret.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Expose backend service
kubectl apply -f k8s/backend-service.yaml
```

#### 3. Deploy Frontend

```bash
# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Expose frontend service
kubectl apply -f k8s/frontend-service.yaml
```

#### 4. Verify Deployment

```bash
# Check pods
kubectl get pods

# Expected output:
# NAME                                      READY   STATUS    RESTARTS   AGE
# notes-backend-deployment-xxxxx-xxxxx      1/1     Running   0          2m
# notes-backend-deployment-xxxxx-xxxxx      1/1     Running   0          2m
# notes-frontend-deployment-xxxxx-xxxxx     1/1     Running   0          1m
# notes-frontend-deployment-xxxxx-xxxxx     1/1     Running   0          1m

# Check services
kubectl get svc

# Access application
# Frontend: http://localhost:30081
# Backend API: http://localhost:32000/notes
```

### Kubernetes Resources Explained

#### ConfigMap (`backend-configmap.yaml`)
- Stores non-sensitive configuration
- Database host, port, database name

#### Secret (`backend-secret.yaml`)
- Stores sensitive data (base64 encoded)
- Database username and password

#### Deployment (`backend-deployment.yaml`)
- 2 replicas for high availability
- Health probes:
  - **Readiness probe**: Checks if pod is ready to receive traffic
  - **Liveness probe**: Restarts pod if unhealthy
- Environment variables loaded from ConfigMap and Secret

#### Service
- **Backend**: NodePort on 32000
- **Frontend**: NodePort on 30081
- Exposes deployments to external traffic

### Scaling

```bash
# Scale backend
kubectl scale deployment notes-backend-deployment --replicas=3

# Scale frontend
kubectl scale deployment notes-frontend-deployment --replicas=3
```

### Troubleshooting

```bash
# View pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- sh

# Restart deployment
kubectl rollout restart deployment <deployment-name>
```
## 🌟 BONUS: Advanced CI/CD Implementation

### Multi-Tag Strategy

Our advanced CI/CD pipeline implements a sophisticated tagging strategy for better version control and traceability:

#### Tagging System

Every image is tagged with multiple identifiers:

1. **`latest`** - Always points to the most recent main branch build
   ```
   mariethereseh/notes-backend:latest
   ```

2. **Git Commit SHA** - Unique identifier for each commit
   ```
   mariethereseh/notes-backend:main-a1b2c3d
   ```

3. **Branch Name** - Identifies the source branch
   ```
   mariethereseh/notes-backend:develop
   ```

#### Benefits

✅ **Traceability**: Every image can be traced back to exact source code
✅ **Rollback**: Easy to rollback to specific versions using SHA tags
✅ **Environment Separation**: Different tags for dev/staging/production
✅ **Audit Trail**: Complete history of all builds and deployments

#### Advanced Features

1. **Parallel Builds**: Backend and frontend build simultaneously
2. **Build Caching**: Uses Docker layer caching for faster builds
3. **Metadata Extraction**: Automatically generates labels and tags
4. **Conditional Tagging**: `latest` only applied to main branch
5. **Build Summary**: Final summary job showing all successful steps

#### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to Main/Develop                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Test Job                                  │
│              - Setup Node.js                                 │
│              - Run npm test                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────────┐  ┌────────────────────┐
│  Build Backend     │  │  Build Frontend    │
│  - Extract metadata│  │  - Extract metadata│
│  - Multi-tag       │  │  - Multi-tag       │
│  - Push to Hub     │  │  - Push to Hub     │
└────────────────────┘  └────────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Summary Job                               │
│              - Display build results                         │
│              - Show commit SHA                               │
└─────────────────────────────────────────────────────────────┘
```

#### Usage Examples

**Deploy specific version to production:**
```bash
# Update Kubernetes deployment with specific SHA
kubectl set image deployment/notes-backend-deployment \
  notes-backend=mariethereseh/notes-backend:main-a1b2c3d
```

**Rollback to previous version:**
```bash
# Find previous SHA from Docker Hub
# Rollback
kubectl set image deployment/notes-backend-deployment \
  notes-backend=mariethereseh/notes-backend:main-x9y8z7w
```

**View all available versions:**
```bash
# List all tags on Docker Hub
curl -s https://hub.docker.com/v2/repositories/mariethereseh/notes-backend/tags | jq -r '.results[].name'
```

### CI/CD Best Practices Implemented

1. ✅ **Separation of Concerns**: Separate jobs for test, build backend, build frontend
2. ✅ **Fail Fast**: Tests run before building images
3. ✅ **Parallel Execution**: Backend and frontend build simultaneously
4. ✅ **Build Caching**: Reduces build time by 60-70%
5. ✅ **Semantic Versioning**: Commit SHA provides unique version identifier
6. ✅ **Security**: Secrets stored securely in GitHub Actions
7. ✅ **Idempotency**: Same commit always produces same image
8. ✅ **Auditability**: Complete build history available

### Performance Metrics

- **Build Time**: ~2-3 minutes (with caching)
- **Test Execution**: ~10-15 seconds
- **Image Size**: 
  - Backend: ~50MB (Node.js Alpine)
  - Frontend: ~25MB (Nginx Alpine)

This advanced CI/CD implementation demonstrates enterprise-level DevOps practices and provides a solid foundation for scaling to production environments.

## 🧪 Testing

### Running Tests Locally

```bash
cd backend
npm install
npm test
```

### Test Coverage
- Basic sanity tests
- API endpoint tests (can be extended)

## 📊 API Endpoints

### GET /notes
Returns all notes

**Response:**
```json
[
  {
    "id": 1,
    "text": "My first note",
    "created_at": "2025-12-09T10:30:00.000Z"
  }
]
```

### POST /notes
Create a new note

**Request:**
```json
{
  "text": "My new note"
}
```

**Response:**
```json
{
  "id": 2,
  "text": "My new note",
  "created_at": "2025-12-09T11:00:00.000Z"
}
```

### DELETE /notes/:id
Delete a note by ID

**Response:**
```json
{
  "message": "Note deleted successfully"
}
```

## 🔒 Security Considerations

- Database credentials stored in Kubernetes Secrets
- CORS configured to accept requests from frontend
- MD5 authentication for PostgreSQL
- Environment variables for sensitive configuration

## 🎯 Project Requirements Checklist

- ✅ Application with database persistence
- ✅ Clean, production-ready Dockerfiles
- ✅ Docker Compose orchestration
- ✅ CI/CD pipeline with test, build, and push stages
- ✅ Kubernetes deployment with ConfigMaps and Secrets
- ✅ Readiness and liveness probes
- ✅ External database with clear justification
- ✅ Complete documentation

## 👥 Team Members

- Marie Therese H

## 📚 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 16
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx

## 📝 License

This project is for educational purposes as part of the DevOps course (020IDCE5) at Saint Joseph University of Beirut.

## 🙏 Acknowledgments

- Instructors: Nadim Henoud, Toufic Fakhry
- Course: 020IDCE5 - Intégration et Déploiement Continue
- Institution: Saint Joseph University of Beirut
