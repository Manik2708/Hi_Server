export interface ConfessionModel {
  confession_id: string;
  sender_id: string;
  sender_anonymous_id: string;
  crush_id: string;
  confession: string;
  status: string;
  crush_name: string;
  sending_time: Date;
  reading_time?: Date;
  reaction_time?: Date;
}
