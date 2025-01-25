describe('Auth', () => {
  it('Find the Sign in text', () => {
    // No need to specify the full URL here, just the path
    cy.visit('/')

    cy.contains('Sign in')
  })

  it('Login with demo', () => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
    cy.contains('Parties')
  })

  it('Logo redirects to home page', () => {
    // large screen
    cy.viewport(1920, 1080)
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
    cy.contains('Parties')
    cy.visit('/parties/new')
    cy.contains('Create')
    cy.get('[data-cy="logo"]').parent().first().click({ force: true })
    cy.contains('Parties')
  })

  it('Logout', () => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
    cy.contains('Parties')

    cy.get('.MuiButtonBase-root > .MuiAvatar-root > .MuiAvatar-img').click()
    cy.contains('Logout').click()

    cy.contains('Sign in')
  })
})
