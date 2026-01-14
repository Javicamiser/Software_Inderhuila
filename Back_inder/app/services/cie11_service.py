import requests

CIE11_API_URL = "https://id.who.int/icd/release/11/2024-01/mms/search"
CIE11_TOKEN = "TU_TOKEN_OMS"

HEADERS = {
    "Authorization": f"Bearer {CIE11_TOKEN}",
    "Accept": "application/json",
    "Accept-Language": "es"
}

def buscar_cie11(q: str):
    params = {
        "q": q,
        "useFlexisearch": "true"
    }

    response = requests.get(
        CIE11_API_URL,
        headers=HEADERS,
        params=params,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    resultados = []
    for item in data.get("destinationEntities", []):
        resultados.append({
            "codigo": item.get("theCode"),
            "nombre": item.get("title", {}).get("@value")
        })

    return resultados
