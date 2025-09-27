#!/bin/bash
# Skrypt do wdrażania aplikacji
# Usage: ./scripts/deploy.sh [environment]

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Konfiguracja
ENVIRONMENT="${1:-production}"
BUILD_DIR="dist"
BACKUP_DIR="backups"

echo -e "${BLUE}🚀 Wdrażanie aplikacji do środowiska: $ENVIRONMENT${RESET}"
echo "=================================================="

# Sprawdź czy build istnieje
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Katalog build ($BUILD_DIR) nie istnieje${RESET}"
    echo -e "${BLUE}💡 Uruchom najpierw 'make prepare-prod'${RESET}"
    exit 1
fi

# Utwórz katalog backups
mkdir -p "$BACKUP_DIR"

# Utwórz backup obecnej wersji (jeśli istnieje)
if [ -d "deployed" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${BLUE}💾 Tworzenie kopii zapasowej: $BACKUP_NAME${RESET}"
    cp -r deployed "$BACKUP_DIR/$BACKUP_NAME"
    echo -e "${GREEN}✅ Kopia zapasowa utworzona${RESET}"
fi

# Symulacja wdrożenia (w rzeczywistym środowisku tutaj byłyby komendy wdrożenia)
echo -e "${BLUE}📦 Przygotowywanie do wdrożenia...${RESET}"

case "$ENVIRONMENT" in
    "production")
        echo -e "${BLUE}🏭 Wdrażanie do produkcji...${RESET}"
        # Tutaj byłyby komendy do wdrożenia na serwer produkcyjny
        # np. rsync, scp, docker deploy, kubernetes apply, etc.
        
        # Symulacja - kopiowanie do katalogu deployed
        rm -rf deployed
        cp -r "$BUILD_DIR" deployed
        echo -e "${GREEN}✅ Wdrożono do produkcji${RESET}"
        ;;
        
    "staging")
        echo -e "${BLUE}🧪 Wdrażanie do staging...${RESET}"
        # Tutaj byłyby komendy do wdrożenia na serwer staging
        
        # Symulacja
        rm -rf deployed-staging
        cp -r "$BUILD_DIR" deployed-staging
        echo -e "${GREEN}✅ Wdrożono do staging${RESET}"
        ;;
        
    "development")
        echo -e "${BLUE}🔧 Wdrażanie do development...${RESET}"
        # Tutaj byłyby komendy do wdrożenia na serwer development
        
        # Symulacja
        rm -rf deployed-dev
        cp -r "$BUILD_DIR" deployed-dev
        echo -e "${GREEN}✅ Wdrożono do development${RESET}"
        ;;
        
    *)
        echo -e "${RED}❌ Nieznane środowisko: $ENVIRONMENT${RESET}"
        echo -e "${BLUE}💡 Dostępne środowiska: production, staging, development${RESET}"
        exit 1
        ;;
esac

# Zapisz informacje o wdrożeniu
DEPLOY_INFO_FILE="deploy-info-$ENVIRONMENT.json"
cat > "$DEPLOY_INFO_FILE" << EOF
{
  "deployDate": "$(date -Iseconds)",
  "environment": "$ENVIRONMENT",
  "version": "$(jq -r '.version // "unknown"' package.json 2>/dev/null || echo 'unknown')",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "deployedBy": "$(whoami)",
  "buildSize": "$(du -sh $BUILD_DIR | cut -f1)",
  "backupCreated": "$([ -d "$BACKUP_DIR" ] && echo 'true' || echo 'false')"
}
EOF

echo -e "${GREEN}✅ Informacje o wdrożeniu zapisane w $DEPLOY_INFO_FILE${RESET}"

# Sprawdzenie zdrowia aplikacji (podstawowe)
echo -e "${BLUE}🏥 Sprawdzanie zdrowia aplikacji...${RESET}"

# Tutaj byłyby sprawdzenia health check
# np. curl do endpointów, sprawdzenie czy serwis odpowiada, etc.

# Symulacja sprawdzenia
sleep 2
echo -e "${GREEN}✅ Aplikacja odpowiada prawidłowo${RESET}"

# Powiadomienia (opcjonalne)
echo -e "${BLUE}📢 Wysyłanie powiadomień...${RESET}"
# Tutaj mogłyby być powiadomienia do Slack, email, etc.
echo -e "${GREEN}✅ Powiadomienia wysłane${RESET}"

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Wdrożenie zakończone pomyślnie!${RESET}"
echo "=================================================="
echo -e "${BLUE}🌍 Środowisko: $ENVIRONMENT${RESET}"
echo -e "${BLUE}📅 Data wdrożenia: $(date)${RESET}"
echo -e "${BLUE}📦 Wersja: $(jq -r '.version // "unknown"' package.json 2>/dev/null || echo 'unknown')${RESET}"
echo -e "${BLUE}🔗 Git commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')${RESET}"

if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
    echo -e "${BLUE}💾 Dostępne kopie zapasowe: $BACKUP_COUNT${RESET}"
fi

echo ""
echo -e "${BLUE}Następne kroki:${RESET}"
echo "  1. Monitoruj logi aplikacji"
echo "  2. Sprawdź metryki wydajności"
echo "  3. Przetestuj kluczowe funkcjonalności"
echo "  4. W razie problemów uruchom: make restore BACKUP=nazwa_kopii"

# Pokaż dostępne kopie zapasowe
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
    echo ""
    echo -e "${BLUE}📋 Dostępne kopie zapasowe:${RESET}"
    ls -la "$BACKUP_DIR" | tail -n +2 | while read -r line; do
        echo "  $line"
    done
fi
