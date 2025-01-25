describe('Party Page', () => {

  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
  })

  it('User should be able to see its own party', () => {
    cy.visit('/parties/653bb3059482835aff2829d2')
    cy.contains('Party')
    cy.contains('Test party for main user')
  })

  it('User should land on edit on his own party', () => {
    cy.visit('/parties/653bb3059482835aff2829d2')
    cy.contains('Edit')
  })

  it('User should be able to see party of another user', () => {
    cy.visit('/parties/65480224472bd000dd6adf21')
    cy.contains('Party')
    cy.contains('Marks party')
  })

  it('User should be able to attend a party of another user', () => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=646afa4da97b083c85265d2d`)
    cy.visit('/parties/65480224472bd000dd6adf21')
    cy.get('[data-cy="attend-button"]').click()
    cy.contains('Attendees').click()
    cy.contains('Adam', {timeout: 10000 })

    // check un attend
    cy.contains('Details').click()
    cy.get('[data-cy="unattend-button"]').click()
    cy.contains('Attendees').click()
    cy.contains('Adam', {timeout: 10000 }).should('not.exist')
  })

  it('User should be able to attend his own party', () => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=646afa4da97b083c85265d5d`)
    cy.visit('/parties/65480224472bd000dd6adf27')
    cy.contains('Details').click()
    cy.get('[data-cy="attend-button"]').click()
    cy.contains('Attendees').click()
    cy.contains('Steve', {timeout: 10000 })

    // check un attend
    cy.contains('Details').click()
    cy.get('[data-cy="unattend-button"]').click()
    cy.contains('Attendees').click()
    cy.contains('No attendees yet', { timeout: 10000 }).should('exist')
  })

  it('User should not be able to attend a past party', () => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=646afa4da97b083c85265d2d`)
    cy.visit('/parties/65482cdf613df81ad799d067')
    cy.contains('Details').click()
    cy.get('[data-cy="attend-button"]').should('be.disabled')
  })

  it('User should be able to comment on his own party and delete it', () => {
    cy.visit('/parties/65482cdf613df81ad799d067')
    cy.contains('Details').click()
    cy.get('[data-cy="comment-input"]').type('Test comment')
    cy.get('[data-cy="comment-submit-button"]').click()
    cy.contains('Test comment')
    cy.get('[data-cy="comment-delete-button"]').click()
    cy.get('[data-cy="comment-delete-confirm-button"]').click()
    cy.contains('Test comment').should('not.exist')
  })

  it('User should be able to respond to another users comment', () => {
    cy.visit('/parties/65480224472bd000dd6adf21')
    cy.get('[data-cy="comment-reply-button"]').click()
    cy.get('[data-cy="comment-reply-input"]').type('Test reply')
    cy.get('[data-cy="comment-reply-submit-button"]').click()
    cy.contains('Test reply')
  })

  it('User should be able to draft a party, and party should not be visible from explore', () => {
    cy.visit('/parties/653bb3059482835aff2829d2')
    cy.get('[data-cy="unpublish-party"]').click()
    cy.get('[data-cy="publish-party"]').should('exist')
    cy.visit('/parties/find')
    cy.contains('Test party for main user').should('not.exist')
    cy.visit('/parties/653bb3059482835aff2829d2')
    cy.get('[data-cy="publish-party"]').click()
    cy.get('[data-cy="publish-party"]').should('not.exist')
  })

  it('User should not be able to publish/draft his party when it has been completed', () => {
    cy.visit('/parties/65482cdf613df81ad799d067')
    cy.get('[data-cy="unpublish-party"]').should('be.disabled')
  })
})
