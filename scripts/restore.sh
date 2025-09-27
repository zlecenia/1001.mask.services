#!/bin/bash
# Skrypt do przywracania z kopii zapasowej
# Usage: ./scripts/restore.sh <nazwa_kopii>

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Sprawdź argumenty
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Użycie: $0 <nazwa_kopii>${RESET}"
    echo -e "${BLUE}💡 Dostępne kopie zapasowe:${RESET}"
    if [ -d "backups" ] && [ "$(ls -A backups)" ]; then
        ls -1 backups/ | sed 's/^/  - /'
    else
        echo "  (brak kopii zapasowych)"
    fi
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_DIR="backups"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo -e "${BLUE}🔄 Przywracanie z kopii zapasowej: $BACKUP_NAME${RESET}"
echo "=================================================="

# Sprawdź czy kopia zapasowa istnieje
if [ ! -d "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Kopia zapasowa '$BACKUP_NAME' nie istnieje${RESET}"
    echo -e "${BLUE}💡 Dostępne kopie zapasowe:${RESET}"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        ls -1 "$BACKUP_DIR/" | sed 's/^/  - /'
    else
        echo "  (brak kopii zapasowych)"
    fi
    exit 1
fi

# Pokaż informacje o kopii zapasowej
if [ -f "$BACKUP_PATH/backup-metadata.json" ]; then
    echo -e "${BLUE}📋 Informacje o kopii zapasowej:${RESET}"
    if command -v jq >/dev/null 2>&1; then
        echo "  Nazwa: $(jq -r '.backupName // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
        echo "  Data utworzenia: $(jq -r '.createdDate // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
        echo "  Utworzona przez: $(jq -r '.createdBy // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
        echo "  Wersja: $(jq -r '.version // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
        echo "  Git commit: $(jq -r '.gitCommit // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
        echo "  Rozmiar: $(jq -r '.backupSize // "unknown"' "$BACKUP_PATH/backup-metadata.json")"
    else
        echo "  (zainstaluj jq aby zobaczyć szczegóły)"
    fi
    echo ""
fi

# Ostrzeżenie
echo -e "${YELLOW}⚠️  UWAGA: Ta operacja nadpisze obecne pliki!${RESET}"
echo -e "${BLUE}Pliki które zostaną nadpisane:${RESET}"

# Pokaż co zostanie nadpisane
ITEMS_TO_RESTORE=$(find "$BACKUP_PATH" -maxdepth 1 -type f -o -type d | grep -v "^$BACKUP_PATH$" | sed "s|^$BACKUP_PATH/||" | grep -v "backup-metadata.json\|BACKUP-README.md")

for item in $ITEMS_TO_RESTORE; do
    if [ -e "$item" ]; then
        echo -e "  ${YELLOW}📝 $item (zostanie nadpisany)${RESET}"
    else
        echo -e "  ${GREEN}📄 $item (nowy plik)${RESET}"
    fi
done

echo ""
read -p "Czy chcesz kontynuować? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}💡 Anulowano przywracanie${RESET}"
    exit 0
fi

# Utwórz kopię zapasową obecnego stanu przed przywracaniem
CURRENT_BACKUP_NAME="before-restore-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}💾 Tworzenie kopii zapasowej obecnego stanu: $CURRENT_BACKUP_NAME${RESET}"
./scripts/backup.sh "$CURRENT_BACKUP_NAME" > /dev/null 2>&1
echo -e "${GREEN}✅ Kopia zapasowa utworzona${RESET}"

# Przywracanie
echo -e "${BLUE}🔄 Przywracanie plików...${RESET}"

# Usuń node_modules przed przywracaniem (będzie przeinstalowany)
if [ -d "node_modules" ]; then
    echo -e "${BLUE}🗑️  Usuwanie node_modules...${RESET}"
    rm -rf node_modules
fi

# Przywróć pliki z kopii zapasowej
for item in $ITEMS_TO_RESTORE; do
    if [ -e "$BACKUP_PATH/$item" ]; then
        echo -e "${GREEN}✅ Przywracanie: $item${RESET}"
        
        # Usuń istniejący plik/katalog
        if [ -e "$item" ]; then
            rm -rf "$item"
        fi
        
        # Skopiuj z kopii zapasowej
        cp -r "$BACKUP_PATH/$item" "$item"
    fi
done

# Przywróć uprawnienia skryptów
if [ -d "scripts" ]; then
    echo -e "${BLUE}🔧 Przywracanie uprawnień skryptów...${RESET}"
    chmod +x scripts/*.sh 2>/dev/null || true
    echo -e "${GREEN}✅ Uprawnienia przywrócone${RESET}"
fi

# Reinstaluj zależności
echo -e "${BLUE}📦 Reinstalacja zależności...${RESET}"
if [ -f "package.json" ]; then
    if npm install; then
        echo -e "${GREEN}✅ Zależności zainstalowane${RESET}"
    else
        echo -e "${YELLOW}⚠️  Problemy z instalacją zależności${RESET}"
    fi
else
    echo -e "${YELLOW}⚠️  Brak package.json - pominięto instalację zależności${RESET}"
fi

# Sprawdź czy przywracanie się powiodło
echo -e "${BLUE}🔍 Sprawdzanie przywróconego stanu...${RESET}"

# Podstawowe sprawdzenia
CHECKS_PASSED=0
TOTAL_CHECKS=0

# Sprawdź package.json
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json istnieje${RESET}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ package.json nie istnieje${RESET}"
fi

# Sprawdź Makefile
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "Makefile" ]; then
    echo -e "${GREEN}✅ Makefile istnieje${RESET}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ Makefile nie istnieje${RESET}"
fi

# Sprawdź katalog js
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "js" ]; then
    echo -e "${GREEN}✅ Katalog js/ istnieje${RESET}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ Katalog js/ nie istnieje${RESET}"
fi

# Sprawdź katalog scripts
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "scripts" ]; then
    echo -e "${GREEN}✅ Katalog scripts/ istnieje${RESET}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}❌ Katalog scripts/ nie istnieje${RESET}"
fi

# Utwórz plik z informacjami o przywracaniu
RESTORE_INFO_FILE="restore-info.json"
cat > "$RESTORE_INFO_FILE" << EOF
{
  "restoreDate": "$(date -Iseconds)",
  "restoredFrom": "$BACKUP_NAME",
  "restoredBy": "$(whoami)",
  "backupCreatedBefore": "$CURRENT_BACKUP_NAME",
  "checksTotal": $TOTAL_CHECKS,
  "checksPassed": $CHECKS_PASSED,
  "success": $([ $CHECKS_PASSED -eq $TOTAL_CHECKS ] && echo 'true' || echo 'false')
}
EOF

echo ""
echo "=================================================="
if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ Przywracanie zakończone pomyślnie!${RESET}"
else
    echo -e "${YELLOW}⚠️  Przywracanie zakończone z ostrzeżeniami${RESET}"
fi
echo "=================================================="
echo -e "${BLUE}📁 Przywrócono z kopii: $BACKUP_NAME${RESET}"
echo -e "${BLUE}💾 Kopia zapasowa przed przywracaniem: $CURRENT_BACKUP_NAME${RESET}"
echo -e "${BLUE}📊 Sprawdzenia: $CHECKS_PASSED/$TOTAL_CHECKS przeszły${RESET}"
echo -e "${BLUE}📅 Data: $(date)${RESET}"

echo ""
echo -e "${BLUE}💡 Następne kroki:${RESET}"
echo "  1. Sprawdź czy aplikacja działa: make dev"
echo "  2. Uruchom testy: make test"
echo "  3. W razie problemów przywróć poprzedni stan:"
echo "     make restore BACKUP=$CURRENT_BACKUP_NAME"

echo ""
echo -e "${BLUE}📋 Dostępne kopie zapasowe:${RESET}"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
    ls -la "$BACKUP_DIR" | tail -n +2 | while read -r line; do
        backup_name=$(echo "$line" | awk '{print $NF}')
        backup_date=$(echo "$line" | awk '{print $6, $7, $8}')
        if [ "$backup_name" = "$CURRENT_BACKUP_NAME" ]; then
            echo -e "  ${GREEN}📦 $backup_name ($backup_date) [kopia przed przywracaniem]${RESET}"
        elif [ "$backup_name" = "$BACKUP_NAME" ]; then
            echo -e "  ${BLUE}📦 $backup_name ($backup_date) [przywrócona]${RESET}"
        else
            echo "  📦 $backup_name ($backup_date)"
        fi
    done
fi
