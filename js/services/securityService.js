// Security Service for Industrial Vue Application
// Implements authentication, authorization, input validation, XSS/CSRF protection, and audit logging

// Using Web Crypto API for browser compatibility instead of external CryptoJS

class SecurityService {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.auditLog = [];
    this.maxAuditLogSize = 1000;
    this.csrfTokens = new Map();
    this.activeSessions = new Map();
    
    // XSS Protection patterns
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];
    
    // SQL Injection patterns
    this.sqlPatterns = [
      /(\s*(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+)/gi,
      /(--|\/\*|\*\/|;)/gi,
      /(\s*(or|and)\s+\d+\s*=\s*\d+)/gi,
      /('|\"|`|;|\\|\/\*|\*\/)/gi
    ];
    
    // Initialize security configurations
    this.initializeSecurity();
  }
  
  initializeSecurity() {
    // Set up CSP headers if running in secure context
    if (typeof document !== 'undefined') {
      this.setupContentSecurityPolicy();
    }
    
    // Initialize session cleanup
    this.startSessionCleanup();
    
    console.log('🔒 SecurityService initialized with industrial-grade protection');
  }
  
  // === AUTHENTICATION & AUTHORIZATION ===
  
  async authenticateUser(username, password, role = 'OPERATOR') {
    const startTime = Date.now();
    
    try {
      // Check for account lockout
      if (this.isAccountLocked(username)) {
        const error = new Error('Account locked due to too many failed attempts');
        await this.logSecurityEvent('AUTH_LOCKED', { username, timestamp: startTime });
        throw error;
      }
      
      // Validate input
      const cleanUsername = this.sanitizeInput(username);
      const cleanPassword = this.sanitizeInput(password);
      
      if (!(await this.validateCredentials(cleanUsername, cleanPassword))) {
        await this.handleFailedLogin(username);
        const error = new Error('Invalid credentials');
        await this.logSecurityEvent('AUTH_FAILED', { username: cleanUsername, timestamp: startTime });
        throw error;
      }
      
      // Validate role
      if (!this.isValidRole(role)) {
        const error = new Error('Invalid role specified');
        await this.logSecurityEvent('AUTH_INVALID_ROLE', { username: cleanUsername, role, timestamp: startTime });
        throw error;
      }
      
      // Create secure session
      const sessionToken = this.generateSecureToken();
      const session = {
        id: sessionToken,
        username: cleanUsername,
        role: role,
        loginTime: startTime,
        lastActivity: startTime,
        permissions: this.getRolePermissions(role),
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent
      };
      
      this.activeSessions.set(sessionToken, session);
      
      // Reset failed login attempts
      this.resetFailedAttempts(username);
      
      // Log successful authentication
      await this.logSecurityEvent('AUTH_SUCCESS', {
        username: cleanUsername,
        role,
        sessionId: sessionToken,
        timestamp: startTime,
        duration: Date.now() - startTime
      });
      
      return {
        success: true,
        sessionToken,
        user: {
          username: cleanUsername,
          role,
          permissions: session.permissions
        }
      };
      
    } catch (error) {
      await this.logSecurityEvent('AUTH_ERROR', {
        username: username,
        error: error.message,
        timestamp: startTime
      });
      throw error;
    }
  }
  
  validateSession(sessionToken) {
    if (!sessionToken) return null;
    
    const session = this.activeSessions.get(sessionToken);
    if (!session) return null;
    
    // Check session timeout
    const now = Date.now();
    if (now - session.lastActivity > this.sessionTimeout) {
      this.invalidateSession(sessionToken);
      this.logSecurityEvent('SESSION_TIMEOUT', { sessionId: sessionToken, username: session.username });
      return null;
    }
    
    // Update last activity
    session.lastActivity = now;
    this.activeSessions.set(sessionToken, session);
    
    return session;
  }
  
  invalidateSession(sessionToken) {
    const session = this.activeSessions.get(sessionToken);
    if (session) {
      this.logSecurityEvent('SESSION_LOGOUT', {
        sessionId: sessionToken,
        username: session.username,
        duration: Date.now() - session.loginTime
      });
      this.activeSessions.delete(sessionToken);
    }
  }
  
  // === ROLE-BASED ACCESS CONTROL ===
  
  isValidRole(role) {
    const validRoles = ['OPERATOR', 'ADMIN', 'SUPERUSER', 'SERWISANT'];
    return validRoles.includes(role);
  }
  
  getRolePermissions(role) {
    const permissions = {
      'OPERATOR': ['view_dashboard', 'view_sensors', 'acknowledge_alerts'],
      'ADMIN': ['view_dashboard', 'view_sensors', 'acknowledge_alerts', 'manage_users', 'configure_system'],
      'SUPERUSER': ['view_dashboard', 'view_sensors', 'acknowledge_alerts', 'manage_users', 'configure_system', 'system_maintenance', 'view_audit_logs'],
      'SERWISANT': ['view_dashboard', 'view_sensors', 'acknowledge_alerts', 'configure_system', 'system_maintenance', 'hardware_access']
    };
    
    return permissions[role] || [];
  }
  
  hasPermission(sessionToken, permission) {
    const session = this.validateSession(sessionToken);
    if (!session) return false;
    
    return session.permissions.includes(permission) || session.permissions.includes('*');
  }
  
  // === INPUT VALIDATION & SANITIZATION ===
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Basic HTML entity encoding
    let sanitized = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Remove potential XSS patterns
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }
  
  validateInput(input, type = 'text', options = {}) {
    const validation = {
      isValid: true,
      errors: [],
      sanitized: input
    };
    
    if (!input && options.required) {
      validation.isValid = false;
      validation.errors.push('Field is required');
      return validation;
    }
    
    // Sanitize input
    validation.sanitized = this.sanitizeInput(input);
    
    // Type-specific validation
    switch (type) {
      case 'username':
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(validation.sanitized) && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(validation.sanitized)) {
          validation.isValid = false;
          validation.errors.push('Username must be 3-20 characters, alphanumeric with _ or -, or a valid email address');
        }
        break;
        
      case 'password':
        if (validation.sanitized.length < 8) {
          validation.isValid = false;
          validation.errors.push('Password must be at least 8 characters');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(validation.sanitized)) {
          validation.isValid = false;
          validation.errors.push('Password must contain uppercase, lowercase, and number');
        }
        break;
        
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validation.sanitized)) {
          validation.isValid = false;
          validation.errors.push('Invalid email format');
        }
        break;
        
      case 'number':
        if (isNaN(validation.sanitized)) {
          validation.isValid = false;
          validation.errors.push('Must be a valid number');
        }
        break;
    }
    
    // Check for SQL injection patterns
    if (this.detectSQLInjection(validation.sanitized)) {
      validation.isValid = false;
      validation.errors.push('Invalid characters detected');
    }
    
    return validation;
  }
  
  detectSQLInjection(input) {
    return this.sqlPatterns.some(pattern => pattern.test(input));
  }
  
  // === CSRF PROTECTION ===
  
  generateCSRFToken(sessionToken) {
    const token = this.generateSecureToken();
    this.csrfTokens.set(sessionToken, {
      token,
      timestamp: Date.now()
    });
    
    // Clean old tokens
    this.cleanupCSRFTokens();
    
    return token;
  }
  
  validateCSRFToken(sessionToken, submittedToken) {
    const csrfData = this.csrfTokens.get(sessionToken);
    if (!csrfData) return false;
    
    // Check token age (max 1 hour)
    if (Date.now() - csrfData.timestamp > 3600000) {
      this.csrfTokens.delete(sessionToken);
      return false;
    }
    
    return csrfData.token === submittedToken;
  }
  
  cleanupCSRFTokens() {
    const now = Date.now();
    for (const [sessionToken, csrfData] of this.csrfTokens.entries()) {
      if (now - csrfData.timestamp > 3600000) {
        this.csrfTokens.delete(sessionToken);
      }
    }
  }
  
  // === AUDIT LOGGING ===
  
  async logSecurityEvent(event, data = {}) {
    const logEntry = {
      id: this.generateSecureToken(),
      timestamp: new Date().toISOString(),
      event,
      data: { ...data },
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };
    
    this.auditLog.push(logEntry);
    
    // Limit log size
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Security Event:', logEntry);
    }
    
    return logEntry;
  }
  
  getAuditLog(sessionToken, filters = {}) {
    // Validate session has audit permission
    if (!this.hasPermission(sessionToken, 'view_audit_logs')) {
      throw new Error('Insufficient permissions to view audit logs');
    }
    
    let filteredLog = [...this.auditLog];
    
    // Apply filters
    if (filters.event) {
      filteredLog = filteredLog.filter(entry => entry.event === filters.event);
    }
    
    if (filters.username) {
      filteredLog = filteredLog.filter(entry => 
        entry.data.username === filters.username
      );
    }
    
    if (filters.startDate) {
      filteredLog = filteredLog.filter(entry => 
        new Date(entry.timestamp) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filteredLog = filteredLog.filter(entry => 
        new Date(entry.timestamp) <= new Date(filters.endDate)
      );
    }
    
    return filteredLog.slice(0, filters.limit || 100);
  }
  
  // === UTILITY METHODS ===
  
  generateSecureToken() {
    // Use Web Crypto API for secure random token generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  async hashPassword(password) {
    // Use Web Crypto API for password hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  async validateCredentials(username, password) {
    // This is a mock implementation - replace with real authentication
    const validCredentials = {
      'admin': await this.hashPassword('admin123'),
      'operator': await this.hashPassword('operator123'),
      'service': await this.hashPassword('service123')
    };
    
    const hashedPassword = await this.hashPassword(password);
    return validCredentials[username] === hashedPassword;
  }
  
  isAccountLocked(username) {
    // Implementation for account lockout logic
    const failures = this.getFailedAttempts(username);
    return failures >= this.maxLoginAttempts;
  }
  
  handleFailedLogin(username) {
    // Track failed login attempts
    const key = `failed_${username}`;
    const failures = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, failures.toString());
    
    if (failures >= this.maxLoginAttempts) {
      setTimeout(() => {
        localStorage.removeItem(key);
      }, this.lockoutDuration);
    }
  }
  
  getFailedAttempts(username) {
    return parseInt(localStorage.getItem(`failed_${username}`) || '0');
  }
  
  resetFailedAttempts(username) {
    localStorage.removeItem(`failed_${username}`);
  }
  
  getClientIP() {
    // Mock implementation - in real app, get from server
    return 'localhost';
  }
  
  setupContentSecurityPolicy() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'";
    document.head.appendChild(meta);
  }
  
  startSessionCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionToken, session] of this.activeSessions.entries()) {
        if (now - session.lastActivity > this.sessionTimeout) {
          this.invalidateSession(sessionToken);
        }
      }
    }, 60000); // Check every minute
  }
  
  // === PUBLIC API ===
  
  getSecurityMetrics(sessionToken) {
    if (!this.hasPermission(sessionToken, 'view_audit_logs')) {
      throw new Error('Insufficient permissions');
    }
    
    return {
      activeSessions: this.activeSessions.size,
      auditLogEntries: this.auditLog.length,
      csrfTokens: this.csrfTokens.size,
      lastCleanup: Date.now()
    };
  }
  
  destroy() {
    this.activeSessions.clear();
    this.csrfTokens.clear();
    this.auditLog = [];
  }
}

// Global instance
let securityServiceInstance = null;

// Factory function
export function getSecurityService() {
  if (!securityServiceInstance) {
    securityServiceInstance = new SecurityService();
  }
  return securityServiceInstance;
}

export default SecurityService;
