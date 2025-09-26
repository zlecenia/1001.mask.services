/**
 * Login Form Component v1
 * Formularz logowania z walidacją i wirtualną klawiaturą dla ekranu dotykowego 7.9"
 */

// Template for login form with virtual keyboard
const template = `
<div class="login-form-container" :class="{ 'virtual-keyboard-active': showKeyboard }">
  <form @submit.prevent="handleLogin" class="login-form">
    <div class="form-header">
      <div class="logo-section">
        <img src="/favicon.ico" alt="MASKSERVICE" class="login-logo">
        <h2 class="system-title">MASKSERVICE C20 1001</h2>
      </div>
      <div class="language-selector">
        <select v-model="selectedLanguage" @change="changeLanguage">
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>

    <div class="form-body">
      <div class="input-group">
        <label for="username" class="input-label">{{ $t('login.username') }}</label>
        <input
          id="username"
          ref="usernameInput"
          v-model="formData.username"
          type="text"
          class="form-input"
          :class="{ 'error': errors.username }"
          :placeholder="$t('login.username_placeholder')"
          readonly
          @focus="openKeyboard('username')"
          @blur="onInputBlur"
          autocomplete="username"
        >
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>

      <div class="input-group">
        <label for="password" class="input-label">{{ $t('login.password') }}</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            ref="passwordInput"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password }"
            :placeholder="$t('login.password_placeholder')"
            readonly
            @focus="openKeyboard('password')"
            @blur="onInputBlur"
            autocomplete="current-password"
          >
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
            :title="showPassword ? $t('login.hide_password') : $t('login.show_password')"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="role-selection" v-if="showRoleSelection">
        <label class="input-label">{{ $t('login.select_role') }}</label>
        <div class="role-buttons">
          <button
            v-for="role in availableRoles"
            :key="role.value"
            type="button"
            class="role-button"
            :class="{ 'active': formData.role === role.value }"
            @click="selectRole(role.value)"
          >
            <i :class="role.icon"></i>
            <span>{{ $t('roles.' + role.value.toLowerCase()) }}</span>
          </button>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="login-button"
          :disabled="!isFormValid || isLoading"
          :class="{ 'loading': isLoading }"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <span>{{ isLoading ? $t('login.logging_in') : $t('login.login') }}</span>
        </button>
        
        <button
          type="button"
          class="clear-button"
          @click="clearForm"
          :disabled="isLoading"
        >
          {{ $t('common.clear') }}
        </button>
      </div>

      <div v-if="loginError" class="login-error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ loginError }}</span>
      </div>
    </div>
  </form>

  <!-- Virtual Keyboard -->
  <div v-if="showKeyboard" class="virtual-keyboard" @click.stop>
    <div class="keyboard-header">
      <span class="keyboard-title">{{ $t('keyboard.title') }}</span>
      <button class="keyboard-close" @click="closeKeyboard">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="keyboard-display">
      <span class="current-input">{{ currentInputValue }}</span>
      <div class="cursor" :class="{ 'blink': showCursor }"></div>
    </div>

    <div class="keyboard-rows">
      <div class="keyboard-row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
        <button
          v-for="key in row"
          :key="key.value || key"
          class="keyboard-key"
          :class="[
            key.type || 'normal',
            { 'active': key === pressedKey }
          ]"
          @mousedown="keyPress(key)"
          @mouseup="keyRelease"
          @mouseleave="keyRelease"
        >
          <span v-if="key.icon">
            <i :class="key.icon"></i>
          </span>
          <span v-else>{{ typeof key === 'string' ? key : key.display }}</span>
        </button>
      </div>
    </div>

    <div class="keyboard-footer">
      <button class="keyboard-action cancel" @click="cancelKeyboardInput">
        {{ $t('common.cancel') }}
      </button>
      <button class="keyboard-action confirm" @click="confirmKeyboardInput">
        {{ $t('common.confirm') }}
      </button>
    </div>
  </div>

  <!-- Overlay when keyboard is active -->
  <div v-if="showKeyboard" class="keyboard-overlay" @click="closeKeyboard"></div>
</div>
`;

