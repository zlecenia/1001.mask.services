/**
 * JSON Editor Component 0.1.0
 * Visual editor for component configuration files with schema validation
 * Supports editing js/features/[component]/[version]/config/[file].json files
 */

const template = `
<div class="json-editor-container landscape-7-9">
  <div class="editor-header">
    <h2 class="editor-title">🛠️ Wizualny Edytor Konfiguracji JSON</h2>
    <p class="editor-subtitle">Bezpieczna edycja plików konfiguracyjnych z walidacją schematu</p>
  </div>

  <div class="controls-panel">
    <div class="control-group">
      <label>Komponent:</label>
      <select v-model="selectedComponent" @change="loadComponentConfigs" class="component-select">
        <option value="">Wybierz komponent</option>
        <option v-for="comp in availableComponents" :key="comp" :value="comp">{{ comp }}</option>
      </select>
    </div>
    
    <div class="control-group" v-if="selectedComponent">
      <label>Plik Config:</label>
      <select v-model="selectedConfigFile" @change="loadConfigFile" class="config-select">
        <option value="">Wybierz plik</option>
        <option v-for="file in configFiles" :key="file" :value="file">{{ file }}</option>
      </select>
    </div>
    
    <div class="control-group">
      <label>Schema:</label>
      <select v-model="selectedSchema" @change="applySchema" class="schema-select">
        <option value="">Wybierz schemat</option>
        <option v-for="schema in availableSchemas" :key="schema.name" :value="schema.name">
          {{ schema.title }}
        </option>
      </select>
    </div>

    <div class="action-buttons">
      <button @click="loadSampleData" class="btn btn-primary" :disabled="!selectedSchema">
        📂 Załaduj Przykład
      </button>
      <button @click="validateJSON" class="btn btn-success" :disabled="!currentJSON || !currentSchema">
        ✅ Waliduj
      </button>
      <button @click="saveConfig" class="btn btn-warning" :disabled="!currentJSON || !selectedComponent">
        💾 Zapisz Config
      </button>
      <button @click="resetEditor" class="btn btn-info">
        🔄 Reset
      </button>
    </div>
  </div>

  <div class="editor-workspace">
    <div class="editor-panel">
      <h3>📝 Edytor Wizualny</h3>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      
      <div v-if="!currentJSON" class="empty-state">
        <p>Wybierz komponent i plik konfiguracyjny lub załaduj przykład</p>
      </div>
      
      <div v-else class="json-tree">
        <json-node 
          v-for="(value, key) in currentJSON" 
          :key="key"
          :node-key="key"
          :value="value"
          :path="key"
          :editable="true"
          @update-value="updateValue"
          @delete-node="deleteNode"
          @add-node="addNode"
        />
        
        <button v-if="canAddToRoot" @click="showAddModal('')" class="add-button">
          ➕ Dodaj element
        </button>
      </div>
    </div>
    
    <div class="preview-panel">
      <h3>👁️ Podgląd JSON</h3>
      <pre class="json-preview">{{ jsonPreview }}</pre>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-left">{{ statusMessage }}</div>
    <div class="status-right">{{ selectedComponent ? selectedComponent + '/' + (selectedConfigFile || 'brak pliku') : 'Wybierz komponent' }}</div>
  </div>

  <!-- Modal do dodawania nowych elementów -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h3>Dodaj nowy element</h3>
      <div class="input-group">
        <label>Klucz:</label>
        <input v-model="newElementKey" type="text" placeholder="Nazwa klucza" />
      </div>
      <div class="input-group">
        <label>Typ:</label>
        <select v-model="newElementType">
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="array">Array</option>
          <option value="object">Object</option>
        </select>
      </div>
      <div class="input-group">
        <label>Wartość:</label>
        <input v-model="newElementValue" type="text" placeholder="Wartość" />
      </div>
      <div class="modal-actions">
        <button @click="addNewElement" class="btn btn-success">Dodaj</button>
        <button @click="closeModal" class="btn btn-secondary">Anuluj</button>
      </div>
    </div>
  </div>
</div>
`;

