describe('Profile Page', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
  })

  it('user should be able to see his own profile', () => {
    cy.viewport(1280, 720)
    cy.get('[data-cy="account-avatar"]').click()
    cy.contains('Profile').click()
    cy.contains('Profile')
    cy.contains('Parties')
    cy.contains('About')
  })

  it('user should be able to see another users profile', () => {
    cy.viewport(1280, 720)
    cy.get('[data-cy="account-avatar"]').click()
    cy.visit(`/users/646afa4da97b083c85265d4e`)
    cy.contains('Profile')
    cy.contains('Parties')
    cy.contains('About')
  })

  it('user should not be able to see private info when profile is not public', () => {
    cy.viewport(1280, 720)
    cy.get('[data-cy="account-avatar"]').click()
    cy.contains('Settings').click()
    cy.get('.PrivateSwitchBase-input').should('not.be.checked')
    cy.visit(`/users/6463a85ae23ac02c4ad26b31`)
    cy.contains('Profile')
    cy.contains('1111').should('not.exist')
  })
})
