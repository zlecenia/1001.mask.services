/**
 * System Settings Component 0.1.0
 * Advanced system configuration and settings management
 * Migrated from c201001.mask.services to 1001.mask.services modular structure
 */

import { getSecurityService } from '../../../services/securityService.js';

const template = `
<div class="system-settings landscape-7-9">
  <div class="settings-container">
    
    <!-- Header -->
    <div class="settings-header">
      <button class="back-btn" @click="goBack">← {{ $t('common.back') || 'Powrót' }}</button>
      <h2 class="settings-title">{{ pageTitle }}</h2>
      <div class="header-actions">
        <div v-if="settingsState.hasUnsavedChanges" class="unsaved-indicator">
          ⚠️ {{ $t('settings.unsaved_changes') || 'Niezapisane zmiany' }}
        </div>
        <div class="vue-badge">Vue 3</div>
      </div>
    </div>

    <!-- Settings Tabs -->
    <div class="settings-tabs">
      <button 
        v-for="category in settingsCategories" 
        :key="category.id"
        class="tab-button"
        :class="{ active: activeTab === category.id }"
        @click="activeTab = category.id"
      >
        {{ category.icon }} {{ category.name }}
      </button>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      
      <!-- Network Settings -->
      <div v-if="activeTab === 'network'" class="settings-group">
        <h3>🌐 {{ $t('settings.network_title') || 'Ustawienia Sieci' }}</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>{{ $t('settings.ip_address') || 'Adres IP:' }}</label>
            <input 
              v-model="networkSettings.ipAddress" 
              type="text" 
              :class="{ invalid: !isValidIP(networkSettings.ipAddress) }"
              placeholder="192.168.1.10"
            />
            <span v-if="!isValidIP(networkSettings.ipAddress)" class="error-hint">
              {{ $t('settings.invalid_ip') || 'Nieprawidłowy adres IP' }}
            </span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.port') || 'Port:' }}</label>
            <input 
              v-model.number="networkSettings.port" 
              type="number" 
              :class="{ invalid: !isValidPort(networkSettings.port) }"
              min="1" max="65535"
            />
            <span v-if="!isValidPort(networkSettings.port)" class="error-hint">
              {{ $t('settings.invalid_port') || 'Port musi być w zakresie 1-65535' }}
            </span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.gateway') || 'Brama:' }}</label>
            <input 
              v-model="networkSettings.gateway" 
              type="text" 
              :class="{ invalid: !isValidIP(networkSettings.gateway) }"
              placeholder="192.168.1.1"
            />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.dns_server') || 'Serwer DNS:' }}</label>
            <input 
              v-model="networkSettings.dnsServer" 
              type="text" 
              :class="{ invalid: !isValidIP(networkSettings.dnsServer) }"
              placeholder="8.8.8.8"
            />
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="networkSettings.dhcpEnabled" type="checkbox" />
              {{ $t('settings.dhcp_enabled') || 'DHCP włączone' }}
            </label>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.connection_timeout') || 'Timeout połączenia (s):' }}</label>
            <input v-model.number="networkSettings.connectionTimeout" type="number" min="5" max="300" />
          </div>
        </div>
        
        <div class="network-actions">
          <button class="test-btn" @click="testConnection" :disabled="settingsState.isLoading">
            {{ settingsState.isLoading ? '⏳ ' + ($t('settings.testing') || 'Testowanie...') : '🔍 ' + ($t('settings.test_connection') || 'Test połączenia') }}
          </button>
          <div v-if="networkTestResult" class="test-result" :class="networkTestResult.success ? 'success' : 'error'">
            {{ networkTestResult.message }}
          </div>
        </div>
      </div>

      <!-- System Configuration -->
      <div v-if="activeTab === 'system'" class="settings-group">
        <h3>⚙️ {{ $t('settings.system_title') || 'Konfiguracja Systemu' }}</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>{{ $t('settings.update_interval') || 'Interwał odświeżania (s):' }}</label>
            <input v-model.number="systemConfig.updateInterval" type="number" min="1" max="3600" />
            <span class="hint">{{ $t('settings.update_interval_hint') || 'Jak często system pobiera nowe dane' }}</span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.log_level') || 'Poziom logów:' }}</label>
            <select v-model="systemConfig.logLevel">
              <option v-for="option in logLevelOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.max_log_files') || 'Maksymalna liczba plików logów:' }}</label>
            <input v-model.number="systemConfig.maxLogFiles" type="number" min="1" max="100" />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.data_retention') || 'Retencja danych (dni):' }}</label>
            <input v-model.number="systemConfig.dataRetention" type="number" min="1" max="3650" />
            <span class="hint">{{ $t('settings.data_retention_hint') || 'Jak długo przechowywać dane historyczne' }}</span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.backup_interval') || 'Interwał kopii zapasowej (godziny):' }}</label>
            <input v-model.number="systemConfig.backupInterval" type="number" min="1" max="168" />
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="systemConfig.debugMode" type="checkbox" />
              {{ $t('settings.debug_mode') || 'Tryb debugowania' }}
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="systemConfig.autoBackup" type="checkbox" />
              {{ $t('settings.auto_backup') || 'Automatyczne kopie zapasowe' }}
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="systemConfig.enableMonitoring" type="checkbox" />
              {{ $t('settings.enable_monitoring') || 'Włącz monitorowanie systemu' }}
            </label>
          </div>
        </div>
        
        <div class="system-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">{{ $t('settings.system_version') || 'Wersja systemu:' }}</span>
              <span class="value">{{ systemInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('settings.last_restart') || 'Ostatni restart:' }}</span>
              <span class="value">{{ formatTimestamp(systemInfo.lastRestart) }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ $t('settings.uptime') || 'Czas pracy:' }}</span>
              <span class="value">{{ systemInfo.uptime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Device Settings -->
      <div v-if="activeTab === 'device'" class="settings-group">
        <h3>🔧 {{ $t('settings.device_title') || 'Ustawienia Urządzenia' }}</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>{{ $t('settings.device_name') || 'Nazwa urządzenia:' }}</label>
            <input v-model="deviceSettings.deviceName" type="text" maxlength="50" />
            <span class="hint">{{ $t('settings.device_name_hint') || 'Unikalna nazwa identyfikująca urządzenie' }}</span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.location') || 'Lokalizacja:' }}</label>
            <input v-model="deviceSettings.location" type="text" maxlength="100" />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.timezone') || 'Strefa czasowa:' }}</label>
            <select v-model="deviceSettings.timezone">
              <option v-for="tz in timezoneOptions" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.language') || 'Język interfejsu:' }}</label>
            <select v-model="deviceSettings.language">
              <option value="pl">Polski</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.units') || 'Jednostki miary:' }}</label>
            <select v-model="deviceSettings.units">
              <option value="metric">{{ $t('settings.metric') || 'Metryczne' }}</option>
              <option value="imperial">{{ $t('settings.imperial') || 'Imperialne' }}</option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.precision') || 'Precyzja wyświetlania:' }}</label>
            <input v-model.number="deviceSettings.precision" type="number" min="0" max="5" />
            <span class="hint">{{ $t('settings.precision_hint') || 'Liczba miejsc po przecinku' }}</span>
          </div>
        </div>
        
        <div class="device-status">
          <h4>{{ $t('settings.device_status') || 'Status urządzenia' }}</h4>
          <div class="status-grid">
            <div class="status-item" :class="deviceStatus.connection.status">
              <span class="status-icon">{{ deviceStatus.connection.icon }}</span>
              <span class="status-text">{{ deviceStatus.connection.text }}</span>
            </div>
            <div class="status-item" :class="deviceStatus.memory.status">
              <span class="status-icon">{{ deviceStatus.memory.icon }}</span>
              <span class="status-text">{{ deviceStatus.memory.text }}</span>
            </div>
            <div class="status-item" :class="deviceStatus.storage.status">
              <span class="status-icon">{{ deviceStatus.storage.icon }}</span>
              <span class="status-text">{{ deviceStatus.storage.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div v-if="activeTab === 'security'" class="settings-group">
        <h3>🔒 {{ $t('settings.security_title') || 'Ustawienia Bezpieczeństwa' }}</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>{{ $t('settings.session_timeout') || 'Timeout sesji (minuty):' }}</label>
            <input v-model.number="securitySettings.sessionTimeout" type="number" min="5" max="480" />
            <span class="hint">{{ $t('settings.session_timeout_hint') || 'Automatyczne wylogowanie po okresie nieaktywności' }}</span>
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.max_login_attempts') || 'Maksymalna liczba prób logowania:' }}</label>
            <input v-model.number="securitySettings.maxLoginAttempts" type="number" min="1" max="10" />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.password_expiry') || 'Wygaśnięcie hasła (dni):' }}</label>
            <input v-model.number="securitySettings.passwordExpiry" type="number" min="30" max="365" />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.lockout_duration') || 'Czas blokady konta (minuty):' }}</label>
            <input v-model.number="securitySettings.lockoutDuration" type="number" min="5" max="1440" />
          </div>
          
          <div class="setting-item">
            <label>{{ $t('settings.encryption_level') || 'Poziom szyfrowania:' }}</label>
            <select v-model="securitySettings.encryptionLevel">
              <option value="AES128">AES-128</option>
              <option value="AES256">AES-256</option>
              <option value="RSA2048">RSA-2048</option>
            </select>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="securitySettings.enableTwoFactor" type="checkbox" />
              {{ $t('settings.enable_2fa') || 'Dwuskładnikowe uwierzytelnianie' }}
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="securitySettings.auditLogging" type="checkbox" />
              {{ $t('settings.audit_logging') || 'Logowanie zdarzeń bezpieczeństwa' }}
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="securitySettings.forcePasswordChange" type="checkbox" />
              {{ $t('settings.force_password_change') || 'Wymuś zmianę hasła przy pierwszym logowaniu' }}
            </label>
          </div>
          
          <div class="setting-item checkbox">
            <label>
              <input v-model="securitySettings.enableSessionMonitoring" type="checkbox" />
              {{ $t('settings.session_monitoring') || 'Monitorowanie sesji użytkowników' }}
            </label>
          </div>
        </div>

        <div class="security-actions">
          <button class="security-btn" @click="generateSecurityReport">
            📊 {{ $t('settings.security_report') || 'Raport bezpieczeństwa' }}
          </button>
          <button class="security-btn" @click="clearAuditLogs">
            🗑️ {{ $t('settings.clear_logs') || 'Wyczyść logi audytu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Actions Panel -->
    <div class="actions-panel">
      <div class="actions-left">
        <button class="reset-btn" @click="resetSettings">
          🔄 {{ $t('settings.reset') || 'Przywróć domyślne' }}
        </button>
        <button class="export-btn" @click="exportSettings">
          📤 {{ $t('settings.export') || 'Eksportuj ustawienia' }}
        </button>
        <button class="import-btn" @click="importSettings">
          📥 {{ $t('settings.import') || 'Importuj ustawienia' }}
        </button>
      </div>
      
      <div class="actions-right">
        <div v-if="settingsState.lastSaved" class="last-saved">
          {{ $t('settings.last_saved') || 'Ostatnio zapisano:' }} 
          {{ formatTimestamp(settingsState.lastSaved) }}
        </div>
        <button 
          class="save-btn" 
          @click="saveSettings"
          :disabled="settingsState.isLoading || !settingsState.hasUnsavedChanges"
          :class="{ loading: settingsState.isLoading }"
        >
          {{ settingsState.isLoading ? 
            '⏳ ' + ($t('settings.saving') || 'Zapisywanie...')  : 
            '💾 ' + ($t('settings.save') || 'Zapisz ustawienia') 
          }}
        </button>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="validationErrors.length > 0" class="validation-errors">
      <h4>{{ $t('settings.validation_errors') || 'Błędy walidacji:' }}</h4>
      <ul>
        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
      </ul>
    </div>
  </div>
</div>`;

