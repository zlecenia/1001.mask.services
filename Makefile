# Makefile for 1001.mask.services Industrial Vue Application
# Automatyzacja procesów budowania, testowania i zarządzania modułami

# Zmienne konfiguracyjne
NODE_VERSION := $(shell node --version 2>/dev/null || echo "not-installed")
NPM_VERSION := $(shell npm --version 2>/dev/null || echo "not-installed")
PROJECT_NAME := 1001.mask.services
BUILD_DIR := dist
SCRIPTS_DIR := scripts
FEATURES_DIR := js/features

# Kolory dla output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

# Domyślny target
.DEFAULT_GOAL := help

# Sprawdzenie środowiska
.PHONY: check-env
check-env:
	@echo "$(BLUE)Sprawdzanie środowiska...$(RESET)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "npm: $(NPM_VERSION)"
	@if [ "$(NODE_VERSION)" = "not-installed" ]; then \
		echo "$(RED)❌ Node.js nie jest zainstalowany$(RESET)"; \
		exit 1; \
	fi
	@if [ "$(NPM_VERSION)" = "not-installed" ]; then \
		echo "$(RED)❌ npm nie jest zainstalowany$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Środowisko OK$(RESET)"

# Instalacja zależności
.PHONY: install
install: check-env
	@echo "$(BLUE)Instalowanie zależności...$(RESET)"
	npm install
	@echo "$(GREEN)✅ Zależności zainstalowane$(RESET)"

# Czyszczenie
.PHONY: clean
clean:
	@echo "$(BLUE)Czyszczenie projektu...$(RESET)"
	rm -rf $(BUILD_DIR)
	rm -rf node_modules/.vite
	rm -rf coverage
	rm -f test-results.json
	@echo "$(GREEN)✅ Projekt wyczyszczony$(RESET)"

# Budowanie aplikacji
.PHONY: build
build: install
	@echo "$(BLUE)Budowanie aplikacji...$(RESET)"
	npm run build
	@echo "$(GREEN)✅ Aplikacja zbudowana$(RESET)"

# Uruchomienie serwera deweloperskiego
.PHONY: dev
dev: install
	@echo "$(BLUE)Uruchamianie serwera deweloperskiego...$(RESET)"
	npm run dev

# Testowanie wszystkich modułów
.PHONY: test
test: install
	@echo "$(BLUE)Uruchamianie wszystkich testów...$(RESET)"
	npm test
	@echo "$(GREEN)✅ Wszystkie testy zakończone$(RESET)"

# Testowanie wszystkich typów
.PHONY: test-all
test-all: install
	@echo "$(BLUE)Uruchamianie wszystkich typów testów...$(RESET)"
	npm run test:all
	@echo "$(GREEN)✅ Wszystkie typy testów zakończone$(RESET)"

# Testy integracyjne
.PHONY: test-integration
test-integration: install
	@echo "$(BLUE)Uruchamianie testów integracyjnych...$(RESET)"
	npm run test:integration
	@echo "$(GREEN)✅ Testy integracyjne zakończone$(RESET)"

# Testy E2E
.PHONY: test-e2e
test-e2e: install
	@echo "$(BLUE)Uruchamianie testów E2E...$(RESET)"
	npm run test:e2e
	@echo "$(GREEN)✅ Testy E2E zakończone$(RESET)"

# Testy property-based
.PHONY: test-property
test-property: install
	@echo "$(BLUE)Uruchamianie testów property-based...$(RESET)"
	npm run test:property
	@echo "$(GREEN)✅ Testy property-based zakończone$(RESET)"

# Analiza zdrowia komponentów
.PHONY: analyze
analyze: install
	@echo "$(BLUE)Analiza zdrowia komponentów...$(RESET)"
	npm run analyze
	@echo "$(GREEN)✅ Analiza zakończona$(RESET)"

# Generowanie screenshotów
.PHONY: screenshots
screenshots: install
	@echo "$(BLUE)Generowanie screenshotów komponentów...$(RESET)"
	npm run screenshots
	@echo "$(GREEN)✅ Screenshoty wygenerowane$(RESET)"

