/**
 * Visual Component Editor Module
 * Path: js/features/componentEditor/0.1.0/index.js
 *
 * Wizualny edytor komponentów Vue z walidacją schematów
 */

import Component from './componentEditor.js';
import config from './config/config.json';
import schema from './config/schema.json';
import crud from './config/crud.json';

// File System API dla edycji plików
class ComponentFileSystem {
  constructor() {
    this.basePath = 'js/features';
  }

  /**
   * Skanuj dostępne komponenty
   */
  async scanComponents() {
    const patterns = [
      '*.js', '*.vue', '*.css', '*.json', '*.ts', '*.tsx',
      'config/*.json'
    ];

    const components = [];
    const modules = ['loginForm', 'appHeader', 'mainMenu', 'pressurePanel',
      'appFooter', 'auditLogViewer', 'deviceData', 'realtimeSensors'];

    for (const module of modules) {
      const moduleComponents = {
        name: module,
        path: `${this.basePath}/${module}/0.1.0`,
        components: []
      };

      // Skanuj pliki główne
      moduleComponents.components.push(
          { name: `${module}.js`, type: 'js', path: `${this.basePath}/${module}/0.1.0/${module}.js` },
          { name: 'index.js', type: 'js', path: `${this.basePath}/${module}/0.1.0/index.js` },
          { name: 'package.json', type: 'json', path: `${this.basePath}/${module}/0.1.0/package.json` }
      );

      // Skanuj pliki konfiguracyjne
      const configFiles = ['config.json', 'schema.json', 'crud.json', 'data.json'];
      for (const configFile of configFiles) {
        moduleComponents.components.push({
          name: configFile,
          type: 'json',
          path: `${this.basePath}/${module}/0.1.0/config/${configFile}`
        });
      }

      components.push(moduleComponents);
    }

    return components;
  }

  /**
   * Wczytaj plik komponentu
   */
  async loadFile(path) {
    try {
      // W prawdziwej implementacji użyj fs/promises lub fetch API
      const response = await fetch(`/${path}`);
      const content = await response.text();

      if (path.endsWith('.json')) {
        return JSON.parse(content);
      }
      return content;
    } catch (error) {
      console.error(`Failed to load file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Zapisz plik komponentu
   */
  async saveFile(path, content) {
    try {
      const body = typeof content === 'object'
          ? JSON.stringify(content, null, 2)
          : content;

      // W prawdziwej implementacji użyj fs/promises lub API endpoint
      const response = await fetch(`/api/save-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path, content: body })
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to save file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Wczytaj schemat dla komponentu
   */
  async loadSchema(componentPath) {
    const schemaPath = componentPath.replace(/\.[^.]+$/, '') + '/config/schema.json';
    try {
      return await this.loadFile(schemaPath);
    } catch {
      return this.getDefaultSchema();
    }
  }

  /**
   * Wczytaj reguły CRUD
   */
  async loadCrudRules(componentPath) {
    const crudPath = componentPath.replace(/\.[^.]+$/, '') + '/config/crud.json';
    try {
      return await this.loadFile(crudPath);
    } catch {
      return this.getDefaultCrudRules();
    }
  }

  /**
   * Domyślny schemat
   */
  getDefaultSchema() {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "component": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "version": { "type": "string" },
            "description": { "type": "string" }
          }
        },
        "ui": { "type": "object" },
        "data": { "type": "object" }
      }
    };
  }

  /**
   * Domyślne reguły CRUD
   */
  getDefaultCrudRules() {
    return {
      "name": "default",
      "rules": {
        "editable": ["ui", "data", "config"],
        "readonly": ["component", "metadata"],
        "protected": ["_internal"],
        "addable": true,
        "deletable": false
      }
    };
  }
}

