param(
  [string]$OutputDirectory = "backups"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$file = Join-Path $OutputDirectory "fire-extinguisher-$timestamp.sql"
docker compose exec -T postgres pg_dump -U tzw_app fire_extinguisher_management > $file
Write-Output "Backup created: $file"
