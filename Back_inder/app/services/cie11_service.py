# ============================================================
# SERVICIO CIE-11 — API oficial OMS
# OAuth2 con caché de token (1 hora)
# Archivo: app/services/cie11_service.py
# ============================================================
import time
import requests

# ── Credenciales OMS ─────────────────────────────────────────
CLIENT_ID     = "d8a95e49-1091-41f1-a852-02ca89475938_1c8063c2-3a13-4f4e-a619-0a2992ed2cfa"
CLIENT_SECRET = "70tzDCP/AUNP/sZULtLzMqvu73raKScQJEqkZpyTnTk="
TOKEN_URL     = "https://icdaccessmanagement.who.int/connect/token"
API_BASE      = "https://id.who.int/icd/release/11/2024-01/mms"

# ── Caché del token ───────────────────────────────────────────
_token_cache: dict = {"access_token": None, "expires_at": 0}


def _get_token() -> str:
    now = time.time()
    if _token_cache["access_token"] and now < _token_cache["expires_at"] - 60:
        return _token_cache["access_token"]

    resp = requests.post(
        TOKEN_URL,
        data={
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "scope":         "icdapi_access",
            "grant_type":    "client_credentials",
        },
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"]   = now + data.get("expires_in", 3600)
    return _token_cache["access_token"]


def _headers() -> dict:
    return {
        "Authorization":  f"Bearer {_get_token()}",
        "Accept":         "application/json",
        "Accept-Language": "es",
        "API-Version":    "v2",
    }


def buscar_cie11(query: str, max_results: int = 20) -> list[dict]:
    """
    Busca códigos CIE-11 por nombre o código.
    Retorna lista de {codigo, nombre, descripcion}.
    """
    try:
        resp = requests.get(
            f"{API_BASE}/search",
            params={
                "q":                          query,
                "flatResults":                True,
                "highlightingEnabled":        False,
                "medicalCodingMode":          True,
                "includeKeywordResult":       True,
                "useFlexisearch":             True,
                "subtreeFilterUsage":         "includedChildrenOnly",
            },
            headers=_headers(),
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        resultados = []
        for item in data.get("destinationEntities", [])[:max_results]:
            codigo = item.get("theCode", "")
            nombre = item.get("title", "")
            # Limpiar HTML del nombre si viene con tags
            import re
            nombre = re.sub(r"<[^>]+>", "", nombre)
            if codigo and nombre:
                resultados.append({
                    "codigo":      codigo,
                    "nombre":      nombre,
                    "descripcion": item.get("definition", ""),
                })

        return resultados

    except Exception as e:
        raise Exception(f"Error consultando CIE-11: {str(e)}")