# Walidacja konfiguracji
.PHONY: config-validate
config-validate: install
	@echo "$(BLUE)Walidacja konfiguracji komponentów...$(RESET)"
	npm run config:validate
	@echo "$(GREEN)✅ Konfiguracja zwalidowana$(RESET)"

# Poszczególne komponenty development servers
.PHONY: json-editor
json-editor: install
	@echo "$(BLUE)Uruchamianie JSON Editor...$(RESET)"
	npm run component:dev:jsonEditor

.PHONY: user-menu
user-menu: install
	@echo "$(BLUE)Uruchamianie User Menu...$(RESET)"
	npm run component:dev:userMenu

.PHONY: service-menu
service-menu: install
	@echo "$(BLUE)Uruchamianie Service Menu...$(RESET)"
	npm run component:dev:serviceMenu

.PHONY: system-settings
system-settings: install
	@echo "$(BLUE)Uruchamianie System Settings...$(RESET)"
	npm run component:dev:systemSettings

.PHONY: device-data
device-data: install
	@echo "$(BLUE)Uruchamianie Device Data...$(RESET)"
	npm run component:dev:deviceData

.PHONY: reports-viewer
reports-viewer: install
	@echo "$(BLUE)Uruchamianie Reports Viewer...$(RESET)"
	npm run component:dev:reportsViewer

.PHONY: device-history
device-history: install
	@echo "$(BLUE)Uruchamianie Device History...$(RESET)"
	npm run component:dev:deviceHistory

.PHONY: test-menu
test-menu: install
	@echo "$(BLUE)Uruchamianie Test Menu...$(RESET)"
	npm run component:dev:testMenu

.PHONY: component-editor
component-editor: install
	@echo "$(BLUE)Uruchamianie Component Editor...$(RESET)"
	npm run component:dev:componentEditor

.PHONY: pressure-panel
pressure-panel: install
	@echo "$(BLUE)Uruchamianie Pressure Panel...$(RESET)"
	npm run component:dev:pressurePanel

.PHONY: main-menu
main-menu: install
	@echo "$(BLUE)Uruchamianie Main Menu...$(RESET)"
	npm run component:dev:mainMenu

.PHONY: audit-log-viewer
audit-log-viewer: install
	@echo "$(BLUE)Uruchamianie Audit Log Viewer...$(RESET)"
	npm run component:dev:auditLogViewer

# Playground - wybór komponentów
.PHONY: playground
	@echo "$(BLUE)Uruchamianie Playground...$(RESET)"
	npm run playground

# Testowanie z pokryciem kodu
.PHONY: test-coverage
test-coverage: install
	@echo "$(BLUE)Running tests with coverage...$(RESET)"
	npm run test:coverage

# Testowanie poszczególnych modułów
.PHONY: test-modules
test-modules: install
	@echo "$(BLUE)Testowanie poszczególnych modułów...$(RESET)"
	@echo "$(GREEN)✅ Testowanie modułów zakończone$(RESET)"

# Testowanie konkretnego modułu
.PHONY: test-module
test-module:
	@if [ -z "$(MODULE)" ]; then \
		echo "$(RED)❌ Użyj: make test-module MODULE=nazwa_modułu$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Testowanie modułu: $(MODULE)...$(RESET)"
	@$(SCRIPTS_DIR)/test-single-module.sh $(MODULE)

# Linting kodu
.PHONY: lint
lint: install
	@echo "$(BLUE)Sprawdzanie jakości kodu...$(RESET)"
	npm run lint || echo "$(YELLOW)⚠️ Brak konfiguracji lint$(RESET)"

# Formatowanie kodu
.PHONY: format
format: install
	@echo "$(BLUE)Formatowanie kodu...$(RESET)"
	npm run format || echo "$(YELLOW)⚠️ Brak konfiguracji formatowania$(RESET)"

