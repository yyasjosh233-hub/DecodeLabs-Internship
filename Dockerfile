# ==============================================================================
# Stage 1: Build the React frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source files
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Build the frontend (outputs to /app/dist)
RUN npm run build

# ==============================================================================
# Stage 2: Serve using Python FastAPI
# ==============================================================================
FROM python:3.10-slim AS runner
WORKDIR /app

# Install system dependencies if any are needed (none for basic FastAPI packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend_fastapi/requirements.txt ./backend_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements.txt

# Copy backend code
COPY backend_fastapi ./backend_fastapi

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /app/dist ./dist

# Expose default port
EXPOSE 8000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=8000

# Start FastAPI application
CMD ["python", "-m", "uvicorn", "backend_fastapi.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
