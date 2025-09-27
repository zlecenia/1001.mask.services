/**
 * User Menu Module - Dynamic role-based user menu component
 * Migrated from UserMenuScreen.js to modular architecture
 * 
 * Features:
 * - Role-based menu configuration (OPERATOR, ADMIN, SUPERUSER, SERWISANT)
 * - SecurityService integration for access control and audit logging
 * - Vuex store integration for navigation and user state
 * - Multi-language support (PL/EN/DE)
 * - Responsive grid layout optimized for 7.9" LCD displays
 * - Menu item validation and sanitization
 * - Session timeout and activity monitoring
 */

import { reactive, computed, onMounted, onUnmounted, inject } from 'vue';

const UserMenu = {
    name: 'UserMenu',
    
    props: {
        user: {
            type: Object,
            default: () => ({ username: null, role: null, isAuthenticated: false }),
            validator: (user) => {
                return user && typeof user.username === 'string' && typeof user.role === 'string';
            }
        },
        language: {
            type: String,
            default: 'pl',
            validator: (lang) => ['pl', 'en', 'de'].includes(lang)
        },
        config: {
            type: Object,
            required: true
        }
    },
    
    emits: ['navigate', 'logout', 'menu-item-selected', 'security-event'],
    
    setup(props, { emit }) {
        // Injected dependencies
        const store = inject('store');
        const securityService = inject('securityService');
        
        // Reactive state
        const menuState = reactive({
            isLoading: true,
            currentView: 'menu',
            selectedMenuItem: null,
            refreshAttempts: 0,
            maxRefreshAttempts: 50,
            lastActivity: Date.now(),
            sessionTimer: null
        });
        
        // Security and validation methods
        const validateMenuAccess = async (menuItem) => {
            try {
                if (!securityService) return true;
                
                const hasAccess = await securityService.checkPermission(props.user.role, menuItem.id);
                
                if (!hasAccess) {
                    await securityService.logAuditEvent({
                        type: 'MENU_ACCESS_DENIED',
                        details: {
                            menuItem: menuItem.id,
                            userRole: props.user.role,
                            username: props.user.username
                        },
                        level: 'WARNING'
                    });
                    
                    emit('security-event', {
                        type: 'ACCESS_DENIED',
                        menuItem: menuItem.id
                    });
                }
                
                return hasAccess;
            } catch (error) {
                console.error('UserMenu: Menu access validation failed:', error);
                return false;
            }
        };
        
        const sanitizeMenuId = (menuId) => {
            if (!securityService) return menuId;
            return securityService.sanitizeInput(menuId);
        };
        
        // Menu configuration based on role
        const getMenuConfig = () => {
            try {
                const userRole = props.user.role || 'OPERATOR';
                const roleConfig = props.config.roles[userRole] || props.config.roles.OPERATOR;
                
                return roleConfig.menuItems.map(item => ({
                    ...item,
                    id: sanitizeMenuId(item.id),
                    label: getLocalizedText(item.labelKey) || item.label || item.id,
                    description: getLocalizedText(item.descriptionKey) || item.description || ''
                }));
            } catch (error) {
                console.error('UserMenu: Failed to get menu config:', error);
                return [];
            }
        };
        
        // Localization helper
        const getLocalizedText = (key) => {
            try {
                const i18nKeys = props.config.localization?.i18nKeys;
                if (!i18nKeys || !key) return null;
                
                // Handle nested keys like roles.OPERATOR
                const keyParts = key.split('.');
                let value = i18nKeys;
                
                for (const part of keyParts) {
                    value = value[part];
                    if (!value) break;
                }
                
                if (typeof value === 'object') {
                    return value[props.language] || value.pl || null;
                }
                
                return value;
            } catch (error) {
                console.error('UserMenu: Localization error:', error);
                return null;
            }
        };
        
        // Computed properties
        const currentMenu = computed(() => getMenuConfig());
        
        const userRoleText = computed(() => {
            try {
                const roleKey = `roles.${props.user.role}`;
                const localizedRole = getLocalizedText(roleKey);
                return localizedRole || props.user.role;
            } catch (error) {
                return props.user.role;
            }
        });
        
        const welcomeText = computed(() => {
            try {
                const welcomeKey = getLocalizedText('welcome') || 'Witaj';
                return `${welcomeKey}, ${props.user.username}`;
            } catch (error) {
                return `Witaj, ${props.user.username}`;
            }
        });
        
        const loadingText = computed(() => {
            return getLocalizedText('loading') || 'Ładowanie menu...';
        });
        
        const logoutText = computed(() => {
            return getLocalizedText('logout') || 'Wyloguj';
        });
        
        const menuStatsText = computed(() => {
            const optionsText = getLocalizedText('optionsAvailable') || 'opcji dostępnych dla roli';
            return `${currentMenu.value.length} ${optionsText} ${userRoleText.value}`;
        });
        
        const roleClass = computed(() => {
            return `role-${(props.user.role || 'guest').toLowerCase()}`;
        });
        
        // Activity monitoring
        const updateActivity = () => {
            menuState.lastActivity = Date.now();
        };
        
        const checkSessionTimeout = () => {
            const timeoutDuration = 30 * 60 * 1000; // 30 minutes
            const timeSinceActivity = Date.now() - menuState.lastActivity;
            
            if (timeSinceActivity > timeoutDuration) {
                handleLogout('SESSION_TIMEOUT');
            }
        };
        
        // Navigation methods
        const selectMenuItem = async (menuItem) => {
            try {
                updateActivity();
                
                console.log(`UserMenu: Menu item selected: ${menuItem.id}`);
                
                // Validate access
                const hasAccess = await validateMenuAccess(menuItem);
                if (!hasAccess) {
                    console.warn(`UserMenu: Access denied for menu item: ${menuItem.id}`);
                    return;
                }
                
                menuState.selectedMenuItem = menuItem;
                
                // Log audit event
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'MENU_ITEM_SELECTED',
                        details: {
                            menuItem: menuItem.id,
                            menuLabel: menuItem.label,
                            userRole: props.user.role,
                            username: props.user.username
                        },
                        level: 'INFO'
                    });
                }
                
                // Update store navigation state
                if (store) {
                    await store.dispatch('navigation/setCurrentRoute', {
                        name: menuItem.id,
                        params: { language: props.language }
                    });
                }
                
                // Emit events
                emit('menu-item-selected', menuItem);
                
                // Integration with existing MenuManager
                if (window.MenuManager && window.MenuManager.selectMenuOption) {
                    try {
                        await window.MenuManager.selectMenuOption(menuItem.id);
                    } catch (error) {
                        console.error(`UserMenu: MenuManager integration failed for ${menuItem.id}:`, error);
                    }
                } else {
                    // Fallback - emit navigation event
                    emit('navigate', 'template-view', props.language, menuItem.id);
                }
                
            } catch (error) {
                console.error('UserMenu: Menu selection failed:', error);
                
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'MENU_SELECTION_ERROR',
                        details: {
                            menuItem: menuItem.id,
                            error: error.message,
                            username: props.user.username
                        },
                        level: 'ERROR'
                    });
                }
            }
        };
        
        const handleLogout = async (reason = 'USER_INITIATED') => {
            try {
                updateActivity();
                
                console.log('UserMenu: Logout initiated:', reason);
                
                // Log audit event
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'USER_LOGOUT',
                        details: {
                            reason,
                            username: props.user.username,
                            userRole: props.user.role,
                            sessionDuration: Date.now() - menuState.lastActivity
                        },
                        level: 'INFO'
                    });
                }
                
                // Clear session timer
                if (menuState.sessionTimer) {
                    clearInterval(menuState.sessionTimer);
                    menuState.sessionTimer = null;
                }
                
                // Update store
                if (store) {
                    await store.dispatch('auth/logout');
                }
                
                // Integration with existing auth system
                if (window.AuthManager && window.AuthManager.logout) {
                    window.AuthManager.logout();
                }
                
                // Emit events
                emit('logout', reason);
                emit('navigate', 'login-screen', props.language, 'default');
                
            } catch (error) {
                console.error('UserMenu: Logout failed:', error);
            }
        };
        
        const refreshMenu = async () => {
            try {
                updateActivity();
                
                // Prevent excessive refresh attempts
                if (menuState.refreshAttempts >= menuState.maxRefreshAttempts) {
                    console.warn('UserMenu: Maximum refresh attempts reached');
                    return;
                }
                
                menuState.refreshAttempts++;
                console.log('UserMenu: Menu refresh initiated');
                menuState.isLoading = true;
                
                // Log audit event
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'MENU_REFRESH',
                        details: {
                            attempts: menuState.refreshAttempts,
                            username: props.user.username,
                            userRole: props.user.role
                        },
                        level: 'INFO'
                    });
                }
                
                // Simulate refresh delay
                setTimeout(() => {
                    menuState.isLoading = false;
                }, props.config.performance?.refreshDelay || 500);
                
                // Reset attempts counter periodically
                setTimeout(() => {
                    menuState.refreshAttempts = Math.max(0, menuState.refreshAttempts - 5);
                }, 60000); // Reset 5 attempts every minute
                
            } catch (error) {
                console.error('UserMenu: Menu refresh failed:', error);
                menuState.isLoading = false;
            }
        };
        
        // Lifecycle hooks
        onMounted(async () => {
            try {
                console.log('UserMenu: Component mounted');
                console.log(`UserMenu: Menu loaded for role: ${props.user.role} (${currentMenu.value.length} items)`);
                
                // Initialize security service
                if (securityService) {
                    await securityService.logAuditEvent({
                        type: 'MENU_LOADED',
                        details: {
                            userRole: props.user.role,
                            username: props.user.username,
                            menuItemsCount: currentMenu.value.length,
                            language: props.language
                        },
                        level: 'INFO'
                    });
                }
                
                // Setup session monitoring
                menuState.sessionTimer = setInterval(checkSessionTimeout, 60000); // Check every minute
                
                // Finish loading
                setTimeout(() => {
                    menuState.isLoading = false;
                }, props.config.performance?.loadingDelay || 300);
                
            } catch (error) {
                console.error('UserMenu: Initialization failed:', error);
                menuState.isLoading = false;
            }
        });
        
        onUnmounted(() => {
            // Cleanup session timer
            if (menuState.sessionTimer) {
                clearInterval(menuState.sessionTimer);
                menuState.sessionTimer = null;
            }
            
            console.log('UserMenu: Component unmounted');
        });
        
        return {
            // State
            menuState,
            
            // Computed
            currentMenu,
            userRoleText,
            welcomeText,
            loadingText,
            logoutText,
            menuStatsText,
            roleClass,
            
            // Methods
            selectMenuItem,
            handleLogout,
            refreshMenu,
            updateActivity
        };
    },
    
    template: `
        <div class="user-menu vue-component" @click="updateActivity" @keydown="updateActivity">
            <div class="menu-container">
                
                <!-- Menu Header -->
                <div class="menu-header">
                    <div class="header-content">
                        <h1 class="welcome-text">{{ welcomeText }}</h1>
                        <div class="user-badge">
                            <span class="role-badge" :class="roleClass">
                                {{ userRoleText }}
                            </span>
                            <span class="vue-indicator">Vue</span>
                        </div>
                    </div>
                    
                    <div class="header-actions">
                        <button 
                            class="refresh-btn" 
                            @click="refreshMenu" 
                            :disabled="menuState.isLoading"
                            :title="menuState.isLoading ? loadingText : 'Odśwież menu'"
                        >
                            {{ menuState.isLoading ? '⏳' : '🔄' }}
                        </button>
                        <button 
                            class="logout-btn" 
                            @click="handleLogout('USER_INITIATED')"
                            :title="logoutText"
                        >
                            🚪 {{ logoutText }}
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="menuState.isLoading" class="menu-loading">
                    <div class="loading-spinner"></div>
                    <p>{{ loadingText }}</p>
                </div>

                <!-- Menu Grid -->
                <div v-else class="menu-layout">
                    <div class="menu-grid">
                        <div 
                            v-for="menuItem in currentMenu" 
                            :key="menuItem.id"
                            class="menu-item"
                            :class="{ 
                                active: menuState.selectedMenuItem?.id === menuItem.id,
                                'role-restricted': !menuItem.accessible
                            }"
                            @click="selectMenuItem(menuItem)"
                            @keydown.enter="selectMenuItem(menuItem)"
                            @keydown.space="selectMenuItem(menuItem)"
                            tabindex="0"
                            role="button"
                            :aria-label="menuItem.label + ': ' + menuItem.description"
                        >
                            <div class="menu-icon">{{ menuItem.icon }}</div>
                            <div class="menu-content">
                                <h3 class="menu-title">{{ menuItem.label }}</h3>
                                <p class="menu-description">{{ menuItem.description }}</p>
                            </div>
                            <div class="menu-arrow">→</div>
                        </div>
                    </div>
                    
                    <!-- Menu Stats -->
                    <div class="menu-stats">
                        <p>{{ menuStatsText }}</p>
                    </div>
                </div>
            </div>
        </div>
    `
};

export default UserMenu;