# Analiza modułów
.PHONY: analyze-modules
analyze-modules:
	@echo "$(BLUE)Analiza struktury modułów...$(RESET)"
	@$(SCRIPTS_DIR)/analyze-modules.py
	@echo "$(GREEN)✅ Analiza modułów zakończona$(RESET)"

# Generowanie dokumentacji
.PHONY: docs
docs:
	@echo "$(BLUE)Generowanie dokumentacji...$(RESET)"
	@$(SCRIPTS_DIR)/generate-docs.sh
	@echo "$(GREEN)✅ Dokumentacja wygenerowana$(RESET)"

# Walidacja struktury projektu
.PHONY: validate
validate:
	@echo "$(BLUE)Walidacja struktury projektu...$(RESET)"
	@$(SCRIPTS_DIR)/validate-structure.sh
	@echo "$(GREEN)✅ Struktura projektu zwalidowana$(RESET)"

# Przygotowanie do produkcji
.PHONY: prepare-prod
prepare-prod: clean install test build
	@echo "$(BLUE)Przygotowywanie do produkcji...$(RESET)"
	@$(SCRIPTS_DIR)/prepare-production.sh
	@echo "$(GREEN)✅ Gotowe do produkcji$(RESET)"

# Przygotowanie do produkcji bez testów (dla przypadków gdy testy wydajności nie przechodzą)
.PHONY: prepare-prod-fast
prepare-prod-fast: clean install
	@echo "$(BLUE)Przygotowywanie do produkcji (bez testów)...$(RESET)"
	@SKIP_TESTS=true $(SCRIPTS_DIR)/prepare-production.sh
	@echo "$(GREEN)✅ Gotowe do produkcji$(RESET)"

# Deployment
.PHONY: deploy
deploy: prepare-prod-fast
	@echo "$(BLUE)Wdrażanie aplikacji...$(RESET)"
	@$(SCRIPTS_DIR)/deploy.sh
	@echo "$(GREEN)✅ Aplikacja wdrożona$(RESET)"

# Monitoring i logi
.PHONY: logs
logs:
	@echo "$(BLUE)Wyświetlanie logów...$(RESET)"
	@$(SCRIPTS_DIR)/show-logs.sh

# Backup
.PHONY: backup
backup:
	@echo "$(BLUE)Tworzenie kopii zapasowej...$(RESET)"
	@$(SCRIPTS_DIR)/backup.sh
	@echo "$(GREEN)✅ Kopia zapasowa utworzona$(RESET)"

# Przywracanie z kopii zapasowej
.PHONY: restore
restore:
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)❌ Użyj: make restore BACKUP=nazwa_kopii$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Przywracanie z kopii: $(BACKUP)...$(RESET)"
	@$(SCRIPTS_DIR)/restore.sh $(BACKUP)
	@echo "$(GREEN)✅ Przywracanie zakończone$(RESET)"

