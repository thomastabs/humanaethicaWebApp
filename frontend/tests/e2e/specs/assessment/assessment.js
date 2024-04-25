describe('Assessment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createAssessmentTest();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create assessment', () => {
        const REVIEW = 'very great, so good';


        cy.demoVolunteerLogin();
        // intercept get activities request
        cy.intercept('GET', '/activities').as('getActivities');
        cy.intercept('GET', '/volunteer/assessments').as('getAssessments')


        // go to volunteer activities view
        cy.get('[data-cy="volunteerActivities"]').click();

        cy.wait('@getActivities');
        cy.wait('@getAssessments');


        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .should('have.length', 6)
            .eq(0)
            .children()
            .should('have.length', 10)
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(0)
            .should('contain', 'A1');

        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0).find('[data-cy="writeAssessment"]').click();




        cy.get('[data-cy="reviewInput"]').type(REVIEW)
        cy.get('[data-cy="createAssessment"]').click()

        cy.logout();


        cy.demoMemberLogin()
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        cy.intercept('GET', '/institutions/*/assessments').as('getAssessments');


        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="assessments"]').click();

        cy.wait('@getInstitutions');
        cy.wait('@getAssessments');

        cy.get('[data-cy="institutionAssessmentsTable"] tbody tr').should('have.length', 1);
        cy.get('[data-cy="institutionAssessmentsTable"] tbody tr').eq(0).children().eq(0).should('contain', REVIEW)
        cy.logout();


    });

});


