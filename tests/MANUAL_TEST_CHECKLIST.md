# 🧪 MaskService C20 - Manual Test Checklist

## 📋 Pre-Test Setup
- [ ] Application is running on http://localhost:8080
- [ ] Browser console is open (F12)
- [ ] Network tab is visible to monitor requests
- [ ] Test environment is stable

---

## 🔄 **ROLE SWITCHING TESTS**

### Test 1: Role Switcher Functionality
- [ ] Role switcher is visible in main menu
- [ ] Dropdown contains all 4 roles (OPERATOR, ADMIN, SERWISANT, SUPERUSER)
- [ ] Current role is displayed in badge
- [ ] Role can be changed via dropdown

### Test 2: OPERATOR Role
- [ ] Switch to OPERATOR role
- [ ] Menu shows: Monitoring, Alerts
- [ ] User badge shows "OPERATOR"
- [ ] Click Monitoring → loads monitoring dashboard
- [ ] Click Alerts → loads alerts system
- [ ] No access to admin/serwisant/superuser features

### Test 3: ADMIN Role  
- [ ] Switch to ADMIN role
- [ ] Menu shows: Monitoring, Alerts, Tests, Reports, Users, System
- [ ] User badge shows "ADMIN"
- [ ] All OPERATOR features + admin features accessible
- [ ] Can access user management
- [ ] Can access system settings

### Test 4: SERWISANT Role
- [ ] Switch to SERWISANT role  
- [ ] Menu shows: Diagnostyka, Kalibracja, Konserwacja
- [ ] User badge shows "SERWISANT"
- [ ] Click Diagnostyka → loads diagnostics component
- [ ] Click Kalibracja → loads calibration component  
- [ ] Click Konserwacja → loads maintenance component
- [ ] Service-specific features are accessible

### Test 5: SUPERUSER Role
- [ ] Switch to SUPERUSER role
- [ ] Menu shows all available components
- [ ] User badge shows "SUPERUSER"
- [ ] Analytics component is accessible
- [ ] Integration features available
- [ ] Audit logs accessible
- [ ] All system features available

---

## 🧩 **COMPONENT TESTING**

### Test 6: Pressure Panel
- [ ] Pressure panel is visible on right side
- [ ] Shows "PANEL CIŚNIEŃ" header
- [ ] Does NOT show "Ładowanie PressurePanel..." 
- [ ] Displays actual pressure data or working interface
- [ ] No console errors related to pressure panel
- [ ] Panel updates/refreshes appropriately

### Test 7: Monitoring Component (OPERATOR/ADMIN)
- [ ] Switch to OPERATOR role
- [ ] Click Monitoring menu item
- [ ] Component loads in content area
- [ ] Shows monitoring dashboard with widgets
- [ ] Real-time data displays
- [ ] Refresh functionality works
- [ ] Professional UI with gradients/styling

### Test 8: Alerts Component (OPERATOR/ADMIN)
- [ ] Click Alerts menu item  
- [ ] Component loads with alert management interface
- [ ] Shows alert statistics
- [ ] Alert list displays properly
- [ ] Alert filtering works
- [ ] Auto-refresh functionality (3s interval)

### Test 9: Diagnostics Component (SERWISANT)
- [ ] Switch to SERWISANT role
- [ ] Click Diagnostyka menu item
- [ ] Component loads with diagnostic tools
- [ ] Multiple tabs available (System Info, Hardware, Network, etc.)
- [ ] Tab switching works smoothly
- [ ] Diagnostic data displays correctly
- [ ] Professional styling applied

### Test 10: Calibration Component (SERWISANT)
- [ ] Click Kalibracja menu item
- [ ] Component loads with calibration interface
- [ ] Sensor grid displays
- [ ] Sensor cards show status (Good/Warning/Critical)
- [ ] Calibration buttons are functional
- [ ] Professional card-based layout

### Test 11: Maintenance Component (SERWISANT)
- [ ] Click Konserwacja menu item
- [ ] Component loads with maintenance dashboard
- [ ] Shows maintenance statistics (Active, Pending, Completed)
- [ ] Calendar view displays
- [ ] Task management interface works
- [ ] Equipment status shows
- [ ] Reports section accessible

