export interface ConfessionModel {
  confessionId: string;
  senderId: string;
  senderAnonymousId: string;
  crushId: string;
  confession: string;
  status: string;
  crushName: string;
  sendingTime: Date;
  readingTime?: Date;
  reactionTime?: Date;
}
