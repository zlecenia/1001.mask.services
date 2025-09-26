# MASKTRONIC C20 - System Ról, Interfejsów i Uprawnień

## 📋 Przegląd Systemu

System MASKTRONIC C20 implementuje zaawansowany system kontroli dostępu oparty na rolach, z dodatkowymi ograniczeniami w zależności od używanego interfejsu (LCD 7.9" vs przeglądarka komputera).

## 🎭 Role Systemowe

### 1. **OPERATOR** 
- **Podstawowe funkcje testowe i monitorowanie**
- Dostęp do: Test Wizard, Device History, Real-time Sensors, View Reports, User Data
- **Ekran**: `operator-menu-screen.html`
- **Ograniczenia**: Brak dostępu do zarządzania użytkownikami i ustawień systemowych

### 2. **ADMIN**
- **Zarządzanie użytkownikami i zaawansowane raportowanie**  
- Dostęp do: Users Management, Batch Reports, Report Schedule + funkcje OPERATOR
- **Ekran**: `admin-menu-screen.html`
- **Ograniczenia**: Brak dostępu do krytycznych ustawień systemowych

### 3. **SERVICEUSER** (Service Technician)
- **Konserwacja, kalibracja i zarządzanie warsztatem**
- Dostęp do: Workshop Parts/Maintenance/Tools/Inventory, Service Menu + podstawowe funkcje
- **Ekran**: `service-menu-screen.html`  
- **Ograniczenia**: Brak dostępu do zarządzania użytkownikami i ustawień systemowych

### 4. **SUPERUSER**
- **Pełny dostęp systemowy i administracja**
- Dostęp do: Wszystkich funkcji + System Settings, Integrations, Standards
- **Ekran**: `superuser-menu-screen.html`
- **Ograniczenia**: Brak ograniczeń

## 🖥️ Interfejsy i Ograniczenia

### **Interfejs LCD 7.9" (400x1280px)**
- **Cel**: Obsługa urządzenia z ekranem dotykowym
- **Ograniczenia**:
  - Ograniczona lista funkcji (najpotrzebniejsze dla danej roli)
  - Zoptymalizowany layout dla proporcji 30% wysokości do szerokości
  - Większe przyciski i elementy dotykowe
  - Uproszczone menu bez zagnieżdżeń

### **Interfejs Komputerowy (Przeglądarka)**
- **Cel**: Pełna funkcjonalność dla administratorów
- **Możliwości**:
  - Pełny zakres funkcji dla przypisanej roli
  - Zaawansowane formularze i tabele
  - Skróty klawiszowe i funkcje zaawansowane

## 🔐 Personalizacja Uprawnień

### **Poziom 1: Przypisanie Ról**
Każdy użytkownik może mieć przypisane kombinacje ról:
- `OPERATOR` 
- `OPERATOR + ADMIN`
- `SERVICEUSER + ADMIN`
- `SUPERUSER` (wszystkie uprawnienia)

### **Poziom 2: Ograniczenia w Ramach Ról**
Można ograniczyć dostęp do konkretnych funkcji w ramach przypisanej roli:
```javascript
userPermissions = {
    roles: ['OPERATOR', 'ADMIN'],
    restrictions: {
        'ADMIN': {
            excludeFunctions: ['users_delete', 'system_backup']
        }
    },
    interface: 'LCD' // lub 'BROWSER'
}
```

### **Poziom 3: Ograniczenia Interfejsowe**
- **LCD**: Automatyczne ograniczenie do podstawowych funkcji
- **Browser**: Pełny dostęp zgodny z rolą

## 🏗️ Architektura Systemu

### **1. Struktura Ekranów**
```
views/screens/
├── login-screen.html           # Logowanie
├── operator-menu-screen.html   # Menu OPERATOR
├── admin-menu-screen.html      # Menu ADMIN  
├── service-menu-screen.html    # Menu SERVICEUSER
├── superuser-menu-screen.html  # Menu SUPERUSER
└── user-menu-screen.html       # Menu ogólne (legacy)
```

### **2. System Ładowania Widoków**
- **ViewLoader**: Dynamiczne ładowanie ekranów z plików HTML
- **MenuManager**: Integracja z ViewLoader dla szablonów
- **TemplateValidator**: Walidacja poprawności ładowania

### **3. Kontrola Dostępu**
```javascript
// Przykład kontroli dostępu
function checkAccess(user, functionName) {
    const hasRole = user.roles.includes(getRequiredRole(functionName));
    const notRestricted = !user.restrictions[functionName];
    const interfaceAllowed = checkInterfaceRestrictions(user.interface, functionName);
    
    return hasRole && notRestricted && interfaceAllowed;
}
```

## 🎯 Mapowanie Funkcji do Ról

| Funkcja | OPERATOR | ADMIN | SERVICEUSER | SUPERUSER |
|---------|----------|-------|-----------|-----------|
| Test Wizard | ✅ | ✅ | ❌ | ✅ |
| Device History | ✅ | ✅ | ✅ | ✅ |
| Real-time Sensors | ✅ | ✅ | ✅ | ✅ |
| Users Management | ❌ | ✅ | ❌ | ✅ |
| Batch Reports | ❌ | ✅ | ❌ | ✅ |
| Workshop Parts | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |
| Integrations | ❌ | ❌ | ❌ | ✅ |

## 🔧 Implementacja Techniczna

### **1. Logowanie i Inicjalizacja**
```javascript
// Po zalogowaniu
function initializeUserSession(username, roles, interface) {
    const userScreen = determineUserScreen(roles);
    await viewLoader.loadAndInjectView(userScreen);
    setupRoleBasedMenu(roles, interface);
}
```

### **2. Dynamiczne Menu**
```javascript
// Filtrowanie opcji menu
function filterMenuOptions(menuOptions, userRoles, interface) {
    return menuOptions.filter(option => {
        return hasPermission(option, userRoles) && 
               isInterfaceSupported(option, interface);
    });
}
```

### **3. Walidacja Dostępu**
```javascript
// TemplateValidator sprawdza:
- Czy szablon się załadował
- Czy router zmienił URL
- Czy zawartość menu została zaktualizowana
- Czy wszystkie elementy są funkcjonalne
```

## 📱 Optymalizacja LCD (400x1280px)

### **Wytyczne Designu**:
- **Proporcje**: 30% wysokości do szerokości
- **Przyciski**: Minimum 44px wysokości dla touch
- **Tekst**: Minimum 16px dla czytelności
- **Margines**: 8px między elementami
- **Kolory**: Wysoky kontrast dla LCD

### **Przykład CSS**:
```css
@media screen and (max-width: 400px) and (max-height: 1280px) {
    .menu-item {
        height: 64px;
        font-size: 18px;
        padding: 12px;
        margin: 8px 0;
    }
    
    .lcd-optimized {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
}
```

## 🧪 System Walidacji

### **TemplateValidator Features**:
- ✅ Monitorowanie ładowania szablonów
- ✅ Śledzenie zmian routera/hash
- ✅ Walidacja zawartości menu
- ✅ Raportowanie błędów
- ✅ Skróty klawiszowe: `Ctrl+Shift+V`

### **Przykład Użycia**:
```javascript
// Test konkretnej opcji menu
await templateValidator.testMenuOption('user_data');

// Generuj raport walidacji  
const report = templateValidator.generateReport();

// Monitor w czasie rzeczywistym
templateValidator.setupMenuMonitoring();
```

## 🚀 Wdrożenie i Testowanie

### **1. Weryfikacja Ról**
1. Zaloguj się jako każda rola
2. Sprawdź dostępne opcje menu
3. Przetestuj funkcje przypisane do roli

### **2. Test Interfejsów**
1. Uruchom w przeglądarce (symulacja komputera)
2. Zmień rozdzielczość na 400x1280 (symulacja LCD)
3. Porównaj dostępne funkcje

### **3. Walidacja Systemu**
1. Użyj `TemplateValidator` do testów
2. Sprawdź logi konsoli
3. Wygeneruj raport wyników

---

**System MASKTRONIC C20 zapewnia pełną kontrolę dostępu z elastycznymi ograniczeniami interfejsowymi, zoptymalizowany dla urządzeń LCD touchscreen 7.9" oraz pełnofunkcjonalnych przeglądarek komputerowych.**