### Test 12: Analytics Component (SUPERUSER)
- [ ] Switch to SUPERUSER role
- [ ] Click Analytics menu item (if available)
- [ ] Component loads with analytics dashboard  
- [ ] Metrics overview displays
- [ ] Chart sections visible
- [ ] Performance predictions shown
- [ ] Auto-refresh (60s interval)

---

## 🧭 **NAVIGATION TESTS**

### Test 13: Menu Navigation
- [ ] Clicking menu items changes content area
- [ ] Active menu item is highlighted
- [ ] Navigation is smooth without flicker
- [ ] Back/forward browser buttons work
- [ ] URL updates correctly with route changes

### Test 14: Direct URL Access
- [ ] Navigate directly to `/monitoring` → loads monitoring
- [ ] Navigate directly to `/alerts` → loads alerts
- [ ] Navigate directly to `/diagnostics` → loads diagnostics (SERWISANT)
- [ ] Navigate directly to `/calibration` → loads calibration (SERWISANT)
- [ ] Navigate directly to `/maintenance` → loads maintenance (SERWISANT)
- [ ] Navigate directly to `/analytics` → loads analytics (SUPERUSER)
- [ ] Invalid URLs show appropriate error/placeholder

### Test 15: Role-based Access Control
- [ ] OPERATOR cannot access SERWISANT routes directly
- [ ] SERWISANT cannot access SUPERUSER routes directly
- [ ] Appropriate error messages for unauthorized access
- [ ] Role switching unlocks/locks appropriate routes

---

## 🎨 **UI/UX TESTS**

### Test 16: Visual Design
- [ ] Professional styling throughout application
- [ ] Consistent color scheme (blues, greens, etc.)
- [ ] Gradients and shadows applied appropriately
- [ ] Typography is readable and consistent
- [ ] Icons are appropriate and visible
- [ ] Responsive layout works on different screen sizes

### Test 17: User Experience
- [ ] Role changes show notification/feedback
- [ ] Loading states are informative
- [ ] Smooth transitions between components
- [ ] No jarring layout shifts
- [ ] Error messages are helpful
- [ ] Success feedback is clear

### Test 18: Header & Footer
- [ ] Header shows logo and title correctly
- [ ] Header shows current user name and role
- [ ] Logout button is functional
- [ ] Footer shows version and status
- [ ] Footer shows online indicator

---

## ⚡ **PERFORMANCE TESTS**

### Test 19: Loading Performance
- [ ] Initial app load < 5 seconds
- [ ] Role switching < 2 seconds
- [ ] Component loading < 3 seconds
- [ ] No significant memory leaks
- [ ] Smooth animations and transitions

### Test 20: Error Handling
- [ ] Network errors handled gracefully
- [ ] Component errors don't crash entire app
- [ ] Console shows minimal critical errors
- [ ] Fallback content displays appropriately
- [ ] Recovery from errors is possible

---

## 🔧 **TECHNICAL TESTS**

### Test 21: Console Errors
- [ ] No critical JavaScript errors
- [ ] No Vue compilation errors
- [ ] HTTP 404s are minimal and non-critical
- [ ] No memory leak warnings
- [ ] Performance warnings are minimal

### Test 22: Network Requests
- [ ] Component loading requests succeed
- [ ] Config file requests work
- [ ] No unnecessary duplicate requests
- [ ] Failed requests have proper fallbacks
- [ ] Request timeouts are reasonable

### Test 23: Browser Compatibility
- [ ] Works in Chrome/Chromium
- [ ] Works in Firefox  
- [ ] Works in Safari (if available)
- [ ] Works in Edge
- [ ] Mobile browsers render correctly

---

## 📊 **TEST RESULTS SUMMARY**

### Overall Status
- [ ] All critical functionality works
- [ ] All roles can access their components
- [ ] No blocking issues identified
- [ ] Performance is acceptable
- [ ] UI/UX meets quality standards

### Issues Found
| Issue | Severity | Component | Status |
|-------|----------|-----------|--------|
|       |          |           |        |
|       |          |           |        |
|       |          |           |        |

### Test Environment
- **Date**: ________________
- **Tester**: _______________
- **Browser**: ______________
- **Screen Resolution**: ____
- **Test Duration**: ________

### Final Recommendation
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ CONDITIONAL PASS - Minor issues need fixing
- [ ] ❌ FAIL - Critical issues must be resolved

---

## 📝 **NOTES**
_Use this space for additional observations, edge cases, or recommendations:_

```
[Add your testing notes here]
```
