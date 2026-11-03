# Stage 1: Build Spring Boot JAR
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build application skipping tests for speed in Docker setup
RUN mvn clean package -DskipTests

# Stage 2: Run Spring Boot application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
