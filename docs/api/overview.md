# API Overview

Base URL (local): `http://localhost:3000/api`
Interactive docs: `http://localhost:3000/api/docs` (Swagger/OpenAPI)

## Sprint-0 endpoints

| Method | Path          | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/api/health` | Service health check     |
| GET    | `/api/docs`   | Swagger UI (HTML)        |
| GET    | `/api/docs-json` | OpenAPI JSON document |

### `GET /api/health` — example

```json
{
  "status": "ok",
  "service": "agency-management-backend",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Conventions (apply from Sprint 1 onward)

- Global prefix `/api`; versioning deferred until needed.
- DTOs validated by the global `ValidationPipe` (`whitelist: true`,
  `forbidNonWhitelisted: true`, `transform: true`).
- Errors share one envelope (see `HttpExceptionFilter`):

```json
{
  "statusCode": 400,
  "message": "…",
  "error": "BadRequestException",
  "timestamp": "…",
  "path": "/api/…"
}
```

- Auth: Bearer JWT in `Authorization` header (Sprint 1). Swagger documents it
  as the `access-token` security scheme.
