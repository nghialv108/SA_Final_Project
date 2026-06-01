FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/IamService.Api/IamService.Api.csproj src/IamService.Api/
COPY src/IamService.Application/IamService.Application.csproj src/IamService.Application/
COPY src/IamService.Domain/IamService.Domain.csproj src/IamService.Domain/
COPY src/IamService.Infrastructure/IamService.Infrastructure.csproj src/IamService.Infrastructure/
RUN dotnet restore src/IamService.Api/IamService.Api.csproj
COPY src/ src/
RUN dotnet publish src/IamService.Api/IamService.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:3001
EXPOSE 3001
ENTRYPOINT ["dotnet", "IamService.Api.dll"]