// JSON Node Component - rekurencyjny komponent do renderowania drzewa JSON
const JsonNodeComponent = {
  name: 'JsonNode',
  props: ['nodeKey', 'value', 'path', 'editable'],
  emits: ['update-value', 'delete-node', 'add-node'],
  template: `
    <div class="json-node">
      <div class="node-header">
        <span 
          :class="['json-key', { editable: editable }]" 
          @click="editKey"
          @blur="saveKey"
          @keydown.enter="saveKey"
          @keydown.escape="cancelEdit"
          :contenteditable="editable"
          ref="keyElement"
        >{{ nodeKey }}</span>
        
        <span v-if="!isObject && !isArray" 
          :class="['json-value', valueType, { editable: editable }]"
          @click="editValue"
          @blur="saveValue" 
          @keydown.enter="saveValue"
          @keydown.escape="cancelEdit"
          :contenteditable="editable"
          ref="valueElement"
        >{{ displayValue }}</span>
        
        <button v-if="canDelete" @click="deleteThis" class="delete-button">🗑️</button>
      </div>
      
      <div v-if="isObject" class="json-object">
        <json-node 
          v-for="(childValue, childKey) in value" 
          :key="childKey"
          :node-key="childKey"
          :value="childValue"
          :path="path + '/' + childKey"
          :editable="editable"
          @update-value="$emit('update-value', $event)"
          @delete-node="$emit('delete-node', $event)"
          @add-node="$emit('add-node', $event)"
        />
        <button v-if="canAddChildren" @click="addChild" class="add-button">➕ Dodaj właściwość</button>
      </div>
      
      <div v-if="isArray" class="json-array">
        <json-node 
          v-for="(item, index) in value" 
          :key="index"
          :node-key="'[' + index + ']'"
          :value="item"
          :path="path + '/' + index"
          :editable="editable"
          @update-value="$emit('update-value', $event)"
          @delete-node="$emit('delete-node', $event)"
          @add-node="$emit('add-node', $event)"
        />
        <button v-if="canAddChildren" @click="addArrayItem" class="add-button">➕ Dodaj element</button>
      </div>
    </div>
  `,
  computed: {
    isObject() {
      return typeof this.value === 'object' && this.value !== null && !Array.isArray(this.value);
    },
    isArray() {
      return Array.isArray(this.value);
    },
    valueType() {
      if (this.value === null) return 'null';
      if (typeof this.value === 'boolean') return 'boolean';
      if (typeof this.value === 'number') return 'number';
      return 'string';
    },
    displayValue() {
      if (typeof this.value === 'string') return this.value;
      return JSON.stringify(this.value);
    },
    canDelete() {
      return this.editable && this.path !== this.nodeKey; // Nie można usunąć root elementów
    },
    canAddChildren() {
      return this.editable && (this.isObject || this.isArray);
    }
  },
  methods: {
    editKey() {
      if (!this.editable) return;
      this.$nextTick(() => {
        if (this.$refs.keyElement) {
          this.$refs.keyElement.focus();
        }
      });
    },
    editValue() {
      if (!this.editable || this.isObject || this.isArray) return;
      this.$nextTick(() => {
        if (this.$refs.valueElement) {
          this.$refs.valueElement.focus();
        }
      });
    },
    saveKey(event) {
      if (!this.editable) return;
      const newKey = event.target.textContent.trim();
      if (newKey && newKey !== this.nodeKey) {
        this.$emit('update-value', {
          path: this.path,
          type: 'key',
          oldKey: this.nodeKey,
          newKey: newKey
        });
      }
    },
    saveValue(event) {
      if (!this.editable) return;
      let newValue = event.target.textContent.trim();
      
      // Parse value based on type
      try {
        if (newValue === 'true' || newValue === 'false') {
          newValue = newValue === 'true';
        } else if (!isNaN(newValue) && newValue !== '') {
          newValue = Number(newValue);
        } else if (newValue === 'null') {
          newValue = null;
        }
        // Otherwise keep as string
        
        this.$emit('update-value', {
          path: this.path,
          type: 'value',
          value: newValue
        });
      } catch (error) {
        // Reset to original value on error
        event.target.textContent = this.displayValue;
      }
    },
    cancelEdit(event) {
      event.target.blur();
    },
    deleteThis() {
      this.$emit('delete-node', { path: this.path });
    },
    addChild() {
      this.$emit('add-node', { path: this.path, type: 'object' });
    },
    addArrayItem() {
      this.$emit('add-node', { path: this.path, type: 'array' });
    }
  }
};

