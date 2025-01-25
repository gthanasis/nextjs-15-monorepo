describe('Explore', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
  })

  it('User should be able to see parties published', () => {
    cy.contains('Marks Party'.toUpperCase())
    cy.contains('Test party for main user'.toUpperCase())
  })

  it('User should be able to filters parties', () => {
    cy.contains('Marks Party'.toUpperCase())
    cy.contains('Test party for main user'.toUpperCase())
    cy.contains('Filters').click()
    cy.get('[data-cy="party-music-filter"]').type('pop')
    cy.get('[data-cy="close-party-filters"]').click()
    cy.contains('Test party for main user'.toUpperCase()).should('not.exist')
    cy.contains('Test party for main user (past)'.toUpperCase()).should('not.exist')
  })

  it('User should see message if there are no parties', () => {
    cy.contains('Filters').click()
    cy.get('[data-cy="party-music-filter"]').type('test-music')
    cy.get('[data-cy="close-party-filters"]').click()
    cy.contains('No parties were found in this area with the selected filters')
    cy.get('[data-cy="add-party-button"]').click()
    cy.url().should('include', '/parties/new')
  })

  it('User should be able to filter parties, go to Manage and then be able to clear filters', () => {
    cy.viewport(1280, 720)
    cy.contains('Filters').click()
    cy.get('[data-cy="party-music-filter"]').type('test-music')
    cy.get('[data-cy="close-party-filters"]').click()
    cy.contains('No parties were found in this area with the selected filters')
    cy.contains('Manage').click()
    cy.contains('Test party for main user', {timeout: 10000 })
    cy.contains('Explore').click()
    cy.contains('Filters').click()
    cy.get('[data-cy="clear-party-filters"]').click()
    cy.get('[data-cy="party-music-filter"]').should('not.contain', 'test-music');
  })
})
