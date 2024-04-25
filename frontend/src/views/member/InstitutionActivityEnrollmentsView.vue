<template>
  <v-card class="table">
    <div class="text-h3">{{ activity.name }}</div>
    <v-data-table
      :headers="headers"
      :items="enrollments"
      :search="search"
      disable-pagination
      :hide-default-footer="true"
      :mobile-breakpoint="0"
      data-cy="activityEnrollmentsTable"
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
          <v-btn
            color="primary"
            dark
            @click="getActivities"
            data-cy="getActivities"
            >Activities</v-btn
          >
        </v-card-title>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-tooltip v-if="!item.participating && checkNumberOfParticipants(activity, enrollments)" bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mr-2 action-button"
              color="white"
              v-on="on"
              data-cy="selectParticipantButton"
              @click="selectParticipant(activity, item)"
              >fa-light fa-check
            </v-icon>
          </template>
          <span>Select Participant</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <participation-dialog
        v-if="currentActivity && currentEnrollment && participationDialog"
        v-model="participationDialog"
        :enrollment ="currentEnrollment"
        :activity="currentActivity"
        v-on:create-participation="onSaveParticipation" 
        v-on:close-participation-dialog="onCloseParticipationDialog"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import ParticipationDialog from '@/views/member/ParticipationDialog.vue';

@Component({
  components: {
    'participation-dialog': ParticipationDialog,
  },
})
export default class InstitutionActivityEnrollmentsView extends Vue {
  activity!: Activity;
  enrollments: Enrollment[] = [];
  search: string = '';

  currentActivity: Activity | null = null;
  currentEnrollment: Enrollment | null = null;
  participationDialog: boolean = false;

  headers: object = [
      {
      text: 'Name',
      value: 'volunteerName',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Motivation',
      value: 'motivation',
      align: 'left',
      width: '50%',
    },
    {
      text: 'Application Date',
      value: 'enrollmentDateTime',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participating',
      value: 'participating',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '15%',
    },
  ];

  async created() {
    this.activity = this.$store.getters.getActivity;
    if (this.activity !== null && this.activity.id !== null) {
      await this.$store.dispatch('loading');
      try {
        this.enrollments = await RemoteServices.getActivityEnrollments(
          this.activity.id,
        );
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
      await this.$store.dispatch('clearLoading');
    }
  }

  async getActivities() {
    await this.$store.dispatch('setActivity', null);
    this.$router.push({ name: 'institution-activities' }).catch(() => {});
  }

  checkNumberOfParticipants(activity: Activity, enrollments: Enrollment[]){
    const participantsCount = enrollments.filter(enrollment => enrollment.participating).length;
    return participantsCount < activity.participantsNumberLimit;
  }

  selectParticipant(activity: Activity, enrollment: Enrollment) {
    this.currentActivity = activity;
    this.currentEnrollment = enrollment;
    this.participationDialog = true;
  }

  async onSaveParticipation() {
    this.participationDialog = false;
    this.currentActivity = null;
    this.currentEnrollment = null;
  }

  onCloseParticipationDialog(){
    this.currentActivity = null;
    this.currentEnrollment = null;
    this.participationDialog = false;
  }
}
</script>

<style lang="scss" scoped>
.date-fields-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-fields-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>
