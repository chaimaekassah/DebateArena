# Utiliser une image Python officielle comme base
# FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
# WORKDIR /app

# Copier le fichier requirements.txt
# COPY requirements.txt .

# Installer les dépendances Python
# RUN pip install --no-cache-dir -r requirements.txt 
#no-cache-dir :Option qui dit à pip de ne pas sauvegarder les fichiers de cache téléchargés

# Copier le script app.py dans le conteneur
# COPY app.py .

# Définir la variable d'environnement pour l'API key (à remplacer lors de l'exécution)
# ENV GOOGLE_API_KEY=""

# Lancer l'API
# CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY chatbot /app/chatbot
COPY .env /app/.env

CMD ["uvicorn", "chatbot.app:app", "--host", "0.0.0.0", "--port", "8000"]
