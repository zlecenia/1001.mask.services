#!/bin/bash
# Skrypt do generowania dokumentacji projektu
# Usage: ./scripts/generate-docs.sh

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Konfiguracja
DOCS_DIR="docs"
FEATURES_DIR="js/features"
OUTPUT_FILE="$DOCS_DIR/modules-documentation.md"

echo -e "${BLUE}📚 Generowanie dokumentacji...${RESET}"
echo "=================================================="

# Utwórz katalog docs jeśli nie istnieje
mkdir -p "$DOCS_DIR"

# Rozpocznij plik dokumentacji
cat > "$OUTPUT_FILE" << 'EOF'
# Dokumentacja Modułów - 1001.mask.services

Automatycznie wygenerowana dokumentacja wszystkich modułów w systemie.

## Spis treści

EOF

# Znajdź wszystkie moduły
MODULES=$(find "$FEATURES_DIR" -name "index.js" -type f | sed 's|/index.js||' | sed "s|$FEATURES_DIR/||" | sort)

if [ -z "$MODULES" ]; then
    echo -e "${YELLOW}⚠️  Nie znaleziono żadnych modułów${RESET}"
    exit 0
fi

echo -e "${BLUE}Generowanie dokumentacji dla modułów:${RESET}"

# Dodaj spis treści
for MODULE_PATH in $MODULES; do
    MODULE_NAME=$(basename "$MODULE_PATH")
    VERSION=$(basename "$(dirname "$FEATURES_DIR/$MODULE_PATH")")
    echo "- [$MODULE_NAME v$VERSION](#$MODULE_NAME-v$VERSION)" >> "$OUTPUT_FILE"
    echo "  - $MODULE_NAME v$VERSION"
done

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Generuj dokumentację dla każdego modułu
for MODULE_PATH in $MODULES; do
    MODULE_NAME=$(basename "$MODULE_PATH")
    VERSION=$(basename "$(dirname "$FEATURES_DIR/$MODULE_PATH")")
    FULL_PATH="$FEATURES_DIR/$MODULE_PATH"
    
    echo -e "${BLUE}📦 Dokumentowanie: $MODULE_NAME v$VERSION${RESET}"
    
    # Nagłówek modułu
    cat >> "$OUTPUT_FILE" << EOF
## $MODULE_NAME v$VERSION

