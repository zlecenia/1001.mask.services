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
      <button @click="undo" class="btn btn-undo" :disabled="!canUndo" title="Cofnij (Ctrl+Z)">↩️ Cofnij</button>
      <button @click="redo" class="btn btn-redo" :disabled="!canRedo" title="Ponów (Ctrl+Y)">↪️ Ponów</button>
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
      } catch (e) {
        // Keep as string if parsing fails
      }
      
      this.$emit('value-changed', {
        path: this.path,
        value: newValue
      });
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
      history: [],
      historyIndex: -1,
      
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
    },
    canUndo() {
      return this.historyIndex > 0;
    },
    canRedo() {
      return this.historyIndex < this.history.length - 1;
    }
  },
  async mounted() {
    await this.loadAvailableComponents();
    this.statusMessage = 'Komponenty załadowane';
    
    // Add keyboard shortcuts for undo/redo
    document.addEventListener('keydown', this.handleKeydown);
  },
  
  beforeUnmount() {
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    recordHistory() {
      // Clear future history when a new change is made
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      this.history.push(JSON.parse(JSON.stringify(this.currentJSON)));
      this.historyIndex++;
    },

    undo() {
      if (this.canUndo) {
        this.historyIndex--;
        this.currentJSON = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      }
    },

    redo() {
      if (this.canRedo) {
        this.historyIndex++;
        this.currentJSON = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      }
    },

    handleKeydown(event) {
      // Handle Ctrl+Z (undo)
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      }
      // Handle Ctrl+Y or Ctrl+Shift+Z (redo)
      else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
        event.preventDefault();
        this.redo();
      }
    },

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
        this.selectedConfigFile = '';
        this.currentJSON = null;
        return;
      }
      
      try {
        // Standard config files for each component
        this.configFiles = ['config.json', 'data.json', 'schema.json', 'crud.json'];
        this.statusMessage = `Załadowano pliki dla ${this.selectedComponent}`;
        
        // Auto-load config.json and schema.json
        this.selectedConfigFile = 'config.json';
        await this.loadConfigFile();
        await this.loadComponentSchema();
        
      } catch (error) {
        this.showError(`Błąd wczytywania plików dla ${this.selectedComponent}`);
      }
    },

    async loadConfigFile() {
      if (!this.selectedConfigFile || !this.selectedComponent) {
        this.currentJSON = null;
        return;
      }
      
      try {
        const path = `js/features/${this.selectedComponent}/0.1.0/config/${this.selectedConfigFile}`;
        this.statusMessage = `Wczytywanie ${path}...`;
        
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        this.currentJSON = data;
        this.originalJSON = JSON.parse(JSON.stringify(data));
        this.history = [JSON.parse(JSON.stringify(data))];
        this.historyIndex = 0;
        this.showSuccess(`Załadowano ${this.selectedConfigFile} dla ${this.selectedComponent}`);
        
      } catch (error) {
        console.warn(`Nie udało się załadować ${this.selectedConfigFile} dla ${this.selectedComponent}:`, error);
        
        // Fallback: create default structure based on file type
        const defaultData = this.createDefaultConfig(this.selectedConfigFile, this.selectedComponent);
        this.currentJSON = defaultData;
        this.originalJSON = JSON.parse(JSON.stringify(defaultData));
        this.history = [JSON.parse(JSON.stringify(defaultData))];
        this.historyIndex = 0;
        
        this.showWarning(`Utworzono domyślną strukturę dla ${this.selectedConfigFile}`);
      }
    },

    async loadComponentSchema() {
      if (!this.selectedComponent) return;
      
      try {
        const schemaPath = `js/features/${this.selectedComponent}/0.1.0/config/schema.json`;
        const response = await fetch(schemaPath);
        
        if (response.ok) {
          const schema = await response.json();
          // Auto-apply schema if found
          this.currentSchema = schema;
          this.selectedSchema = 'component-schema';
          this.showSuccess(`Załadowano schemat dla ${this.selectedComponent}`);
        }
      } catch (error) {
        console.warn(`Schema nie znaleziona dla ${this.selectedComponent}:`, error);
        // Use default schema based on config file type
        this.autoSelectAppropriateSchema();
      }
    },

    createDefaultConfig(fileName, componentName) {
      switch (fileName) {
        case 'config.json':
          return {
            component: {
              name: componentName,
              version: "0.1.0",
              title: componentName.charAt(0).toUpperCase() + componentName.slice(1),
              description: `${componentName} component configuration`
            },
            settings: {},
            ui: {},
            security: {
              readOnly: [],
              protected: [],
              roles: ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"]
            }
          };
        case 'data.json':
          return {
            sampleData: `data for ${componentName}`,
            lastUpdated: new Date().toISOString()
          };
        case 'schema.json':
          return {
            type: "object",
            properties: {
              component: {
                type: "object",
                required: ["name", "version"]
              },
              settings: { type: "object" }
            },
            required: ["component"]
          };
        case 'crud.json':
          return {
            operations: {
              create: { enabled: true, roles: ["ADMIN", "SUPERUSER"] },
              read: { enabled: true, roles: ["OPERATOR", "ADMIN", "SUPERUSER", "SERWISANT"] },
              update: { enabled: true, roles: ["ADMIN", "SUPERUSER"] },
              delete: { enabled: false, roles: ["SUPERUSER"] }
            }
          };
        default:
          return { sample: `data for ${fileName}` };
      }
    },

    autoSelectAppropriateSchema() {
      if (this.selectedConfigFile === 'config.json') {
        this.selectedSchema = 'app';
        this.applySchema();
      }
    },

    applySchema() {
      if (!this.selectedSchema) {
        this.currentSchema = null;
        return;
      }
      this.currentSchema = this.schemas[this.selectedSchema];
      this.validateJSON();
    },

    loadSampleData() {
      if (!this.selectedSchema || !this.sampleData[this.selectedSchema]) {
        this.showError('Brak przykładowych danych dla wybranego schematu');
        return;
      }
      this.currentJSON = JSON.parse(JSON.stringify(this.sampleData[this.selectedSchema]));
      this.originalJSON = JSON.parse(JSON.stringify(this.currentJSON));
      this.history = [JSON.parse(JSON.stringify(this.currentJSON))];
      this.historyIndex = 0;
      this.showSuccess('Załadowano przykładowe dane');
    },

    validateJSON() {
      if (!this.currentJSON || !this.currentSchema) {
        this.showError('Brak danych JSON lub schematu do walidacji');
        return;
      }
      const isValid = this.validateAgainstSchema(this.currentJSON, this.currentSchema);
      if (isValid) {
        this.showSuccess('JSON jest poprawny');
      } else {
        this.showError('JSON jest niepoprawny');
      }
    },

    async saveConfig() {
      if (!this.currentJSON || !this.selectedComponent || !this.selectedConfigFile) {
        this.showError('Brak danych do zapisania');
        return;
      }
      try {
        // Simulate API call to save file
        this.statusMessage = 'Zapisywanie...';
        await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
        this.showSuccess('Plik zapisany pomyślnie');
        this.originalJSON = JSON.parse(JSON.stringify(this.currentJSON));
      } catch (error) {
        this.showError('Błąd zapisu pliku');
      }
    },

    resetEditor() {
      this.currentJSON = JSON.parse(JSON.stringify(this.originalJSON));
      this.history = [JSON.parse(JSON.stringify(this.originalJSON))];
      this.historyIndex = 0;
      this.showSuccess('Przywrócono oryginalną wersję');
    },

    // JSON manipulation methods
    updateValue(event) {
      if (event.type === 'key') {
        this.updateJSONKey(event.path, event.oldKey, event.newKey);
      } else {
        this.updateJSONValue(event.path, event.value);
      }
      this.recordHistory();
      this.statusMessage = 'Wartość zaktualizowana';
    },

    updateJSONKey(path, oldKey, newKey) {
      const pathParts = path.split('/');
      let current = this.currentJSON;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      const value = current[oldKey];
      delete current[oldKey];
      current[newKey] = value;
    },

    updateJSONValue(path, newValue) {
      const pathParts = path.split('/');
      let current = this.currentJSON;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      const key = pathParts[pathParts.length - 1];
      if (Array.isArray(current) && !isNaN(key)) {
        current[parseInt(key)] = newValue;
      } else {
        current[key] = newValue;
      }
    },

    deleteNode(event) {
      const pathParts = event.path.split('/');
      if (pathParts.length === 1) {
        delete this.currentJSON[pathParts[0]];
      } else {
        let current = this.currentJSON;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]];
        }
        const keyToDelete = pathParts[pathParts.length - 1];
        if (Array.isArray(current)) {
          current.splice(parseInt(keyToDelete), 1);
        } else {
          delete current[keyToDelete];
        }
      }
      this.showSuccess('Element usunięty: ' + event.path);
      this.recordHistory();
    },

    addNode(event) {
      this.showAddModal(event.path);
    },

    showAddModal(path) {
      this.newElementPath = path;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.newElementKey = '';
      this.newElementType = 'string';
      this.newElementValue = '';
    },

    addNewElement() {
      if (!this.newElementKey && this.newElementPath) {
        const pathParts = this.newElementPath.split('/');
        let current = this.currentJSON;
        for (const part of pathParts) {
          current = current[part];
        }
        if (!Array.isArray(current)) {
           this.showError('Klucz jest wymagany dla obiektów');
           return;
        }
      }

      let value;
      switch (this.newElementType) {
        case 'number': value = Number(this.newElementValue); break;
        case 'boolean': value = this.newElementValue === 'true'; break;
        case 'array': value = []; break;
        case 'object': value = {}; break;
        default: value = this.newElementValue;
      }

      let target = this.currentJSON;
      if (this.newElementPath) {
        const pathParts = this.newElementPath.split('/');
        for (const part of pathParts) {
          target = target[part];
        }
      }

      if (Array.isArray(target)) {
        target.push(value);
      } else {
        target[this.newElementKey] = value;
      }
      
      this.showSuccess('Nowy element dodany do ' + (this.newElementPath || 'root'));
      this.closeModal();
      this.recordHistory();
    },

    // Helper methods
    validateAgainstSchema(data, schema) {
      // Basic validation logic placeholder
      if (!schema) return true;
      for (const key in schema.properties) {
        if (schema.required && schema.required.includes(key) && !data.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    showSuccess(message) {
      this.message = { type: 'success', text: message };
      this.statusMessage = message;
      setTimeout(() => this.message = null, 3000);
    },
    
    showWarning(message) {
      this.message = { type: 'warning', text: message };
      this.statusMessage = message;
      setTimeout(() => this.message = null, 4000);
    },
    
    showError(message) {
      this.message = { type: 'error', text: message };
      this.statusMessage = message;
      setTimeout(() => this.message = null, 5000);
    }
  }
};

export default JsonEditor;
