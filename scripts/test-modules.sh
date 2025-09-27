#!/bin/bash
# Skrypt do testowania wszystkich modułów jeden po drugim
# Usage: ./scripts/test-modules.sh

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Konfiguracja
FEATURES_DIR="js/features"
TEST_RESULTS_FILE="module-test-results.json"
FAILED_MODULES=()
PASSED_MODULES=()

echo -e "${BLUE}🧪 Testowanie wszystkich modułów jeden po drugim...${RESET}"
echo "=================================================="

# Sprawdź czy katalog features istnieje
if [ ! -d "$FEATURES_DIR" ]; then
    echo -e "${RED}❌ Katalog $FEATURES_DIR nie istnieje${RESET}"
    exit 1
fi

# Znajdź wszystkie moduły (katalogi z plikiem index.js)
MODULES=$(find "$FEATURES_DIR" -name "index.js" -type f | sed 's|/index.js||' | sed "s|$FEATURES_DIR/||" | sort)

if [ -z "$MODULES" ]; then
    echo -e "${YELLOW}⚠️  Nie znaleziono żadnych modułów w $FEATURES_DIR${RESET}"
    exit 0
fi

echo -e "${BLUE}Znalezione moduły:${RESET}"
echo "$MODULES" | sed 's/^/  - /'
echo ""

# Inicjalizuj plik wyników
echo "{\"timestamp\": \"$(date -Iseconds)\", \"results\": []}" > "$TEST_RESULTS_FILE"

# Testuj każdy moduł osobno
for MODULE_PATH in $MODULES; do
    MODULE_NAME=$(basename "$MODULE_PATH")
    echo -e "${BLUE}📦 Testowanie modułu: $MODULE_NAME${RESET}"
    echo "--------------------------------------------------"
    
    # Znajdź pliki testowe dla tego modułu
    TEST_FILES=$(find "$FEATURES_DIR/$MODULE_PATH" -name "*.test.js" -type f)
    
    if [ -z "$TEST_FILES" ]; then
        echo -e "${YELLOW}⚠️  Brak plików testowych dla modułu $MODULE_NAME${RESET}"
        continue
    fi
    
    # Uruchom testy dla tego modułu
    START_TIME=$(date +%s)
    if npm test -- "$FEATURES_DIR/$MODULE_PATH" --reporter=json > "test-$MODULE_NAME.json" 2>&1; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${GREEN}✅ $MODULE_NAME - PASSED (${DURATION}s)${RESET}"
        PASSED_MODULES+=("$MODULE_NAME")
        
        # Dodaj wynik do pliku JSON
        TEMP_FILE=$(mktemp)
        jq --arg module "$MODULE_NAME" --arg status "PASSED" --argjson duration "$DURATION" \
           '.results += [{"module": $module, "status": $status, "duration": $duration}]' \
           "$TEST_RESULTS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$TEST_RESULTS_FILE"
    else
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${RED}❌ $MODULE_NAME - FAILED (${DURATION}s)${RESET}"
        FAILED_MODULES+=("$MODULE_NAME")
        
        # Pokaż błędy
        echo -e "${RED}Błędy:${RESET}"
        tail -20 "test-$MODULE_NAME.json" | sed 's/^/  /'
        
        # Dodaj wynik do pliku JSON
        TEMP_FILE=$(mktemp)
        jq --arg module "$MODULE_NAME" --arg status "FAILED" --argjson duration "$DURATION" \
           '.results += [{"module": $module, "status": $status, "duration": $duration}]' \
           "$TEST_RESULTS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$TEST_RESULTS_FILE"
    fi
    
    echo ""
done

# Podsumowanie
echo "=================================================="
echo -e "${BLUE}📊 PODSUMOWANIE TESTÓW MODUŁÓW${RESET}"
echo "=================================================="

TOTAL_MODULES=$((${#PASSED_MODULES[@]} + ${#FAILED_MODULES[@]}))
echo "Łącznie modułów: $TOTAL_MODULES"
echo -e "Przeszły: ${GREEN}${#PASSED_MODULES[@]}${RESET}"
echo -e "Nie przeszły: ${RED}${#FAILED_MODULES[@]}${RESET}"

if [ ${#PASSED_MODULES[@]} -gt 0 ]; then
    echo -e "\n${GREEN}✅ Moduły które przeszły testy:${RESET}"
    for module in "${PASSED_MODULES[@]}"; do
        echo "  - $module"
    done
fi

if [ ${#FAILED_MODULES[@]} -gt 0 ]; then
    echo -e "\n${RED}❌ Moduły które nie przeszły testów:${RESET}"
    for module in "${FAILED_MODULES[@]}"; do
        echo "  - $module"
    done
fi

# Wyczyść pliki tymczasowe
rm -f test-*.json

echo -e "\n${BLUE}📄 Szczegółowe wyniki zapisane w: $TEST_RESULTS_FILE${RESET}"

# Zwróć kod błędu jeśli jakieś testy nie przeszły
if [ ${#FAILED_MODULES[@]} -gt 0 ]; then
    exit 1
else
    echo -e "\n${GREEN}🎉 Wszystkie moduły przeszły testy!${RESET}"
    exit 0
fi
