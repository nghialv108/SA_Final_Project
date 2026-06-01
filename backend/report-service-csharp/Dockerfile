FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/ReportService.Api/ReportService.Api.csproj src/ReportService.Api/
RUN dotnet restore src/ReportService.Api/ReportService.Api.csproj
COPY src/ src/
RUN dotnet publish src/ReportService.Api/ReportService.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:3005
EXPOSE 3005
ENTRYPOINT ["dotnet", "ReportService.Api.dll"]
