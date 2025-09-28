/**
 * Maintenance Component 0.1.0
 * Workshop maintenance management for Service Technicians
 */

export default {
  metadata: {
    name: 'maintenance',
    version: '0.1.0', 
    contractVersion: '2.0',
    description: 'Workshop maintenance management and task scheduling',
    author: 'MASKSERVICE System',
    roles: ['SERWISANT', 'ADMIN', 'SUPERUSER'],
    initialized: false
  },

  // Initialize component
  async init(context = {}) {
    console.log('🔧 [Maintenance] Initializing component...');
    console.log('📋 [Maintenance] Context received:', context);
    
    try {
      this.metadata.initialized = true;
      console.log('✅ [Maintenance] Component initialized successfully');
      
      return {
        success: true,
        message: 'maintenance initialized',
        contractVersion: '2.0'
      };
    } catch (error) {
      console.error('❌ [Maintenance] Initialization failed:', error);
      return {
        success: false,
        error: error.message,
        contractVersion: '2.0'
      };
    }
  },

  // Handle component actions
  handle(request = {}) {
    const { action = 'getStatus', data = {} } = request;
    
    switch (action) {
      case 'getStatus':
        return {
          success: true,
          data: {
            initialized: this.metadata.initialized,
            activeTasksCount: 12,
            pendingTasksCount: 5,
            completedToday: 3,
            nextMaintenanceDate: '2025-09-30'
          }
        };
        
      case 'getTasks':
        return {
          success: true,
          data: this.getMaintenanceTasks()
        };
        
      case 'addTask':
        return {
          success: true,
          data: { message: 'Task added successfully', taskId: Date.now() }
        };
        
      case 'updateTask':
        return {
          success: true,
          data: { message: 'Task updated successfully' }
        };
        
      default:
        return {
          success: false,
          error: `Unknown action: ${action}`
        };
    }
  },

  // Render component in container
  render(container, context = {}) {
    console.log('🎨 [Maintenance] Starting render...');
    
    if (!container) {
      return;
    }
    
    // Create maintenance dashboard HTML
    container.innerHTML = `
      <div class="maintenance-dashboard">
        <div class="dashboard-header">
          <h2>🔧 Maintenance Dashboard</h2>
          <div class="maintenance-actions">
            <button class="btn-add-task" onclick="addMaintenanceTask()">
              <i class="fas fa-plus"></i> Add Task
            </button>
            <button class="refresh-btn" onclick="refreshMaintenance()">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        <div class="maintenance-stats">
          <div class="stat-card active">
            <h3>Active Tasks</h3>
            <div class="stat-number">12</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card pending">
            <h3>Pending</h3>
            <div class="stat-number">5</div>
            <div class="stat-label">Scheduled</div>
          </div>
          <div class="stat-card completed">
            <h3>Completed Today</h3>
            <div class="stat-number">3</div>
            <div class="stat-label">Finished</div>
          </div>
          <div class="stat-card upcoming">
            <h3>Next Maintenance</h3>
            <div class="stat-date">Sep 30</div>
            <div class="stat-label">2025</div>
          </div>
        </div>

        <div class="maintenance-tabs">
          <div class="tab active" onclick="switchMaintenanceTab('schedule')">
            <i class="fas fa-calendar"></i> Schedule
          </div>
          <div class="tab" onclick="switchMaintenanceTab('tasks')">
            <i class="fas fa-tasks"></i> Tasks
          </div>
          <div class="tab" onclick="switchMaintenanceTab('equipment')">
            <i class="fas fa-tools"></i> Equipment
          </div>
          <div class="tab" onclick="switchMaintenanceTab('reports')">
            <i class="fas fa-file-alt"></i> Reports
          </div>
        </div>

        <div class="tab-content">
          <div id="schedule-panel" class="tab-panel active">
            ${this.renderSchedulePanel()}
          </div>
          
          <div id="tasks-panel" class="tab-panel">
            ${this.renderTasksPanel()}
          </div>
          
          <div id="equipment-panel" class="tab-panel">
            ${this.renderEquipmentPanel()}
          </div>
          
          <div id="reports-panel" class="tab-panel">
            ${this.renderReportsPanel()}
          </div>
        </div>

        <div class="maintenance-footer">
          <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    
    // Add event handlers
    this.attachEventHandlers();
    
    console.log('✅ [Maintenance] Component rendered successfully');
  },

  // Render schedule panel
  renderSchedulePanel() {
    return `
      <div class="schedule-section">
        <div class="calendar-view">
          <h3>📅 Maintenance Calendar</h3>
          <div class="calendar-grid">
            <div class="calendar-header">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div class="calendar-days">
              ${this.generateCalendarDays()}
            </div>
          </div>
        </div>
        
        <div class="upcoming-tasks">
          <h3>🔔 Upcoming Tasks</h3>
          <div class="task-list">
            <div class="task-item priority-high">
              <span class="task-device">MASK-001</span>
              <span class="task-name">Quarterly Check</span>
              <span class="task-date">Sep 30</span>
            </div>
            <div class="task-item priority-medium">
              <span class="task-device">SCBA-007</span>
              <span class="task-name">Filter Replacement</span>
              <span class="task-date">Oct 02</span>
            </div>
            <div class="task-item priority-low">
              <span class="task-device">REG-003</span>
              <span class="task-name">Calibration Check</span>
              <span class="task-date">Oct 05</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Render tasks panel
  renderTasksPanel() {
    return `
      <div class="tasks-section">
        <div class="task-filters">
          <select class="filter-status">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select class="filter-priority">
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div class="tasks-grid">
          ${this.generateTaskCards()}
        </div>
      </div>
    `;
  },

  // Render equipment panel
  renderEquipmentPanel() {
    return `
      <div class="equipment-section">
        <h3>🛠️ Equipment Status</h3>
        <div class="equipment-grid">
          <div class="equipment-card">
            <div class="equipment-header">
              <h4>MASK-001</h4>
              <span class="status-good">Good</span>
            </div>
            <div class="equipment-info">
              <p>Last Service: Sep 15, 2025</p>
              <p>Next Service: Dec 15, 2025</p>
              <p>Hours: 1,245</p>
            </div>
          </div>
          
          <div class="equipment-card">
            <div class="equipment-header">
              <h4>SCBA-007</h4>
              <span class="status-warning">Warning</span>
            </div>
            <div class="equipment-info">
              <p>Last Service: Aug 20, 2025</p>
              <p>Next Service: Oct 02, 2025</p>
              <p>Hours: 2,156</p>
            </div>
          </div>
          
          <div class="equipment-card">
            <div class="equipment-header">
              <h4>REG-003</h4>
              <span class="status-good">Good</span>
            </div>
            <div class="equipment-info">
              <p>Last Service: Sep 10, 2025</p>
              <p>Next Service: Dec 10, 2025</p>
              <p>Hours: 892</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Render reports panel
  renderReportsPanel() {
    return `
      <div class="reports-section">
        <h3>📊 Maintenance Reports</h3>
        <div class="reports-grid">
          <div class="report-card">
            <h4>Monthly Summary</h4>
            <p>Tasks Completed: 45</p>
            <p>Avg Response Time: 2.3h</p>
            <p>Equipment Uptime: 98.5%</p>
            <button class="btn-download">Download PDF</button>
          </div>
          
          <div class="report-card">
            <h4>Equipment Health</h4>
            <p>Critical Issues: 0</p>
            <p>Warnings: 2</p>
            <p>Good Status: 15</p>
            <button class="btn-download">Download PDF</button>
          </div>
          
          <div class="report-card">
            <h4>Cost Analysis</h4>
            <p>Parts Cost: $1,250</p>
            <p>Labor Hours: 120h</p>
            <p>Total Cost: $4,500</p>
            <button class="btn-download">Download PDF</button>
          </div>
        </div>
      </div>
    `;
  },

  // Generate calendar days
  generateCalendarDays() {
    let html = '';
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate();
      const hasTask = [15, 25, 30].includes(day); // Example task days
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}">
          <span class="day-number">${day}</span>
          ${hasTask ? '<span class="task-indicator">●</span>' : ''}
        </div>
      `;
    }
    
    return html;
  },

  // Generate task cards
  generateTaskCards() {
    const tasks = this.getMaintenanceTasks();
    return tasks.map(task => `
      <div class="task-card priority-${task.priority}">
        <div class="task-header">
          <h4>${task.device}</h4>
          <span class="status-badge status-${task.status}">${task.status.toUpperCase()}</span>
        </div>
        <div class="task-body">
          <h5>${task.task}</h5>
          <p>${task.description}</p>
          <div class="task-details">
            <span>📅 ${task.date}</span>
            <span>👤 ${task.assignedTo}</span>
            <span>⏱️ ${task.estimatedDuration}min</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
          <button class="btn-complete" onclick="completeTask(${task.id})">Complete</button>
        </div>
      </div>
    `).join('');
  },

  // Get maintenance tasks data
  getMaintenanceTasks() {
    return [
      {
        id: 1,
        device: 'MASK-001',
        task: 'Quarterly Check',
        date: '2025-09-30',
        status: 'pending',
        priority: 'high',
        assignedTo: 'Jan Kowalski',
        estimatedDuration: 120,
        description: 'Pełny przegląd kwartalny urządzenia'
      },
      {
        id: 2,
        device: 'SCBA-007',
        task: 'Filter Replacement',
        date: '2025-10-02',
        status: 'scheduled',
        priority: 'medium',
        assignedTo: 'Anna Nowak',
        estimatedDuration: 45,
        description: 'Wymiana filtrów HEPA'
      },
      {
        id: 3,
        device: 'REG-003',
        task: 'Calibration Check',
        date: '2025-10-05',
        status: 'pending',
        priority: 'low',
        assignedTo: 'Piotr Wiśniewski',
        estimatedDuration: 60,
        description: 'Sprawdzenie kalibracji regulatora'
      }
    ];
  },

  // Attach event handlers
  attachEventHandlers() {
    // Add global functions for maintenance actions
    window.switchMaintenanceTab = (tabName) => {
      // Hide all panels
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      document.querySelectorAll('.maintenance-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected panel
      const panel = document.getElementById(`${tabName}-panel`);
      if (panel) panel.classList.add('active');
      
      // Activate tab
      event.target.closest('.tab').classList.add('active');
    };
    
    window.addMaintenanceTask = () => {
      alert('Add Maintenance Task dialog would open here');
    };
    
    window.refreshMaintenance = () => {
      console.log('🔄 Refreshing maintenance data...');
      // Re-render component
      this.render(document.querySelector('.maintenance-dashboard').parentElement);
    };
    
    window.editTask = (taskId) => {
      console.log(`Editing task ${taskId}`);
      alert(`Edit Task ${taskId} dialog would open here`);
    };
    
    window.completeTask = (taskId) => {
      console.log(`Completing task ${taskId}`);
      alert(`Task ${taskId} marked as completed!`);
    };
  }
};
