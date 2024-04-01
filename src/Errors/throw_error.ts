import { InternalServerError } from "./server_error";
import express from "express";

export class ThrowError{
    constructor(error: any, response: express.Response){
        switch(error){
            case error instanceof InternalServerError:
                throw new InternalServerError(error.toString())
            default:
                return response.status(error.getStatus()).json({message: error.message})
        }
    }
}