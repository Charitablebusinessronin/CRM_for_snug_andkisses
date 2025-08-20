describe('Client Portal E2E Tests', () => {
  describe('Navigation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
      cy.visit('/client-dashboard')
    })

    it('navigates from dashboard to Care Plan via sidebar and shows Care Plan title', () => {
      cy.get('[data-testid="nav-care-plan"]').click()
      cy.url().should('include', '/client-dashboard/care-plan')
      cy.get('[data-testid="care-plan-title"]').should('contain', 'Care Plan')
    })

    it('navigates from dashboard to Service Requests and displays header', () => {
      cy.get('[data-testid="nav-service-requests"]').click()
      cy.url().should('include', '/client-dashboard/service-requests')
      cy.get('[data-testid="service-requests-title"]').should('contain', 'Service Requests')
    })

    it('navigates from dashboard to Profile and displays profile title', () => {
      cy.get('[data-testid="nav-profile"]').click()
      cy.url().should('include', '/client-dashboard/profile')
      cy.get('[data-testid="profile-title"]').should('contain', 'Profile')
    })
  })

  describe('Care Plan Page', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
      cy.visit('/client-dashboard/care-plan')
    })

    it('displays care plan overview, current caregiver, and upcoming appointments', () => {
      cy.get('[data-testid="care-plan-overview"]').should('be.visible')
      cy.get('[data-testid="current-caregiver"]').should('be.visible')
      cy.get('[data-testid="upcoming-appointments"]').should('be.visible')
    })

    it('edits care preferences and shows success confirmation', () => {
      cy.get('[data-testid="edit-preferences-button"]').click()
      cy.get('[data-testid="preferences-modal"]').should('be.visible')
      cy.get('[data-testid="save-preferences-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })

  describe('Service Requests Page', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
      cy.visit('/client-dashboard/service-requests')
    })

    it('renders service request form with type and urgency selects', () => {
      cy.get('[data-testid="service-request-form"]').should('be.visible')
      cy.get('[data-testid="service-type-select"]').should('be.visible')
      cy.get('[data-testid="urgency-select"]').should('be.visible')
    })

    it('submits a new Postpartum Care request and confirms success message', () => {
      cy.get('[data-testid="service-type-select"]').select('Postpartum Care')
      cy.get('[data-testid="urgency-select"]').select('Normal')
      cy.get('[data-testid="description-textarea"]').type('Need assistance with newborn care')
      cy.get('[data-testid="submit-request-button"]').click()
      
      cy.get('[data-testid="success-message"]').should('contain', 'Service request submitted')
    })

    it('lists existing service requests in request history', () => {
      cy.get('[data-testid="request-history"]').should('be.visible')
      cy.get('[data-testid="request-item"]').should('have.length.greaterThan', 0)
    })
  })

  describe('Profile Page', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
      cy.visit('/client-dashboard/profile')
    })

    it('renders profile form with personal and contact sections', () => {
      cy.get('[data-testid="profile-form"]').should('be.visible')
      cy.get('[data-testid="personal-info-section"]').should('be.visible')
      cy.get('[data-testid="contact-info-section"]').should('be.visible')
    })

    it('updates first name and shows success message', () => {
      cy.get('[data-testid="first-name-input"]').clear().type('Updated Name')
      cy.get('[data-testid="save-profile-button"]').click()
      cy.get('[data-testid="success-message"]').should('contain', 'Profile updated')
    })

    it('validates required first name field and displays error', () => {
      cy.get('[data-testid="first-name-input"]').clear()
      cy.get('[data-testid="save-profile-button"]').click()
      cy.get('[data-testid="validation-error"]').should('contain', 'First name is required')
    })
  })

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
    })

    it('mobile viewport (375x667) shows hamburger menu and opens mobile nav', () => {
      cy.viewport(375, 667) // iPhone 6/7/8
      cy.visit('/client-dashboard')
      
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
      cy.get('[data-testid="mobile-menu-button"]').click()
      cy.get('[data-testid="mobile-nav"]').should('be.visible')
    })

    it('tablet viewport (768x1024) displays dashboard title and sidebar nav', () => {
      cy.viewport(768, 1024) // iPad
      cy.visit('/client-dashboard')
      
      cy.get('[data-testid="dashboard-title"]').should('be.visible')
      cy.get('[data-testid="sidebar-nav"]').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
    })

    it('when /api/care-plans returns 500 the UI surfaces a care plan load error', () => {
      // Mock API failure
      cy.intercept('GET', '/api/care-plans', { statusCode: 500 }).as('getCarePlansError')
      
      cy.visit('/client-dashboard/care-plan')
      cy.wait('@getCarePlansError')
      
      cy.get('[data-testid="error-message"]').should('contain', 'Unable to load care plan')
    })

    it('when health check network fails the dashboard shows a retry button', () => {
      cy.intercept('GET', '/api/health', { forceNetworkError: true }).as('networkError')
      
      cy.visit('/client-dashboard')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })
  })
})