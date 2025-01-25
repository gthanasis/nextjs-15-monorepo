describe('Menu', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
  })

  it('Menu items should work', () => {
    cy.viewport(1280, 720)
    cy.contains('Explore').click()
    cy.url().should('include', '/parties/find')
    cy.contains('Add Party').click()
    cy.url().should('include', '/parties/new')
    cy.contains('Manage').click()
    cy.url().should('include', '/parties/list')
    cy.get('.MuiAvatar-img').click()
    cy.contains('Profile').click()
    cy.url().should('include', '/users')
    cy.get('.MuiAvatar-img').click()
    cy.contains('Settings').click()
    cy.url().should('include', '/settings')
  })
})