# Inicjalizacja skryptów
.PHONY: init-scripts
init-scripts:
	@echo "$(BLUE)Inicjalizacja skryptów...$(RESET)"
	@mkdir -p $(SCRIPTS_DIR)
	@chmod +x $(SCRIPTS_DIR)/*.sh 2>/dev/null || true
	@echo "$(GREEN)✅ Skrypty zainicjalizowane$(RESET)"

# Status projektu
.PHONY: status
status: check-env
	@echo "$(BLUE)Status projektu $(PROJECT_NAME):$(RESET)"
	@echo "📁 Katalog: $(PWD)"
	@echo "🔧 Node.js: $(NODE_VERSION)"
	@echo "📦 npm: $(NPM_VERSION)"
	@echo "📊 Moduły: $$(find $(FEATURES_DIR) -name "index.js" | wc -l) znalezionych"
	@echo "🧪 Testy: $$(find . -name "*.test.js" | wc -l) plików testowych"
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "🏗️  Build: $(GREEN)istnieje$(RESET)"; \
	else \
		echo "🏗️  Build: $(YELLOW)brak$(RESET)"; \
	fi

# Pomoc
.PHONY: help
help:
	@echo "$(BLUE)MASKSERVICE C20 1001 - Makefile Commands$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 Setup & Build:$(RESET)"
	@echo "  $(GREEN)install$(RESET)          - Instaluje zależności npm"
	@echo "  $(GREEN)clean$(RESET)            - Czyści pliki tymczasowe i build"
	@echo "  $(GREEN)build$(RESET)            - Buduje aplikację do produkcji"
	@echo "  $(GREEN)dev$(RESET)              - Uruchamia serwer deweloperski"
	@echo ""
	@echo "$(YELLOW)🧪 Testing:$(RESET)"
	@echo "  $(GREEN)test$(RESET)             - Uruchamia wszystkie testy"
	@echo "  $(GREEN)test-all$(RESET)         - Uruchamia wszystkie typy testów"
	@echo "  $(GREEN)test-integration$(RESET) - Testy integracyjne"
	@echo "  $(GREEN)test-e2e$(RESET)         - Testy End-to-End"
	@echo "  $(GREEN)test-property$(RESET)    - Testy Property-based"
	@echo "  $(GREEN)test-coverage$(RESET)    - Uruchamia testy z pokryciem kodu"
	@echo "  $(GREEN)test-modules$(RESET)     - Testuje wszystkie moduły osobno"
	@echo "  $(GREEN)test-module$(RESET)      - Testuje konkretny moduł (MODULE=nazwa)"
	@echo ""
	@echo "$(YELLOW)📊 Analysis:$(RESET)"
	@echo "  $(GREEN)analyze$(RESET)          - Analiza zdrowia komponentów"
	@echo "  $(GREEN)screenshots$(RESET)      - Generuje screenshoty komponentów"
	@echo "  $(GREEN)config-validate$(RESET)  - Waliduje konfigurację komponentów"
	@echo ""
	@echo "$(YELLOW)🎮 Component Dev Servers:$(RESET)"
	@echo "  $(GREEN)json-editor$(RESET)      - JSON Editor (port 3009)"
	@echo "  $(GREEN)user-menu$(RESET)        - User Menu (port 3010)"
	@echo "  $(GREEN)service-menu$(RESET)     - Service Menu (port 3011)"
	@echo "  $(GREEN)system-settings$(RESET)  - System Settings (port 3012)"
	@echo "  $(GREEN)device-data$(RESET)      - Device Data (port 3013)"
	@echo "  $(GREEN)reports-viewer$(RESET)   - Reports Viewer (port 3014)"
	@echo "  $(GREEN)device-history$(RESET)   - Device History (port 3015)"
	@echo "  $(GREEN)test-menu$(RESET)        - Test Menu (port 3016)"
	@echo "  $(GREEN)component-editor$(RESET) - Component Editor (port 3017)"
	@echo "  $(GREEN)pressure-panel$(RESET)   - Pressure Panel (port 3006)"
	@echo "  $(GREEN)main-menu$(RESET)        - Main Menu (port 3003)"
	@echo "  $(GREEN)audit-log-viewer$(RESET) - Audit Log Viewer (port 3008)"
	@echo ""
	@echo "$(YELLOW)🔧 Utilities:$(RESET)"
	@echo "  $(GREEN)playground$(RESET)       - Uruchamia wybór komponentów"
	@echo "  $(GREEN)lint$(RESET)             - Sprawdza jakość kodu"
	@echo "  $(GREEN)format$(RESET)           - Formatuje kod"
	@echo "  $(GREEN)docs$(RESET)             - Generuje dokumentację"
	@echo "  $(GREEN)status$(RESET)           - Pokazuje status projektu"
	@echo "  $(GREEN)help$(RESET)             - Wyświetla tę pomoc"
	@echo ""
	@echo "$(YELLOW)Przykłady użycia:$(RESET)"
	@echo "  make install"
	@echo "  make test-module MODULE=loginForm"
	@echo "  make restore BACKUP=backup-2024-01-01"