// Schema Validator
class SchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * Waliduj dane według schematu
   */
  validate(data) {
    const errors = [];
    this.validateObject(data, this.schema, '', errors);
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateObject(data, schema, path, errors) {
    if (!schema || !schema.properties) return;

    // Sprawdź wymagane pola
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push({
            path: path ? `${path}.${field}` : field,
            message: 'Required field missing'
          });
        }
      }
    }

    // Waliduj właściwości
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const fullPath = path ? `${path}.${key}` : key;
      const value = data[key];

      if (value === undefined) continue;

      // Sprawdź typ
      if (!this.validateType(value, propSchema.type)) {
        errors.push({
          path: fullPath,
          message: `Expected type ${propSchema.type}, got ${typeof value}`
        });
        continue;
      }

      // Waliduj zagnieżdżone obiekty
      if (propSchema.type === 'object' && propSchema.properties) {
        this.validateObject(value, propSchema, fullPath, errors);
      }

      // Waliduj tablice
      if (propSchema.type === 'array' && Array.isArray(value)) {
        if (propSchema.minItems && value.length < propSchema.minItems) {
          errors.push({
            path: fullPath,
            message: `Array must have at least ${propSchema.minItems} items`
          });
        }
        if (propSchema.maxItems && value.length > propSchema.maxItems) {
          errors.push({
            path: fullPath,
            message: `Array must have at most ${propSchema.maxItems} items`
          });
        }
      }

      // Waliduj stringi
      if (propSchema.type === 'string' && typeof value === 'string') {
        if (propSchema.minLength && value.length < propSchema.minLength) {
          errors.push({
            path: fullPath,
            message: `String must be at least ${propSchema.minLength} characters`
          });
        }
        if (propSchema.pattern) {
          const regex = new RegExp(propSchema.pattern);
          if (!regex.test(value)) {
            errors.push({
              path: fullPath,
              message: `String does not match pattern ${propSchema.pattern}`
            });
          }
        }
      }

      // Waliduj liczby
      if (propSchema.type === 'number' && typeof value === 'number') {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push({
            path: fullPath,
            message: `Value must be at least ${propSchema.minimum}`
          });
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push({
            path: fullPath,
            message: `Value must be at most ${propSchema.maximum}`
          });
        }
      }

      // Waliduj enum
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push({
          path: fullPath,
          message: `Value must be one of: ${propSchema.enum.join(', ')}`
        });
      }
    }
  }

  validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return true;
    }
  }
}

// Field Generator - tworzy pola do edycji na podstawie schematu
class FieldGenerator {
  constructor(schema, crudRules) {
    this.schema = schema;
    this.crudRules = crudRules;
  }

  /**
   * Generuj pola edytowalne
   */
  generateFields(data) {
    const fields = [];
    this.processObject(data, this.schema.properties, '', fields);
    return fields;
  }

  processObject(data, properties, path, fields) {
    if (!properties) return;

    for (const [key, propSchema] of Object.entries(properties)) {
      const fullPath = path ? `${path}.${key}` : key;
      const value = data ? data[key] : undefined;
      const permission = this.getPermission(fullPath);

      if (propSchema.type === 'object' && propSchema.properties) {
        // Rekurencyjnie przetwarzaj obiekty
        this.processObject(value, propSchema.properties, fullPath, fields);
      } else {
        // Dodaj pole
        fields.push(this.createField(fullPath, value, propSchema, permission));
      }
    }
  }

  /**
   * Określ uprawnienia dla pola
   */
  getPermission(path) {
    const topLevelKey = path.split('.')[0];

    if (this.crudRules.rules.protected.includes(topLevelKey)) {
      return 'protected';
    }
    if (this.crudRules.rules.readonly.includes(topLevelKey)) {
      return 'readonly';
    }
    if (this.crudRules.rules.editable.includes(topLevelKey)) {
      return 'editable';
    }

    return 'readonly'; // domyślnie readonly
  }

  /**
   * Stwórz definicję pola
   */
  createField(path, value, schema, permission) {
    const field = {
      path,
      label: this.formatLabel(path),
      value: value !== undefined ? value : this.getDefaultValue(schema),
      type: this.getFieldType(schema),
      permission,
      schema
    };

    // Dodaj dodatkowe właściwości
    if (schema.enum) {
      field.options = schema.enum;
      field.type = 'select';
    }

    if (schema.description) {
      field.hint = schema.description;
    }

    if (schema.type === 'array') {
      field.type = 'array';
      field.itemSchema = schema.items || { type: 'string' };
    }

    return field;
  }

