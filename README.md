# Internship Management

Simple internship management application with a Spring Boot backend and a Vite + React frontend.

## Repository structure

- backend/ — Spring Boot application (Maven wrapper included)
- frontend/ — Vite + React frontend

## Prerequisites

- Java 11+ (or the version required by the project)
- Node.js 16+
- npm (or yarn)

## Run backend (development)

On Windows:

```powershell
cd backend
mvnw.cmd spring-boot:run
```

On Unix/macOS:

```bash
cd backend
./mvnw spring-boot:run
```

## Run frontend (development)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs via Vite (default http://localhost:5173). Configure backend API URL in the frontend `services/api.js` if needed.

## Build

- Backend: `mvn clean package` (from `backend/`)
- Frontend: `npm run build` (from `frontend/`)

## Tests

- Backend unit tests: `mvn test` (from `backend/`)
- Frontend tests: (none by default)

## Configuration

Application properties: `backend/src/main/resources/application.properties`.

## License

Add your license here.
