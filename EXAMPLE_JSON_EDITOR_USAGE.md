# 🛠️ JSON Editor - Praktyczny Przewodnik Użycia

## 🎯 **Cel: Edycja Konfiguracji Komponentów**

JSON Editor pozwala na bezpieczną edycję plików konfiguracyjnych wszystkich komponentów bez bezpośredniej manipulacji JSON.

---

## 🚀 **Scenariusz 1: Edycja AppFooter Config**

### Uruchomienie JSON Editor
```bash
# Uruchom JSON Editor na porcie 3009
npm run component:dev:jsonEditor

# Otwórz w przeglądarce
http://localhost:3009
```

### Krok po kroku:

#### 1. **Wybór Komponentu**
- W dropdown "Komponent" wybierz: **appFooter**
- Automatycznie załadują się dostępne pliki konfiguracyjne

#### 2. **Wybór Pliku Config**
- W dropdown "Plik Config" wybierz: **config.json**
- To jest główny plik konfiguracyjny komponentu

#### 3. **Zastosowanie Schema**
- W dropdown "Schema" wybierz: **App Configuration**
- Schema zapewni walidację danych

#### 4. **Załadowanie Przykładu**
- Kliknij przycisk **"📂 Załaduj Przykład"**
- Zostanie wczytana przykładowa konfiguracja appFooter

#### 5. **Edycja Wartości**
- **Kliknij na wartość** w drzewie JSON aby ją edytować
- Przykład: zmień `"showTimestamp": true` na `false`
- **Enter** - zapisz zmianę
- **Escape** - anuluj edycję

#### 6. **Walidacja**
- Kliknij **"✅ Waliduj"** aby sprawdzić poprawność
- Błędy będą wyświetlone na czerwono
- Sukces zostanie potwierdzony na zielono

#### 7. **Zapisanie Konfiguracji**
- Kliknij **"💾 Zapisz Config"**
- Plik zostanie zapisany w `js/features/appFooter/0.1.0/config/config.json`

---

## 🚀 **Scenariusz 2: Edycja Menu Structure**

### Cel: Dodanie nowej pozycji do menu OPERATOR

#### 1. **Konfiguracja Edytora**
```
Komponent: mainMenu
Plik Config: config.json
Schema: Menu Structure
```

#### 2. **Załaduj Przykład**
Zostanie załadowana struktura:
```json
{
  "OPERATOR": [
    { "key": "test_wizard", "label": "Test Wizard", "icon": "🧙" },
    { "key": "test_quick", "label": "Quick Test", "icon": "⚡" }
  ]
}
```

#### 3. **Dodaj Nową Pozycję Menu**
- Kliknij **"➕ Dodaj element"** obok tablicy OPERATOR
- Wypełnij modal:
  - **Klucz**: `sensors`
  - **Typ**: `object`
  - **Wartość**: `{}` (pusty obiekt)
- Kliknij **"Dodaj"**

#### 4. **Wypełnij Szczegóły Pozycji**
Dla nowo utworzonego obiektu dodaj właściwości:
- `key`: "sensors"
- `label`: "Sensory"  
- `icon`: "🔬"

#### 5. **Wynik**
```json
{
  "OPERATOR": [
    { "key": "test_wizard", "label": "Test Wizard", "icon": "🧙" },
    { "key": "test_quick", "label": "Quick Test", "icon": "⚡" },
    { "key": "sensors", "label": "Sensory", "icon": "🔬" }
  ]
}
```

---

## 🚀 **Scenariusz 3: Edycja System Settings (Ograniczona)**

### Cel: Zmiana timeout sesji w systemSettings

#### 1. **Konfiguracja**
```
Komponent: systemSettings
Plik Config: config.json  
Schema: System Configuration
```

#### 2. **Uwaga o Bezpieczeństwie**
System Settings ma **ograniczone uprawnienia edycji**:
- ✅ **Dozwolone**: timeouty, progi alarmowe, UI settings
- ❌ **Chronione**: role, ścieżki systemowe, tokeny bezpieczeństwa

#### 3. **Edycja Dozwolonych Pól**
Możesz edytować:
```json
{
  "authentication": {
    "session_timeout": 1800,        // ✅ Edytowalny
    "max_login_attempts": 5         // ✅ Edytowalny
  },
  "ui": {
    "animations_enabled": true      // ✅ Edytowalny
  },
  "sensors": {
    "update_interval": 1000,        // ✅ Edytowalny
    "alarm_thresholds": {           // ✅ Edytowalny
      "pressure_high": 6.0,
      "pressure_low": 0.5
    }
  }
}
```

#### 4. **Chronione Pola**
Te pola **NIE MOGĄ** być edytowane:
```json
{
  "roles": { ... },                 // ❌ Chronione
  "security_paths": { ... },        // ❌ Chronione  
  "encryption_keys": { ... }        // ❌ Chronione
}
```

---

