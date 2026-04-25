# ============================================================
# MIDDLEWARE DE AUTENTICACIÓN JWT
# ============================================================
from fastapi import Request
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from app.core.config import settings

RUTAS_PUBLICAS = {
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
}

PREFIJOS_PUBLICOS = [
    "/api/v1/auth/",
    "/api/v1/catalogos",
    "/api/v1/cie11",
    "/api/v1/cups",
]

# Headers CORS que deben estar en TODAS las respuestas incluyendo 401
CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, ngrok-skip-browser-warning",
}


async def auth_middleware(request: Request, call_next):
    path = request.url.path
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    auth_header = request.headers.get("Authorization")
    print(f"DEBUG: {request.method} {path} | Auth: {auth_header[:20] if auth_header else 'NONE'}")
    # Preflight OPTIONS — siempre permitir con CORS headers
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, headers=CORS_HEADERS)

    # Rutas exactas públicas
    if path in RUTAS_PUBLICAS:
        return await call_next(request)

    # Prefijos públicos
    for prefijo in PREFIJOS_PUBLICOS:
        if path.startswith(prefijo):
            return await call_next(request)

    # Verificar token JWT
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Token de autenticación requerido"},
            headers=CORS_HEADERS,
        )

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        request.state.user_id  = payload.get("sub")
        request.state.user_rol = payload.get("rol")
    except JWTError:
        return JSONResponse(
            status_code=401,
            content={"detail": "Token inválido o expirado"},
            headers=CORS_HEADERS,
        )

    return await call_next(request)