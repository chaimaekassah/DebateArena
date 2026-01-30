FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src

# Build du projet (sans exécuter les tests ici)
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copier le fichier .jar depuis l’étape de build
COPY --from=build /workspace/target/*.jar app.jar

# Exposer le port Spring Boot
EXPOSE 8080

# Lancer l’application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
