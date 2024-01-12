export class CassandraTableNames{
    static sentConfessions:string='sent_confessions'
    static recievedUnreadConfessions:string='recieved_unread_confessions'
    static recievedReadConfessions:string='recieved_read_confessions'
}

export interface CassandraKeys{
    PARTITION_KEY:string,
    FIRST_SORTING_KEY:string,
    SECOND_SORTING_KEY?:string
}

export class CassandraMethods{
    static getSentConfessionsKey=():CassandraKeys=>{
        return {
            PARTITION_KEY:'sender_id',
            FIRST_SORTING_KEY:'time',
            SECOND_SORTING_KEY:'confession_id'
        }
    }
    static getRecievedUnreadConfessionsKey=():CassandraKeys=>{
        return {
            PARTITION_KEY: 'crush_id',
            FIRST_SORTING_KEY: 'time',
            SECOND_SORTING_KEY:'confession_id'
        }
    }
    static getRecievedReadConfessionsKey=():CassandraKeys=>{
        return {
            PARTITION_KEY: 'crush_id',
            FIRST_SORTING_KEY: 'time',
            SECOND_SORTING_KEY:'confession_id'
        }
    }
}
