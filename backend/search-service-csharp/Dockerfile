FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/SearchService.Api/SearchService.Api.csproj src/SearchService.Api/
RUN dotnet restore src/SearchService.Api/SearchService.Api.csproj
COPY src/ src/
RUN dotnet publish src/SearchService.Api/SearchService.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:3004
EXPOSE 3004
ENTRYPOINT ["dotnet", "SearchService.Api.dll"]
