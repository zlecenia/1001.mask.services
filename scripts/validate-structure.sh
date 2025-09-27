#!/bin/bash
# Skrypt do walidacji struktury projektu
# Usage: ./scripts/validate-structure.sh

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Liczniki
ERRORS=0
WARNINGS=0
CHECKS=0

echo -e "${BLUE}🔍 Walidacja struktury projektu...${RESET}"
echo "=================================================="

# Funkcja do sprawdzania
check_file() {
    local file="$1"
    local description="$2"
    local required="$3"
    
    CHECKS=$((CHECKS + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $description${RESET}"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $description${RESET}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠️  $description (opcjonalny)${RESET}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

check_dir() {
    local dir="$1"
    local description="$2"
    local required="$3"
    
    CHECKS=$((CHECKS + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $description${RESET}"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $description${RESET}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠️  $description (opcjonalny)${RESET}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Sprawdź podstawowe pliki projektu
echo -e "${BLUE}📁 Sprawdzanie podstawowych plików...${RESET}"
check_file "package.json" "package.json istnieje" "true"
check_file "vite.config.js" "vite.config.js istnieje" "true"
check_file "index.html" "index.html istnieje" "true"
check_file "Makefile" "Makefile istnieje" "true"
check_file "README.md" "README.md istnieje" "false"
check_file ".gitignore" ".gitignore istnieje" "false"

echo ""

# Sprawdź strukturę katalogów
echo -e "${BLUE}📂 Sprawdzanie struktury katalogów...${RESET}"
check_dir "js" "Katalog js/ istnieje" "true"
check_dir "js/features" "Katalog js/features/ istnieje" "true"
check_dir "js/services" "Katalog js/services/ istnieje" "true"
check_dir "scripts" "Katalog scripts/ istnieje" "true"
check_dir "docs" "Katalog docs/ istnieje" "false"
check_dir "dist" "Katalog dist/ istnieje (build)" "false"

echo ""

# Sprawdź skrypty
echo -e "${BLUE}🔧 Sprawdzanie skryptów...${RESET}"
check_file "scripts/test-modules.sh" "Skrypt test-modules.sh" "true"
check_file "scripts/test-single-module.sh" "Skrypt test-single-module.sh" "true"
check_file "scripts/analyze-modules.py" "Skrypt analyze-modules.py" "true"
check_file "scripts/generate-docs.sh" "Skrypt generate-docs.sh" "true"

# Sprawdź uprawnienia skryptów
if [ -f "scripts/test-modules.sh" ]; then
    if [ -x "scripts/test-modules.sh" ]; then
        echo -e "${GREEN}✅ Skrypt test-modules.sh ma uprawnienia wykonywania${RESET}"
    else
        echo -e "${YELLOW}⚠️  Skrypt test-modules.sh nie ma uprawnień wykonywania${RESET}"
        WARNINGS=$((WARNINGS + 1))
    fi
    CHECKS=$((CHECKS + 1))
fi

echo ""

# Sprawdź moduły
echo -e "${BLUE}📦 Sprawdzanie modułów...${RESET}"
MODULES=$(find js/features -name "index.js" -type f 2>/dev/null | sed 's|/index.js||' | sed 's|js/features/||' | sort)

if [ -z "$MODULES" ]; then
    echo -e "${RED}❌ Nie znaleziono żadnych modułów${RESET}"
    ERRORS=$((ERRORS + 1))
else
    MODULE_COUNT=$(echo "$MODULES" | wc -l)
    echo -e "${GREEN}✅ Znaleziono $MODULE_COUNT modułów${RESET}"
    
    # Sprawdź każdy moduł
    for MODULE_PATH in $MODULES; do
        MODULE_NAME=$(basename "$MODULE_PATH")
        FULL_PATH="js/features/$MODULE_PATH"
        
        echo -e "${BLUE}  📦 Sprawdzanie modułu: $MODULE_NAME${RESET}"
        
        # Sprawdź wymagane pliki modułu
        check_file "$FULL_PATH/index.js" "    index.js w $MODULE_NAME" "true"
        
        # Sprawdź pliki opcjonalne
        check_file "$FULL_PATH/README.md" "    README.md w $MODULE_NAME" "false"
        check_file "$FULL_PATH/config.json" "    config.json w $MODULE_NAME" "false"
        
        # Sprawdź testy
        TEST_FILES=$(find "$FULL_PATH" -name "*.test.js" -type f 2>/dev/null)
        if [ -n "$TEST_FILES" ]; then
            TEST_COUNT=$(echo "$TEST_FILES" | wc -l)
            echo -e "${GREEN}    ✅ $TEST_COUNT plików testowych w $MODULE_NAME${RESET}"
        else
            echo -e "${YELLOW}    ⚠️  Brak testów w $MODULE_NAME${RESET}"
            WARNINGS=$((WARNINGS + 1))
        fi
        CHECKS=$((CHECKS + 1))
    done
fi

echo ""

# Sprawdź package.json
echo -e "${BLUE}📋 Sprawdzanie package.json...${RESET}"
if [ -f "package.json" ]; then
    # Sprawdź czy zawiera wymagane pola
    if command -v jq >/dev/null 2>&1; then
        NAME=$(jq -r '.name // empty' package.json)
        VERSION=$(jq -r '.version // empty' package.json)
        SCRIPTS=$(jq -r '.scripts // empty' package.json)
        
        if [ -n "$NAME" ]; then
            echo -e "${GREEN}✅ package.json zawiera nazwę: $NAME${RESET}"
        else
            echo -e "${RED}❌ package.json nie zawiera nazwy${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
        
        if [ -n "$VERSION" ]; then
            echo -e "${GREEN}✅ package.json zawiera wersję: $VERSION${RESET}"
        else
            echo -e "${RED}❌ package.json nie zawiera wersji${RESET}"
            ERRORS=$((ERRORS + 1))
        fi
        
        if [ "$SCRIPTS" != "null" ] && [ -n "$SCRIPTS" ]; then
            echo -e "${GREEN}✅ package.json zawiera skrypty${RESET}"
        else
            echo -e "${YELLOW}⚠️  package.json nie zawiera skryptów${RESET}"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        CHECKS=$((CHECKS + 3))
    else
        echo -e "${YELLOW}⚠️  jq nie jest zainstalowane - pominięto szczegółową walidację package.json${RESET}"
        WARNINGS=$((WARNINGS + 1))
        CHECKS=$((CHECKS + 1))
    fi
fi

echo ""

# Sprawdź node_modules
echo -e "${BLUE}📚 Sprawdzanie zależności...${RESET}"
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo -e "${GREEN}✅ node_modules istnieje ($NODE_MODULES_SIZE)${RESET}"
else
    echo -e "${YELLOW}⚠️  node_modules nie istnieje - uruchom 'make install'${RESET}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

# Sprawdź pliki konfiguracyjne
echo ""
echo -e "${BLUE}⚙️  Sprawdzanie konfiguracji...${RESET}"
check_file "vite.config.js" "Konfiguracja Vite" "true"

if [ -f "vite.config.js" ]; then
    # Sprawdź czy zawiera podstawową konfigurację
    if grep -q "defineConfig" vite.config.js; then
        echo -e "${GREEN}✅ vite.config.js używa defineConfig${RESET}"
    else
        echo -e "${YELLOW}⚠️  vite.config.js nie używa defineConfig${RESET}"
        WARNINGS=$((WARNINGS + 1))
    fi
    CHECKS=$((CHECKS + 1))
fi

# Podsumowanie
echo ""
echo "=================================================="
echo -e "${BLUE}📊 PODSUMOWANIE WALIDACJI${RESET}"
echo "=================================================="

echo "Łączna liczba sprawdzeń: $CHECKS"
echo -e "Błędy: ${RED}$ERRORS${RESET}"
echo -e "Ostrzeżenia: ${YELLOW}$WARNINGS${RESET}"
echo -e "Pomyślne: ${GREEN}$((CHECKS - ERRORS - WARNINGS))${RESET}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Struktura projektu jest prawidłowa!${RESET}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "\n${YELLOW}⚠️  Struktura projektu jest w porządku, ale są ostrzeżenia${RESET}"
    exit 0
else
    echo -e "\n${RED}❌ Znaleziono błędy w strukturze projektu${RESET}"
    echo -e "${BLUE}💡 Rekomendacje:${RESET}"
    
    if [ $ERRORS -gt 0 ]; then
        echo "  • Napraw błędy oznaczone ❌"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo "  • Rozważ naprawienie ostrzeżeń oznaczonych ⚠️"
    fi
    
    exit 1
fi
