import dotenv from 'dotenv'

dotenv.config()

export const DatabaseUrl: string=process.env.DATABASE_URL!
export const IP:string=process.env.IP_ADDRESS!
export const FirebasePath:string=process.env.FIREBASE_PATH!
export const NodemailerSenderEmail:string=process.env.NODEMAILER_SENDER_EMAIL!
export const NodemailerSenderPassword:string=process.env.NODEMAILER_SENDER_PASSWORD!
export const NodemailerService:string=process.env.NODEMAILER_SPMTP_SERVICE!