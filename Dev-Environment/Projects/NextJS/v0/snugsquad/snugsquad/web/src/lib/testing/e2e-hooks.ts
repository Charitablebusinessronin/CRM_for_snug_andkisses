/**
 * E2E Testing Harness
 * 
 * This module provides hooks, test IDs, and utilities for end-to-end testing
 * of key user journeys. Test cases are owned by QA (James), but we implement
 * the hooks and IDs needed for testing.
 */

export const TEST_IDS = {
  // Authentication
  AUTH: {
    SIGNIN_FORM: "auth-signin-form",
    EMAIL_INPUT: "auth-email-input",
    PASSWORD_INPUT: "auth-password-input",
    SIGNIN_BUTTON: "auth-signin-button",
    MFA_FORM: "auth-mfa-form",
    MFA_CODE_INPUT: "auth-mfa-code-input",
    MFA_VERIFY_BUTTON: "auth-mfa-verify-button",
    SIGNOUT_BUTTON: "auth-signout-button",
    ERROR_MESSAGE: "auth-error-message",
    LOADING_SPINNER: "auth-loading-spinner"
  },

  // Navigation
  NAV: {
    MAIN_NAV: "main-navigation",
    DASHBOARD_LINK: "nav-dashboard-link",
    CARE_PLAN_LINK: "nav-care-plan-link",
    SERVICE_REQUESTS_LINK: "nav-service-requests-link",
    PROFILE_LINK: "nav-profile-link",
    USER_MENU: "nav-user-menu",
    USER_ROLE_DISPLAY: "nav-user-role"
  },

  // Dashboard
  DASHBOARD: {
    WELCOME_MESSAGE: "dashboard-welcome",
    QUICK_ACTIONS: "dashboard-quick-actions",
    RECENT_ACTIVITY: "dashboard-recent-activity",
    STATS_CARDS: "dashboard-stats-cards"
  },

  // Care Plan
  CARE_PLAN: {
    TITLE: "care-plan-title",
    PROGRESS_BAR: "care-plan-progress",
    MILESTONES_LIST: "care-plan-milestones",
    MILESTONE_ITEM: "care-plan-milestone",
    MILESTONE_STATUS: "care-plan-milestone-status",
    QUICK_ACTIONS: "care-plan-quick-actions"
  },

  // Service Requests
  SERVICE_REQUESTS: {
    CREATE_FORM: "service-request-create-form",
    DESCRIPTION_INPUT: "service-request-description",
    DATE_INPUT: "service-request-date",
    SUBMIT_BUTTON: "service-request-submit",
    REQUESTS_LIST: "service-requests-list",
    REQUEST_ITEM: "service-request-item",
    REQUEST_STATUS: "service-request-status"
  },

  // Profile
  PROFILE: {
    EDIT_FORM: "profile-edit-form",
    NAME_INPUT: "profile-name-input",
    EMAIL_INPUT: "profile-email-input",
    PHONE_INPUT: "profile-phone-input",
    SAVE_BUTTON: "profile-save-button",
    PREFERENCES_SECTION: "profile-preferences"
  },

  // Common UI Elements
  COMMON: {
    LOADING: "loading-spinner",
    ERROR_BANNER: "error-banner",
    SUCCESS_MESSAGE: "success-message",
    MODAL: "modal-overlay",
    MODAL_CLOSE: "modal-close-button",
    CONFIRM_DIALOG: "confirm-dialog",
    CONFIRM_YES: "confirm-yes-button",
    CONFIRM_NO: "confirm-no-button"
  }
} as const;

/**
 * Test data factories for consistent test scenarios
 */
export const TEST_DATA = {
  USERS: {
    CLIENT: {
      email: "test-client@example.com",
      password: "TestPassword123!",
      role: "client" as const
    },
    ADMIN: {
      email: "test-admin@example.com", 
      password: "AdminPass456!",
      role: "admin" as const
    },
    EMPLOYEE: {
      email: "test-employee@example.com",
      password: "EmployeePass789!",
      role: "employee" as const
    }
  },

  CARE_PLANS: {
    ACTIVE: {
      title: "Post-Surgery Recovery",
      status: "active" as const,
      progress: 65
    },
    COMPLETED: {
      title: "Physical Therapy Program",
      status: "completed" as const,
      progress: 100
    }
  },

  SERVICE_REQUESTS: {
    NEW: {
      description: "Need assistance with medication management",
      requestedDate: new Date().toISOString().split('T')[0]
    }
  }
};

/**
 * Test utilities for common testing patterns
 */
export class E2ETestUtils {
  /**
   * Wait for element to be visible and interactable
   */
  static async waitForElement(selector: string, timeout = 5000): Promise<Element> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element && this.isElementVisible(element)) {
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element ${selector} not found or visible within ${timeout}ms`);
  }

  /**
   * Check if element is visible and interactable
   */
  static isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const htmlElement = element as HTMLElement;
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           htmlElement.offsetWidth > 0 &&
           htmlElement.offsetHeight > 0;
  }

  /**
   * Wait for network requests to complete
   */
  static async waitForNetworkIdle(timeout = 5000): Promise<void> {
    // This would integrate with Playwright's network idle detection
    // For now, just wait a reasonable amount of time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Generate unique test data
   */
  static generateUniqueEmail(prefix = "test"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  /**
   * Clean up test data after tests
   */
  static async cleanupTestData(): Promise<void> {
    // Clear localStorage and sessionStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Clear cookies (client-side only)
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }
}

/**
 * Test hooks for React components
 */
export const useE2ETestHooks = () => {
  const addTestId = (element: HTMLElement, testId: string) => {
    element.setAttribute('data-testid', testId);
  };

  const getTestId = (testId: string) => {
    return `[data-testid="${testId}"]`;
  };

  return {
    addTestId,
    getTestId,
    TEST_IDS,
    TEST_DATA
  };
};

/**
 * Accessibility testing utilities
 */
export const A11Y_UTILS = {
  /**
   * Check if element has proper ARIA labels
   */
  hasAriaLabel: (element: Element): boolean => {
    return element.hasAttribute('aria-label') || 
           element.hasAttribute('aria-labelledby') ||
           element.getAttribute('role') === 'button' ||
           element.tagName === 'BUTTON';
  },

  /**
   * Check if form inputs have proper labels
   */
  hasFormLabel: (input: Element): boolean => {
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
      const id = input.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        return !!label;
      }
    }
    return false;
  },

  /**
   * Check if element is keyboard navigable
   */
  isKeyboardNavigable: (element: Element): boolean => {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return tag === 'button' || 
           tag === 'a' || 
           tag === 'input' || 
           tag === 'select' ||
           tag === 'textarea' ||
           role === 'button' ||
           role === 'link' ||
           role === 'menuitem';
  }
};

export default {
  TEST_IDS,
  TEST_DATA,
  E2ETestUtils,
  useE2ETestHooks,
  A11Y_UTILS
};
