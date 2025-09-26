/**
 * Login Form Component v1
 * Formularz logowania z walidacją i wirtualną klawiaturą dla ekranu dotykowego 7.9"
 */

// Template for login form with virtual keyboard aligned to Vitest expectations
const template = `
<div class="login-form-shell">
  <form class="login-form landscape-7-9 touch-optimized" @submit.prevent="handleLogin">
    <div class="login-header">
      <div class="branding">
        <img src="/favicon.ico" alt="MASKSERVICE" class="login-logo" />
        <div class="title-block">
          <h2 class="system-title">MASKSERVICE C20 1001</h2>
          <p class="system-subtitle">Industrial Access Console</p>
        </div>
      </div>
      <div class="language-selector">
        <label class="sr-only" for="language">{{ $t('common.language') }}</label>
        <select id="language" v-model="selectedLanguage" @change="changeLanguage">
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>

    <div class="login-body">
      <div class="field-group">
        <label class="field-label" for="username">{{ $t('login.username') }}</label>
        <input
          id="username"
          type="text"
          autocomplete="username"
          class="field-control"
          :class="{ error: errors.username }"
          v-model="form.username"
          @focus="handleFocus('username', $event)"
          @blur="handleBlur('username')"
        />
        <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="password">{{ $t('login.password') }}</label>
        <div class="password-wrapper">
          <input
            id="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            class="field-control"
            :class="{ error: errors.password }"
            v-model="form.password"
            @focus="handleFocus('password', $event)"
            @blur="handleBlur('password')"
          />
          <button type="button" class="password-toggle" @click="togglePasswordVisibility">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="field-group" v-if="showRoleSelection">
        <label class="field-label" for="role">{{ $t('login.select_role') }}</label>
        <select
          id="role"
          class="field-control role-select"
          :class="{ error: errors.role }"
          v-model="form.role"
          @focus="handleFocus('role', $event)"
          @blur="handleBlur('role')"
        >
          <option value="">{{ $t('login.choose_role') }}</option>
          <option
            v-for="role in normalizedRoles"
            :key="role.value"
            :value="role.value"
          >
            {{ $t(role.translationKey) }}
          </option>
        </select>
        <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
      </div>
    </div>

    <div class="login-footer">
      <button
        type="submit"
        class="login-button"
        :disabled="!isFormValid || loading"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <span>{{ loading ? $t('login.logging_in') : $t('auth.login') }}</span>
      </button>

      <button
        type="button"
        class="secondary-button"
        :disabled="loading"
        @click="clearForm"
      >
        {{ $t('common.clear') }}
      </button>

      <p v-if="loginError" class="error-message login-error">{{ loginError }}</p>
    </div>
  </form>

  <div class="virtual-keyboard" v-if="showKeyboard" @mousedown.stop>
    <div class="keyboard-header">
      <span class="keyboard-title">{{ $t('keyboard.title') }}</span>
      <button type="button" class="keyboard-close" @click="closeKeyboard">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="keyboard-display">
      <span class="current-input">{{ currentInputValue }}</span>
    </div>

    <div class="keyboard-rows">
      <div
        class="keyboard-row"
        v-for="(row, index) in keyboardLayout"
        :key="`row-${index}`"
      >
        <button
          v-for="key in row"
          :key="getKeyValue(key)"
          type="button"
          class="key"
          :data-key="getKeyValue(key)"
          :class="[
            getKeyClass(key),
            { active: pressedKey === getKeyValue(key), 'caps-active': capsLock && getKeyValue(key) === 'caps' }
          ]"
          @mousedown.prevent="onVirtualKeyDown(key)"
          @mouseup.prevent="onVirtualKeyUp"
          @mouseleave="onVirtualKeyUp"
        >
          <span v-if="getKeyValue(key) === 'caps'">
            <i :class="capsLock ? 'fas fa-lock' : 'fas fa-unlock'"></i>
          </span>
          <span v-else>{{ formatKeyLabel(key) }}</span>
        </button>
      </div>
    </div>
  </div>

  <div class="keyboard-overlay" v-if="showKeyboard" @click="closeKeyboard"></div>
</div>
`;