**Ścieżka:** \`$MODULE_PATH\`  
**Wersja:** $VERSION  
**Data generowania:** $(date '+%Y-%m-%d %H:%M:%S')

EOF

    # Sprawdź czy istnieje README
    if [ -f "$FULL_PATH/README.md" ]; then
        echo "### Opis" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        # Dodaj zawartość README (pomiń pierwszy nagłówek)
        tail -n +2 "$FULL_PATH/README.md" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    else
        echo "### Opis" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "*Brak dokumentacji README.md*" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi

    # Analiza plików
    echo "### Struktura plików" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    FILES=$(find "$FULL_PATH" -type f | sort)
    for file in $FILES; do
        RELATIVE_FILE=$(echo "$file" | sed "s|$FULL_PATH/||")
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
        echo "- \`$RELATIVE_FILE\` (${FILE_SIZE} bytes)" >> "$OUTPUT_FILE"
    done
    echo "" >> "$OUTPUT_FILE"

    # Analiza zależności z index.js
    if [ -f "$FULL_PATH/index.js" ]; then
        echo "### Zależności" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        IMPORTS=$(grep -E "^import.*from|require\(" "$FULL_PATH/index.js" 2>/dev/null || true)
        if [ -n "$IMPORTS" ]; then
            echo "\`\`\`javascript" >> "$OUTPUT_FILE"
            echo "$IMPORTS" >> "$OUTPUT_FILE"
            echo "\`\`\`" >> "$OUTPUT_FILE"
        else
            echo "*Brak zewnętrznych zależności*" >> "$OUTPUT_FILE"
        fi
        echo "" >> "$OUTPUT_FILE"
    fi

    # Analiza testów
    TEST_FILES=$(find "$FULL_PATH" -name "*.test.js" -type f)
    if [ -n "$TEST_FILES" ]; then
        echo "### Testy" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        for test_file in $TEST_FILES; do
            TEST_NAME=$(basename "$test_file")
            TEST_COUNT=$(grep -c "it\|test\|describe" "$test_file" 2>/dev/null || echo "0")
            echo "- \`$TEST_NAME\` - $TEST_COUNT testów" >> "$OUTPUT_FILE"
        done
        echo "" >> "$OUTPUT_FILE"
    else
        echo "### Testy" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "*Brak testów*" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi

    # Analiza konfiguracji
    if [ -f "$FULL_PATH/config.json" ]; then
        echo "### Konfiguracja" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "\`\`\`json" >> "$OUTPUT_FILE"
        cat "$FULL_PATH/config.json" >> "$OUTPUT_FILE"
        echo "\`\`\`" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi

    # Analiza metadanych z index.js
    if [ -f "$FULL_PATH/index.js" ]; then
        echo "### Metadane" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        # Wyciągnij metadane
        METADATA=$(grep -A 20 "metadata.*{" "$FULL_PATH/index.js" 2>/dev/null || true)
        if [ -n "$METADATA" ]; then
            echo "\`\`\`javascript" >> "$OUTPUT_FILE"
            echo "$METADATA" | head -20 >> "$OUTPUT_FILE"
            echo "\`\`\`" >> "$OUTPUT_FILE"
        else
            echo "*Brak metadanych*" >> "$OUTPUT_FILE"
        fi
        echo "" >> "$OUTPUT_FILE"
    fi

    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
done

# Dodaj stopkę
cat >> "$OUTPUT_FILE" << EOF

## Statystyki

- **Łączna liczba modułów:** $(echo "$MODULES" | wc -l)
- **Data generowania:** $(date '+%Y-%m-%d %H:%M:%S')
- **Wygenerowane przez:** scripts/generate-docs.sh

---

*Ta dokumentacja została wygenerowana automatycznie. Aby ją zaktualizować, uruchom \`make docs\`.*
EOF

echo -e "${GREEN}✅ Dokumentacja wygenerowana: $OUTPUT_FILE${RESET}"

# Generuj również dokumentację API
API_DOC_FILE="$DOCS_DIR/api-documentation.md"
echo -e "${BLUE}📋 Generowanie dokumentacji API...${RESET}"

cat > "$API_DOC_FILE" << 'EOF'
# Dokumentacja API - 1001.mask.services

## Makefile Commands

### Podstawowe komendy

EOF

# Wyciągnij komendy z Makefile
if [ -f "Makefile" ]; then
    grep -E "^[a-zA-Z0-9_-]+:" Makefile | grep -v "^\.PHONY" | while read -r line; do
        COMMAND=$(echo "$line" | cut -d':' -f1)
        echo "#### \`make $COMMAND\`" >> "$API_DOC_FILE"
        echo "" >> "$API_DOC_FILE"
        
        # Znajdź komentarz opisujący komendę
        COMMENT=$(grep -B 1 "^$COMMAND:" Makefile | head -1 | grep "^#" | sed 's/^# *//' || echo "Brak opisu")
        echo "$COMMENT" >> "$API_DOC_FILE"
        echo "" >> "$API_DOC_FILE"
    done
fi

echo -e "${GREEN}✅ Dokumentacja API wygenerowana: $API_DOC_FILE${RESET}"

# Generuj indeks dokumentacji
INDEX_FILE="$DOCS_DIR/README.md"
cat > "$INDEX_FILE" << EOF
# Dokumentacja Projektu 1001.mask.services

## Dostępna dokumentacja

- [📦 Dokumentacja Modułów](modules-documentation.md) - Szczegółowy opis wszystkich modułów
- [🔧 Dokumentacja API](api-documentation.md) - Komendy Makefile i API
- [📊 Analiza Modułów](../module-analysis-results.json) - Wyniki analizy struktury modułów

## Szybki start

1. \`make install\` - Zainstaluj zależności
2. \`make dev\` - Uruchom serwer deweloperski
3. \`make test\` - Uruchom testy
4. \`make build\` - Zbuduj aplikację

## Więcej informacji

- Uruchom \`make help\` aby zobaczyć wszystkie dostępne komendy
- Uruchom \`make status\` aby sprawdzić status projektu
- Uruchom \`make docs\` aby zaktualizować tę dokumentację

---

*Ostatnia aktualizacja: $(date '+%Y-%m-%d %H:%M:%S')*
EOF

echo -e "${GREEN}✅ Indeks dokumentacji wygenerowany: $INDEX_FILE${RESET}"
echo -e "${BLUE}📚 Dokumentacja dostępna w katalogu: $DOCS_DIR${RESET}"
