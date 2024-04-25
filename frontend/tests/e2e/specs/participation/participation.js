describe('Participation', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createParticipationTest();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create participation', () => {
        const RATING = "1";


        cy.demoMemberLogin()
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 2)
            .eq(0)
            .children()
            .should('have.length', 14)
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).children().eq(4).should('contain', 1)

        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).find('[data-cy="showEnrollments"]').click();

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should('have.length', 2)
            .eq(0)
            .children()
            .should('have.length', 5)

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', "false");

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).find('[data-cy="selectParticipantButton"]').click();

        cy.get('[data-cy="ratingInput"]').type(RATING);
        cy.get('[data-cy="createParticipation"]').click();

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', "true");

        cy.get('[data-cy="getActivities"]').click();

        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).children().eq(4).should('contain', 2)

        cy.logout();
    });
});