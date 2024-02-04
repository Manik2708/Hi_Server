export interface UpdateConfessionStatus {
  senderId: string;
  crushId: string;
  confessionId: string;
  updatedStatus: string;
  updateTime: string;
  sendingTime: string;
  readingTime: string;
}

export interface UpdateConfessionStatusForSender {
  confessionId: string;
  updatedStatus: string;
  updateTime: string;
}
