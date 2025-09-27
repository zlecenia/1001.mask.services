#!/bin/bash
# Skrypt do przygotowania aplikacji do produkcji
# Usage: ./scripts/prepare-production.sh

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

echo -e "${BLUE}🚀 Przygotowywanie do produkcji...${RESET}"
echo "=================================================="

# Sprawdź czy wszystkie testy przechodzą (opcjonalnie)
if [ "${SKIP_TESTS:-false}" != "true" ]; then
    echo -e "${BLUE}🧪 Sprawdzanie testów...${RESET}"
    if npm test; then
        echo -e "${GREEN}✅ Wszystkie testy przechodzą${RESET}"
    else
        echo -e "${RED}❌ Testy nie przechodzą - przerwano przygotowanie${RESET}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Pominięto testy (SKIP_TESTS=true)${RESET}"
fi

# Sprawdź strukturę projektu
echo -e "${BLUE}🔍 Walidacja struktury...${RESET}"
if ./scripts/validate-structure.sh; then
    echo -e "${GREEN}✅ Struktura projektu jest prawidłowa${RESET}"
else
    echo -e "${YELLOW}⚠️  Znaleziono problemy w strukturze, ale kontynuujemy...${RESET}"
fi

# Wyczyść poprzedni build
echo -e "${BLUE}🧹 Czyszczenie poprzedniego build...${RESET}"
rm -rf dist/
echo -e "${GREEN}✅ Wyczyszczono${RESET}"

# Zbuduj aplikację
echo -e "${BLUE}🏗️  Budowanie aplikacji...${RESET}"
BUILD_CMD="npm run build"
if [ "${SKIP_TESTS:-false}" = "true" ]; then
    BUILD_CMD="npm run build:fast"
fi

if $BUILD_CMD; then
    echo -e "${GREEN}✅ Aplikacja zbudowana${RESET}"
else
    echo -e "${RED}❌ Błąd podczas budowania${RESET}"
    exit 1
fi

# Sprawdź rozmiar build
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${BLUE}📦 Rozmiar build: $BUILD_SIZE${RESET}"
    
    # Ostrzeż jeśli build jest bardzo duży
    BUILD_SIZE_BYTES=$(du -s dist | cut -f1)
    if [ "$BUILD_SIZE_BYTES" -gt 10240 ]; then  # > 10MB
        echo -e "${YELLOW}⚠️  Build jest duży ($BUILD_SIZE) - rozważ optymalizację${RESET}"
    fi
fi

# Wygeneruj dokumentację
echo -e "${BLUE}📚 Generowanie dokumentacji...${RESET}"
./scripts/generate-docs.sh

# Utwórz plik z informacjami o build
BUILD_INFO_FILE="dist/build-info.json"
cat > "$BUILD_INFO_FILE" << EOF
{
  "buildDate": "$(date -Iseconds)",
  "version": "$(jq -r '.version // "unknown"' package.json 2>/dev/null || echo 'unknown')",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "buildSize": "$BUILD_SIZE",
  "environment": "production"
}
EOF

echo -e "${GREEN}✅ Informacje o build zapisane w $BUILD_INFO_FILE${RESET}"

# Sprawdź czy wszystkie wymagane pliki są w build
echo -e "${BLUE}🔍 Sprawdzanie zawartości build...${RESET}"
REQUIRED_FILES=("index.html" "assets")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "dist/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Wszystkie wymagane pliki są w build${RESET}"
else
    echo -e "${RED}❌ Brakujące pliki w build:${RESET}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

# Sprawdź bezpieczeństwo (podstawowe)
echo -e "${BLUE}🔒 Sprawdzanie bezpieczeństwa...${RESET}"
if command -v npm >/dev/null 2>&1; then
    if npm audit --audit-level=high --production; then
        echo -e "${GREEN}✅ Brak krytycznych luk bezpieczeństwa${RESET}"
    else
        echo -e "${YELLOW}⚠️  Znaleziono potencjalne problemy bezpieczeństwa${RESET}"
        echo -e "${BLUE}💡 Uruchom 'npm audit fix' aby naprawić${RESET}"
    fi
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Aplikacja gotowa do produkcji!${RESET}"
echo "=================================================="
echo -e "${BLUE}📁 Build znajduje się w: dist/${RESET}"
echo -e "${BLUE}📊 Rozmiar: $BUILD_SIZE${RESET}"
echo -e "${BLUE}📅 Data: $(date)${RESET}"
echo ""
echo -e "${BLUE}Następne kroki:${RESET}"
echo "  1. Przetestuj build lokalnie"
echo "  2. Uruchom 'make deploy' aby wdrożyć"
echo "  3. Monitoruj aplikację po wdrożeniu"
