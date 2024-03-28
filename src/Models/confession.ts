export interface ConfessionModel {
  confessionId: string;
  senderId: string;
  senderAnonymousId: string;
  crushId: string;
  confession: string;
  status: string;
  crushName: string;
  sendingTime: string;
  readingTime?: string;
  reactionTime?: string;
}
