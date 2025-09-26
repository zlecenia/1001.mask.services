# 📋 Przewodnik Użytkowania Wyodrębnionych Schematów JSON

## 🎯 **Przegląd Systemu**

System składa się z **13 wyodrębnionych plików**:

### 📄 **Schematy Walidacji** (6 plików)
- `app-schema.json` - Walidacja app.json
- `menu-schema.json` - Walidacja menu.json  
- `router-schema.json` - Walidacja router.json
- `system-schema.json` - Walidacja system.json
- `test-scenarios-schema.json` - Walidacja test-scenarios.json
- `workshop-schema.json` - Walidacja workshop.json

### 🔧 **Reguły CRUD** (6 plików)
- `app-crud.json` - Reguły edycji app.json
- `menu-crud.json` - Reguły edycji menu.json
- `router-crud.json` - Reguły edycji router.json
- `system-crud.json` - Reguły edycji system.json
- `test-scenarios-crud.json` - Reguły edycji test-scenarios.json
- `workshop-crud.json` - Reguły edycji workshop.json

### 🛠️ **Edytor Główny** (1 plik)
- `json-config-editor.html` - Główny edytor z logiką

---

## 🚀 **Jak używać**

### **1. Podstawowe użycie**
```
1. Otwórz edytor (json-config-editor.html)
2. Wybierz typ z listy (np. "App.json") 
3. Kliknij "Załaduj Przykład"
4. Edytuj wartości (klik na zielone pola)
5. Waliduj i eksportuj
```

### **2. Import własnych schematów**
```
1. Kliknij "Schema:" → wybierz np. app-schema.json
2. Kliknij "CRUD Rules:" → wybierz np. app-crud.json  
3. Wybierz odpowiedni typ z listy
4. Wczytaj swój plik JSON
```

### **3. Tworzenie nowego typu**
```javascript
// Stwórz my-config-schema.json
{
  "type": "object",
  "title": "Moja Konfiguracja",
  "properties": {
    "setting1": { "type": "string" },
    "setting2": { "type": "number" }
  },
  "required": ["setting1"]
}

// Stwórz my-config-crud.json
{
  "name": "my-config",
  "title": "Moja Konfiguracja", 
  "rules": {
    "editable": ["setting1", "setting2"],
    "addable": false,
    "deletable": false
  }
}
```

---

## 📚 **Struktury Reguł CRUD**

### **editable** - Co można edytować
```json
"editable": [
  "field1",                    // Bezpośrednie pole
  "object/field",              // Pole w obiekcie  
  "array/*/field",             // Pole w każdym elemencie tablicy
  "deep/*/nested/*/field"      // Głęboko zagnieżdżone pole
]
```

### **addable** - Gdzie można dodawać
```json
"addable": [
  "array",                     // Dodawanie do tablicy
  "object/nested_array",       // Dodawanie do zagnieżdżonej tablicy
  "*/dynamic_field"            // Dodawanie pól dynamicznych
]
```

### **deletable** - Co można usuwać  
```json
"deletable": [
  "array/*",                   // Usuwanie elementów z tablicy
  "object/optional_field",     // Usuwanie opcjonalnych pól
  "*/removable/*"              // Wzorzec usuwania
]
```

---

## ⚙️ **Typy Pól w CRUD**

### **Podstawowe typy**
| Typ | Opis | Przykład |
|-----|------|----------|
| `string` | Zwykły tekst | "Nazwa" |
| `number` | Liczba | 42 |
| `boolean` | true/false | true |
| `select` | Lista wyboru | ["opt1", "opt2"] |
| `email` | Adres email | "user@domain.com" |
| `url` | Adres URL | "https://example.com" |

### **Specjalne typy**
| Typ | Opis | Format |
|-----|------|---------|
| `duration_ms` | Czas w ms | 5000 (5 sekund) |
| `date` | Data | "2024-01-15" |
| `currency` | Waluta | 45.50 |
| `phone` | Telefon | "+48 123 456 789" |
| `readonly_string` | Tylko odczyt | "READONLY" |

---

## 🔍 **Przykłady Walidacji**

### **App.json - Prosty schemat**
```json
{
  "API_URL": "http://localhost:3000",     // ✅ Można edytować
  "WS_URL": "ws://localhost:3000",        // ✅ Można edytować  
  "MOCK_MODE": true,                      // ✅ Można edytować
  "UPDATE_INTERVAL": 5000                 // ✅ Można edytować
}
// ❌ Nie można dodawać/usuwać pól
```

