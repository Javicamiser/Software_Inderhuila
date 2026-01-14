#!/bin/bash

# Script para ejecutar la aplicación INDER

# Crear directorio de uploads si no existe
mkdir -p uploads

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar la aplicación
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
