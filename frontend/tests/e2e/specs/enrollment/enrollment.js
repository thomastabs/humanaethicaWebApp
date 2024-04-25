describe('Enrollment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createEnrollmentTest();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create enrollment', () => {
        const MOTIVATION = 'porque sou o melhor';

        cy.demoMemberLogin()
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 3)
            .eq(0)
            .children()
            .should('have.length', 14)
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', 0)
        cy.logout();


        cy.demoVolunteerLogin();
        cy.intercept('GET', '/activities').as('getActivities');
        cy.intercept('GET', '/enrollments/volunteer').as('getEnrollments')

        cy.get('[data-cy="volunteerActivities"]').click();
        cy.wait('@getActivities');
        cy.wait('@getEnrollments');

        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .should('have.length', 3)
            .eq(0)
            .children()
            .should('have.length', 10)
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0).get('[data-cy="applyForActivity"]').click();

        cy.get('[data-cy="motivationInput"]').type(MOTIVATION);
        cy.get('[data-cy="createEnrollment"]').click()
        cy.logout();

        cy.demoMemberLogin()
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        cy.intercept('GET', '/themes/availableThemes').as('availableTeams')
        cy.intercept('GET', '/activities/1/enrollments').as('activityEnrollments')

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', 1)
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).find('[data-cy="showEnrollments"]').click();
        cy.wait('@availableTeams');
        cy.wait('@activityEnrollments')

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should('have.length', 1)
            .eq(0)
            .children()
            .should('have.length', 5)

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).children().eq(1).should('contain', MOTIVATION);
        cy.logout();
    });
});