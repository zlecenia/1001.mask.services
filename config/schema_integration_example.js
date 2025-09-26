/**
 * 🔧 PRZYKŁAD INTEGRACJI SCHEMATÓW JSON Z SYSTEMEM
 * ================================================
 * 
 * Ten przykład pokazuje jak wykorzystać wyodrębnione schematy
 * w rzeczywistej aplikacji Node.js/Express
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv'); // Biblioteka do walidacji JSON Schema

class ConfigManager {
    constructor(schemasDir = './schemas', dataDir = './data') {
        this.schemasDir = schemasDir;
        this.dataDir = dataDir;
        this.schemas = {};
        this.crudRules = {};
        this.ajv = new Ajv({ allErrors: true });
        
        this.loadAllSchemas();
    }

    /**
     * 📂 Ładowanie wszystkich schematów i reguł CRUD
     */
    loadAllSchemas() {
        const schemaFiles = [
            'app', 'menu', 'router', 
            'system', 'test-scenarios', 'workshop'
        ];

        schemaFiles.forEach(type => {
            try {
                // Załaduj schemat walidacji
                const schemaPath = path.join(this.schemasDir, `${type}-schema.json`);
                const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                this.schemas[type] = schemaData;
                this.ajv.addSchema(schemaData, type);

                // Załaduj reguły CRUD
                const crudPath = path.join(this.schemasDir, `${type}-crud.json`);
                const crudData = JSON.parse(fs.readFileSync(crudPath, 'utf8'));
                this.crudRules[type] = crudData;

                console.log(`✅ Loaded schema and CRUD rules for: ${type}`);
            } catch (error) {
                console.error(`❌ Failed to load schema for ${type}:`, error.message);
            }
        });
    }

    /**
     * 🔍 Walidacja pliku konfiguracji
     */
    validateConfig(type, data) {
        const validate = this.ajv.getSchema(type);
        if (!validate) {
            throw new Error(`Schema not found for type: ${type}`);
        }

        const isValid = validate(data);
        
        return {
            valid: isValid,
            errors: validate.errors || [],
            schema: this.schemas[type]
        };
    }

    /**
     * 📝 Sprawdzenie uprawnień do edycji pola
     */
    canEditField(type, fieldPath) {
        const rules = this.crudRules[type];
        if (!rules || !rules.rules) return false;

        const editable = rules.rules.editable || [];
        
        return editable.some(rule => {
            // Obsługa wzorców z gwiazdkami
            if (rule.includes('*')) {
                const regex = new RegExp('^' + rule.replace(/\*/g, '[^/]+') + '$');
                return regex.test(fieldPath);
            }
            return rule === fieldPath;
        });
    }

    /**
     * ➕ Sprawdzenie czy można dodawać elementy
     */
    canAddToPath(type, parentPath) {
        const rules = this.crudRules[type];
        if (!rules || !rules.rules) return false;

        const addable = rules.rules.addable;
        if (addable === false) return false;
        if (!Array.isArray(addable)) return false;

        return addable.some(rule => {
            if (rule.includes('*')) {
                const regex = new RegExp('^' + rule.replace(/\*/g, '[^/]+') + '$');
                return regex.test(parentPath);
            }
            return rule === parentPath;
        });
    }

    /**
     * 🗑️ Sprawdzenie czy można usuwać elementy
     */
    canDeleteFromPath(type, itemPath) {
        const rules = this.crudRules[type];
        if (!rules || !rules.rules) return false;

        const deletable = rules.rules.deletable;
        if (deletable === false) return false;
        if (!Array.isArray(deletable)) return false;

        return deletable.some(rule => {
            if (rule.includes('*')) {
                const regex = new RegExp('^' + rule.replace(/\*/g, '[^/]+') + '$');
                return regex.test(itemPath);
            }
            return rule === itemPath;
        });
    }

    /**
     * 💾 Bezpieczne zapisywanie konfiguracji
     */
    saveConfig(type, data, backup = true) {
        // 1. Walidacja danych
        const validation = this.validateConfig(type, data);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
        }

        const configPath = path.join(this.dataDir, `${type}.json`);

        // 2. Backup istniejącej konfiguracji
        if (backup && fs.existsSync(configPath)) {
            const backupPath = path.join(this.dataDir, `${type}.backup.json`);
            fs.copyFileSync(configPath, backupPath);
        }

        // 3. Zapisz nową konfigurację
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
        
        return {
            success: true,
            path: configPath,
            validation
        };
    }

    /**
     * 📖 Wczytywanie konfiguracji z walidacją
     */
    loadConfig(type) {
        const configPath = path.join(this.dataDir, `${type}.json`);
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }

        const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const validation = this.validateConfig(type, data);

        return {
            data,
            validation,
            path: configPath
        };
    }

    /**
     * 🔧 Aktualizacja pojedynczego pola
     */
    updateField(type, fieldPath, newValue) {
        // Sprawdź uprawnienia
        if (!this.canEditField(type, fieldPath)) {
            throw new Error(`Field ${fieldPath} is not editable`);
        }

        // Wczytaj aktualną konfigurację
        const config = this.loadConfig(type);
        
        // Aktualizuj pole
        this.setValueByPath(config.data, fieldPath, newValue);
        
        // Zapisz z walidacją
        return this.saveConfig(type, config.data);
    }

    /**
     * 🛠️ Pomocnicza funkcja do ustawiania wartości według ścieżki
     */
    setValueByPath(obj, path, value) {
        const keys = path.split('/');
        const lastKey = keys.pop();
        
        let current = obj;
        for (const key of keys) {
            if (Array.isArray(current)) {
                current = current[parseInt(key)];
            } else {
                current = current[key];
            }
        }
        
        if (Array.isArray(current)) {
            current[parseInt(lastKey)] = value;
        } else {
            current[lastKey] = value;
        }
    }

    /**
     * 📊 Raport o stanie wszystkich konfiguracji
     */
    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            configs: {},
            summary: { valid: 0, invalid: 0, missing: 0 }
        };

        Object.keys(this.schemas).forEach(type => {
            try {
                const config = this.loadConfig(type);
                report.configs[type] = {
                    status: config.validation.valid ? 'valid' : 'invalid',
                    errors: config.validation.errors,
                    path: config.path
                };
                
                if (config.validation.valid) {
                    report.summary.valid++;
                } else {
                    report.summary.invalid++;
                }
            } catch (error) {
                report.configs[type] = {
                    status: 'missing',
                    error: error.message
                };
                report.summary.missing++;
            }
        });

        return report;
    }
}

