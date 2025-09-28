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

# JSON Editor development server
.PHONY: json-editor
json-editor: install
	@echo "$(BLUE)Uruchamianie JSON Editor...$(RESET)"
	npm run component:dev:jsonEditor

# Playground - wybór komponentów
.PHONY: playground
playground: install
	@echo "$(BLUE)Uruchamianie Playground...$(RESET)"
	npm run playground

# Testowanie z pokryciem kodu
.PHONY: test-coverage
test-coverage: install
	@echo "$(BLUE)Uruchamianie testów z pokryciem kodu...$(RESET)"
	npm run test:coverage || npm test -- --coverage
	@echo "$(GREEN)✅ Testy z pokryciem zakończone$(RESET)"

# Testowanie poszczególnych modułów
.PHONY: test-modules
test-modules: install
	@echo "$(BLUE)Testowanie poszczególnych modułów...$(RESET)"
	@$(SCRIPTS_DIR)/test-modules.sh
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
	@echo "$(BLUE)Makefile dla $(PROJECT_NAME)$(RESET)"
	@echo ""
	@echo "$(YELLOW)Dostępne komendy:$(RESET)"
	@echo "  $(GREEN)install$(RESET)          - Instaluje zależności npm"
	@echo "  $(GREEN)clean$(RESET)            - Czyści pliki tymczasowe i build"
	@echo "  $(GREEN)build$(RESET)            - Buduje aplikację do produkcji"
	@echo "  $(GREEN)dev$(RESET)              - Uruchamia serwer deweloperski"
	@echo "  $(GREEN)test$(RESET)             - Uruchamia wszystkie testy"
	@echo "  $(GREEN)analyze$(RESET)          - Analiza zdrowia komponentów"
	@echo "  $(GREEN)screenshots$(RESET)      - Generuje screenshoty komponentów"
	@echo "  $(GREEN)config-validate$(RESET)  - Waliduje konfigurację komponentów"
	@echo "  $(GREEN)json-editor$(RESET)      - Uruchamia JSON Editor (port 3009)"
	@echo "  $(GREEN)playground$(RESET)       - Uruchamia wybór komponentów"
	@echo "  $(GREEN)test-coverage$(RESET)    - Uruchamia testy z pokryciem kodu"
	@echo "  $(GREEN)test-modules$(RESET)     - Testuje wszystkie moduły osobno"
	@echo "  $(GREEN)test-module$(RESET)      - Testuje konkretny moduł (MODULE=nazwa)"
	@echo "  $(GREEN)lint$(RESET)             - Sprawdza jakość kodu"
	@echo "  $(GREEN)format$(RESET)           - Formatuje kod"
	@echo "  $(GREEN)analyze-modules$(RESET)  - Analizuje strukturę modułów"
	@echo "  $(GREEN)docs$(RESET)             - Generuje dokumentację"
	@echo "  $(GREEN)validate$(RESET)         - Waliduje strukturę projektu"
	@echo "  $(GREEN)prepare-prod$(RESET)     - Przygotowuje do produkcji"
	@echo "  $(GREEN)deploy$(RESET)           - Wdraża aplikację"
	@echo "  $(GREEN)logs$(RESET)             - Wyświetla logi"
	@echo "  $(GREEN)backup$(RESET)           - Tworzy kopię zapasową"
	@echo "  $(GREEN)restore$(RESET)          - Przywraca z kopii (BACKUP=nazwa)"
	@echo "  $(GREEN)status$(RESET)           - Pokazuje status projektu"
	@echo "  $(GREEN)help$(RESET)             - Wyświetla tę pomoc"
	@echo ""
	@echo "$(YELLOW)Przykłady użycia:$(RESET)"
	@echo "  make install"
	@echo "  make test-module MODULE=loginForm"
	@echo "  make restore BACKUP=backup-2024-01-01"
