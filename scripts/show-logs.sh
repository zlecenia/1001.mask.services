#!/bin/bash
# Skrypt do wyświetlania logów aplikacji
# Usage: ./scripts/show-logs.sh [opcje]

set -e

# Kolory
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'

# Domyślne ustawienia
FOLLOW=false
LINES=50
LOG_LEVEL="all"
ENVIRONMENT="development"

# Parsowanie argumentów
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -l|--level)
            LOG_LEVEL="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [opcje]"
            echo ""
            echo "Opcje:"
            echo "  -f, --follow     Śledź logi na żywo"
            echo "  -n, --lines N    Pokaż ostatnie N linii (domyślnie: 50)"
            echo "  -l, --level L    Filtruj po poziomie (all, error, warn, info, debug)"
            echo "  -e, --env E      Środowisko (development, staging, production)"
            echo "  -h, --help       Pokaż tę pomoc"
            echo ""
            echo "Przykłady:"
            echo "  $0 -f                    # Śledź logi na żywo"
            echo "  $0 -n 100 -l error      # Pokaż 100 ostatnich błędów"
            echo "  $0 -e production         # Logi z produkcji"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Nieznana opcja: $1${RESET}"
            echo "Użyj -h aby zobaczyć pomoc"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Wyświetlanie logów aplikacji${RESET}"
echo "=================================================="
echo -e "${BLUE}Środowisko: $ENVIRONMENT${RESET}"
echo -e "${BLUE}Poziom logów: $LOG_LEVEL${RESET}"
echo -e "${BLUE}Liczba linii: $LINES${RESET}"
echo -e "${BLUE}Śledzenie: $([ "$FOLLOW" = true ] && echo 'TAK' || echo 'NIE')${RESET}"
echo "=================================================="

# Funkcja do kolorowania logów
colorize_log() {
    while IFS= read -r line; do
        case "$line" in
            *"ERROR"*|*"error"*|*"Error"*)
                echo -e "${RED}$line${RESET}"
                ;;
            *"WARN"*|*"warn"*|*"Warning"*)
                echo -e "${YELLOW}$line${RESET}"
                ;;
            *"INFO"*|*"info"*|*"Info"*)
                echo -e "${GREEN}$line${RESET}"
                ;;
            *"DEBUG"*|*"debug"*|*"Debug"*)
                echo -e "${BLUE}$line${RESET}"
                ;;
            *)
                echo "$line"
                ;;
        esac
    done
}

# Funkcja do filtrowania po poziomie
filter_by_level() {
    if [ "$LOG_LEVEL" = "all" ]; then
        cat
    else
        case "$LOG_LEVEL" in
            error)
                grep -i "error\|err\|exception\|fail"
                ;;
            warn)
                grep -i "warn\|warning"
                ;;
            info)
                grep -i "info\|information"
                ;;
            debug)
                grep -i "debug\|trace"
                ;;
            *)
                echo -e "${RED}❌ Nieznany poziom logów: $LOG_LEVEL${RESET}" >&2
                exit 1
                ;;
        esac
    fi
}

# Ścieżki do plików logów w zależności od środowiska
case "$ENVIRONMENT" in
    development)
        LOG_SOURCES=(
            "npm-debug.log"
            "vite.log"
            "console.log"
            "/tmp/app-dev.log"
        )
        ;;
    staging)
        LOG_SOURCES=(
            "/var/log/app-staging.log"
            "/var/log/nginx/staging-access.log"
            "/var/log/nginx/staging-error.log"
        )
        ;;
    production)
        LOG_SOURCES=(
            "/var/log/app-production.log"
            "/var/log/nginx/production-access.log"
            "/var/log/nginx/production-error.log"
            "/var/log/syslog"
        )
        ;;
    *)
        echo -e "${RED}❌ Nieznane środowisko: $ENVIRONMENT${RESET}"
        exit 1
        ;;
esac

# Sprawdź dostępne źródła logów
AVAILABLE_LOGS=()
for log_source in "${LOG_SOURCES[@]}"; do
    if [ -f "$log_source" ]; then
        AVAILABLE_LOGS+=("$log_source")
    fi
