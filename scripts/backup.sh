#!/bin/bash
# Skrypt do tworzenia kopii zapasowych
# Usage: ./scripts/backup.sh [nazwa_kopii]

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Konfiguracja
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="${1:-backup-$TIMESTAMP}"
PROJECT_NAME="1001.mask.services"

echo -e "${BLUE}💾 Tworzenie kopii zapasowej: $BACKUP_NAME${RESET}"
echo "=================================================="

# Utwórz katalog backups
mkdir -p "$BACKUP_DIR"

# Sprawdź czy kopia o tej nazwie już istnieje
if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    echo -e "${YELLOW}⚠️  Kopia zapasowa '$BACKUP_NAME' już istnieje${RESET}"
    read -p "Czy chcesz ją nadpisać? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}💡 Anulowano. Użyj innej nazwy lub usuń istniejącą kopię${RESET}"
        exit 0
    fi
    rm -rf "$BACKUP_DIR/$BACKUP_NAME"
fi

# Utwórz katalog kopii zapasowej
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo -e "${BLUE}📁 Kopiowanie plików...${RESET}"

# Lista plików/katalogów do skopiowania
ITEMS_TO_BACKUP=(
    "js/"
    "scripts/"
    "docs/"
    "package.json"
    "package-lock.json"
    "vite.config.js"
    "index.html"
    "Makefile"
    "README.md"
    ".gitignore"
)

# Lista plików opcjonalnych
OPTIONAL_ITEMS=(
    "dist/"
    "deployed/"
    "test-results.json"
    "module-analysis-results.json"
    "module-test-results.json"
)

# Kopiuj wymagane elementy
for item in "${ITEMS_TO_BACKUP[@]}"; do
    if [ -e "$item" ]; then
        echo -e "${GREEN}✅ Kopiowanie: $item${RESET}"
        cp -r "$item" "$BACKUP_DIR/$BACKUP_NAME/"
    else
        echo -e "${YELLOW}⚠️  Pominięto (nie istnieje): $item${RESET}"
    fi
done

# Kopiuj opcjonalne elementy
echo -e "${BLUE}📦 Kopiowanie plików opcjonalnych...${RESET}"
for item in "${OPTIONAL_ITEMS[@]}"; do
    if [ -e "$item" ]; then
        echo -e "${GREEN}✅ Kopiowanie: $item${RESET}"
        cp -r "$item" "$BACKUP_DIR/$BACKUP_NAME/"
    else
        echo -e "${BLUE}ℹ️  Pominięto (nie istnieje): $item${RESET}"
    fi
done

# Utwórz plik metadanych kopii zapasowej
METADATA_FILE="$BACKUP_DIR/$BACKUP_NAME/backup-metadata.json"
cat > "$METADATA_FILE" << EOF
{
  "backupName": "$BACKUP_NAME",
  "projectName": "$PROJECT_NAME",
  "createdDate": "$(date -Iseconds)",
  "createdBy": "$(whoami)",
  "hostname": "$(hostname)",
  "version": "$(jq -r '.version // "unknown"' package.json 2>/dev/null || echo 'unknown')",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "gitStatus": "$(git status --porcelain 2>/dev/null | wc -l) uncommitted changes",
  "nodeVersion": "$(node --version 2>/dev/null || echo 'unknown')",
  "npmVersion": "$(npm --version 2>/dev/null || echo 'unknown')",
  "backupSize": "$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)",
  "filesCount": $(find "$BACKUP_DIR/$BACKUP_NAME" -type f | wc -l)
}
EOF

# Utwórz plik README dla kopii zapasowej
README_FILE="$BACKUP_DIR/$BACKUP_NAME/BACKUP-README.md"
cat > "$README_FILE" << EOF
# Kopia zapasowa: $BACKUP_NAME

## Informacje o kopii zapasowej

- **Nazwa:** $BACKUP_NAME
- **Projekt:** $PROJECT_NAME
- **Data utworzenia:** $(date)
- **Utworzona przez:** $(whoami)
- **Rozmiar:** $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)

## Zawartość

$(find "$BACKUP_DIR/$BACKUP_NAME" -maxdepth 2 -type d | sed 's|^'"$BACKUP_DIR/$BACKUP_NAME"'||' | sed 's|^/||' | grep -v '^$' | sort | sed 's/^/- /')

## Przywracanie

Aby przywrócić tę kopię zapasową:

\`\`\`bash
make restore BACKUP=$BACKUP_NAME
\`\`\`

lub ręcznie:

\`\`\`bash
./scripts/restore.sh $BACKUP_NAME
\`\`\`

## Metadane

Zobacz plik \`backup-metadata.json\` dla szczegółowych informacji technicznych.
EOF

# Oblicz rozmiar kopii zapasowej
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
FILES_COUNT=$(find "$BACKUP_DIR/$BACKUP_NAME" -type f | wc -l)

# Aktualizuj metadane z rzeczywistym rozmiarem
TEMP_FILE=$(mktemp)
jq --arg size "$BACKUP_SIZE" --argjson count "$FILES_COUNT" \
   '.backupSize = $size | .filesCount = $count' \
   "$METADATA_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$METADATA_FILE"

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Kopia zapasowa utworzona pomyślnie!${RESET}"
echo "=================================================="
echo -e "${BLUE}📁 Lokalizacja: $BACKUP_DIR/$BACKUP_NAME${RESET}"
echo -e "${BLUE}📊 Rozmiar: $BACKUP_SIZE${RESET}"
echo -e "${BLUE}📄 Liczba plików: $FILES_COUNT${RESET}"
echo -e "${BLUE}📅 Data: $(date)${RESET}"

# Pokaż listę wszystkich kopii zapasowych
echo ""
echo -e "${BLUE}📋 Wszystkie dostępne kopie zapasowe:${RESET}"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
    ls -la "$BACKUP_DIR" | tail -n +2 | while read -r line; do
        backup_name=$(echo "$line" | awk '{print $NF}')
        backup_size=$(echo "$line" | awk '{print $5}')
        backup_date=$(echo "$line" | awk '{print $6, $7, $8}')
        echo "  📦 $backup_name ($backup_date)"
    done
else
    echo "  (brak innych kopii zapasowych)"
fi

echo ""
echo -e "${BLUE}💡 Przydatne komendy:${RESET}"
echo "  make restore BACKUP=$BACKUP_NAME  # Przywróć tę kopię"
echo "  ls -la $BACKUP_DIR/               # Pokaż wszystkie kopie"
echo "  rm -rf $BACKUP_DIR/$BACKUP_NAME   # Usuń tę kopię"

# Sprawdź czy nie ma za dużo kopii zapasowych
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Masz $BACKUP_COUNT kopii zapasowych${RESET}"
    echo -e "${BLUE}💡 Rozważ usunięcie starszych kopii aby zaoszczędzić miejsce${RESET}"
fi
