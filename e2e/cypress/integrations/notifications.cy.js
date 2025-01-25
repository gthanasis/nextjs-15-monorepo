describe('Notifications', () => {

  const John = {
    name: 'Jonathan',
    id: '6463a85ae23ac02c4ad26b31',
    parties: ['653bb3059482835aff2829d2'],
  }

  const Mark = {
    id: '646afa4da97b083c85265d4e',
    name: 'Mark',
    parties: ['65480224472bd000dd6adf21']
  }

  const Ela = {
    name: 'Ela',
    id: '646afa4da97b083c85265d4c',
    parties: ['65480224472bd000dd6adf22'],
  }

  const Oscar = {
    name: 'Oscar',
    id: '646afa4da97b083c85265d4d',
    parties: [],
  }

  const loginAs = (user) => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=${user.id}`)
  }
  const goToUserParty = (user) => {
    cy.visit(`/parties/${user.parties[0]}`)
  }
  const commentOnParty = (comment) => {
    cy.contains('Details').click()
    cy.get('[data-cy="comment-input"]').type(comment)
    cy.get('[data-cy="comment-submit-button"]').click()
    cy.contains(comment)
  }
  const replyOnFirstComment = (reply) => {
    cy.get('[data-cy="comment-reply-button"]').first().click()
    cy.get('[data-cy="comment-reply-input"]').type(reply)
    cy.get('[data-cy="comment-reply-submit-button"]').click()
    cy.contains(reply)
  }

  beforeEach(() => {
    // User to comment  -> 6463a85ae23ac02c4ad26b31
    // Notification User -> 646afa4da97b083c85265d4c
    // Notification User Party -> 65480224472bd000dd6adf22
  })

  describe('John\'s Notification from John\'s party', () => {
    it('John should get a notification when Ela comments on his party', () => {
      // Login as Ela
      loginAs(Ela)
      goToUserParty(John)
      commentOnParty('Notification comment')
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Ela.name} commented on your party`)
    })
    it('John should NOT get a notification if he comments on his own party', () => {
      loginAs(John)
      goToUserParty(John)
      commentOnParty('Test comment')
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${John.name} user commented on your party`).should('not.exist')
    })
    it('John Should get a notification if Ela replies to johns comment on his party', () => {
      loginAs(John)
      goToUserParty(John)
      commentOnParty('Comment to reply on')
      loginAs(Ela)
      goToUserParty(John)
      replyOnFirstComment('Notification reply')
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Ela.name} replied to your comment`)
    })
    it('John Should get a notification if Ela attends John\'s party', () => {
      loginAs(Ela)
      goToUserParty(John)
      cy.get('[data-cy="attend-button"]').click()
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Ela.name} is attending your party`)
    })
  })

  describe('John\'s Notification from another party', () => {
    it('John should not get a notification if mark comments on a random party', () => {
      loginAs(Mark)
      goToUserParty(Ela)
      commentOnParty('Notification comment')
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Mark.name} commented on your party`).should('not.exist')
    })
    it('John should not get a notification if oscar replies to a random party', () => {
      loginAs(Oscar)
      goToUserParty(Ela)
      commentOnParty('Notification comment')
      replyOnFirstComment('Notification reply')
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Oscar.name} replied to your comment`).should('not.exist')
    })
    it('John should not get a notification if mark attends a random party', () => {
      loginAs(Mark)
      goToUserParty(Ela)
      cy.get('[data-cy="attend-button"]').click()
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Mark.name} is attending your party`).should('not.exist')
    })
    it('John should get notification if Mark replies to his comment on Ela\'s party', () => {
      loginAs(John)
      goToUserParty(Ela)
      commentOnParty('Comment to reply on')
      loginAs(Mark)
      goToUserParty(Ela)
      replyOnFirstComment('Notification reply')
      loginAs(John)
      cy.get('[data-testid="notifications"]').click()
      cy.contains(`${Mark.name} replied to your comment`)
    });
  })

})