## 🚀 **Scenariusz 4: Custom JSON Editing**

### Cel: Edycja dowolnego pliku JSON

#### 1. **Przygotowanie**
- Nie wybieraj komponentu ani schematu
- Kliknij **"📂 Załaduj plik"** i wybierz dowolny plik .json
- Lub użyj **"Załaduj Przykład"** bez schematu

#### 2. **Pełna Swoboda Edycji**
Bez schematu możesz:
- Dodawać dowolne pola
- Usuwać wszystkie elementy  
- Zmieniać typy danych
- Tworzyć zagnieżdżone struktury

#### 3. **Eksport Rezultatu**
- Kliknij **"💾 Eksportuj JSON"**
- Pobierz zedytowany plik

---

## 🔧 **Zaawansowane Funkcje**

### 1. **Zarządzanie Typami Danych**
```
String: "tekst"           -> edytuj bezpośrednio
Number: 123               -> wpisz liczbę
Boolean: true/false       -> wpisz true lub false  
Array: []                 -> użyj ➕ aby dodać elementy
Object: {}                -> użyj ➕ aby dodać właściwości
```

### 2. **Skróty Klawiszowe**
- **Enter** - zapisz edycję
- **Escape** - anuluj edycję
- **Tab** - przejdź do następnego pola

### 3. **Walidacja w Czasie Rzeczywistym**
- Błędy składni JSON są wyświetlane natychmiast
- Schema validation działa podczas edycji
- Kolorowe oznaczenia: 🟢 poprawne, 🔴 błędne

---

## 🎯 **Praktyczne Przykłady Konfiguracji**

### AppFooter Display Settings
```json
{
  "display": {
    "showTimestamp": true,
    "showSystemInfo": true,
    "showConnectionStatus": true,
    "compactMode": false,
    "updateInterval": 1000
  },
  "theme": {
    "backgroundColor": "#2c3e50",
    "textColor": "#ecf0f1",
    "fontSize": "12px"
  }
}
```

### MainMenu dla różnych ról
```json
{
  "OPERATOR": [
    { "key": "dashboard", "label": "Dashboard", "icon": "📊", "route": "/dashboard" },
    { "key": "sensors", "label": "Sensory", "icon": "🔬", "route": "/sensors" }
  ],
  "ADMIN": [
    { "key": "dashboard", "label": "Dashboard", "icon": "📊", "route": "/dashboard" },
    { "key": "users", "label": "Użytkownicy", "icon": "👥", "route": "/users" },
    { "key": "settings", "label": "Ustawienia", "icon": "⚙️", "route": "/settings" }
  ]
}
```

### System Security Settings
```json
{
  "authentication": {
    "session_timeout": 1800,
    "max_login_attempts": 5,
    "password_policy": {
      "min_length": 8,
      "require_uppercase": true,
      "require_numbers": true
    }
  },
  "api": {
    "rate_limit": 100,
    "timeout": 5000,
    "retry_attempts": 3
  }
}
```

---

## 🔒 **Bezpieczeństwo i Najlepsze Praktyki**

### 1. **Przed Edycją**
- ✅ Zrób kopię zapasową konfiguracji
- ✅ Sprawdź uprawnienia edycji
- ✅ Wybierz odpowiednią schema

### 2. **Podczas Edycji**
- ✅ Waliduj każdą zmianę
- ✅ Sprawdzaj preview na bieżąco
- ✅ Używaj logicznych nazw kluczy

### 3. **Po Edycji**
- ✅ Waliduj całą konfigurację
- ✅ Testuj komponent po zmianach
- ✅ Sprawdź czy aplikacja działa poprawnie

### 4. **Co NIGDY nie robić**
- ❌ Nie usuwaj wymaganych pól
- ❌ Nie zmieniaj typów danych krytycznych pól
- ❌ Nie edytuj ID komponentów lub wersji
- ❌ Nie pomijaj walidacji przed zapisem

---

## 🎉 **JSON Editor jest gotowy!**

**Wszystkie funkcje działają:**
- ✅ **Wybór komponentów** z listy
- ✅ **Multi-file editing** (config.json, data.json, schema.json, crud.json)
- ✅ **Schema validation** dla 6 typów konfiguracji
- ✅ **Visual tree editing** z click-to-edit
- ✅ **Real-time preview** z syntax highlighting
- ✅ **Import/Export** plików JSON
- ✅ **Safety features** z backup system
- ✅ **Responsive design** zoptymalizowany dla 7.9" display

### Uruchomienie:
```bash
npm run component:dev:jsonEditor
# http://localhost:3009
```

### Przykłady użycia:
- `example-usage.html` - interaktywne scenariusze
- `standalone.html` - podstawowy edytor
- Ten przewodnik - szczegółowe instrukcje

**JSON Editor jest teraz w pełni funkcjonalnym narzędziem do bezpiecznej edycji konfiguracji wszystkich komponentów MASKSERVICE!** 🛠️✨
