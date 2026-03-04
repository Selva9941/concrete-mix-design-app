# Fast Server + Hosting Setup

## 1) Fast local server (no Docker)
```bash
cd "/home/selva/mix concrete/concrete_app"
./start_fast_server.sh 127.0.0.1 8080
```
Open: http://127.0.0.1:8080/index.html

## 2) Fast host stack (Docker: Nginx + PHP-FPM + OPcache)
```bash
cd "/home/selva/mix concrete/concrete_app"
docker compose up -d --build
```
Open: http://127.0.0.1:8080/index.html

## 3) API endpoints
- POST `/api.php/login` or `/api/login`
- POST `/api.php/calculate` or `/api/calculate`
- GET `/api.php/designs` or `/api/designs`
- POST `/api.php/designs` or `/api/designs`
- DELETE `/api.php/designs?id=<id>` or `/api/designs?id=<id>`