done

if [ ${#AVAILABLE_LOGS[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nie znaleziono plików logów dla środowiska $ENVIRONMENT${RESET}"
    echo -e "${BLUE}💡 Sprawdzane lokalizacje:${RESET}"
    for log_source in "${LOG_SOURCES[@]}"; do
        echo "  - $log_source"
    done
    
    # Sprawdź logi npm/node w bieżącym katalogu
    echo ""
    echo -e "${BLUE}🔍 Sprawdzanie lokalnych logów...${RESET}"
    
    if [ -f "npm-debug.log" ]; then
        echo -e "${GREEN}✅ Znaleziono npm-debug.log${RESET}"
        echo -e "${BLUE}📄 Ostatnie linie z npm-debug.log:${RESET}"
        tail -n "$LINES" npm-debug.log | filter_by_level | colorize_log
    fi
    
    # Sprawdź logi z package.json scripts
    if [ -f "package.json" ] && command -v jq >/dev/null 2>&1; then
        echo -e "${BLUE}📋 Dostępne skrypty npm:${RESET}"
        jq -r '.scripts | keys[]' package.json | sed 's/^/  - npm run /'
    fi
    
    # Pokaż logi z przeglądarki (jeśli serwer dev jest uruchomiony)
    if pgrep -f "vite" > /dev/null; then
        echo -e "${GREEN}✅ Serwer Vite jest uruchomiony${RESET}"
        echo -e "${BLUE}💡 Logi z przeglądarki są przekazywane do terminala z serwerem dev${RESET}"
    fi
    
    exit 0
fi

echo -e "${GREEN}✅ Znalezione pliki logów:${RESET}"
for log_file in "${AVAILABLE_LOGS[@]}"; do
    log_size=$(du -sh "$log_file" 2>/dev/null | cut -f1)
    echo "  📄 $log_file ($log_size)"
done
echo ""

# Funkcja do wyświetlania logów
show_logs() {
    if [ "$FOLLOW" = true ]; then
        echo -e "${BLUE}👁️  Śledzenie logów na żywo (Ctrl+C aby zakończyć)...${RESET}"
        echo ""
        
        # Użyj tail -f dla wszystkich plików
        tail -f "${AVAILABLE_LOGS[@]}" | filter_by_level | colorize_log
    else
        echo -e "${BLUE}📖 Ostatnie $LINES linii logów:${RESET}"
        echo ""
        
        # Pokaż ostatnie linie z wszystkich plików
        for log_file in "${AVAILABLE_LOGS[@]}"; do
            echo -e "${BLUE}=== $log_file ===${RESET}"
            tail -n "$LINES" "$log_file" | filter_by_level | colorize_log
            echo ""
        done
    fi
}

# Obsługa sygnału przerwania
trap 'echo -e "\n${BLUE}👋 Zakończono wyświetlanie logów${RESET}"; exit 0' INT

# Wyświetl logi
show_logs

# Jeśli nie śledziliśmy logów, pokaż dodatkowe informacje
if [ "$FOLLOW" = false ]; then
    echo "=================================================="
    echo -e "${BLUE}💡 Przydatne komendy:${RESET}"
    echo "  $0 -f                    # Śledź logi na żywo"
    echo "  $0 -n 100               # Pokaż więcej linii"
    echo "  $0 -l error             # Tylko błędy"
    echo "  make dev                 # Uruchom serwer dev z logami"
    echo ""
    echo -e "${BLUE}📊 Statystyki logów:${RESET}"
    for log_file in "${AVAILABLE_LOGS[@]}"; do
        if [ -f "$log_file" ]; then
            total_lines=$(wc -l < "$log_file" 2>/dev/null || echo "0")
            error_lines=$(grep -ci "error\|err\|exception\|fail" "$log_file" 2>/dev/null || echo "0")
            warn_lines=$(grep -ci "warn\|warning" "$log_file" 2>/dev/null || echo "0")
            echo "  📄 $(basename "$log_file"): $total_lines linii ($error_lines błędów, $warn_lines ostrzeżeń)"
        fi
    done
fi
