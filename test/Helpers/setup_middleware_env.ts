import { UserModel } from "../../src/Models/user";
import { jest } from "@jest/globals";
import express from "express";
import jsonwt from 'jwt-simple';
export const getResolvedTestModule = (user: UserModel):string=>{
    const token = (Math.random() + 1).toString(36).substring(2, 5);
    jest.spyOn(express.request, 'header').mockReturnValue(token);
    jest.spyOn(jsonwt, 'decode').mockImplementation((...args: any) => {
      return {
        id: user._id._id.toString(),
      };
    });
    return token;
}