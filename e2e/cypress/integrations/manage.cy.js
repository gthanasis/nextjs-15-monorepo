describe('Manage page', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
  })

  it('User should be able to see list of his own parties', () => {
    cy.visit('/parties/list')
    cy.contains('Test party for main user')
    cy.contains('Test party for main user (past)')
    cy.contains('Marks party').should('not.exist')
  })

  it('User should be able to edit a party', () => {
    cy.visit('/parties/list')
    cy.get('[data-cy="party-table-row"]').contains('Test party for main user').click()
    cy.contains('Info')
  })
})
