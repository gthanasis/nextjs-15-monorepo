describe('Create party', () => {
  const createParty = (name) => {
    cy.visit('/parties/new')
    cy.get('[data-cy="create-party-title-input"]').type(name)
    cy.get('[data-testid="CalendarIcon"]').click()
    cy.get('.Mui-selected').should('exist')
    cy.get('[data-testid="CalendarIcon"]').click()
    cy.get('.ql-editor').type('A test description')
    cy.get('[data-cy="create-party-autocomplete-location-input"]').type('Athens')
    cy.contains('Athens, Greece').click()
    cy.get('[data-cy="create-party-floor-input"]').type('1')
    cy.get('[data-cy="create-party-doorbell-input"]').type('John Doe')
    cy.get('[data-cy="create-party-genre-autocomplete"]').click()
    cy.contains('Pop').click()
    cy.contains('Provided').click()
    cy.get('[data-cy="create-party-save-button"]').click()
    cy.url().should('include', '/parties/')
    cy.contains('Your party is not public yet')
  }

  beforeEach(() => {
    cy.visit(`${Cypress.env('BACKEND')}auth/login/demo?userID=6463a85ae23ac02c4ad26b31`)
    cy.intercept('GET', `${Cypress.env('BACKEND')}geo/autocomplete*`, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          "res": [
            {
              "placeId": "ChIJ8UNwBh-9oRQR3Y1mdkU1Nic",
              "description": "Athens, Greece"
            },
            {
              "placeId": "ChIJuTO0tBlt9ogRfGGd1gJydE0",
              "description": "Athens, GA, USA"
            },
            {
              "placeId": "ChIJYVzn2RqQoRQRqrPuCt8Vsjg",
              "description": "Athens International Airport \"Eleftherios Venizelos\" (ATH), Attiki Odos, Spata, Greece"
            },
            {
              "placeId": "ChIJ08VDKIp6SIgRK0piBi8BsDA",
              "description": "Athens, OH, USA"
            },
            {
              "placeId": "ChIJDbG8Onz9SIYRBL8H-2t3gkg",
              "description": "Athens, TX, USA"
            }
          ],
          "count": 5
        }
      });
    }).as('getAutocomplete');
    cy.intercept('GET', `${Cypress.env('BACKEND')}geo/details/*`, (req) => {
      // Your request manipulation and stub response
      req.reply({
        statusCode: 200,
        body: {
          "res": {
            "address": "Athens, Greece",
            "latitude": 37.9838096,
            "longitude": 23.7275388,
            "name": "Athens",
            "url": "https://maps.google.com/?q=Athens,+Greece&ftid=0x14a1bd1f067043f1:0x2736354576668ddd",
            "placeId": "ChIJ8UNwBh-9oRQR3Y1mdkU1Nic"
          }
        }
      });
    }).as('getDetails');
  })

  it('User should be able to create a party', () => {
    createParty('A new test party')
  })

  it('User should be able to edit a party', () => {
    createParty('A new test party 2')
    cy.get('[data-cy="create-party-title-input"]').find('input').focus().clear().type('test edit')
    cy.get('[data-cy="create-party-floor-input"]').find('input').focus().clear().type('2')
    cy.get('[data-cy="create-party-doorbell-input"]').find('input').focus().clear().type('Jane Doe')
    cy.get('[data-cy="update-party"]').click()
    cy.contains('test edit')
  })
})