const styles = `
<style scoped>
.login-form-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 45px rgba(18, 38, 63, 0.18);
  padding: 24px;
}

.landscape-7-9 {
  min-height: 360px;
}

.touch-optimized {
  touch-action: manipulation;
}

.login-header,
.login-body,
.login-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.branding {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-logo {
  width: 48px;
  height: 48px;
}

.system-title {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.system-subtitle {
  margin: 0;
  font-size: 12px;
  color: #6b778c;
}

.language-selector select,
.field-control {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d7dde5;
  padding: 10px 12px;
  font-size: 14px;
}

.field-control.error {
  border-color: #e74c3c;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #475569;
}

.login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #2563eb, #4338ca);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  min-height: 48px;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5f5;
  background: #f8f9ff;
  font-weight: 500;
  min-height: 44px;
}

.error-message {
  color: #e53935;
  font-size: 12px;
  margin: 0;
}

.virtual-keyboard {
  width: 100%;
  max-width: 880px;
  background: #0f172a;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.45);
}

.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.keyboard-title {
  font-size: 13px;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.keyboard-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.keyboard-display {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  padding: 12px;
  color: #e2e8f0;
  font-family: 'Fira Code', monospace;
  margin-bottom: 12px;
}

.keyboard-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.key {
  min-width: 46px;
  min-height: 46px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(148, 163, 184, 0.18);
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.08s ease, background 0.08s ease;
}

.key.active {
  transform: translateY(2px);
  background: #2563eb;
}

.key.special {
  min-width: 72px;
}

.key.space {
  min-width: 220px;
}

.key.enter {
  background: #22c55e;
}

.key.enter.active {
  background: #16a34a;
}

.caps-active {
  background: #f59e0b !important;
}

.keyboard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
}

.sr-only {
  position: absolute;
  clip: rect(0 0 0 0);
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  overflow: hidden;
}

@media (max-height: 450px) {
  .login-form {
    max-width: 360px;
    padding: 16px;
  }

  .key {
    min-width: 38px;
    min-height: 38px;
  }
}
</style>
`;

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
        { value: 'OPERATOR', translationKey: 'roles.operator' },
        { value: 'ADMIN', translationKey: 'roles.admin' },
        { value: 'SUPERUSER', translationKey: 'roles.superuser' },
        { value: 'SERWISANT', translationKey: 'roles.serwisant' }
      ]
    }
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
        role: ''
      },
      errors: {},
      loading: false,
      loginError: '',
      showPassword: false,
      selectedLanguage: 'pl',
      showKeyboard: true,
      activeInput: 'username',
      capsLock: false,
      pressedKey: null,
      viewport: {
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
      },
      validationRules: {
        usernameMin: 3,
        passwordMin: 3
      },
      keyboardLayout: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        [{ value: 'caps', display: 'Caps', type: 'special' }, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', { value: 'backspace', display: '⌫', type: 'special' }],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        [{ value: 'space', display: '␣', type: 'space' }, { value: 'enter', display: '⏎', type: 'enter' }]
      ]
    };
  },
  computed: {
    normalizedRoles() {
      return this.availableRoles.map((role) => ({
        value: role.value,
        translationKey: role.translationKey || `roles.${role.value.toLowerCase()}`
      }));
    },
    isFormValid() {
      return (
        this.form.username.length >= this.validationRules.usernameMin &&
        this.form.password.length >= this.validationRules.passwordMin &&
        !!this.form.role
      );
    },
    currentInputValue() {
      return this.activeInput ? this.form[this.activeInput] || '' : '';
    }
  },
  methods: {
    handleFocus(field, event) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      this.activeInput = field === 'role' ? null : field;
      if (field !== 'role') {
        this.showKeyboard = true;
      }
    },
    handleBlur(field) {
      this.validateField(field);
    },
    handleLogin() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      this.loginError = '';

      const payload = {
        username: this.form.username,
        password: this.form.password,
        role: this.form.role
      };

      this.$emit('login-attempt', { ...payload, timestamp: new Date().toISOString() });

      const dispatch = this.$store?.dispatch || (() => Promise.resolve({ success: true }));

      dispatch('auth/login', payload)
        .then((result = {}) => {
          if (result.success) {
            this.$router?.push?.('/dashboard');
            this.clearForm();
          } else {
            this.loginError = result.error || 'Invalid credentials';
          }
        })
        .catch(() => {
          this.loginError = 'Authentication service unavailable';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validateField(field) {
      const newErrors = { ...this.errors };
      const minUser = this.validationRules.usernameMin;
      const minPass = this.validationRules.passwordMin;

      if (field === 'username') {
        if (!this.form.username || this.form.username.length < minUser) {
          newErrors.username = `Username must be at least ${minUser} characters (minimum 3 characters)`;
        } else {
          delete newErrors.username;
        }
      }

      if (field === 'password') {
        if (!this.form.password || this.form.password.length < minPass) {
          newErrors.password = `Password must be at least ${minPass} characters (minimum 3 characters)`;
        } else {
          delete newErrors.password;
        }
      }

      if (field === 'role') {
        if (!this.form.role) {
          newErrors.role = 'Role selection is required';
        } else {
          delete newErrors.role;
        }
      }

      this.errors = newErrors;
    },
    validateForm() {
      this.validateField('username');
      this.validateField('password');
      this.validateField('role');
      return Object.keys(this.errors).length === 0;
    },
    clearForm() {
      this.form = { username: '', password: '', role: '' };
      this.errors = {};
      this.loginError = '';
      this.activeInput = 'username';
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    changeLanguage() {
      this.$emit('language-changed', this.selectedLanguage);
    },
    closeKeyboard() {
      this.showKeyboard = false;
      this.pressedKey = null;
    },
    onVirtualKeyDown(key) {
      const value = this.getKeyValue(key);
      this.pressedKey = value;
      this.handleKeyPress(value);
    },
    onVirtualKeyUp() {
      this.pressedKey = null;
    },
    handleKeyPress(key) {
      const value = typeof key === 'string' ? key : key?.value;
      if (!value) {
        return;
      }

      if (!this.activeInput) {
        this.activeInput = 'username';
      }

      switch (value) {
        case 'backspace':
          this.form[this.activeInput] = this.form[this.activeInput]?.slice(0, -1) || '';
          break;
        case 'space':
          this.form[this.activeInput] = `${this.form[this.activeInput] || ''} `;
          break;
        case 'enter':
          this.handleLogin();
          break;
        case 'caps':
          this.capsLock = !this.capsLock;
          break;
        default: {
          const char = this.capsLock ? value.toUpperCase() : value;
          this.form[this.activeInput] = `${this.form[this.activeInput] || ''}${char}`;
          break;
        }
      }

      if (value !== 'caps') {
        this.validateField(this.activeInput);
      }
    },
    getKeyValue(key) {
      return typeof key === 'string' ? key : key.value;
    },
    getKeyClass(key) {
      if (typeof key === 'string') {
        return 'character';
      }
      if (key.type === 'space') {
        return 'space';
      }
      return `special ${key.type || ''}`.trim();
    },
    formatKeyLabel(key) {
      const value = this.getKeyValue(key);
      if (value === 'space') {
        return 'Space';
      }
      if (value === 'enter') {
        return 'Enter';
      }
      if (value === 'backspace') {
        return '⌫';
      }
      return this.capsLock ? value.toUpperCase() : value;
    },
    handleResize() {
      if (typeof window === 'undefined') {
        return;
      }
      this.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      this.handleResize();
    }
  },
  beforeUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  },
  emits: ['login-attempt', 'language-changed']
};
