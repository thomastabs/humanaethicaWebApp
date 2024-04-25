<template>
    <v-dialog v-model="dialog" persistent width="1300">
      <v-card>
        <v-card-title>
          <span class="headline">Select Participant</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-row>
              <v-col cols="12">
                <v-text-field
                    label="Rating"
                    type="text"
                    min="1"
                    max="5"
                    :rules="[isRatingValid() || 'Rating must be empty or an integer between 1 and 5']"
                    v-model="editParticipation.rating"
                    data-cy="ratingInput"
              ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="blue-darken-1"
              variant="text"
              @click="$emit('close-participation-dialog')"
            >
            Close
          </v-btn>
          <v-btn
              color="blue-darken-1"
              variant="text"
              @click="createParticipation"
              data-cy="createParticipation"
              v-if="isRatingValid()"
            >
            Make Participant
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { Vue, Component, Prop, Model } from 'vue-property-decorator';
  import RemoteServices from '@/services/RemoteServices';
  import { ISOtoString } from '@/services/ConvertDateService';
  import Participation from '@/models/participation/Participation';
  import Enrollment from '@/models/enrollment/Enrollment';
  
  @Component({
    methods: { ISOtoString },
  })
  export default class ParticipationDialog extends Vue {
    @Model('dialog', Boolean) dialog!: boolean;
    @Prop({ type: Participation, required: true }) readonly participation!: Participation;
    @Prop({ type: Enrollment, required: true }) readonly enrollment!: Enrollment;
  
    editParticipation: Participation = new Participation();
  
    async created() {
      this.editParticipation = new Participation(this.participation);
    }
  
    async createParticipation() {
      if ((this.$refs.form as Vue & { validate: () => boolean }).validate() && (this.enrollment.activityId !== null)) {
        try {
          if (!this.editParticipation.rating && this.editParticipation.rating !== 0) {
                this.editParticipation.rating = null;
          }
          this.editParticipation.volunteerId = this.enrollment.volunteerId;
          const result = await RemoteServices.createParticipation(this.editParticipation, this.enrollment.activityId)
          this.enrollment.participating = true;
          this.$emit('create-participation', result);
        } 
        catch (error) {
          await this.$store.dispatch('error', error);
        }
      }
    }

    isRatingValid() {
      if (!this.editParticipation.rating && this.editParticipation.rating !== 0) return true;
      const rating = this.editParticipation.rating;
      const num = Number(rating);
      return !isNaN(num) && num >= 1 && num <= 5 && Number.isInteger(num);
    }
  }
  </script>
  
  