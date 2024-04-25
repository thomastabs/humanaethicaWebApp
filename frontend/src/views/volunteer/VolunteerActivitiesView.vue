<template>
  <div>
    <v-card class="table">
      <v-data-table
          :headers="headers"
          :items="activities"
          :search="search"
          disable-pagination
          :hide-default-footer="true"
          :mobile-breakpoint="0"
          data-cy="volunteerActivitiesTable"
      >
        <template v-slot:top>
          <v-card-title>
            <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                class="mx-2"
            />
            <v-spacer />
          </v-card-title>
        </template>
        <template v-slot:[`item.themes`]="{ item }">
          <v-chip v-for="theme in item.themes" v-bind:key="theme.id">
            {{ theme.completeName }}
          </v-chip>
        </template>

        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip v-if="item.state === 'APPROVED'" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="red"
                  v-on="on"
                  data-cy="reportButton"
                  @click="reportActivity(item)"
              >warning</v-icon
              >
            </template>
            <span>Report Activity</span>
          </v-tooltip>
          <v-tooltip
              v-if="
              item.state === 'APPROVED' &&
              !hasVolunteerMadeAnAssessmentInInstitution(item) &&
              checkActivityOver(item) &&
              doesVolunteerHaveParticipation(item)
            "
              bottom
          >
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="blue"
                  v-on="on"
                  data-cy="writeAssessment"
                  @click="writeAssessment(item)"
              >fa-solid fa-right-to-bracket</v-icon
              >
            </template>
            <span>Write Assessment</span>
          </v-tooltip>
          <v-tooltip
              v-if="
              item.state === 'APPROVED' &&
              !deadlineHasPassed(item) &&
              !isVolunteerEnrolled(item)
            "
              bottom
          >
            <template v-slot:activator="{ on }">
              <v-icon
                  class="mr-2 action-button"
                  color="blue"
                  v-on="on"
                  data-cy="applyForActivity"
                  @click="applyForActivity(item)"
              >fa-solid fa-right-to-bracket</v-icon
              >
            </template>
            <span>Apply for Activity</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <enrollment-dialog
          v-if="currentActivity && currentEnrollment && enrollmentDialog"
          v-model="enrollmentDialog"
          :enrollment="currentEnrollment"
          :activity="currentActivity"
          v-on:create-enrollment="onSaveEnrollment"
          v-on:close-enrollment-dialog="onCloseEnrollmentDialog"
      />
      <assessment-dialog
          v-if="currentActivity && currentAssessment && assessmentDialog"
          v-model="assessmentDialog"
          :assessment="currentAssessment"
          :activity="currentActivity"
          v-on:create-assessment="onSaveAssessment"
          v-on:close-assessment-dialog="onCloseAssessmentDialog"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import { show } from 'cli-cursor';

import Enrollment from '@/models/enrollment/Enrollment';
import EnrollmentDialog from '@/views/volunteer/EnrollmentDialog.vue';
import AssessmentDialog from '@/views/volunteer/AssessmentDialog.vue';
import Institution from '@/models/institution/Institution';

import Assessment from '@/models/assessment/Assessment';
import Participation from '@/models/participation/Participation';

@Component({
  components: {
    'enrollment-dialog': EnrollmentDialog,
    'assessment-dialog': AssessmentDialog,
  },
  methods: { show },
})
export default class VolunteerActivitiesView extends Vue {
  activities: Activity[] = [];
  enrollments: Enrollment[] = [];

  currentActivity: Activity | null = null;
  currentEnrollment: Enrollment | null = null;
  enrollmentDialog: boolean = false;

  assessments: Assessment[] = [];
  participations: Participation[] = [];

  currentInstitution: Institution | null = null;
  currentAssessment: Assessment | null = null;
  assessmentDialog: boolean = false;

  search: string = '';
  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Themes',
      value: 'themes',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activities = await RemoteServices.getActivities();
      this.enrollments = await RemoteServices.getVolunteerEnrollments();
      this.participations = await RemoteServices.getVolunteerParticipations();
      this.assessments = await RemoteServices.getVolunteerAssessments();
      console.log(this.assessments);
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  async reportActivity(activity: Activity) {
    if (activity.id !== null) {
      try {
        const result = await RemoteServices.reportActivity(
            this.$store.getters.getUser.id,
            activity.id,
        );
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.activities.unshift(result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }

  deadlineHasPassed(activity: Activity) {
    if (activity.formattedApplicationDeadline) {
      const deadline = Date.parse(activity.formattedApplicationDeadline);
      return deadline < Date.now();
    }
    return false;
  }

  isVolunteerEnrolled(activity: Activity) {
    return this.enrollments.some(
        (enrollment: Enrollment) => enrollment.activityId === activity.id,
    );
  }

  applyForActivity(activity: Activity) {
    this.currentActivity = activity;
    this.currentEnrollment = new Enrollment();
    this.enrollmentDialog = true;
  }

  async onSaveEnrollment(enrollment: Enrollment) {
    this.enrollments = this.enrollments.filter((e) => e.id !== enrollment.id);
    this.enrollments.unshift(enrollment);
    this.enrollmentDialog = false;
    this.currentActivity = null;
    this.currentEnrollment = null;
  }

  onCloseEnrollmentDialog() {
    this.currentActivity = null;
    this.currentEnrollment = null;
    this.enrollmentDialog = false;
  }

  // returns true if the activity is not over
  checkActivityOver(activity: Activity) {
    return Date.parse(activity.endingDate) < Date.now();
  }
  // returns true if the volunteer has already made an assessment in the institution
  hasVolunteerMadeAnAssessmentInInstitution(activity: Activity) {
    return this.assessments.some(
        (volunteerAssessment: Assessment) =>
            activity.institution === volunteerAssessment.institution,
    );
  }
  // returns true if the volunteer has a participation in the activity
  doesVolunteerHaveParticipation(activity: Activity) {
    return this.participations.some(
        (volunteerParticipation: Participation) =>
            volunteerParticipation.activityId === activity.id,
    );
  }
  // opens the dialog to write an assessment/
  writeAssessment(activity: Activity) {
    this.currentActivity = activity;
    this.currentAssessment = new Assessment();
    this.assessmentDialog = true;
  }
  // saves the assessment
  async onSaveAssessment(assessment: Assessment) {
    this.assessments = this.assessments.filter((a) => a.id !== assessment.id);
    this.assessments.unshift(assessment);
    this.assessmentDialog = false;
    this.currentActivity = null;
    this.currentAssessment = null;

  }
  // closes the dialog
  onCloseAssessmentDialog() {
    this.currentActivity = null;
    this.currentAssessment = null;
    this.assessmentDialog = false;
  }
}
</script>

<style lang="scss" scoped></style>
