FROM python:3.11-slim

WORKDIR /app

# Copier requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le dossier chatbot (y compris app.py et chatbot_service.py)
COPY . .

# Variable d'environnement
ENV GOOGLE_API_KEY=""

# Lancer l'API
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5005"]