// Styles optimized for 7.9" landscape display with virtual keyboard
const styles = `
<style scoped>
.login-form-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow: hidden;
}

.login-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease;
}

.virtual-keyboard-active .login-form {
  transform: scale(0.85) translateY(-10%);
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-logo {
  width: 48px;
  height: 48px;
}

.system-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.language-selector select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background: white;
  cursor: pointer;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-input.error {
  border-color: #e74c3c;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.password-toggle:hover {
  color: #3498db;
}

.error-message {
  font-size: 11px;
  color: #e74c3c;
  margin-top: 2px;
}

.role-selection {
  margin: 8px 0;
}

.role-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.role-button {
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  transition: all 0.2s ease;
}

.role-button:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.role-button.active {
  border-color: #3498db;
  background: #3498db;
  color: white;
}

.role-button i {
  font-size: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.login-button {
  flex: 2;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: #2980b9;
}

.login-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.clear-button {
  flex: 1;
  padding: 12px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-button:hover:not(:disabled) {
  background: #7f8c8d;
}

.login-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  color: #e74c3c;
  font-size: 12px;
}

/* Virtual Keyboard Styles */
.virtual-keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #2c3e50;
  color: white;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.keyboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #34495e;
  background: #34495e;
}

.keyboard-title {
  font-size: 12px;
  font-weight: bold;
}

.keyboard-close {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.keyboard-display {
  padding: 8px 16px;
  background: #34495e;
  border-bottom: 1px solid #4a5f7a;
  display: flex;
  align-items: center;
  min-height: 32px;
  font-family: monospace;
}

.current-input {
  flex: 1;
  font-size: 14px;
  word-break: break-all;
}

.cursor {
  width: 2px;
  height: 16px;
  background: white;
  margin-left: 2px;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.keyboard-rows {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.keyboard-row {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.keyboard-key {
  background: #3c5073;
  border: 1px solid #4a5f7a;
  color: white;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  user-select: none;
}

.keyboard-key:hover {
  background: #4a5f7a;
}

.keyboard-key:active,
.keyboard-key.active {
  background: #3498db;
  transform: scale(0.95);
}

.keyboard-key.space {
  flex: 1;
  max-width: 200px;
}

.keyboard-key.backspace {
  min-width: 60px;
}

.keyboard-key.enter {
  min-width: 60px;
  background: #27ae60;
}

.keyboard-key.enter:hover {
  background: #229954;
}

.keyboard-footer {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  border-top: 1px solid #34495e;
  background: #34495e;
}

.keyboard-action {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.keyboard-action.cancel {
  background: #95a5a6;
  color: white;
}

.keyboard-action.cancel:hover {
  background: #7f8c8d;
}

.keyboard-action.confirm {
  background: #27ae60;
  color: white;
}

.keyboard-action.confirm:hover {
  background: #229954;
}

/* Responsive adjustments for 400px height */
@media (max-height: 450px) {
  .login-form {
    padding: 16px;
    max-width: 350px;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  .virtual-keyboard {
    max-height: 50vh;
  }
  
  .keyboard-key {
    min-width: 28px;
    min-height: 28px;
    padding: 6px;
    font-size: 11px;
  }
}
</style>
`;

