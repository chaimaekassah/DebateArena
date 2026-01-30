# Base Python
FROM python:3.11-slim

# Répertoire de travail
WORKDIR /app

# Copier requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code
COPY . .

# Lancer l'API avec port dynamique
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-5005}"]