/**
 * 🌐 EXPRESS API ENDPOINTS
 * ========================
 */

const express = require('express');
const app = express();
const configManager = new ConfigManager();

app.use(express.json());

// GET /api/config/:type - Pobierz konfigurację
app.get('/api/config/:type', (req, res) => {
    try {
        const config = configManager.loadConfig(req.params.type);
        res.json(config);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// PUT /api/config/:type - Zapisz całą konfigurację
app.put('/api/config/:type', (req, res) => {
    try {
        const result = configManager.saveConfig(req.params.type, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/config/:type/field - Aktualizuj pojedyncze pole
app.patch('/api/config/:type/field', (req, res) => {
    try {
        const { fieldPath, value } = req.body;
        const result = configManager.updateField(req.params.type, fieldPath, value);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/schema/:type - Pobierz schemat
app.get('/api/schema/:type', (req, res) => {
    const schema = configManager.schemas[req.params.type];
    const crud = configManager.crudRules[req.params.type];
    
    if (!schema) {
        return res.status(404).json({ error: 'Schema not found' });
    }
    
    res.json({ schema, crud });
});

// POST /api/config/:type/validate - Waliduj dane bez zapisywania
app.post('/api/config/:type/validate', (req, res) => {
    try {
        const validation = configManager.validateConfig(req.params.type, req.body);
        res.json(validation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/permissions/:type/:fieldPath - Sprawdź uprawnienia
app.get('/api/permissions/:type/:fieldPath', (req, res) => {
    const { type, fieldPath } = req.params;
    const permissions = {
        canEdit: configManager.canEditField(type, fieldPath),
        canAdd: configManager.canAddToPath(type, fieldPath),
        canDelete: configManager.canDeleteFromPath(type, fieldPath)
    };
    res.json(permissions);
});

// GET /api/report - Raport walidacji wszystkich konfiguracji
app.get('/api/report', (req, res) => {
    const report = configManager.generateValidationReport();
    res.json(report);
});

/**
 * 🧪 PRZYKŁADY UŻYCIA
 * ===================
 */

// Przykład 1: Walidacja pliku app.json
async function example1() {
    console.log('\n🧪 Przykład 1: Walidacja konfiguracji aplikacji');
    
    const appConfig = {
        "API_URL": "http://localhost:3000",
        "WS_URL": "ws://localhost:3000", 
        "MOCK_MODE": true,
        "UPDATE_INTERVAL": 5000
    };

    const validation = configManager.validateConfig('app', appConfig);
    console.log('Validation result:', validation.valid ? '✅ Valid' : '❌ Invalid');
    
    if (!validation.valid) {
        console.log('Errors:', validation.errors);
    }
}

// Przykład 2: Sprawdzanie uprawnień edycji
async function example2() {
    console.log('\n🧪 Przykład 2: Sprawdzanie uprawnień edycji');
    
    const checks = [
        { type: 'app', path: 'API_URL' },
        { type: 'menu', path: 'OPERATOR/0/key' },
        { type: 'workshop', path: 'spare_parts/default_parts/0/id' },
        { type: 'workshop', path: 'spare_parts/default_parts/0/quantity' }
    ];

    checks.forEach(check => {
        const canEdit = configManager.canEditField(check.type, check.path);
        console.log(`${check.type}:${check.path} → ${canEdit ? '✅ Editable' : '❌ Read-only'}`);
    });
}

// Przykład 3: Bezpieczna aktualizacja pola
async function example3() {
    console.log('\n🧪 Przykład 3: Aktualizacja konfiguracji');
    
    try {
        // To powinno się udać (pole edytowalne)
        const result1 = configManager.updateField('app', 'UPDATE_INTERVAL', 10000);
        console.log('✅ Updated UPDATE_INTERVAL:', result1.success);
        
        // To powinno się nie udać (pole chronione)
        try {
            configManager.updateField('workshop', 'spare_parts/default_parts/0/id', 'NEW_ID');
        } catch (error) {
            console.log('❌ Protected field update blocked:', error.message);
        }
    } catch (error) {
        console.error('Update failed:', error.message);
    }
}

// Uruchomienie przykładów
if (require.main === module) {
    example1();
    example2();
    example3();
    
    // Uruchomienie serwera
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Config API Server running on port ${PORT}`);
        console.log(`📋 Available endpoints:`);
        console.log(`   GET    /api/config/:type`);
        console.log(`   PUT    /api/config/:type`);
        console.log(`   PATCH  /api/config/:type/field`);
        console.log(`   GET    /api/schema/:type`);
        console.log(`   POST   /api/config/:type/validate`);
        console.log(`   GET    /api/permissions/:type/:fieldPath`);
        console.log(`   GET    /api/report`);
    });
}

module.exports = ConfigManager;