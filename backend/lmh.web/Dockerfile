FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/lmh.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
