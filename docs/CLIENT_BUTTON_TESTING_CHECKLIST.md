# Client Portal Button Testing Checklist

## 🎯 Pre-Testing Setup
- [ ] Containers are running (frontend on 5369, backend on 4728)
- [ ] Can access client dashboard at `http://localhost:5369/client/dashboard`
- [ ] Logged in with client demo account: `client@snugandkisses.demo` / `SecureDemo2025!`
- [ ] Browser developer tools open to monitor network requests

## 🚨 Urgent Actions Section

### Request Urgent Care Button
- [ ] **Click Test**: Button shows loading state
- [ ] **API Call**: Network tab shows POST to `/api/client/urgent-care`
- [ ] **Response**: Returns 200 with provider contact info
- [ ] **Toast**: Shows "Urgent Care Requested" message
- [ ] **Visual**: Button styling matches urgent category (red/purple theme)
- [ ] **Cooldown**: Button disabled for 2 seconds after click

### Contact Care Provider Button  
- [ ] **Click Test**: Button shows loading state
- [ ] **API Call**: Network tab shows POST to `/api/client/contact-provider`
- [ ] **Response**: Returns 200 with estimated response time
- [ ] **Toast**: Shows "Provider Contacted" message
- [ ] **Disabled State**: Grayed out if `hasActiveServices: false`
- [ ] **Badge**: Shows "5-10 min" estimated time

## ⚡ Primary Actions Section