### **Menu.json - Tablica obiektów**
```json
{
  "OPERATOR": [                           // ❌ Nazwa roli chroniona
    {
      "key": "test_wizard",               // ✅ Można edytować
      "label": "Test Wizard",             // ✅ Można edytować
      "icon": "🧙"                        // ✅ Można edytować
    }
  ]
}
// ✅ Można dodawać nowe pozycje menu
// 🗑️ Można usuwać pozycje menu (cały obiekt)
```

### **Workshop.json - Złożona struktura**
```json
{
  "spare_parts": {
    "default_parts": [
      {
        "id": "F001",                     // ❌ ID chronione
        "name": "Filtr P3",               // ✅ Można edytować
        "category": "FILTER",             // ❌ Kategoria chroniona
        "quantity": 25,                   // ✅ Można edytować
        "price": 45.50                    // ✅ Można edytować
      }
    ]
  }
}
// ✅ Można dodawać nowe części
// 🗑️ Można usuwać części (cały obiekt)
```

---

## 💡 **Wskazówki**

### **🟢 Zielone pola** = Edytowalne
- Kliknij aby edytować
- Enter = zapisz, Escape = anuluj
- Automatyczna konwersja typów

### **🔴 Czerwone pola** = Tylko odczyt  
- Zazwyczaj ID, kategorie, struktury
- Chronione przed przypadkową zmianą

### **➕ Przycisk Dodaj**
- Dostępny gdzie `addable` pozwala
- Otwiera modal z formularzem
- Automatycznie dobiera typ

### **🗑️ Przycisk Usuń**
- Usuwa CAŁY obiekt z tablicy
- NIE usuwa pojedynczych pól
- Wymaga potwierdzenia

---

## 📦 **Export/Import**

### **Eksport opcje**
1. **💾 Eksportuj JSON** - tylko dane
2. **📋 Eksportuj Bieżący** - schema + crud dla aktywnego typu  
3. **📦 Eksportuj Wszystko** - wszystkie schematy i reguły (12 plików)

### **Import opcje**
1. **Plik JSON** - dane do edycji
2. **Schema** - pojedynczy schemat walidacji
3. **CRUD Rules** - pojedynczy plik reguł

---

## 🔧 **Automatyczne funkcje**

### **Wykrywanie typu pliku**
```javascript
// Na podstawie nazwy
app.json → typ "app"
menu.json → typ "menu"

// Na podstawie struktury
{API_URL, WS_URL} → typ "app"
{OPERATOR, ADMIN} → typ "menu"
{spare_parts, tools} → typ "workshop"
```

### **Walidacja w czasie rzeczywistym**
- Sprawdzanie typów danych
- Kontrola zakresów (min/max)
- Walidacja wzorców (regex)
- Sprawdzanie wymaganych pól

### **Inteligentne parsowanie**
```javascript
"123" → 123 (number)
"true" → true (boolean)
"null" → null
"\"text\"" → "text" (string)
```

---

## 🛡️ **Bezpieczeństwo**

### **Poziomy ochrony**
1. **Protected** - całe sekcje chronione
2. **Readonly** - pojedyncze pola chronione  
3. **Editable** - można bezpiecznie edytować
4. **Addable** - można dodawać nowe elementy
5. **Deletable** - można usuwać elementy

### **Walidacja schematu**
- Sprawdzenie zgodności ze schematem JSON
- Kontrola wymaganych pól
- Walidacja typów i formatów
- Ostrzeżenia o niezgodnościach

---

## 🎮 **Przykłady użycia**

### **Administrator systemu**
```
1. Edytuje system.json (timeouty, prógi alarmowe)
2. Modyfikuje menu.json (dodaje nowe opcje)
3. Konfiguruje router.json (nowe języki)
```

### **Serwisant**
```  
1. Aktualizuje workshop.json (stany magazynowe)
2. Dodaje nowe części zamienne
3. Planuje harmonogramy konserwacji
```

### **Operator**
```
1. Zmienia app.json (adresy serwerów)
2. Konfiguruje scenariusze testów
3. Eksportuje raporty
```

---

## 📈 **Rozbudowa systemu**

### **Dodawanie nowego typu**
1. Stwórz `my-type-schema.json`
2. Stwórz `my-type-crud.json`
3. Dodaj do listy w edytorze
4. Zaimportuj pliki przez interfejs

### **Modyfikacja istniejących**
1. Wyeksportuj aktualny schemat
2. Edytuj w zewnętrznym edytorze
3. Zaimportuj z powrotem
4. Przetestuj walidację

Ten system zapewnia **maksymalną elastyczność** przy zachowaniu **bezpieczeństwa struktury** danych konfiguracyjnych! 🚀