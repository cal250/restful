#!/usr/bin/env sh
set -eu

mkdir -p backups
file="backups/fire-extinguisher-$(date +%Y%m%d-%H%M%S).sql"
docker compose exec -T postgres pg_dump -U tzw_app fire_extinguisher_management > "$file"
echo "Backup created: $file"
