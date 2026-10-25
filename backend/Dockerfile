# Multi-stage Dockerfile for Remaindr Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8085
EXPOSE 8085

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