const styles = `
<style scoped>
.system-settings {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.back-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover { background: #5a6268; }

.settings-title {
  margin: 0;
  color: #333;
  font-size: 1.6em;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.unsaved-indicator {
  padding: 6px 12px;
  background: #fff3cd;
  color: #856404;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
}

.vue-badge {
  background: #42b883;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;
}

.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding: 0 4px;
}

.tab-button {
  padding: 12px 16px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 120px;
}

.tab-button:hover {
  border-color: #4facfe;
  background: #f8f9ff;
}

.tab-button.active {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.settings-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.settings-group {
  padding: 20px;
}

.settings-group h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3em;
  border-bottom: 2px solid #4facfe;
  padding-bottom: 8px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-item.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.setting-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.9em;
}

.setting-item input, .setting-item select {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.setting-item input:focus, .setting-item select:focus {
  outline: none;
  border-color: #4facfe;
}

.setting-item input.invalid {
  border-color: #dc3545;
  background: #ffeaea;
}

.setting-item input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.hint {
  font-size: 0.8em;
  color: #888;
  font-style: italic;
}

.error-hint {
  font-size: 0.8em;
  color: #dc3545;
  font-weight: 500;
}

.network-actions, .security-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.test-btn, .security-btn {
  padding: 10px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s;
}

.test-btn:hover:not(:disabled), .security-btn:hover {
  background: #138496;
}

.test-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.test-result {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9em;
}

.test-result.success {
  background: #d4edda;
  color: #155724;
}

.test-result.error {
  background: #f8d7da;
  color: #721c24;
}

.system-info, .device-status {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.system-info h4, .device-status h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1em;
}

.info-grid, .status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item, .status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.status-item {
  flex-direction: row;
  gap: 8px;
}

.status-item.online { border-left: 4px solid #28a745; }
.status-item.warning { border-left: 4px solid #ffc107; }
.status-item.error { border-left: 4px solid #dc3545; }

.status-icon {
  font-size: 1.2em;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9em;
}

.value, .status-text {
  color: #333;
  font-size: 0.9em;
}

.actions-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 12px;
}

.actions-left, .actions-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.reset-btn, .export-btn, .import-btn {
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s;
}

.reset-btn:hover, .export-btn:hover, .import-btn:hover {
  background: #e9ecef;
}

.save-btn {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn.loading {
  animation: pulse 1.5s infinite;
}

.last-saved {
  font-size: 0.85em;
  color: #666;
}

.validation-errors {
  background: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.validation-errors h4 {
  margin: 0 0 8px 0;
  font-size: 1em;
}

.validation-errors ul {
  margin: 0;
  padding-left: 20px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 7.9" display optimizations */
@media (max-height: 450px) {
  .system-settings { padding: 8px; }
  .settings-header { padding: 12px 16px; margin-bottom: 12px; }
  .settings-title { font-size: 1.4em; }
  .settings-group { padding: 16px; }
  .settings-grid { gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .setting-item input, .setting-item select { padding: 8px 10px; }
  .actions-panel { padding: 12px 16px; }
}

@media (max-width: 1024px) {
  .settings-tabs { 
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .tab-button { min-width: auto; }
}
</style>
`;

