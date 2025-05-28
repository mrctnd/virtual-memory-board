# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SanalAniPanosu.API.csproj", "."]
RUN dotnet restore "./SanalAniPanosu.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./SanalAniPanosu.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SanalAniPanosu.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create uploads directory
USER root
RUN mkdir -p /app/Uploads && chown app:app /app/Uploads
USER app

ENTRYPOINT ["dotnet", "SanalAniPanosu.API.dll"]
