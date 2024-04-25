<template>
  <v-dialog v-model="dialog" persistent width="1300">
    <v-card>
      <v-card-title>
        <span class="headline">Write Assessment</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                  label="Review"
                  :rules="[(v) => v && v.length >= 10 || 'Review requires at least 10 characters']"
                  v-model="editAssessment.review"
                  data-cy="reviewInput"
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
            @click="$emit('close-assessment-dialog')"
        >
          Close
        </v-btn>
        <v-btn
            color="blue-darken-1"
            variant="text"
            @click="createAssessment"
            data-cy="createAssessment"
            v-if="editAssessment.review && editAssessment.review.length >= 10"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import Assessment from '@/models/assessment/Assessment';
import RemoteServices from '@/services/RemoteServices';
import { ISOtoString } from '@/services/ConvertDateService';
import Institution from '@/models/institution/Institution';
import Activity from '@/models/activity/Activity';

@Component({
  methods: { ISOtoString },
})
export default class AssessmentDialog extends Vue {
  @Model('dialog', Boolean) dialog!: boolean;
  @Prop({ type: Assessment, required: true }) readonly assessment!: Assessment;
  @Prop({ type: Activity, required: true }) readonly activity!: Activity;

  editAssessment: Assessment = new Assessment();

  async created() {
    this.editAssessment = new Assessment(this.assessment);
  }

  async createAssessment() {
    if ((this.$refs.form as Vue & { validate: () => boolean }).validate() && (this.activity.institution.id!== null)) {
      try {
        const result = await RemoteServices.createAssessment(this.editAssessment, this.activity.institution.id);
        this.assessment.volunteerName = result.volunteerName;
        this.$emit('create-assessment', result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }
}
</script>

<style scoped lang="scss"></style>
