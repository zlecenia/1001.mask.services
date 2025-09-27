// MASKSERVICE C20 1001 Configuration SDK - Go Implementation
// Universal configuration management with validation and real-time sync

package configsdk

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

// ConfigSDK provides configuration management functionality
type ConfigSDK struct {
	BaseURL  string
	Headers  map[string]string
	client   *http.Client
	cache    map[string]interface{}
	schemas  map[string]map[string]interface{}
	watchers map[string]context.CancelFunc
	cacheMu  sync.RWMutex
	schemaMu sync.RWMutex
	watchMu  sync.RWMutex
}

// SDKOptions configuration options for the SDK
type SDKOptions struct {
	BaseURL string
	Headers map[string]string
	Timeout time.Duration
}

// GetOptions options for Get operations
type GetOptions struct {
	UseCache bool
	Validate bool
}

// UpdateOptions options for Update operations
type UpdateOptions struct {
	Validate bool
}

// ValidationResult represents validation outcome
type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Errors []string `json:"errors"`
}

// CrudRules represents CRUD configuration rules
type CrudRules struct {
	Name        string                            `json:"name"`
	Title       string                            `json:"title"`
	Description string                            `json:"description"`
	Rules       CrudRuleSet                       `json:"rules"`
	FieldTypes  map[string]string                 `json:"field_types"`
	Validation  map[string]map[string]interface{} `json:"validation_rules"`
	UIHints     map[string]map[string]interface{} `json:"ui_hints"`
	Permissions map[string][]string               `json:"permissions,omitempty"`
}

// CrudRuleSet defines CRUD operation rules
type CrudRuleSet struct {
	Editable  []string `json:"editable"`
	Readonly  []string `json:"readonly"`
	Protected []string `json:"protected"`
	Addable   bool     `json:"addable"`
	Deletable bool     `json:"deletable"`
}

// NewConfigSDK creates a new configuration SDK instance
func NewConfigSDK(options SDKOptions) *ConfigSDK {
	if options.BaseURL == "" {
		options.BaseURL = "http://localhost:3000/api"
	}
	
	if options.Timeout == 0 {
		options.Timeout = 30 * time.Second
	}
	
	defaultHeaders := map[string]string{
		"Content-Type": "application/json",
	}
	
	for k, v := range options.Headers {
		defaultHeaders[k] = v
	}
	
	return &ConfigSDK{
		BaseURL: options.BaseURL,
		Headers: defaultHeaders,
		client: &http.Client{
			Timeout: options.Timeout,
		},
		cache:    make(map[string]interface{}),
		schemas:  make(map[string]map[string]interface{}),
		watchers: make(map[string]context.CancelFunc),
	}
}

// LoadSchema loads and caches a schema for validation
func (sdk *ConfigSDK) LoadSchema(name string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/schemas/%s", sdk.BaseURL, name)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	for k, v := range sdk.Headers {
		req.Header.Set(k, v)
	}
	
	resp, err := sdk.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("schema loading failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to load schema: %s", body)
	}
	
	var schema map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&schema); err != nil {
		return nil, fmt.Errorf("failed to decode schema: %w", err)
	}
	
	sdk.schemaMu.Lock()
	sdk.schemas[name] = schema
	sdk.schemaMu.Unlock()
	
	return schema, nil
}

// Validate validates data against a loaded schema
func (sdk *ConfigSDK) Validate(data map[string]interface{}, schemaName string) ValidationResult {
	sdk.schemaMu.RLock()
	schema, ok := sdk.schemas[schemaName]
	sdk.schemaMu.RUnlock()
	
	if !ok {
		return ValidationResult{
			Valid:  false,
			Errors: []string{fmt.Sprintf("schema %s not loaded", schemaName)},
		}
	}
	
	errors := sdk.validateData(data, schema)
	return ValidationResult{
		Valid:  len(errors) == 0,
		Errors: errors,
	}
}

// validateData performs the actual validation logic
func (sdk *ConfigSDK) validateData(data map[string]interface{}, schema map[string]interface{}) []string {
	var errors []string
	
	// Check required fields
	if required, ok := schema["required"].([]interface{}); ok {
		for _, req := range required {
			if reqStr, ok := req.(string); ok {
				if _, exists := data[reqStr]; !exists {
					errors = append(errors, fmt.Sprintf("required field %s is missing", reqStr))
				}
			}
		}
	}
	
	// Validate properties
	if properties, ok := schema["properties"].(map[string]interface{}); ok {
		for key, value := range data {
			if prop, ok := properties[key].(map[string]interface{}); ok {
				fieldErrors := sdk.validateField(key, value, prop)
				errors = append(errors, fieldErrors...)
			}
		}
	}
	
	return errors
}

