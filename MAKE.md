# MAKE.md - Dokumentacja komend dla 1001.mask.services

Kompletna dokumentacja wszystkich dostępnych komend Makefile i npm scripts dla systemu MASKSERVICE C20 1001.

## 📋 Spis treści

- [Podstawowe komendy](#podstawowe-komendy)
- [Komendy deweloperskie](#komendy-deweloperskie)
- [Komponenty deweloperskie](#komponenty-deweloperskie)
- [Testowanie](#testowanie)
- [Analiza i walidacja](#analiza-i-walidacja)
- [Generowanie i konfiguracja](#generowanie-i-konfiguracja)
- [Deployment i produkcja](#deployment-i-produkcja)
- [Narzędzia pomocnicze](#narzędzia-pomocnicze)
- [Przykłady użycia](#przykłady-użycia)

---

## 🚀 Podstawowe komendy

### Sprawdzenie środowiska i instalacja

```bash
# Sprawdzenie środowiska (Node.js, npm)
make check-env

# Instalacja wszystkich zależności
make install
npm install

# Status projektu
make status
```

### Czyszczenie i budowanie

```bash
# Czyszczenie plików tymczasowych
make clean

# Budowanie aplikacji (z testami)
make build
npm run build

# Szybkie budowanie (bez testów)
npm run build:fast

# Budowanie deweloperskie
npm run build:dev

# Budowanie produkcyjne
npm run build:prod
```

---

## 🛠️ Komendy deweloperskie

### Serwer deweloperski główny

```bash
# Uruchomienie głównego serwera deweloperskiego
make dev
npm run dev

# Podgląd zbudowanej aplikacji
npm run preview
```

### Playground i narzędzia

```bash
# Uruchomienie Playground (wybór komponentów)
make playground
npm run playground

# JSON Editor (port 3009)
make json-editor
npm run component:dev:jsonEditor
```

---

## 🧩 Komponenty deweloperskie

### Lista wszystkich komponentów z portami

```bash
# Komponenty główne
npm run component:dev:appFooter      # Port 3001 - Stopka aplikacji
npm run component:dev:appHeader      # Port 3002 - Nagłówek aplikacji  
npm run component:dev:mainMenu       # Port 3003 - Menu główne
npm run component:dev:loginForm      # Port 3004 - Formularz logowania
npm run component:dev:pageTemplate   # Port 3005 - Szablon strony
npm run component:dev:pressurePanel  # Port 3006 - Panel ciśnienia
npm run component:dev:realtimeSensors # Port 3007 - Sensory czasu rzeczywistego
npm run component:dev:auditLogViewer # Port 3008 - Przeglądarka logów audytu
npm run component:dev:jsonEditor     # Port 3009 - Edytor JSON z undo/redo

# Komponenty dodatkowe (bez dedykowanych portów w package.json)
# Można uruchomić używając: npm run component:dev <ścieżka> <port>
npm run component:dev js/features/componentEditor/0.1.0 3011
npm run component:dev js/features/deviceData/0.1.0 3012
npm run component:dev js/features/deviceHistory/0.1.0 3013
npm run component:dev js/features/reportsViewer/0.1.0 3014
npm run component:dev js/features/serviceMenu/0.1.0 3015
npm run component:dev js/features/systemSettings/0.1.0 3016
npm run component:dev js/features/testMenu/0.1.0 3017
npm run component:dev js/features/userMenu/0.1.0 3018
```

### Przykłady uruchamiania komponentów

```bash
# Uruchomienie komponentu appFooter na porcie 3001
npm run component:dev:appFooter

# Dostępne endpointy dla każdego komponentu:
# http://localhost:PORT/           - Główna strona komponentu
# http://localhost:PORT/demo       - Interaktywne demo
# http://localhost:PORT/admin      - Panel administracyjny
# http://localhost:PORT/api/info   - Informacje o komponencie
# http://localhost:PORT/api/config - Konfiguracja komponentu
# http://localhost:PORT/api/data   - Dane komponentu
```

---

## 🧪 Testowanie

### Podstawowe testowanie

```bash
# Wszystkie testy
make test
npm test
npm run test

# Testy w trybie watch
npm run test:watch

# Testy z pokryciem kodu
make test-coverage
npm run test:coverage
```

### Testowanie modułów

```bash
# Testowanie wszystkich modułów osobno
make test-modules

# Testowanie konkretnego modułu
make test-module MODULE=loginForm
make test-module MODULE=mainMenu
make test-module MODULE=jsonEditor

# Przykłady testowania poszczególnych komponentów
make test-module MODULE=appFooter
make test-module MODULE=pressurePanel
```

---

## 📊 Analiza i walidacja

### Analiza komponentów

```bash
# Analiza zdrowia wszystkich komponentów
make analyze
npm run analyze

# Analiza struktury modułów
make analyze-modules
npm run analyze

# Generowanie screenshotów komponentów
make screenshots
npm run screenshots

# Screenshot konkretnego komponentu
npm run screenshot
```

### Walidacja

```bash
# Walidacja konfiguracji komponentów
make config-validate
npm run config:validate

# Walidacja struktury projektu
make validate

# Walidacja wszystkich elementów
npm run validate-all

# Walidacja schematów
npm run schema:validate

# Walidacja CRUD
npm run crud:validate
```

---

## ⚙️ Generowanie i konfiguracja

### Konfiguracja

```bash
# Generowanie konfiguracji
npm run config:generate

# Synchronizacja konfiguracji
npm run config:sync

# Obserwowanie zmian w konfiguracji
npm run config:watch

# Aktualizacja konfiguracji
npm run config:update
```

### Generowanie schematów

```bash
# Generowanie wszystkich schematów
npm run schema:generate

# Generowanie schematów z konfiguracji
npm run schema:from-config

# Generowanie schematów komponentów
npm run config:generate-components
```

### Generowanie CRUD

```bash
# Generowanie wszystkich CRUD
npm run crud:generate

# Aktualizacja CRUD
npm run crud:update
```

### Generowanie SDK

```bash
# Generowanie wszystkich SDK
npm run sdk:generate

# SDK dla JavaScript
npm run sdk:js

# SDK dla Python
npm run sdk:python

# SDK dla Go
npm run sdk:go
```

---

## 🚀 Deployment i produkcja

### Przygotowanie do produkcji

```bash
# Pełne przygotowanie (z testami)
make prepare-prod

# Szybkie przygotowanie (bez testów)
make prepare-prod-fast

# Deployment
make deploy
```

### Linting i formatowanie

```bash
# Sprawdzanie jakości kodu
make lint
npm run lint

# Automatyczne naprawianie problemów
npm run lint:fix

# Formatowanie kodu
make format
```

---

## 🛠️ Narzędzia pomocnicze

### Moduły i komponenty

```bash
# Inicjalizacja komponentu
npm run module:init

# Inicjalizacja wszystkich komponentów
npm run module:init-all

# Lista modułów
npm run module:list

# Walidacja modułu
npm run module:validate

# Migracja struktury komponentu
npm run module:migrate
```

### Dokumentacja

```bash
# Generowanie dokumentacji
make docs

# Generowanie README dla komponentów
npm run readme:generate
```

### Backup i restore

```bash
# Tworzenie kopii zapasowej
make backup
npm run backup

# Przywracanie z kopii zapasowej
make restore BACKUP=backup-2024-01-01

# Czyszczenie projektu
make clean
npm run clean
```

### Monitoring

```bash
# Wyświetlanie logów
make logs

# Inicjalizacja skryptów
make init-scripts
```

---

## 💡 Przykłady użycia

### Typowy workflow deweloperski

```bash
# 1. Sprawdzenie środowiska i instalacja
make check-env
make install

# 2. Uruchomienie komponentu do pracy
npm run component:dev:mainMenu

# 3. W drugim terminalu - testy
npm run test:watch

# 4. Analiza po zmianach
make analyze

# 5. Walidacja przed commitem
npm run validate-all
```

### Praca z JSON Editorem

```bash
# Uruchomienie JSON Editor z funkcją undo/redo
npm run component:dev:jsonEditor

# Dostępne URL:
# http://localhost:3009/           - Główny edytor
# http://localhost:3009/test.html  - Strona testowa undo/redo
# http://localhost:3009/admin      - Panel administracyjny
```

### Testowanie konkretnego komponentu

```bash
# Uruchomienie komponentu
npm run component:dev:loginForm

# W drugim terminalu - testowanie
make test-module MODULE=loginForm

# Analiza komponentu
npm run analyze

# Screenshot komponentu
npm run screenshot
```

### Przygotowanie do produkcji

```bash
# Pełny pipeline produkcyjny
make clean
make install
make test
make analyze
make validate
make prepare-prod
make deploy
```

### Praca z konfiguracją

```bash
# Generowanie i walidacja konfiguracji
npm run config:generate
npm run config:validate

# Synchronizacja po zmianach
npm run config:sync

# Obserwowanie zmian w czasie rzeczywistym
npm run config:watch
```

---

## 📝 Notatki

### Porty komponentów

- **3001** - appFooter
- **3002** - appHeader  
- **3003** - mainMenu
- **3004** - loginForm
- **3005** - pageTemplate
- **3006** - pressurePanel
- **3007** - realtimeSensors
- **3008** - auditLogViewer
- **3009** - jsonEditor (z undo/redo)
- **3011+** - Inne komponenty (ręczne uruchamianie)

### Ważne ścieżki

- **Komponenty**: `js/features/`
- **Narzędzia**: `tools/`
- **Konfiguracja**: `config/`
- **Skrypty**: `scripts/`
- **Build**: `dist/`

### Wymagania systemowe

- **Node.js**: >=16.0.0
- **npm**: Najnowsza wersja
- **System**: Linux/macOS/Windows

---

## 🆘 Pomoc

```bash
# Wyświetlenie pomocy Makefile
make help

# Status projektu
make status

# Lista wszystkich komponentów
npm run module:list

# Sprawdzenie środowiska
make check-env
```

---

**Ostatnia aktualizacja**: 2025-09-28  
**Wersja projektu**: 3.0.0  
**System**: MASKSERVICE C20 1001
