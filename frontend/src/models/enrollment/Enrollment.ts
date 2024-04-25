import { ISOtoString } from '@/services/ConvertDateService';

export default class Enrollment {
  id: number | null = null;
  activityId: number | null = null;
  motivation!: string;
  enrollmentDateTime!: string;
  volunteerName!: string;
  volunteerId: number | null = null;
  participating: boolean | null = false;

  constructor(jsonObj?: Enrollment) {
    if (jsonObj) {
      this.id = jsonObj.id;
      this.activityId = jsonObj.activityId;
      this.motivation = jsonObj.motivation;
      this.enrollmentDateTime = ISOtoString(jsonObj.enrollmentDateTime);
      this.volunteerName = jsonObj.volunteerName;
      this.participating = jsonObj.participating;
      this.volunteerId = jsonObj.volunteerId;
    }
  }
}