// Component definition with virtual keyboard functionality
export default {
  name: 'LoginFormComponent',
  template: template + styles,
  props: {
    showRoleSelection: {
      type: Boolean,
      default: true
    },
    availableRoles: {
      type: Array,
      default: () => [
        { value: 'OPERATOR', icon: 'fas fa-user' },
        { value: 'ADMIN', icon: 'fas fa-user-shield' },
        { value: 'SUPERUSER', icon: 'fas fa-user-crown' },
        { value: 'SERWISANT', icon: 'fas fa-user-cog' }
      ]
    }
  },
  data() {
    return {
      formData: {
        username: '',
        password: '',
        role: 'OPERATOR'
      },
      errors: {},
      isLoading: false,
      loginError: '',
      showPassword: false,
      selectedLanguage: 'pl',
      
      // Virtual keyboard state
      showKeyboard: false,
      currentField: null,
      currentInputValue: '',
      tempInputValue: '',
      showCursor: true,
      pressedKey: null,
      
      // Keyboard layout - optimized for touch input
      keyboardLayout: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        [
          { value: 'backspace', display: '⌫', type: 'backspace', icon: 'fas fa-backspace' },
          { value: ' ', display: 'Space', type: 'space' },
          { value: 'enter', display: '✓', type: 'enter', icon: 'fas fa-check' }
        ]
      ]
    };
  },
  computed: {
    isFormValid() {
      return this.formData.username.length >= 3 && 
             this.formData.password.length >= 3 && 
             this.formData.role;
    }
  },
  methods: {
    handleLogin() {
      if (!this.validateForm()) return;
      
      this.isLoading = true;
      this.loginError = '';
      
      // Simulate login process
      setTimeout(() => {
        this.$emit('login-attempt', {
          username: this.formData.username,
          password: this.formData.password,
          role: this.formData.role,
          timestamp: new Date()
        });
        this.isLoading = false;
      }, 1000);
    },
    
    validateForm() {
      this.errors = {};
      
      if (this.formData.username.length < 3) {
        this.errors.username = this.$t('login.username_too_short');
      }
      
      if (this.formData.password.length < 3) {
        this.errors.password = this.$t('login.password_too_short');
      }
      
      return Object.keys(this.errors).length === 0;
    },
    
    clearForm() {
      this.formData = {
        username: '',
        password: '',
        role: 'OPERATOR'
      };
      this.errors = {};
      this.loginError = '';
    },
    
    selectRole(role) {
      this.formData.role = role;
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    changeLanguage() {
      this.$emit('language-changed', this.selectedLanguage);
    },
    
    // Virtual Keyboard Methods
    openKeyboard(fieldName) {
      this.currentField = fieldName;
      this.currentInputValue = this.formData[fieldName];
      this.tempInputValue = this.formData[fieldName];
      this.showKeyboard = true;
      this.startCursorBlink();
      
      // Prevent native keyboard on mobile
      document.activeElement.blur();
    },
    
    closeKeyboard() {
      this.showKeyboard = false;
      this.currentField = null;
      this.stopCursorBlink();
    },
    
    keyPress(key) {
      this.pressedKey = key;
      
      const keyValue = typeof key === 'string' ? key : key.value;
      
      switch (keyValue) {
        case 'backspace':
          this.tempInputValue = this.tempInputValue.slice(0, -1);
          break;
        case 'enter':
          this.confirmKeyboardInput();
          return;
        case ' ':
          this.tempInputValue += ' ';
          break;
        default:
          this.tempInputValue += keyValue;
      }
      
      this.currentInputValue = this.tempInputValue;
    },
    
    keyRelease() {
      this.pressedKey = null;
    },
    
    confirmKeyboardInput() {
      if (this.currentField) {
        this.formData[this.currentField] = this.tempInputValue;
      }
      this.closeKeyboard();
    },
    
    cancelKeyboardInput() {
      this.tempInputValue = this.formData[this.currentField] || '';
      this.currentInputValue = this.tempInputValue;
      this.closeKeyboard();
    },
    
    onInputBlur() {
      // Prevent blur from closing keyboard when clicking on keyboard
    },
    
    startCursorBlink() {
      this.cursorInterval = setInterval(() => {
        this.showCursor = !this.showCursor;
      }, 500);
    },
    
    stopCursorBlink() {
      if (this.cursorInterval) {
        clearInterval(this.cursorInterval);
        this.cursorInterval = null;
      }
    },
    
    // Handle login error from parent
    setLoginError(error) {
      this.loginError = error;
      this.isLoading = false;
    }
  },
  
  mounted() {
    // Prevent zoom on double tap for mobile devices
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
    
    // Disable context menu on touch devices
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.login-form-container')) {
        e.preventDefault();
      }
    });
  },
  
  beforeUnmount() {
    this.stopCursorBlink();
  },
  
  emits: ['login-attempt', 'language-changed']
};