### Schedule Appointment Button
- [ ] **Click Test**: Button shows loading state
- [ ] **Unified Action**: First tries `/api/v1/quick-actions` (may fail - that's OK)
- [ ] **Fallback API**: Falls back to `/api/client/schedule-appointment`
- [ ] **Response**: Returns 200 with suggested times
- [ ] **Toast**: Shows "Appointment Request Sent" message
- [ ] **External Link**: Should attempt to open booking URL (may fail in test)
- [ ] **Badge**: Shows upcoming appointment count if > 0

### Message Care Team Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/messages?compose=true`
- [ ] **Page Load**: Messages page loads successfully
- [ ] **Badge**: Shows unread message count if > 0
- [ ] **No API Call**: This is navigation-only, no API endpoint called

### Start Video Call Button
- [ ] **Click Test**: Button shows loading state
- [ ] **Unified Action**: First tries `/api/v1/quick-actions` (may fail - that's OK)
- [ ] **Fallback API**: Falls back to `/api/client/video-consultation`
- [ ] **Response**: Returns 200 with room URL
- [ ] **Toast**: Shows "Video Consultation Started" message
- [ ] **External Link**: Should attempt to open video room (may fail in test)
- [ ] **Disabled State**: Grayed out if no active services or disconnected

### View Care Progress Button
- [ ] **Click Test**: Button responds immediately  
- [ ] **Navigation**: Redirects to `/client/progress`
- [ ] **Page Load**: Progress page loads successfully
- [ ] **Badge**: Shows current phase (e.g., "Phase 4/18")
- [ ] **No API Call**: This is navigation-only

## 🔧 Secondary Actions Section

### Request Care Changes Button
- [ ] **Click Test**: Button shows loading state
- [ ] **API Call**: Network tab shows POST to `/api/client/care-adjustment`
- [ ] **Response**: Returns 200 with coordinator info
- [ ] **Toast**: Shows "Care Adjustment Requested" message
- [ ] **Disabled State**: Grayed out if `workflowPhase < 9`
- [ ] **Workflow Check**: Only enabled after contract signing phase

### Billing & Payments Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/billing`
- [ ] **Page Load**: Billing page loads successfully
- [ ] **No API Call**: This is navigation-only

### Submit Feedback Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/feedback`
- [ ] **Page Load**: Feedback page loads successfully
- [ ] **No API Call**: This is navigation-only

### Update Preferences Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/preferences`
- [ ] **Page Load**: Preferences page loads successfully
- [ ] **No API Call**: This is navigation-only

## 📚 Informational Actions Section

### Educational Resources Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/resources`
- [ ] **Page Load**: Resources page loads successfully
- [ ] **No API Call**: This is navigation-only

### Help & Support Button
- [ ] **Click Test**: Button responds immediately
- [ ] **Navigation**: Redirects to `/client/support`
- [ ] **Page Load**: Support page loads successfully
- [ ] **No API Call**: This is navigation-only

## 🔐 Authentication & Error Testing

### Unauthenticated Access
- [ ] **Logout**: Sign out of client account
- [ ] **Direct API**: Try calling `/api/client/urgent-care` directly
- [ ] **Expected Result**: Returns 401 Unauthorized
- [ ] **Dashboard Access**: Visiting `/client/dashboard` redirects to login

### Wrong Role Access  
- [ ] **Login as Admin**: Use admin demo account
- [ ] **API Test**: Try calling `/api/client/urgent-care`
- [ ] **Expected Result**: Returns 401 Unauthorized
- [ ] **Role Check**: Verify session.user.role !== 'client' blocks access

## 🎨 Visual & UX Testing

### Loading States
- [ ] **Spinner**: Loading buttons show spinner icon
- [ ] **Disabled**: Buttons disabled during loading
- [ ] **Timeout**: Loading state clears after response (success or error)

### Toast Notifications
- [ ] **Success Toasts**: Appear for successful API calls
- [ ] **Error Toasts**: Appear for failed API calls  
- [ ] **Auto-dismiss**: Toasts disappear after a few seconds
- [ ] **Multiple Toasts**: Handle multiple quick clicks properly

### Button States
- [ ] **Default**: Normal buttons have proper colors and styling
- [ ] **Hover**: Hover effects work on all buttons
- [ ] **Disabled**: Disabled buttons are visually distinct
- [ ] **Badge Display**: Badges show correct counts/info

## 🚀 Performance Testing

### Rapid Clicking
- [ ] **Cooldown**: Buttons respect 2-second cooldown period
- [ ] **Double-click Protection**: No duplicate API calls from double-clicking
- [ ] **Loading State**: Proper loading state during API calls

### Network Conditions
- [ ] **Slow Connection**: Test with network throttling
- [ ] **Offline**: Graceful handling when offline
- [ ] **API Timeout**: Proper error handling for slow APIs

## 📊 Automated Test Execution

### Run Test Suite
```bash
cd C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\CRM_for_snug_andkisses
node scripts/test-client-buttons.js
```

- [ ] **All Tests Pass**: Automated test suite completes successfully
- [ ] **API Coverage**: All client API endpoints tested
- [ ] **Navigation Coverage**: All navigation routes tested
- [ ] **Status Codes**: Proper HTTP status codes returned

## ✅ Sign-off Checklist

- [ ] **All Buttons Functional**: Every button performs expected action
- [ ] **API Responses**: All API endpoints return proper responses
- [ ] **Error Handling**: Graceful error handling for all failure cases
- [ ] **Authentication**: Proper role-based access control
- [ ] **Navigation**: All navigation routes work correctly
- [ ] **Visual Polish**: Loading states, toasts, and styling correct
- [ ] **Performance**: No memory leaks or performance issues
- [ ] **Automated Tests**: Test suite passes completely

## 🐛 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| **API 503 Error** | "Catalyst function URL not configured" | Expected for unified actions, fallback should work |
| **401 Unauthorized** | Button calls fail | Check authentication state and user role |
| **Button Stays Loading** | Spinner never stops | Check for JavaScript errors in console |
| **Toast Not Showing** | No feedback after click | Verify toast hook is imported and working |
| **Navigation 404** | Page not found after redirect | Check if client pages exist in app/client/ |
| **Docker Not Reflecting Changes** | Old code still running | Restart containers or rebuild with --no-cache |

---

**Testing completed by**: ________________  
**Date**: ________________  
**Environment**: ________________  
**Notes**: ________________