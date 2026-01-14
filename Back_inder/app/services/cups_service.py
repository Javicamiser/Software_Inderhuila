import json

with open("app/data/cups.json", encoding="utf-8") as f:
    CUPS = json.load(f)

def buscar_cups(q: str):
    q = q.lower()
    return [
        c for c in CUPS
        if q in c["codigo"] or q in c["nombre"].lower()
    ][:20]