// validateField validates individual field
func (sdk *ConfigSDK) validateField(key string, value interface{}, schema map[string]interface{}) []string {
	var errors []string
	
	// Type validation
	if expectedType, ok := schema["type"].(string); ok {
		if !sdk.validateType(value, expectedType) {
			errors = append(errors, fmt.Sprintf("field %s: expected %s", key, expectedType))
		}
	}
	
	// String validations
	if str, ok := value.(string); ok {
		if minLen, ok := schema["minLength"].(float64); ok && float64(len(str)) < minLen {
			errors = append(errors, fmt.Sprintf("field %s: minimum length is %g", key, minLen))
		}
		if maxLen, ok := schema["maxLength"].(float64); ok && float64(len(str)) > maxLen {
			errors = append(errors, fmt.Sprintf("field %s: maximum length is %g", key, maxLen))
		}
		if pattern, ok := schema["pattern"].(string); ok {
			// In production, use regexp package for pattern validation
			// For now, skip pattern validation to keep example simple
		}
	}
	
	// Number validations
	if num, ok := value.(float64); ok {
		if min, ok := schema["minimum"].(float64); ok && num < min {
			errors = append(errors, fmt.Sprintf("field %s: minimum value is %g", key, min))
		}
		if max, ok := schema["maximum"].(float64); ok && num > max {
			errors = append(errors, fmt.Sprintf("field %s: maximum value is %g", key, max))
		}
	}
	
	// Enum validation
	if enum, ok := schema["enum"].([]interface{}); ok {
		found := false
		for _, enumVal := range enum {
			if enumVal == value {
				found = true
				break
			}
		}
		if !found {
			errors = append(errors, fmt.Sprintf("field %s: value not in allowed enum", key))
		}
	}
	
	return errors
}

// validateType checks if value matches expected type
func (sdk *ConfigSDK) validateType(value interface{}, expectedType string) bool {
	switch expectedType {
	case "string":
		_, ok := value.(string)
		return ok
	case "number":
		_, ok := value.(float64)
		return ok
	case "integer":
		if f, ok := value.(float64); ok {
			return f == float64(int64(f))
		}
		return false
	case "boolean":
		_, ok := value.(bool)
		return ok
	case "array":
		_, ok := value.([]interface{})
		return ok
	case "object":
		_, ok := value.(map[string]interface{})
		return ok
	}
	return true // Unknown type, allow
}

// Get retrieves configuration data
func (sdk *ConfigSDK) Get(configName string, options GetOptions) (map[string]interface{}, error) {
	if options.UseCache {
		sdk.cacheMu.RLock()
		if cached, ok := sdk.cache[configName]; ok {
			sdk.cacheMu.RUnlock()
			return cached.(map[string]interface{}), nil
		}
		sdk.cacheMu.RUnlock()
	}
	
	url := fmt.Sprintf("%s/config/%s", sdk.BaseURL, configName)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	for k, v := range sdk.Headers {
		req.Header.Set(k, v)
	}
	
	resp, err := sdk.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("get config failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get config: %s", body)
	}
	
	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	if options.Validate {
		validation := sdk.Validate(data, configName)
		if !validation.Valid {
			return nil, fmt.Errorf("validation failed: %v", validation.Errors)
		}
	}
	
	if options.UseCache {
		sdk.cacheMu.Lock()
		sdk.cache[configName] = data
		sdk.cacheMu.Unlock()
	}
	
	return data, nil
}

// Update replaces entire configuration
func (sdk *ConfigSDK) Update(configName string, data map[string]interface{}, options UpdateOptions) (map[string]interface{}, error) {
	if options.Validate {
		validation := sdk.Validate(data, configName)
		if !validation.Valid {
			return nil, fmt.Errorf("validation failed: %v", validation.Errors)
		}
	}
	
	url := fmt.Sprintf("%s/config/%s", sdk.BaseURL, configName)
	
	body, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal data: %w", err)
	}
	
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	for k, v := range sdk.Headers {
		req.Header.Set(k, v)
	}
	
	resp, err := sdk.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("update config failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to update config: %s", body)
	}
	
	var updated map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&updated); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	sdk.cacheMu.Lock()
	sdk.cache[configName] = updated
	sdk.cacheMu.Unlock()
	
	return updated, nil
}