const JsonEditor = {
  name: 'JsonEditor',
  components: {
    JsonNode: JsonNodeComponent
  },
  template,
  data() {
    return {
      // Component selection
      availableComponents: [],
      selectedComponent: '',
      configFiles: [],
      selectedConfigFile: '',
      
      // JSON data
      currentJSON: null,
      originalJSON: null,
      
      // Schema system
      selectedSchema: '',
      currentSchema: null,
      availableSchemas: [
        { name: 'app', title: 'App Configuration' },
        { name: 'menu', title: 'Menu Structure' },
        { name: 'router', title: 'Router Settings' },
        { name: 'system', title: 'System Configuration' },
        { name: 'test-scenarios', title: 'Test Scenarios' },
        { name: 'workshop', title: 'Workshop Management' }
      ],
      
      // UI state
      showModal: false,
      newElementKey: '',
      newElementType: 'string',
      newElementValue: '',
      newElementPath: '',
      
      // Messages
      errorMessage: '',
      successMessage: '',
      statusMessage: 'Gotowy do edycji',
      
      // Schemas definitions (same as in HTML)
      schemas: {
        app: {
          type: "object",
          title: "Konfiguracja Aplikacji",
          properties: {
            API_URL: { type: "string", pattern: "^https?://" },
            WS_URL: { type: "string", pattern: "^wss?://" },
            MOCK_MODE: { type: "boolean" },
            UPDATE_INTERVAL: { type: "number", minimum: 1000, maximum: 60000 }
          },
          required: ["API_URL", "WS_URL", "MOCK_MODE", "UPDATE_INTERVAL"]
        },
        menu: {
          type: "object",
          title: "Struktura Menu",
          properties: {
            OPERATOR: { type: "array" },
            ADMIN: { type: "array" },
            SUPERUSER: { type: "array" },
            SERWISANT: { type: "array" }
          }
        }
        // Add other schemas as needed
      },
      
      // Sample data
      sampleData: {
        app: {
          "API_URL": "http://localhost:3000",
          "WS_URL": "ws://localhost:3000", 
          "MOCK_MODE": true,
          "UPDATE_INTERVAL": 5000
        },
        menu: {
          "OPERATOR": [
            { "key": "test_wizard", "label": "Test Wizard", "icon": "🧙" },
            { "key": "test_quick", "label": "Quick Test", "icon": "⚡" }
          ]
        }
      }
    };
  },
  computed: {
    jsonPreview() {
      return this.currentJSON ? JSON.stringify(this.currentJSON, null, 2) : '';
    },
    canAddToRoot() {
      return this.currentJSON && typeof this.currentJSON === 'object';
    }
  },
  async mounted() {
    await this.loadAvailableComponents();
    this.statusMessage = 'Komponenty załadowane';
  },
  methods: {
    async loadAvailableComponents() {
      try {
        // In a real environment, this would fetch from API
        // For now, simulate with known components
        this.availableComponents = [
          'appFooter', 'appHeader', 'auditLogViewer', 'deviceData', 'loginForm',
          'mainMenu', 'pageTemplate', 'pressurePanel', 'realtimeSensors',
          'reportsViewer', 'serviceMenu', 'systemSettings', 'testMenu', 'userMenu'
        ];
      } catch (error) {
        this.showError('Błąd wczytywania listy komponentów');
      }
    },
    
    async loadComponentConfigs() {
      if (!this.selectedComponent) {
        this.configFiles = [];
        return;
      }
      
      try {
        // Simulate loading config files for component
        this.configFiles = ['config.json', 'data.json', 'schema.json', 'crud.json'];
        this.statusMessage = `Załadowano pliki dla ${this.selectedComponent}`;
      } catch (error) {
        this.showError('Błąd wczytywania plików konfiguracyjnych');
      }
    },
    
    async loadConfigFile() {
      if (!this.selectedComponent || !this.selectedConfigFile) return;
      
      try {
        // In real environment, this would load from:
        // js/features/${this.selectedComponent}/0.1.0/config/${this.selectedConfigFile}
        
        // For demo, use sample data
        if (this.selectedConfigFile === 'config.json' && this.sampleData[this.selectedComponent.toLowerCase()]) {
          this.currentJSON = JSON.parse(JSON.stringify(this.sampleData[this.selectedComponent.toLowerCase()]));
          this.originalJSON = JSON.parse(JSON.stringify(this.currentJSON));
          this.showSuccess(`Załadowano ${this.selectedConfigFile}`);
          this.statusMessage = 'Plik załadowany pomyślnie';
        } else {
          // Load empty object for other files
          this.currentJSON = {};
          this.originalJSON = {};
          this.showSuccess(`Utworzono nowy ${this.selectedConfigFile}`);
        }
      } catch (error) {
        this.showError(`Błąd wczytywania ${this.selectedConfigFile}`);
      }
    },
    
    applySchema() {
      if (this.selectedSchema && this.schemas[this.selectedSchema]) {
        this.currentSchema = this.schemas[this.selectedSchema];
        this.statusMessage = `Schema ${this.selectedSchema} zastosowana`;
      }
    },
    
    loadSampleData() {
      if (!this.selectedSchema) {
        this.showError('Najpierw wybierz schemat');
        return;
      }
      
      if (this.sampleData[this.selectedSchema]) {
        this.currentJSON = JSON.parse(JSON.stringify(this.sampleData[this.selectedSchema]));
        this.originalJSON = JSON.parse(JSON.stringify(this.currentJSON));
        this.showSuccess(`Załadowano przykład dla ${this.selectedSchema}`);
        this.statusMessage = 'Przykład załadowany';
      } else {
        this.showError('Brak przykładowych danych dla tego schematu');
      }
    },
    
    validateJSON() {
      if (!this.currentSchema || !this.currentJSON) {
        this.showError('Brak schematu lub danych do walidacji');
        return;
      }
      
      try {
        const isValid = this.validateAgainstSchema(this.currentJSON, this.currentSchema);
        if (isValid) {
          this.showSuccess('JSON jest prawidłowy według schematu');
          this.statusMessage = 'Walidacja pomyślna';
        }
      } catch (error) {
        this.showError('Błąd walidacji: ' + error.message);
      }
    },
    
    async saveConfig() {
      if (!this.currentJSON || !this.selectedComponent || !this.selectedConfigFile) {
        this.showError('Wybierz komponent i plik do zapisania');
        return;
      }
      
      try {
        // In real environment, this would save to:
        // js/features/${this.selectedComponent}/0.1.0/config/${this.selectedConfigFile}
        
        const jsonString = JSON.stringify(this.currentJSON, null, 2);
        
        // For demo, just show success
        this.showSuccess(`Zapisano ${this.selectedConfigFile} dla ${this.selectedComponent}`);
        this.statusMessage = 'Konfiguracja zapisana';
        this.originalJSON = JSON.parse(JSON.stringify(this.currentJSON));
        
      } catch (error) {
        this.showError('Błąd zapisywania: ' + error.message);
      }
    },
    
    resetEditor() {
      if (confirm('Czy na pewno chcesz zresetować edytor? Niezapisane zmiany zostaną utracone.')) {
        this.currentJSON = null;
        this.originalJSON = null;
        this.selectedComponent = '';
        this.selectedConfigFile = '';
        this.selectedSchema = '';
        this.currentSchema = null;
        this.configFiles = [];
        this.statusMessage = 'Edytor zresetowany';
      }
    },
    
    // JSON manipulation methods
    updateValue(event) {
      if (event.type === 'key') {
        this.updateJSONKey(event.path, event.oldKey, event.newKey);
      } else if (event.type === 'value') {
        this.updateJSONValue(event.path, event.value);
      }
    },
    
    updateJSONKey(path, oldKey, newKey) {
      const pathParts = path.split('/');
      pathParts.pop(); // Remove old key
      let target = this.currentJSON;
      
      // Navigate to parent
      for (const part of pathParts) {
        target = target[part];
      }
      
      // Update key
      if (target && typeof target === 'object' && oldKey in target) {
        target[newKey] = target[oldKey];
        delete target[oldKey];
      }
    },
    
    updateJSONValue(path, newValue) {
      const pathParts = path.split('/');
      const key = pathParts.pop();
      let target = this.currentJSON;
      
      // Navigate to parent
      for (const part of pathParts) {
        if (Array.isArray(target)) {
          target = target[parseInt(part)];
        } else {
          target = target[part];
        }
      }
      
      // Set new value
      if (Array.isArray(target)) {
        target[parseInt(key)] = newValue;
      } else {
        target[key] = newValue;
      }
    },
    
    deleteNode(event) {
      if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;
      
      const pathParts = event.path.split('/');
      const key = pathParts.pop();
      let target = this.currentJSON;
      
      // Navigate to parent
      for (const part of pathParts) {
        if (Array.isArray(target)) {
          target = target[parseInt(part)];
        } else {
          target = target[part];
        }
      }
      
      // Delete element
      if (Array.isArray(target)) {
        target.splice(parseInt(key), 1);
      } else {
        delete target[key];
      }
    },
    
    addNode(event) {
      this.newElementPath = event.path;
      this.showModal = true;
    },
    
    showAddModal(path) {
      this.newElementPath = path;
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.newElementKey = '';
      this.newElementValue = '';
      this.newElementType = 'string';
      this.newElementPath = '';
    },
    
    addNewElement() {
      if (!this.newElementKey.trim()) {
        alert('Podaj nazwę klucza');
        return;
      }
      
      let value = this.newElementValue.trim();
      
      // Convert value to appropriate type
      switch (this.newElementType) {
        case 'number':
          value = Number(value) || 0;
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'array':
          value = [];
          break;
        case 'object':
          value = {};
          break;
        default:
          // Keep as string
          break;
      }
      
      // Add element to JSON
      let target = this.currentJSON;
      if (this.newElementPath) {
        const pathParts = this.newElementPath.split('/');
        for (const part of pathParts) {
          target = target[part];
        }
      }
      
      target[this.newElementKey] = value;
      this.closeModal();
    },
    
    // Helper methods
    validateAgainstSchema(data, schema) {
      if (schema.type === 'object') {
        if (typeof data !== 'object' || Array.isArray(data) || data === null) {
          throw new Error('Oczekiwano obiektu');
        }
        
        if (schema.required) {
          for (const field of schema.required) {
            if (!(field in data)) {
              throw new Error(`Brak wymaganego pola: ${field}`);
            }
          }
        }
      }
      return true;
    },
    
    showError(message) {
      this.errorMessage = message;
      this.successMessage = '';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    },
    
    showSuccess(message) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }
};

export default JsonEditor;
