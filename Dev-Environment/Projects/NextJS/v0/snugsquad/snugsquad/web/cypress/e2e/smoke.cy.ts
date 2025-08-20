describe('Smoke', () => {
  it('loads home page', () => {
    cy.visit('/');
    cy.contains('SnugSquad').should('exist');
  });
});