  /**
   * Określ typ pola UI
   */
  getFieldType(schema) {
    switch (schema.type) {
      case 'string':
        if (schema.format === 'date') return 'date';
        if (schema.format === 'time') return 'time';
        if (schema.format === 'email') return 'email';
        if (schema.maxLength > 100) return 'textarea';
        return 'text';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      default:
        return 'text';
    }
  }

  /**
   * Formatuj etykietę
   */
  formatLabel(path) {
    const parts = path.split('.');
    const label = parts[parts.length - 1];
    return label
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
  }

  /**
   * Pobierz domyślną wartość
   */
  getDefaultValue(schema) {
    switch (schema.type) {
      case 'string':
        return schema.default || '';
      case 'number':
      case 'integer':
        return schema.default || 0;
      case 'boolean':
        return schema.default || false;
      case 'array':
        return schema.default || [];
      case 'object':
        return schema.default || {};
      default:
        return '';
    }
  }
}

// Główny moduł edytora
export default {
  name: 'componentEditor',
  version: '0.1.0',
  component: Component,

  // Systemy pomocnicze
  fileSystem: new ComponentFileSystem(),

  /**
   * Główna funkcja obsługi
   */
  async handle(request = {}) {
    const action = request.action || 'init';

    switch (action) {
      case 'scan':
        return await this.scanComponents();

      case 'load':
        return await this.loadComponent(request.path);

      case 'save':
        return await this.saveComponent(request.path, request.data);

      case 'validate':
        return await this.validateComponent(request.data, request.schema);

      case 'generateFields':
        return await this.generateFields(request.data, request.schema, request.crud);

      default:
        return {
          success: true,
          data: {
            module: this.name,
            version: this.version,
            features: [
              'visual-editing',
              'schema-validation',
              'crud-permissions',
              'file-management',
              'multi-format-support'
            ]
          }
        };
    }
  },

  /**
   * Skanuj dostępne komponenty
   */
  async scanComponents() {
    try {
      const components = await this.fileSystem.scanComponents();
      return {
        success: true,
        data: components
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Wczytaj komponent
   */
  async loadComponent(path) {
    try {
      const content = await this.fileSystem.loadFile(path);
      const schema = await this.fileSystem.loadSchema(path);
      const crud = await this.fileSystem.loadCrudRules(path);

      return {
        success: true,
        data: {
          content,
          schema,
          crud,
          path
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Zapisz komponent
   */
  async saveComponent(path, data) {
    try {
      // Waliduj przed zapisem
      const schema = await this.fileSystem.loadSchema(path);
      const validator = new SchemaValidator(schema);
      const validation = validator.validate(data);

      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        };
      }

      // Zapisz plik
      const saved = await this.fileSystem.saveFile(path, data);

      return {
        success: saved,
        message: 'Component saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Waliduj komponent
   */
  async validateComponent(data, schema) {
    try {
      const validator = new SchemaValidator(schema);
      const validation = validator.validate(data);

      return {
        success: validation.valid,
        data: validation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generuj pola do edycji
   */
  async generateFields(data, schema, crud) {
    try {
      const generator = new FieldGenerator(schema, crud);
      const fields = generator.generateFields(data);

      return {
        success: true,
        data: fields
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Inicjalizacja modułu
   */
  async init(context) {
    try {
      console.log('✅ Component Editor initialized');
      return true;
    } catch (error) {
      console.error('❌ Component Editor initialization failed:', error);
      return false;
    }
  },

  // Konfiguracja modułu
  config: {
    name: 'componentEditor',
    displayName: 'Visual Component Editor',
    description: 'Wizualny edytor komponentów Vue z walidacją schematów',
    version: '0.1.0',
    author: 'Industrial Systems Team',
    features: [
      'visual-field-editing',
      'json-schema-validation',
      'crud-permissions',
      'file-management',
      'multi-component-support',
      '7.9-inch-display-optimized'
    ],
    fileSupport: [
      'js', 'vue', 'json', 'css', 'ts', 'tsx'
    ],
    displayOptimization: '7.9inch-landscape-1280x400px'
  }
};

// Eksportuj klasy pomocnicze dla innych modułów
export {
  ComponentFileSystem,
  SchemaValidator,
  FieldGenerator
};