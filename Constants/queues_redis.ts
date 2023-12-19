export class RedisNames{
    static OnlineUserMap: string='OnlineUserMap'
    static SocketId: string='socketId'
    static FirebaseToken: string='firebasetoken'
    static OnlineUsers: string='online-users'
    static LastRecievedConfession: string='lastRecievedConfession'
    static FirstRecievedConfession: string='firstRecievedConfession'
    static RecievedConfessions: string='recievedConfessions'
    static ConfessionLlsenderId: string='senderId';
    static ConfessionLlsenderAnonymousId: string='senderAnonymousId';
    static ConfessionLlconfession: string='confession';
    static ConfessionLltime: string='time';
    static ConfessionLlnextConfessionId:string='nextConfessionId';
    static ConfessionLlpreviousConfessionId: string='previousConfessionId';

}

export class QueueNames{
    static CommonConfessionSavingQueue: string='Common1'
    static OfflineQueue: string='Offline'
    static CommonConfessionReadingQueue: string='Common2'
    static CommonMessageSavingQueue: string='Common3'
    static DatabaseQueue:string='DbQ'
}