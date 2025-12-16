FROM maven:3.9.6-eclipse-temurin-17 as build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
ENV JAVA_OPTS=""
COPY --from=build /app/target/egresados-*.jar /app/app.jar
RUN mkdir -p /app/uploads/news/images /app/uploads/news/attachments && chmod -R 755 /app/uploads
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
