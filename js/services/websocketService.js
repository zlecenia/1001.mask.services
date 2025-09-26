/**
 * WebSocket Service for Real-time Sensor Monitoring
 * 
 * Handles real-time communication with industrial sensor devices
 * Optimized for 7.9" display applications with pressure monitoring
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Event-driven architecture with Vue reactive integration
 * - Industrial device compatibility
 * - Error handling and logging
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.messageQueue = [];
    this.subscribers = new Map();
    this.lastHeartbeat = null;
    this.heartbeatInterval = null;
    this.connectionId = null;
    
    // Configuration for industrial sensor monitoring
    this.config = {
      url: 'ws://localhost:8080/sensor-data',
      protocols: ['sensor-protocol-v1'],
      heartbeatInterval: 30000, // 30 seconds
      messageTimeout: 5000, // 5 seconds
      queueMaxSize: 100,
      compressionEnabled: true
    };
    
    // Sensor data validation schema
    this.sensorSchema = {
      pressure: {
        low: { min: -1000, max: 1000, unit: 'mbar' },
        medium: { min: 0, max: 10, unit: 'bar' },
        high: { min: 0, max: 100, unit: 'bar' }
      },
      temperature: { min: -40, max: 150, unit: '°C' },
      humidity: { min: 0, max: 100, unit: '%' },
      flow: { min: 0, max: 1000, unit: 'l/min' }
    };
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(customConfig = {}) {
    try {
      this.config = { ...this.config, ...customConfig };
      
      console.log('🔌 Connecting to sensor WebSocket...', this.config.url);
      
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.config.messageTimeout);
        
        this.ws.addEventListener('open', () => {
          clearTimeout(timeout);
          resolve(this);
        });
        
        this.ws.addEventListener('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      throw error;
    }
  }

  /**
   * Handle WebSocket connection opened
   */
  handleOpen(event) {
    console.log('✅ WebSocket connected to sensor system');
    
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.connectionId = this.generateConnectionId();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send initial authentication and configuration
    this.sendMessage({
      type: 'auth',
      connectionId: this.connectionId,
      clientType: 'industrial-display',
      displaySize: '7.9-inch',
      protocols: ['pressure-monitoring', 'real-time-alerts']
    });
    
    // Process queued messages
    this.processMessageQueue();
    
    // Notify subscribers
    this.notifySubscribers('connected', { connectionId: this.connectionId });
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.lastHeartbeat = Date.now();
      
      console.log('📡 Sensor data received:', data.type);
      
      switch (data.type) {
        case 'pressure-data':
          this.handlePressureData(data);
          break;
          
        case 'alert':
          this.handleAlert(data);
          break;
          
        case 'heartbeat':
          this.handleHeartbeat(data);
          break;
          
        case 'config-update':
          this.handleConfigUpdate(data);
          break;
          
        case 'error':
          this.handleServerError(data);
          break;
          
        default:
          console.warn('⚠️ Unknown message type:', data.type);
      }
      
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle pressure sensor data
   */
  handlePressureData(data) {
    const validatedData = this.validateSensorData(data.payload);
    
    if (validatedData.isValid) {
      this.notifySubscribers('pressure-data', {
        ...validatedData.data,
        timestamp: data.timestamp || Date.now(),
        deviceId: data.deviceId,
        quality: data.quality || 'good'
      });
    } else {
      console.warn('⚠️ Invalid pressure data received:', validatedData.errors);
    }
  }

  /**
   * Handle sensor alerts
   */
  handleAlert(data) {
    const alert = {
      id: data.alertId || this.generateAlertId(),
      type: data.alertType,
      severity: data.severity || 'warning',
      message: data.message,
      sensorId: data.sensorId,
      value: data.currentValue,
      threshold: data.threshold,
      timestamp: data.timestamp || Date.now(),
      acknowledged: false
    };
    
    console.warn('🚨 Sensor alert:', alert.message);
    
    this.notifySubscribers('alert', alert);
  }

  /**
   * Validate incoming sensor data
   */
  validateSensorData(data) {
    const errors = [];
    const validatedData = {};
    
    try {
      // Validate pressure data structure
      if (data.pressure) {
        const pressure = data.pressure;
        
        ['low', 'medium', 'high'].forEach(level => {
          if (pressure[level]) {
            const schema = this.sensorSchema.pressure[level];
            const value = pressure[level].value;
            
            if (typeof value === 'number' && value >= schema.min && value <= schema.max) {
              validatedData.pressure = validatedData.pressure || {};
              validatedData.pressure[level] = {
                value: value,
                unit: pressure[level].unit || schema.unit,
                status: this.calculateStatus(value, level),
                lastUpdate: Date.now()
              };
            } else {
              errors.push(`Invalid ${level} pressure value: ${value}`);
            }
          }
        });
      }
      
      // Validate additional sensor data
      ['temperature', 'humidity', 'flow'].forEach(sensorType => {
        if (data[sensorType] !== undefined) {
          const schema = this.sensorSchema[sensorType];
          const value = data[sensorType];
          
          if (typeof value === 'number' && value >= schema.min && value <= schema.max) {
            validatedData[sensorType] = {
              value: value,
              unit: schema.unit,
              status: 'normal',
              lastUpdate: Date.now()
            };
          } else {
            errors.push(`Invalid ${sensorType} value: ${value}`);
          }
        }
      });
      
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }
    
    return {
      isValid: errors.length === 0,
      data: validatedData,
      errors: errors
    };
  }

  /**
   * Calculate sensor status based on value and thresholds
   */
  calculateStatus(value, level) {
    // These thresholds should be configurable per installation
    const thresholds = {
      low: { warning: 800, critical: 900 },
      medium: { warning: 8, critical: 9 },
      high: { warning: 80, critical: 90 }
    };
    
    const threshold = thresholds[level];
    
    if (Math.abs(value) >= threshold.critical) {
      return 'critical';
    } else if (Math.abs(value) >= threshold.warning) {
      return 'warning';
    } else {
      return 'normal';
    }
  }

  /**
   * Handle WebSocket connection closed
   */
  handleClose(event) {
    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
    
    this.isConnected = false;
    this.stopHeartbeat();
    
    this.notifySubscribers('disconnected', { 
      code: event.code, 
      reason: event.reason 
    });
    
    // Attempt reconnection unless it was a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnection();
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('❌ WebSocket error:', error);
    
    this.notifySubscribers('error', { 
      error: error,
      timestamp: Date.now()
    });
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnection() {
    this.reconnectAttempts++;
    
    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error);
        
        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnection();
        } else {
          console.error('❌ Max reconnection attempts reached');
          this.notifySubscribers('reconnect-failed', { attempts: this.reconnectAttempts });
        }
      });
    }, this.reconnectDelay);
  }

  /**
   * Send message to WebSocket server
   */
  sendMessage(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      try {
        const messageString = JSON.stringify({
          ...message,
          timestamp: Date.now(),
          connectionId: this.connectionId
        });
        
        this.ws.send(messageString);
        console.log('📤 Message sent:', message.type);
        
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    } else {
      // Queue message for later
      if (this.messageQueue.length < this.config.queueMaxSize) {
        this.messageQueue.push(message);
        console.log('📋 Message queued:', message.type);
      } else {
        console.warn('⚠️ Message queue full, discarding message:', message.type);
      }
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType).add(callback);
    
    console.log(`📡 Subscribed to ${eventType} events`);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  /**
   * Notify all subscribers of an event
   */
  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in subscriber callback for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({ type: 'ping' });
        
        // Check if we received a recent heartbeat
        if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > this.config.heartbeatInterval * 2) {
          console.warn('⚠️ No heartbeat received, connection may be stale');
          this.ws.close(1000, 'Heartbeat timeout');
        }
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle heartbeat response
   */
  handleHeartbeat(data) {
    this.lastHeartbeat = Date.now();
    // Optionally send pong response
    if (data.requiresPong) {
      this.sendMessage({ type: 'pong', pingId: data.pingId });
    }
  }

  /**
   * Request specific sensor data
   */
  requestSensorData(sensorIds = [], dataTypes = ['pressure']) {
    this.sendMessage({
      type: 'request-data',
      sensorIds: sensorIds,
      dataTypes: dataTypes,
      interval: 1000 // Request updates every second
    });
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(thresholds) {
    this.sendMessage({
      type: 'update-thresholds',
      thresholds: thresholds
    });
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId, userId = 'system') {
    this.sendMessage({
      type: 'acknowledge-alert',
      alertId: alertId,
      userId: userId,
      timestamp: Date.now()
    });
  }

  /**
   * Generate unique connection ID
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      connectionId: this.connectionId,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      lastHeartbeat: this.lastHeartbeat,
      subscriberCount: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0)
    };
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.isConnected = false;
    this.connectionId = null;
    this.messageQueue = [];
    this.subscribers.clear();
  }
}

// Export singleton instance
export default new WebSocketService();
