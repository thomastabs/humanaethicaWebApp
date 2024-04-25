import { ISOtoString } from '@/services/ConvertDateService';
import Institution from '@/models/institution/Institution';

export default class Assessment {
  id: number | null = null;
  review!: string;
  reviewDate!: string;
  institution!: Institution;
  volunteerName!: string;

  constructor(jsonObj?: Assessment) {
    if (jsonObj) {
      this.id = jsonObj.id;
      this.review = jsonObj.review;
      this.reviewDate = ISOtoString(jsonObj.reviewDate);
      this.institution = jsonObj.institution;
      this.volunteerName = jsonObj.volunteerName;
    }
  }
}
