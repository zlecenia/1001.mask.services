#!/bin/bash
# Skrypt do testowania pojedynczego modułu
# Usage: ./scripts/test-single-module.sh <module_name>

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Sprawdź argumenty
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Użycie: $0 <nazwa_modułu>${RESET}"
    echo -e "${YELLOW}Przykład: $0 loginForm${RESET}"
    exit 1
fi

MODULE_NAME="$1"
FEATURES_DIR="js/features"

echo -e "${BLUE}🧪 Testowanie modułu: $MODULE_NAME${RESET}"
echo "=================================================="

# Znajdź moduł
MODULE_PATH=""
for path in $(find "$FEATURES_DIR" -name "index.js" -type f | sed 's|/index.js||'); do
    if [[ "$path" == *"$MODULE_NAME"* ]]; then
        MODULE_PATH="$path"
        break
    fi
done

if [ -z "$MODULE_PATH" ]; then
    echo -e "${RED}❌ Nie znaleziono modułu: $MODULE_NAME${RESET}"
    echo -e "${YELLOW}Dostępne moduły:${RESET}"
    find "$FEATURES_DIR" -name "index.js" -type f | sed 's|/index.js||' | sed "s|$FEATURES_DIR/||" | sed 's/^/  - /'
    exit 1
fi

echo -e "${BLUE}📁 Ścieżka modułu: $MODULE_PATH${RESET}"

# Znajdź pliki testowe
TEST_FILES=$(find "$MODULE_PATH" -name "*.test.js" -type f)

if [ -z "$TEST_FILES" ]; then
    echo -e "${YELLOW}⚠️  Brak plików testowych dla modułu $MODULE_NAME${RESET}"
    exit 0
fi

echo -e "${BLUE}🧪 Pliki testowe:${RESET}"
echo "$TEST_FILES" | sed 's/^/  - /'
echo ""

# Uruchom testy
echo -e "${BLUE}🚀 Uruchamianie testów...${RESET}"
START_TIME=$(date +%s)

if npm test -- "$MODULE_PATH" --reporter=verbose; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo ""
    echo -e "${GREEN}✅ Moduł $MODULE_NAME przeszedł wszystkie testy! (${DURATION}s)${RESET}"
    exit 0
else
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo ""
    echo -e "${RED}❌ Moduł $MODULE_NAME nie przeszedł testów (${DURATION}s)${RESET}"
    exit 1
fi
