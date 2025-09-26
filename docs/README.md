# MASKTRONIC C20 - Dokumentacja modularnej architektury

## 📋 Spis treści
- [Przegląd architektury](#przegląd-architektury)
- [Moduły systemu](#moduły-systemu)
- [Struktura plików](#struktura-plików)
- [Instrukcje instalacji](#instrukcje-instalacji)
- [API modułów](#api-modułów)
- [Standardy kodowania](#standardy-kodowania)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## 🏗️ Przegląd architektury

MASKTRONIC C20 został zrefaktoryzowany w wersji 2.0.0 na modularną architekturę dla lepszej organizacji kodu i łatwiejszej konserwacji. Każdy plik JavaScript ma maksymalnie 450 linii kodu.

### Główne cele refaktoryzacji:
- ✅ **Modularność** - Podział dużych plików na mniejsze, wyspecjalizowane moduły
- ✅ **Łatwość konserwacji** - Każdy moduł odpowiada za konkretną funkcjonalność
- ✅ **Reużywalność** - Moduły mogą być niezależnie używane i testowane
- ✅ **Czytelność** - Jasna struktura i dokumentacja każdego modułu

## 🧩 Moduły systemu

### 1. **Settings Modules** (`js/modules/settings-*.js`)
Zarządzanie ustawieniami systemu podzielone na wyspecjalizowane moduły:

- **`settings-core.js`** (199 linii) - Podstawowa funkcjonalność ustawień
- **`settings-scenarios.js`** (251 linii) - Zarządzanie scenariuszami testowymi
- **`settings-integration.js`** (318 linii) - Integracje zewnętrzne
- **`settings-standards.js`** (434 linii) - Zgodność ze standardami PN-EN
- **`settings-system.js`** (442 linii) - Konfiguracja systemu

### 2. **Enhanced Modules** (`js/*-enhanced.js`)
Główne moduły funkcjonalne systemu:

- **`system-settings-enhanced.js`** - Orkiestracja modułów ustawień
- **`workshop-enhanced.js`** - Zarządzanie warsztatem i częściami zamiennymi
- **`test-reports-enhanced.js`** - Generowanie i zarządzanie raportami
- **`test-menu-enhanced.js`** - Kreatory testów i scenariusze
- **`device-data-enhanced.js`** - Monitorowanie urządzeń w czasie rzeczywistym

### 3. **Core Modules** (`js/*.js`)
Podstawowe moduły systemu:

- **`app.js`** - Główna aplikacja i inicjalizacja
- **`menu.js`** - System nawigacji i menu
- **`auth.js`** - Autoryzacja i zarządzanie użytkownikami
- **`router.js`** - Routing i nawigacja między stronami
- **`i18n.js`** - Internationalizacja i lokalizacja

## 📁 Struktura plików

```
frontend/
├── js/
│   ├── modules/                 # Moduły wyspecjalizowane
│   │   ├── settings-core.js
│   │   ├── settings-scenarios.js
│   │   ├── settings-integration.js
│   │   ├── settings-standards.js
│   │   └── settings-system.js
│   ├── *-enhanced.js           # Główne moduły funkcjonalne
│   ├── *.js                    # Podstawowe moduły systemu
│   └── utils.js                # Funkcje pomocnicze
├── css/
│   └── style.css               # Style CSS
├── config/
│   ├── app.json               # Konfiguracja aplikacji
│   ├── menu.json              # Struktura menu
│   └── router.json            # Konfiguracja routingu
├── locales/
│   ├── pl.json                # Tłumaczenia polskie
│   ├── en.json                # Tłumaczenia angielskie
│   └── de.json                # Tłumaczenia niemieckie
├── docs/                      # Dokumentacja
│   ├── README.md
│   ├── modules/
│   └── api/
└── index.html                 # Główny plik HTML
```

## 🚀 Instrukcje instalacji

### 1. Załadowanie modułów w HTML

```html
<!-- Core modules -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<script src="js/auth.js"></script>
<script src="js/i18n.js"></script>

<!-- Settings modules -->
<script src="js/modules/settings-core.js"></script>
<script src="js/modules/settings-scenarios.js"></script>
<script src="js/modules/settings-integration.js"></script>
<script src="js/modules/settings-standards.js"></script>
<script src="js/modules/settings-system.js"></script>

<!-- Enhanced modules -->
<script src="js/system-settings-enhanced.js"></script>
<script src="js/workshop-enhanced.js"></script>
<script src="js/test-reports-enhanced.js"></script>
<script src="js/test-menu-enhanced.js"></script>
<script src="js/device-data-enhanced.js"></script>

<!-- Main application -->
<script src="js/menu.js"></script>
<script src="js/router.js"></script>
<script src="js/app.js"></script>
```

### 2. Inicjalizacja w aplikacji

```javascript
// app.js
class MaskServiceApp {
    constructor() {
        // Moduły będą automatycznie zainicjalizowane
        this.initializeEnhancedModules();
    }
    
    initializeEnhancedModules() {
        // System Settings będzie używał modularnej architektury
        window.systemSettingsEnhanced = new SystemSettingsEnhanced();
        
        // Inne enhanced moduły...
        window.workshopEnhanced = new WorkshopEnhanced();
        window.testReportsEnhanced = new TestReportsEnhanced();
        window.testMenuEnhanced = new TestMenuEnhanced();
        window.deviceDataEnhanced = new DeviceDataEnhanced();
    }
}
```

## 🔗 API modułów

### Settings Core API

```javascript
// Dostęp do konfiguracji
const systemConfig = settingsCore.getSystemConfig();
const scenarios = settingsCore.getTestScenarios();
const integrations = settingsCore.getIntegrationSettings();
const standards = settingsCore.getStandardsConfig();

// Zarządzanie konfiguracją
settingsCore.updateSystemConfig('security', 'sessionTimeout', 45);
settingsCore.saveConfig();
settingsCore.exportConfig();
```

### Settings Scenarios API

```javascript
// Zarządzanie scenariuszami
settingsScenarios.createTestScenario();
settingsScenarios.editScenario('scenario_id');
settingsScenarios.deleteScenario('scenario_id');
settingsScenarios.importScenarios();
settingsScenarios.validateScenarios();
```

### Settings Integration API

```javascript
// Zarządzanie integracjami
settingsIntegration.addIntegration();
settingsIntegration.configureIntegration('integration_id');
settingsIntegration.testConnections();
settingsIntegration.syncData();
```

### Settings Standards API

```javascript
// Zarządzanie standardami
settingsStandards.updateStandards();
settingsStandards.validateCompliance();
settingsStandards.generateComplianceReport();
settingsStandards.configureStandard('pn_en_136');
```

### Settings System API

```javascript
// Konfiguracja systemu
settingsSystem.saveSystemConfig();
settingsSystem.resetToDefaults();
settingsSystem.restartSystem();
settingsSystem.exportSystemConfig();
settingsSystem.importSystemConfig();
```

## 📏 Standardy kodowania

### 1. Limit linii kodu
- **Maksimum 450 linii** na plik JavaScript
- Podział na mniejsze moduły w przypadku przekroczenia limitu

### 2. Konwencje nazewnictwa
- **Klasy**: PascalCase (np. `SettingsCore`)
- **Metody**: camelCase (np. `createTestScenario`)
- **Pliki**: kebab-case (np. `settings-core.js`)
- **Stałe**: UPPER_SNAKE_CASE (np. `MAX_CONCURRENT_TESTS`)

### 3. Dokumentacja
- JSDoc dla wszystkich klas i metod publicznych
- README.md dla każdego modułu
- Komentarze w języku polskim i angielskim

### 4. Struktura modułu

```javascript
/**
 * MASKTRONIC C20 - [Nazwa modułu]
 * [Opis funkcjonalności]
 * @version X.Y.Z
 * @author MASKTRONIC Team
 */

class ModuleName {
    constructor(dependencies) {
        // Inicjalizacja
    }
    
    // Metody publiczne
    
    // Metody prywatne
    
    // Helper methods
}

// Export dla ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleName;
}

console.log('✅ [Module Name] loaded');
```

## 🐛 Rozwiązywanie problemów

### Problem: Moduł nie jest załadowany
**Rozwiązanie**: Sprawdź kolejność ładowania skryptów w `index.html`

### Problem: Błędy JavaScript w konsoli
**Rozwiązanie**: Upewnij się, że wszystkie zależności są załadowane przed inicjalizacją

### Problem: Funkcjonalność nie działa
**Rozwiązanie**: Sprawdź czy globalne instancje są prawidłowo utworzone w `app.js`

## 📊 Statystyki modularyzacji

| Plik oryginalny | Rozmiar (linie) | Status | Nowe moduły |
|----------------|-----------------|---------|-------------|
| `system-settings-enhanced.js` | 1013 → 150 | ✅ Podzielony | 5 modułów |
| `workshop-enhanced.js` | 978 | 🔄 W trakcie | - |
| `test-reports-enhanced.js` | 912 | ⏳ Planowany | - |
| `test-menu-enhanced.js` | 831 | ⏳ Planowany | - |
| `device-data-enhanced.js` | 774 | ⏳ Planowany | - |

## 🔄 Następne kroki

1. **Dokończenie modularizacji** pozostałych dużych plików
2. **Testy integracyjne** nowej architektury
3. **Optymalizacja wydajności** modularnego ładowania
4. **Rozszerzenie dokumentacji** o przykłady użycia
5. **Implementacja ES6 modules** w przyszłych wersjach

---

**Wersja dokumentacji:** 2.0.0  
**Data ostatniej aktualizacji:** 2024-01-23  
**Autorzy:** MASKTRONIC Development Team
