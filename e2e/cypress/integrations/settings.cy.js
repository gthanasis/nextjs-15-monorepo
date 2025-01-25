describe('Settings Page', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)

    cy.viewport(1280, 720)
    cy.get('[data-cy="account-popover"]').first().click()
    cy.contains('Settings').click()
  })

  it('User should be able to edit his settings', () => {
    cy.url().should('include', '/settings')
    cy.get('[data-cy="user-display-name-input"]').find('input').focus().clear().type('John')
    cy.get('[data-cy="user-phone-number-input"]').find('input').focus().clear().type('123456789')
    cy.get('[data-cy="user-save-changes-button"]').click()
    cy.get('[data-cy="user-display-name-input"]').find('input').should('have.value', 'John')
    cy.get('[data-cy="user-phone-number-input"]').find('input').should('have.value', '123456789')
  })
  it('User should be able to delete his profile', () => {
    cy.viewport(1800, 1400)
    cy.url().should('include', '/settings')
    cy.get('[data-cy="delete-user-profile-dialog"]').scrollIntoView()
    cy.get('[data-cy="delete-user-profile-dialog"]').click()
    cy.get('[data-cy="delete-user-close-dialog"]').should('be.visible')
    // delete-user-email-input
    cy.get('[data-cy="delete-user-email-input"]').find('input').focus().type('john@email.com');
    cy.get('[data-cy="delete-user-dialog-confirm-button"]').should('not.be.disabled')
  });
})