// Patch partially updates configuration
func (sdk *ConfigSDK) Patch(configName string, updates map[string]interface{}, options UpdateOptions) (map[string]interface{}, error) {
	if options.Validate {
		// Get current config and merge for validation
		current, err := sdk.Get(configName, GetOptions{UseCache: false, Validate: false})
		if err != nil {
			return nil, fmt.Errorf("failed to get current config for validation: %w", err)
		}
		
		merged := make(map[string]interface{})
		for k, v := range current {
			merged[k] = v
		}
		for k, v := range updates {
			merged[k] = v
		}
		
		validation := sdk.Validate(merged, configName)
		if !validation.Valid {
			return nil, fmt.Errorf("validation failed: %v", validation.Errors)
		}
	}
	
	url := fmt.Sprintf("%s/config/%s", sdk.BaseURL, configName)
	
	body, err := json.Marshal(updates)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updates: %w", err)
	}
	
	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	for k, v := range sdk.Headers {
		req.Header.Set(k, v)
	}
	
	resp, err := sdk.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("patch config failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to patch config: %s", body)
	}
	
	var updated map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&updated); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	
	sdk.cacheMu.Lock()
	sdk.cache[configName] = updated
	sdk.cacheMu.Unlock()
	
	return updated, nil
}

// GetCrud retrieves CRUD rules for configuration
func (sdk *ConfigSDK) GetCrud(configName string) (*CrudRules, error) {
	url := fmt.Sprintf("%s/crud/%s", sdk.BaseURL, configName)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	for k, v := range sdk.Headers {
		req.Header.Set(k, v)
	}
	
	resp, err := sdk.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("get CRUD failed: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get CRUD: %s", body)
	}
	
	var crud CrudRules
	if err := json.NewDecoder(resp.Body).Decode(&crud); err != nil {
		return nil, fmt.Errorf("failed to decode CRUD response: %w", err)
	}
	
	return &crud, nil
}

// Watch monitors configuration for changes
func (sdk *ConfigSDK) Watch(configName string, callback func(error, map[string]interface{}), interval time.Duration) func() {
	if interval == 0 {
		interval = 5 * time.Second
	}
	
	// Cancel existing watcher if any
	sdk.watchMu.Lock()
	if cancel, exists := sdk.watchers[configName]; exists {
		cancel()
	}
	
	ctx, cancel := context.WithCancel(context.Background())
	sdk.watchers[configName] = cancel
	sdk.watchMu.Unlock()
	
	go func() {
		var lastData string
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		
		// Initial fetch
		data, err := sdk.Get(configName, GetOptions{UseCache: false, Validate: false})
		if err == nil {
			if dataBytes, err := json.Marshal(data); err == nil {
				lastData = string(dataBytes)
				callback(nil, data)
			}
		} else {
			callback(err, nil)
		}
		
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				data, err := sdk.Get(configName, GetOptions{UseCache: false, Validate: false})
				if err != nil {
					callback(err, nil)
					continue
				}
				
				if dataBytes, err := json.Marshal(data); err == nil {
					currentData := string(dataBytes)
					if currentData != lastData {
						lastData = currentData
						callback(nil, data)
					}
				}
			}
		}
	}()
	
	return func() {
		cancel()
		sdk.watchMu.Lock()
		delete(sdk.watchers, configName)
		sdk.watchMu.Unlock()
	}
}

// ClearCache clears cached configurations
func (sdk *ConfigSDK) ClearCache(configNames ...string) {
	sdk.cacheMu.Lock()
	defer sdk.cacheMu.Unlock()
	
	if len(configNames) == 0 {
		sdk.cache = make(map[string]interface{})
	} else {
		for _, name := range configNames {
			delete(sdk.cache, name)
		}
	}
}

// Destroy cleanup all resources
func (sdk *ConfigSDK) Destroy() {
	sdk.watchMu.Lock()
	for _, cancel := range sdk.watchers {
		cancel()
	}
	sdk.watchers = make(map[string]context.CancelFunc)
	sdk.watchMu.Unlock()
	
	sdk.cacheMu.Lock()
	sdk.cache = make(map[string]interface{})
	sdk.cacheMu.Unlock()
	
	sdk.schemaMu.Lock()
	sdk.schemas = make(map[string]map[string]interface{})
	sdk.schemaMu.Unlock()
}