const SystemSettingsComponent = {
  name: 'SystemSettingsComponent',
  template: template + styles,
  
  props: {
    user: {
      type: Object,
      default: () => ({ username: null, role: null, isAuthenticated: false })
    },
    language: {
      type: String,
      default: 'pl'
    }
  },
  
  emits: ['navigate', 'settings-changed', 'back'],
  
  data() {
    return {
      activeTab: 'network',
      
      settingsState: {
        isLoading: false,
        hasUnsavedChanges: false,
        lastSaved: null,
        isValidating: false
      },

      networkSettings: {
        ipAddress: '192.168.1.10',
        port: 8080,
        dhcpEnabled: false,
        gateway: '192.168.1.1',
        dnsServer: '8.8.8.8',
        connectionTimeout: 30
      },

      systemConfig: {
        updateInterval: 5,
        debugMode: false,
        logLevel: 'INFO',
        maxLogFiles: 10,
        autoBackup: true,
        backupInterval: 24,
        dataRetention: 365,
        enableMonitoring: true
      },

      deviceSettings: {
        deviceName: 'MASKTRONIC-001',
        location: 'Production Floor',
        timezone: 'Europe/Warsaw',
        language: 'pl',
        units: 'metric',
        precision: 2
      },

      securitySettings: {
        sessionTimeout: 30,
        maxLoginAttempts: 3,
        passwordExpiry: 90,
        lockoutDuration: 15,
        enableTwoFactor: false,
        encryptionLevel: 'AES256',
        auditLogging: true,
        forcePasswordChange: true,
        enableSessionMonitoring: true
      },

      systemInfo: {
        version: '1.0.0-beta',
        lastRestart: new Date(Date.now() - 3600000 * 24 * 2),
        uptime: '2d 14h 23m'
      },

      networkTestResult: null,
      validationErrors: [],
      securityService: null
    };
  },

  computed: {
    pageTitle() {
      return this.$t('settings.page_title') || 'Ustawienia Systemu';
    },

    settingsCategories() {
      return [
        {
          id: 'network',
          name: this.$t('settings.network_category') || 'Sieć',
          icon: '🌐'
        },
        {
          id: 'system',
          name: this.$t('settings.system_category') || 'System',
          icon: '⚙️'
        },
        {
          id: 'device',
          name: this.$t('settings.device_category') || 'Urządzenie',
          icon: '🔧'
        },
        {
          id: 'security',
          name: this.$t('settings.security_category') || 'Bezpieczeństwo',
          icon: '🔒'
        }
      ];
    },

    logLevelOptions() {
      return [
        { value: 'DEBUG', label: 'Debug' },
        { value: 'INFO', label: 'Info' },
        { value: 'WARNING', label: 'Warning' },
        { value: 'ERROR', label: 'Error' },
        { value: 'CRITICAL', label: 'Critical' }
      ];
    },

    timezoneOptions() {
      return [
        { value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET)' },
        { value: 'Europe/London', label: 'Europe/London (GMT)' },
        { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
        { value: 'America/New_York', label: 'America/New_York (EST)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' }
      ];
    },

    deviceStatus() {
      return {
        connection: {
          status: 'online',
          icon: '🌐',
          text: this.$t('settings.connection_online') || 'Połączenie aktywne'
        },
        memory: {
          status: 'warning',
          icon: '💾',
          text: this.$t('settings.memory_usage') || 'Pamięć: 73% (580MB/800MB)'
        },
        storage: {
          status: 'online',
          icon: '💿',
          text: this.$t('settings.storage_usage') || 'Dysk: 45% (4.5GB/10GB)'
        }
      };
    },

    isFormValid() {
      return this.validationErrors.length === 0 && 
             this.isValidIP(this.networkSettings.ipAddress) &&
             this.isValidPort(this.networkSettings.port) &&
             this.isValidIP(this.networkSettings.gateway) &&
             this.isValidIP(this.networkSettings.dnsServer);
    }
  },

  watch: {
    networkSettings: {
      handler() {
        this.settingsState.hasUnsavedChanges = true;
        this.validateSettings();
      },
      deep: true
    },
    
    systemConfig: {
      handler() {
        this.settingsState.hasUnsavedChanges = true;
        this.validateSettings();
      },
      deep: true
    },
    
    deviceSettings: {
      handler() {
        this.settingsState.hasUnsavedChanges = true;
        this.validateSettings();
      },
      deep: true
    },
    
    securitySettings: {
      handler() {
        this.settingsState.hasUnsavedChanges = true;
        this.validateSettings();
      },
      deep: true
    }
  },

  methods: {
    // Validation methods
    isValidIP(ip) {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(ip);
    },

    isValidPort(port) {
      return port >= 1 && port <= 65535;
    },

    validateSettings() {
      this.validationErrors = [];

      // Network validation
      if (!this.isValidIP(this.networkSettings.ipAddress)) {
        this.validationErrors.push(this.$t('settings.error_invalid_ip') || 'Nieprawidłowy adres IP');
      }
      
      if (!this.isValidPort(this.networkSettings.port)) {
        this.validationErrors.push(this.$t('settings.error_invalid_port') || 'Nieprawidłowy port (1-65535)');
      }

      if (!this.isValidIP(this.networkSettings.gateway)) {
        this.validationErrors.push(this.$t('settings.error_invalid_gateway') || 'Nieprawidłowy adres bramy');
      }

      // System validation
      if (this.systemConfig.updateInterval < 1 || this.systemConfig.updateInterval > 3600) {
        this.validationErrors.push(this.$t('settings.error_update_interval') || 'Interwał odświeżania musi być w zakresie 1-3600 sekund');
      }

      if (this.systemConfig.dataRetention < 1 || this.systemConfig.dataRetention > 3650) {
        this.validationErrors.push(this.$t('settings.error_data_retention') || 'Retencja danych musi być w zakresie 1-3650 dni');
      }

      // Security validation
      if (this.securitySettings.sessionTimeout < 5 || this.securitySettings.sessionTimeout > 480) {
        this.validationErrors.push(this.$t('settings.error_session_timeout') || 'Timeout sesji musi być w zakresie 5-480 minut');
      }

      if (this.securitySettings.maxLoginAttempts < 1 || this.securitySettings.maxLoginAttempts > 10) {
        this.validationErrors.push(this.$t('settings.error_max_attempts') || 'Maksymalna liczba prób logowania: 1-10');
      }
    },

    // Network operations
    async testConnection() {
      try {
        this.settingsState.isLoading = true;
        this.networkTestResult = null;

        // Log test attempt
        if (this.securityService) {
          await this.securityService.logAuditEvent('network_connection_test', {
            ipAddress: this.networkSettings.ipAddress,
            port: this.networkSettings.port,
            user: this.user?.username || 'anonymous',
            timestamp: new Date().toISOString()
          });
        }

        // Simulate network test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if SystemManager API exists
        if (window.SystemManager && window.SystemManager.testConnection) {
          const result = await window.SystemManager.testConnection(this.networkSettings);
          this.networkTestResult = {
            success: result.success,
            message: result.message
          };
        } else {
          // Simulate test result
          const success = Math.random() > 0.2; // 80% success rate
          this.networkTestResult = {
            success,
            message: success 
              ? (this.$t('settings.connection_success') || 'Test połączenia zakończony sukcesem!')
              : (this.$t('settings.connection_failed') || 'Test połączenia nieudany - sprawdź ustawienia sieci')
          };
        }

        // Log test result
        if (this.securityService) {
          await this.securityService.logAuditEvent('network_test_completed', {
            success: this.networkTestResult.success,
            message: this.networkTestResult.message,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Network test error:', error);
        this.networkTestResult = {
          success: false,
          message: this.$t('settings.connection_error') || `Test błąd: ${error.message}`
        };

        if (this.securityService) {
          await this.securityService.logAuditEvent('network_test_error', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      } finally {
        this.settingsState.isLoading = false;
      }
    },

    // Settings operations
    async saveSettings() {
      try {
        this.settingsState.isLoading = true;
        this.settingsState.isValidating = true;

        // Validate all settings
        this.validateSettings();
        if (this.validationErrors.length > 0) {
          throw new Error(this.$t('settings.validation_failed') || 'Walidacja nie powiodła się');
        }

        // Log save attempt
        if (this.securityService) {
          await this.securityService.logAuditEvent('system_settings_save', {
            user: this.user?.username || 'anonymous',
            activeTab: this.activeTab,
            timestamp: new Date().toISOString()
          });
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Integrate with existing settings system if available
        if (window.SystemManager && window.SystemManager.saveSettings) {
          await window.SystemManager.saveSettings({
            network: this.networkSettings,
            system: this.systemConfig,
            device: this.deviceSettings,
            security: { ...this.securitySettings, encryptionLevel: '[PROTECTED]' }
          });
        }

        this.settingsState.hasUnsavedChanges = false;
        this.settingsState.lastSaved = new Date();
        
        this.$emit('settings-changed', {
          network: this.networkSettings,
          system: this.systemConfig,
          device: this.deviceSettings,
          security: this.securitySettings
        });

        // Log successful save
        if (this.securityService) {
          await this.securityService.logAuditEvent('system_settings_saved', {
            categories: ['network', 'system', 'device', 'security'],
            timestamp: new Date().toISOString()
          });
        }

        console.log('✅ System settings saved successfully');

      } catch (error) {
        console.error('❌ Failed to save settings:', error);
        
        if (this.securityService) {
          await this.securityService.logAuditEvent('system_settings_save_error', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
        
        alert(this.$t('settings.save_error') || `Błąd zapisywania ustawień: ${error.message}`);
      } finally {
        this.settingsState.isLoading = false;
        this.settingsState.isValidating = false;
      }
    },

    resetSettings() {
      const confirmText = this.$t('settings.confirm_reset') || 'Czy na pewno chcesz przywrócić ustawienia domyślne? Wszystkie niezapisane zmiany zostaną utracone.';
      
      if (confirm(confirmText)) {
        // Reset to defaults
        Object.assign(this.networkSettings, {
          ipAddress: '192.168.1.10',
          port: 8080,
          dhcpEnabled: false,
          gateway: '192.168.1.1',
          dnsServer: '8.8.8.8',
          connectionTimeout: 30
        });

        Object.assign(this.systemConfig, {
          updateInterval: 5,
          debugMode: false,
          logLevel: 'INFO',
          maxLogFiles: 10,
          autoBackup: true,
          backupInterval: 24,
          dataRetention: 365,
          enableMonitoring: true
        });

        Object.assign(this.deviceSettings, {
          deviceName: 'MASKTRONIC-001',
          location: 'Production Floor',
          timezone: 'Europe/Warsaw',
          language: 'pl',
          units: 'metric',
          precision: 2
        });

        Object.assign(this.securitySettings, {
          sessionTimeout: 30,
          maxLoginAttempts: 3,
          passwordExpiry: 90,
          lockoutDuration: 15,
          enableTwoFactor: false,
          encryptionLevel: 'AES256',
          auditLogging: true,
          forcePasswordChange: true,
          enableSessionMonitoring: true
        });

        this.settingsState.hasUnsavedChanges = true;
        this.validationErrors = [];
        this.networkTestResult = null;

        if (this.securityService) {
          this.securityService.logAuditEvent('system_settings_reset', {
            user: this.user?.username || 'anonymous',
            timestamp: new Date().toISOString()
          });
        }
      }
    },

    async exportSettings() {
      try {
        if (this.securityService) {
          await this.securityService.logAuditEvent('settings_export', {
            user: this.user?.username || 'anonymous',
            timestamp: new Date().toISOString()
          });
        }

        const settingsData = {
          network: this.networkSettings,
          system: this.systemConfig,
          device: this.deviceSettings,
          security: { ...this.securitySettings, encryptionLevel: '[REDACTED]' }, // Security
          exportInfo: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            user: this.user.username,
            systemVersion: this.systemInfo.version
          }
        };

        const content = JSON.stringify(settingsData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `system-settings-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (this.securityService) {
          await this.securityService.logAuditEvent('settings_exported', {
            filename: link.download,
            timestamp: new Date().toISOString()
          });
        }

        console.log('✅ Settings exported successfully');
      } catch (error) {
        console.error('Export error:', error);
        if (this.securityService) {
          await this.securityService.logAuditEvent('settings_export_error', {
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    },

    importSettings() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importedSettings = JSON.parse(text);

          // Validate imported data structure
          if (!importedSettings.network || !importedSettings.system || 
              !importedSettings.device || !importedSettings.security) {
            throw new Error(this.$t('settings.invalid_import_format') || 'Nieprawidłowy format pliku');
          }

          // Apply imported settings
          Object.assign(this.networkSettings, importedSettings.network);
          Object.assign(this.systemConfig, importedSettings.system);
          Object.assign(this.deviceSettings, importedSettings.device);
          Object.assign(this.securitySettings, importedSettings.security);

          this.settingsState.hasUnsavedChanges = true;
          this.validateSettings();

          if (this.securityService) {
            await this.securityService.logAuditEvent('settings_imported', {
              filename: file.name,
              user: this.user?.username || 'anonymous',
              timestamp: new Date().toISOString()
            });
          }

          console.log('✅ Settings imported successfully');
        } catch (error) {
          console.error('Import error:', error);
          alert(this.$t('settings.import_error') || `Błąd importu: ${error.message}`);
          
          if (this.securityService) {
            await this.securityService.logAuditEvent('settings_import_error', {
              error: error.message,
              filename: file.name,
              timestamp: new Date().toISOString()
            });
          }
        }
      };

      input.click();
    },

    // Security operations
    async generateSecurityReport() {
      try {
        if (this.securityService) {
          await this.securityService.logAuditEvent('security_report_generated', {
            user: this.user?.username || 'anonymous',
            timestamp: new Date().toISOString()
          });
        }

        const report = {
          reportDate: new Date().toISOString(),
          securitySettings: {
            sessionTimeout: this.securitySettings.sessionTimeout,
            maxLoginAttempts: this.securitySettings.maxLoginAttempts,
            twoFactorEnabled: this.securitySettings.enableTwoFactor,
            auditLogging: this.securitySettings.auditLogging,
            encryptionLevel: this.securitySettings.encryptionLevel
          },
          recommendations: [
            'Włącz dwuskładnikowe uwierzytelnianie',
            'Regularnie zmieniaj hasła',
            'Monitoruj logi audytu',
            'Aktualizuj system regularnie'
          ]
        };

        const content = JSON.stringify(report, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `security-report-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Security report error:', error);
      }
    },

    async clearAuditLogs() {
      const confirmText = this.$t('settings.confirm_clear_logs') || 'Czy na pewno chcesz wyczyścić logi audytu? Ta operacja jest nieodwracalna.';
      
      if (confirm(confirmText)) {
        try {
          if (this.securityService) {
            await this.securityService.logAuditEvent('audit_logs_cleared', {
              user: this.user?.username || 'anonymous',
              timestamp: new Date().toISOString()
            });
          }

          // Implementation would clear audit logs
          console.log('Audit logs cleared');
        } catch (error) {
          console.error('Clear logs error:', error);
        }
      }
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return '---';
      return new Date(timestamp).toLocaleString(this.language === 'pl' ? 'pl-PL' : 'en-US');
    },

    goBack() {
      if (this.settingsState.hasUnsavedChanges) {
        const confirmText = this.$t('settings.confirm_unsaved') || 'Masz niezapisane zmiany. Czy na pewno chcesz wyjść?';
        if (confirm(confirmText)) {
          this.$emit('back');
          this.$emit('navigate', { path: '/dashboard' });
        }
      } else {
        this.$emit('back');
        this.$emit('navigate', { path: '/dashboard' });
      }
    }
  },

  async mounted() {
    try {
      // Initialize SecurityService
      this.securityService = await getSecurityService();
      
      // Log component initialization
      if (this.securityService) {
        await this.securityService.logAuditEvent('system_settings_component_init', {
          user: this.user?.username || 'anonymous',
          timestamp: new Date().toISOString()
        });
      }

      // Load existing settings if available
      if (window.SystemManager && window.SystemManager.loadSettings) {
        const savedSettings = await window.SystemManager.loadSettings();
        if (savedSettings) {
          Object.assign(this.networkSettings, savedSettings.network || {});
          Object.assign(this.systemConfig, savedSettings.system || {});
          Object.assign(this.deviceSettings, savedSettings.device || {});
          Object.assign(this.securitySettings, savedSettings.security || {});
        }
      }

      // Initial validation
      this.validateSettings();

    } catch (error) {
      console.error('Error initializing system settings component:', error);
    }
  },

  beforeUnmount() {
    // Log component cleanup
    if (this.securityService) {
      this.securityService.logAuditEvent('system_settings_component_cleanup', {
        hasUnsavedChanges: this.settingsState.hasUnsavedChanges,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Also export as default
export default SystemSettingsComponent;
