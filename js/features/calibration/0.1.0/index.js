import CalibrationComponent from './CalibrationComponent.vue';
import { ConfigLoader } from '../../../shared/configLoader.js';

/**
 * Calibration Module 0.1.0
 * Sensor and equipment calibration tools for SERWISANT role
 * Provides calibration procedures, validation, and certification
 */

const componentModule = {
  metadata: {
    name: 'calibration',
    version: '0.1.0',
    type: 'component',
    contractVersion: '2.0',
    description: 'Sensor calibration and validation tools',
    author: 'MASKSERVICE System',
    roles: ['SERWISANT', 'ADMIN', 'SUPERUSER'],
    initialized: false
  },

  // Initialize component
  async init(context = {}) {
    console.log('🚀 [Calibration] Starting initialization...', context);
    try {
      console.log('📋 [Calibration] Loading configuration...');
      await this.loadConfig();
      
      console.log('📐 [Calibration] Loading calibration data...');
      await this.loadCalibrationData();
      
      this.metadata.initialized = true;
      console.log('✅ [Calibration] Initialization completed successfully');
      return { success: true, message: 'Calibration component initialized successfully' };
    } catch (error) {
      console.error('❌ [Calibration] Initialization failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Load component configuration
  async loadConfig() {
    this.config = this.getDefaultConfig();
    console.log('📋 [Calibration] Using default configuration');
    return { success: true, config: this.config };
  },

  // Load calibration data
  async loadCalibrationData() {
    this.calibrationData = {
      sensors: [
        {
          id: 'TEMP_01',
          name: 'Temperature Sensor 1',
          type: 'PT100',
          location: 'Main Tank',
          currentValue: 23.5,
          unit: '°C',
          calibrationStatus: 'valid',
          lastCalibration: '2024-12-15',
          nextCalibration: '2025-06-15',
          accuracy: '±0.1°C',
          calibrationPoints: [
            { reference: 0, measured: 0.02, deviation: 0.02 },
            { reference: 25, measured: 25.01, deviation: 0.01 },
            { reference: 50, measured: 49.98, deviation: -0.02 },
            { reference: 100, measured: 100.03, deviation: 0.03 }
          ]
        },
        {
          id: 'PRESS_01',
          name: 'Pressure Sensor 1',
          type: 'Ceramic',
          location: 'Main Line',
          currentValue: 1.23,
          unit: 'bar',
          calibrationStatus: 'due',
          lastCalibration: '2024-08-10',
          nextCalibration: '2025-02-10',
          accuracy: '±0.01 bar',
          calibrationPoints: [
            { reference: 0, measured: 0.005, deviation: 0.005 },
            { reference: 1, measured: 1.008, deviation: 0.008 },
            { reference: 2, measured: 2.012, deviation: 0.012 },
            { reference: 5, measured: 5.015, deviation: 0.015 }
          ]
        },
        {
          id: 'FLOW_01',
          name: 'Flow Sensor 1',
          type: 'Electromagnetic',
          location: 'Inlet Pipe',
          currentValue: 45.8,
          unit: 'l/min',
          calibrationStatus: 'overdue',
          lastCalibration: '2024-06-20',
          nextCalibration: '2024-12-20',
          accuracy: '±1%',
          calibrationPoints: [
            { reference: 0, measured: 0.2, deviation: 0.2 },
            { reference: 25, measured: 25.3, deviation: 0.3 },
            { reference: 50, measured: 50.1, deviation: 0.1 },
            { reference: 75, measured: 74.8, deviation: -0.2 }
          ]
        }
      ],
      procedures: [
        {
          id: 'CAL_TEMP_STD',
          name: 'Temperature Calibration Standard',
          description: 'Standard 4-point temperature calibration procedure',
          sensorTypes: ['PT100', 'PT1000', 'Thermocouple'],
          steps: 8,
          estimatedTime: '45 minutes',
          equipment: ['Reference thermometer', 'Calibration bath', 'Logger']
        },
        {
          id: 'CAL_PRESS_STD',
          name: 'Pressure Calibration Standard',
          description: 'Standard pressure calibration using dead weight tester',
          sensorTypes: ['Ceramic', 'Piezoresistive', 'Capacitive'],
          steps: 6,
          estimatedTime: '30 minutes',
          equipment: ['Dead weight tester', 'Pressure source', 'Logger']
        }
      ],
      certificates: [
        {
          id: 'CERT_001',
          sensorId: 'TEMP_01',
          issuedDate: '2024-12-15',
          validUntil: '2025-06-15',
          technician: 'Jan Kowalski',
          status: 'active',
          accuracy: 'Passed ±0.1°C'
        },
        {
          id: 'CERT_002',
          sensorId: 'PRESS_01',
          issuedDate: '2024-08-10',
          validUntil: '2025-02-10',
          technician: 'Anna Nowak',
          status: 'expiring',
          accuracy: 'Passed ±0.01 bar'
        }
      ]
    };
    
    return { success: true, data: this.calibrationData };
  },

  // Get default configuration
  getDefaultConfig() {
    return {
      component: {
        name: 'calibration',
        displayName: 'Sensor Calibration',
        type: 'calibration-tools',
        refreshInterval: 30000
      },
      ui: {
        layout: 'tabbed',
        theme: 'technical',
        sections: ['sensors', 'procedures', 'certificates'],
        colors: {
          valid: '#27ae60',
          due: '#f39c12',
          overdue: '#e74c3c',
          inProgress: '#3498db'
        }
      },
      calibration: {
        autoReminders: true,
        reminderDays: 30,
        requireCertification: true,
        maxDeviation: 0.05
      }
    };
  },

  // Handle component actions
  handle(request = {}) {
    const { action = 'GET_STATUS', data = {} } = request;
    
    switch (action) {
      case 'GET_SENSORS':
        return {
          success: true,
          data: this.calibrationData?.sensors || []
        };
        
      case 'START_CALIBRATION':
        return this.startCalibration(data.sensorId, data.procedureId);
        
      case 'GET_CERTIFICATES':
        return {
          success: true,
          data: this.calibrationData?.certificates || []
        };
        
      default:
        return {
          success: false,
          error: `Unknown action: ${action}`
        };
    }
  },

  // Start calibration procedure
  startCalibration(sensorId, procedureId) {
    const sensor = this.calibrationData.sensors.find(s => s.id === sensorId);
    const procedure = this.calibrationData.procedures.find(p => p.id === procedureId);
    
    if (!sensor || !procedure) {
      return {
        success: false,
        error: 'Sensor or procedure not found'
      };
    }

    return {
      success: true,
      message: `Calibration started for ${sensor.name}`,
      data: {
        calibrationId: `CAL_${Date.now()}`,
        sensor,
        procedure,
        startTime: new Date().toISOString()
      }
    };
  },

  // Get calibration status color
  getCalibrationStatusColor(status) {
    const colors = {
      valid: '#27ae60',
      due: '#f39c12',
      overdue: '#e74c3c',
      inProgress: '#3498db'
    };
    return colors[status] || '#95a5a6';
  },

  // Get calibration status icon
  getCalibrationStatusIcon(status) {
    const icons = {
      valid: '✅',
      due: '⚠️',
      overdue: '❌',
      inProgress: '🔄'
    };
    return icons[status] || '❓';
  },

  // Render component in container
  render(container, context = {}) {
    console.log('🎨 [Calibration] Starting render...');
    
    if (!container) {
      console.error('❌ [Calibration] No container provided');
      return;
    }

    const sensors = this.calibrationData?.sensors || [];
    const procedures = this.calibrationData?.procedures || [];
    const certificates = this.calibrationData?.certificates || [];
    
    // Create calibration dashboard HTML
    container.innerHTML = `
      <div class="calibration-dashboard" style="padding: 20px; background: #f8f9fa; border-radius: 8px; height: calc(100vh - 120px); overflow-y: auto;">
        <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">📐 Sensor Calibration</h2>
          <div class="header-actions" style="display: flex; gap: 10px;">
            <div class="status-summary" style="display: flex; gap: 10px;">
              <div style="background: #27ae60; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                ✅ ${sensors.filter(s => s.calibrationStatus === 'valid').length} Valid
              </div>
              <div style="background: #f39c12; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                ⚠️ ${sensors.filter(s => s.calibrationStatus === 'due').length} Due
              </div>
              <div style="background: #e74c3c; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                ❌ ${sensors.filter(s => s.calibrationStatus === 'overdue').length} Overdue
              </div>
            </div>
            <button class="new-calibration-btn" style="background: #3498db; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
              🆕 New Calibration
            </button>
          </div>
        </div>
        
        <!-- Calibration Tabs -->
        <div class="calibration-tabs" style="display: flex; background: white; border-radius: 8px 8px 0 0; border-bottom: 1px solid #dee2e6; overflow: hidden;">
          <div class="tab active" data-tab="sensors" style="padding: 15px 20px; background: #3498db; color: white; cursor: pointer; border-right: 1px solid #dee2e6;">
            🌡️ Sensors (${sensors.length})
          </div>
          <div class="tab" data-tab="procedures" style="padding: 15px 20px; background: #ecf0f1; color: #2c3e50; cursor: pointer; border-right: 1px solid #dee2e6;">
            📋 Procedures (${procedures.length})
          </div>
          <div class="tab" data-tab="certificates" style="padding: 15px 20px; background: #ecf0f1; color: #2c3e50; cursor: pointer;">
            📜 Certificates (${certificates.length})
          </div>
        </div>
        
        <!-- Tab Content -->
        <div class="tab-content" style="background: white; border-radius: 0 0 8px 8px; min-height: 500px;">
          
          <!-- Sensors Tab -->
          <div class="tab-panel active" data-panel="sensors" style="padding: 20px;">
            <div class="sensors-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
              ${sensors.map(sensor => `
                <div class="sensor-card" style="border: 2px solid ${this.getCalibrationStatusColor(sensor.calibrationStatus)}; border-radius: 8px; padding: 20px; background: white;">
                  <div class="sensor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                      <h3 style="margin: 0; color: #2c3e50; font-size: 18px;">${sensor.name}</h3>
                      <div style="color: #666; font-size: 12px;">${sensor.type} | ${sensor.location}</div>
                    </div>
                    <div class="status-badge" style="background: ${this.getCalibrationStatusColor(sensor.calibrationStatus)}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; text-transform: uppercase;">
                      ${this.getCalibrationStatusIcon(sensor.calibrationStatus)} ${sensor.calibrationStatus}
                    </div>
                  </div>
                  
                  <div class="sensor-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                      <div style="font-size: 12px; color: #666;">Current Value</div>
                      <div style="font-size: 18px; font-weight: bold; color: #2c3e50;">${sensor.currentValue} ${sensor.unit}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
                      <div style="font-size: 12px; color: #666;">Accuracy</div>
                      <div style="font-size: 14px; font-weight: bold; color: #2c3e50;">${sensor.accuracy}</div>
                    </div>
                  </div>
                  
                  <div class="calibration-dates" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 12px;">
                    <div>
                      <span style="color: #666;">Last Cal:</span>
                      <span style="font-weight: bold;">${sensor.lastCalibration}</span>
                    </div>
                    <div>
                      <span style="color: #666;">Next Cal:</span>
                      <span style="font-weight: bold; color: ${sensor.calibrationStatus === 'overdue' ? '#e74c3c' : '#2c3e50'};">${sensor.nextCalibration}</span>
                    </div>
                  </div>
                  
                  <div class="sensor-actions" style="display: flex; gap: 10px;">
                    <button class="calibrate-btn" style="flex: 1; background: #27ae60; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                      📐 Start Calibration
                    </button>
                    <button class="view-history-btn" style="background: #95a5a6; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                      📊 History
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Procedures Tab -->
          <div class="tab-panel" data-panel="procedures" style="padding: 20px; display: none;">
            <div class="procedures-list" style="display: flex; flex-direction: column; gap: 15px;">
              ${procedures.map(procedure => `
                <div class="procedure-card" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px;">
                  <div style="display: flex; justify-content: between; align-items: flex-start;">
                    <div style="flex: 1;">
                      <h3 style="color: #2c3e50; margin: 0 0 10px 0;">${procedure.name}</h3>
                      <p style="color: #666; margin: 0 0 15px 0; line-height: 1.4;">${procedure.description}</p>
                      
                      <div class="procedure-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                          <div style="font-size: 12px; color: #666;">Sensor Types</div>
                          <div style="font-size: 14px; color: #2c3e50;">${procedure.sensorTypes.join(', ')}</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #666;">Steps</div>
                          <div style="font-size: 14px; font-weight: bold; color: #2c3e50;">${procedure.steps} steps</div>
                        </div>
                        <div>
                          <div style="font-size: 12px; color: #666;">Duration</div>
                          <div style="font-size: 14px; font-weight: bold; color: #2c3e50;">${procedure.estimatedTime}</div>
                        </div>
                      </div>
                      
                      <div class="equipment-needed" style="margin-bottom: 15px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Required Equipment:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                          ${procedure.equipment.map(eq => `
                            <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${eq}</span>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                    
                    <div class="procedure-actions" style="margin-left: 20px;">
                      <button style="background: #27ae60; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin-bottom: 5px; width: 100%;">
                        ▶️ Start
                      </button>
                      <button style="background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">
                        📖 Details
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Certificates Tab -->
          <div class="tab-panel" data-panel="certificates" style="padding: 20px; display: none;">
            <div class="certificates-table" style="background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
              <div class="table-header" style="background: #34495e; color: white; padding: 15px; font-weight: bold; display: grid; grid-template-columns: 150px 1fr 120px 120px 120px 100px; gap: 15px; font-size: 12px;">
                <div>Certificate ID</div>
                <div>Sensor</div>
                <div>Issued Date</div>
                <div>Valid Until</div>
                <div>Technician</div>
                <div>Status</div>
              </div>
              ${certificates.map(cert => `
                <div style="padding: 15px; border-bottom: 1px solid #ecf0f1; display: grid; grid-template-columns: 150px 1fr 120px 120px 120px 100px; gap: 15px; align-items: center; font-size: 12px;">
                  <div style="font-weight: bold; color: #2c3e50;">${cert.id}</div>
                  <div>${this.calibrationData.sensors.find(s => s.id === cert.sensorId)?.name || cert.sensorId}</div>
                  <div>${cert.issuedDate}</div>
                  <div style="color: ${cert.status === 'expiring' ? '#f39c12' : '#2c3e50'};">${cert.validUntil}</div>
                  <div>${cert.technician}</div>
                  <div>
                    <span style="background: ${cert.status === 'active' ? '#27ae60' : '#f39c12'}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase;">
                      ${cert.status}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
        </div>
        
        <div class="calibration-footer" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
          ⏰ Last Update: ${new Date().toLocaleTimeString()} | 📐 Calibration Management System | 🔧 SERWISANT Access Level
        </div>
      </div>
      
      <script>
        // Simple tab switching functionality for calibration
        document.querySelectorAll('.calibration-dashboard .tab').forEach(tab => {
          tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update tab appearance
            document.querySelectorAll('.calibration-dashboard .tab').forEach(t => {
              t.style.background = '#ecf0f1';
              t.style.color = '#2c3e50';
            });
            tab.style.background = '#3498db';
            tab.style.color = 'white';
            
            // Show/hide panels
            document.querySelectorAll('.calibration-dashboard .tab-panel').forEach(panel => {
              panel.style.display = 'none';
            });
            document.querySelector('.calibration-dashboard [data-panel="' + targetTab + '"]').style.display = 'block';
          });
        });
      </script>
    `;
    
    console.log('✅ [Calibration] Dashboard rendered successfully');
  }
};

// Lock the structure to prevent modifications
if (typeof Object.freeze === 'function') {
  Object.freeze(componentModule.metadata);
}

export default componentModule;
