import dotenv from 'dotenv'

dotenv.config()

export const DatabaseUrl: string=process.env.DATABASE_URL!
export const IP:string=process.env.IP_ADDRESS!
export const FirebasePath:string=process.env.FIREBASE_PATH!