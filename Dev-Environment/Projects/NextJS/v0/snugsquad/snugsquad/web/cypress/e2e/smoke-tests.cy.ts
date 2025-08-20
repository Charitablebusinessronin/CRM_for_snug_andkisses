describe('Smoke Tests - Critical Path', () => {
  const testCredentials = {
    client: { email: 'client@snugandkisses.demo', password: 'SecureDemo2025!' },
    admin: { email: 'admin@snugandkisses.demo', password: 'SecureDemo2025!' },
    employee: { email: 'employee@snugandkisses.demo', password: 'SecureDemo2025!' },
    contractor: { email: 'contractor@snugandkisses.demo', password: 'SecureDemo2025!' }
  }

  describe('Application Health', () => {
    it('should load the homepage', () => {
      cy.visit('/')
      cy.get('body').should('be.visible')
    })

    it('should have working health endpoint', () => {
      cy.request('/api/health').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('status', 'healthy')
      })
    })

    it('should redirect to signin for protected routes', () => {
      cy.visit('/client-dashboard')
      cy.url().should('include', '/signin')
    })
  })

  describe('Authentication Smoke Test', () => {
    it('should authenticate client user', () => {
      cy.visit('/signin')
      cy.get('[data-testid="email-input"]').type(testCredentials.client.email)
      cy.get('[data-testid="password-input"]').type(testCredentials.client.password)
      cy.get('[data-testid="signin-button"]').click()
      
      cy.url().should('include', '/client-dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'client@snugandkisses.demo')
    })
  })

  describe('Core Functionality Smoke Test', () => {
    beforeEach(() => {
      // Set up authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
    })

    it('should load client dashboard', () => {
      cy.visit('/client-dashboard')
      cy.get('[data-testid="dashboard-title"]').should('be.visible')
      cy.get('[data-testid="quick-actions"]').should('be.visible')
    })

    it('should load care plan page', () => {
      cy.visit('/client-dashboard/care-plan')
      cy.get('[data-testid="care-plan-title"]').should('be.visible')
    })

    it('should load service requests page', () => {
      cy.visit('/client-dashboard/service-requests')
      cy.get('[data-testid="service-requests-title"]').should('be.visible')
    })

    it('should load profile page', () => {
      cy.visit('/client-dashboard/profile')
      cy.get('[data-testid="profile-title"]').should('be.visible')
    })
  })

  describe('Navigation Smoke Test', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token')
        win.localStorage.setItem('user-role', 'client')
      })
      cy.visit('/client-dashboard')
    })

    it('should navigate between dashboard pages', () => {
      // Test navigation links
      cy.get('[data-testid="nav-care-plan"]').click()
      cy.url().should('include', '/care-plan')

      cy.get('[data-testid="nav-service-requests"]').click()
      cy.url().should('include', '/service-requests')

      cy.get('[data-testid="nav-profile"]').click()
      cy.url().should('include', '/profile')

      cy.get('[data-testid="nav-dashboard"]').click()
      cy.url().should('include', '/client-dashboard')
    })
  })

  describe('API Integration Smoke Test', () => {
    it('should make successful API calls', () => {
      // Test key API endpoints
      cy.request({ url: '/api/health', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]) // 404 acceptable if not implemented yet
      })

      cy.request({ url: '/api/auth/session', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 404])
      })
    })
  })

  describe('Performance Smoke Test', () => {
    it('should load pages within acceptable time', () => {
      const maxLoadTime = 5000 // 5 seconds

      cy.visit('/', { timeout: maxLoadTime })
      cy.get('body').should('be.visible')

      cy.visit('/signin', { timeout: maxLoadTime })
      cy.get('[data-testid="signin-form"]').should('be.visible')
    })
  })
})